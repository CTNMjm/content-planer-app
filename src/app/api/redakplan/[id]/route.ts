import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessLocation } from "@/lib/location-access";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const redakPlan = await prisma.redakPlan.findUnique({
      where: { id: params.id },
      include: {
        location: true,
        inputPlan: true,
        createdBy: { select: { id: true, name: true, email: true } },
        updatedBy: { select: { id: true, name: true, email: true } },
      },
    });
    if (!redakPlan) {
      return NextResponse.json(
        { error: "RedakPlan not found" },
        { status: 404 }
      );
    }
    if (!(await canAccessLocation(user, redakPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }
    return NextResponse.json(redakPlan);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden des RedakPlans" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
    }
    const data = await request.json();

    // Hole den aktuellen Stand für History-Vergleich
    const currentPlan = await prisma.redakPlan.findUnique({
      where: { id: params.id },
    });
    if (!currentPlan) {
      return NextResponse.json({ error: "RedakPlan nicht gefunden" }, { status: 404 });
    }

    if (!(await canAccessLocation(user, currentPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    // Entferne Felder, die nicht direkt geupdated werden können
    const {
      id,
      location,
      inputPlan,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
      createdById,
      updatedById,
      ...updateData
    } = data;
    // locationId explizit übernehmen, falls im Request enthalten —
    // aber nur in Standorte, auf die der User Zugriff hat
    if (typeof data.locationId !== 'undefined') {
      if (
        data.locationId !== currentPlan.locationId &&
        !(await canAccessLocation(user, data.locationId))
      ) {
        return NextResponse.json(
          { error: "Kein Zugriff auf den Ziel-Standort" },
          { status: 403 }
        );
      }
      updateData.locationId = data.locationId;
    }

    // Datumsfelder korrekt umwandeln
    if (updateData.voe && typeof updateData.voe === "string") {
      updateData.voe = new Date(updateData.voe);
    }

    // Erstelle History-Einträge für geänderte Felder
    const allowedFields = Object.keys(updateData);
    const historyEntries: Array<{
      fieldName: string;
      oldValue: string;
      newValue: string;
      changedById: string;
    }> = [];
    for (const field of allowedFields) {
      const currentValue = (currentPlan as any)[field];
      const newValue = updateData[field];
      if (currentValue !== newValue) {
        historyEntries.push({
          fieldName: field,
          oldValue: String(currentValue ?? ""),
          newValue: String(newValue ?? ""),
          changedById: user.id,
        });
      }
    }

    // Update mit History in einer Transaktion
    const updatedRedakPlan = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.redakPlan.update({
        where: { id: params.id },
        data: {
          ...updateData,
          updatedById: user.id,
        },
        include: {
          location: true,
          inputPlan: true,
          createdBy: true,
          updatedBy: true,
        },
      });

      if (historyEntries.length > 0) {
        await prisma.redakPlanHistory.createMany({
          data: historyEntries.map((entry) => ({
            ...entry,
            redakPlanId: params.id,
            action: "UPDATE",
          })),
        });
      }

      return updated;
    });

    return NextResponse.json(updatedRedakPlan);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des RedakPlans" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const currentPlan = await prisma.redakPlan.findUnique({
      where: { id: params.id },
      select: { locationId: true },
    });
    if (!currentPlan) {
      return NextResponse.json(
        { error: "RedakPlan nicht gefunden" },
        { status: 404 }
      );
    }
    if (!(await canAccessLocation(user, currentPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    // Historie-Eintrag
    await prisma.redakPlanHistory.create({
      data: {
        redakPlanId: params.id,
        action: "DELETE",
        fieldName: "deletedAt",
        oldValue: "",
        newValue: new Date().toISOString(),
        changedById: user.id,
        changedAt: new Date(),
      },
    });

    // RedakPlan wirklich löschen
    await prisma.redakPlan.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}