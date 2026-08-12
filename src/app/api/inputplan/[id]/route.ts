import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { getSessionUser, canAccessLocation } from "@/lib/location-access";

type ActionType = "CREATE" | "UPDATE" | "DELETE";

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

    const inputPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id },
      include: {
        location: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!inputPlan) {
      return NextResponse.json({ error: "InputPlan not found" }, { status: 404 });
    }

    if (!(await canAccessLocation(user, inputPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    return NextResponse.json(inputPlan);
  } catch (error) {
    console.error("Error fetching input plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden des Input-Plans" },
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
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const data = await request.json();

    // Hole den aktuellen Stand für History-Vergleich
    const currentPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id }
    });

    if (!currentPlan) {
      return NextResponse.json(
        { error: "Input Plan nicht gefunden" },
        { status: 404 }
      );
    }

    if (!(await canAccessLocation(user, currentPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    // Entferne alle Felder, die nicht direkt geupdated werden können
    const {
      id,
      contentPlan,
      location,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
      createdById,
      updatedById,
      deletedAt,
      deletedById,
      veröffentlichungsdatum,
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

    // Erstelle History-Einträge für geänderte Felder
    const historyEntries: Array<{
      field: string;
      oldValue: string;
      newValue: string;
      changedById: string;
    }> = [];
    for (const [key, newValue] of Object.entries(updateData)) {
      const currentValue = currentPlan[key as keyof typeof currentPlan];
      if (currentValue !== newValue) {
        historyEntries.push({
          field: key,  // ÄNDERUNG: von 'fieldName' zu 'field'
          oldValue: String(currentValue || ""),
          newValue: String(newValue || ""),
          changedById: user.id
        });
      }
    }

    // Update mit History in einer Transaktion
    const updatedInputPlan = await prisma.$transaction(async (prisma) => {
      // Update den InputPlan
      const updated = await prisma.inputPlan.update({
        where: { id: params.id },
        data: {
          ...updateData,
          updatedById: user.id,
        },
        include: {
          location: true,
          contentPlan: true,
          createdBy: true,
          updatedBy: true,
        },
      });

      // Erstelle History-Einträge
      if (historyEntries.length > 0) {
        await prisma.inputPlanHistory.createMany({
          data: historyEntries.map(entry => ({
            ...entry,
            inputPlanId: params.id,
            action: "UPDATE" as ActionType,
          }))
        });
      }

      return updated;
    });

    return NextResponse.json(updatedInputPlan);
  } catch (error) {
    console.error("Error updating input plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Input Plans" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const body = await request.json();

    // Entferne Felder, die nicht direkt gespeichert werden sollen
    const {
      id,
      contentPlan,
      location,
      createdBy,
      updatedBy,
      createdAt,
      updatedAt,
      createdById,
      updatedById,
      locationId,
      deletedAt,
      deletedById,
      veröffentlichungsdatum,
      ...updateData
    } = body;

    // Hole den aktuellen Stand für History-Vergleich
    const currentPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id }
    });

    if (!currentPlan) {
      return NextResponse.json(
        { error: "Input Plan nicht gefunden" },
        { status: 404 }
      );
    }

    if (!(await canAccessLocation(user, currentPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    // locationId explizit übernehmen, falls im Request enthalten —
    // aber nur in Standorte, auf die der User Zugriff hat
    if (typeof body.locationId !== 'undefined') {
      if (
        body.locationId !== currentPlan.locationId &&
        !(await canAccessLocation(user, body.locationId))
      ) {
        return NextResponse.json(
          { error: "Kein Zugriff auf den Ziel-Standort" },
          { status: 403 }
        );
      }
      updateData.locationId = body.locationId;
    }

    // History-Einträge erzeugen
    const historyEntries: Array<{
      field: string;
      oldValue: string;
      newValue: string;
      changedById: string;
    }> = [];
    for (const [key, newValue] of Object.entries(updateData)) {
      const currentValue = currentPlan[key as keyof typeof currentPlan];
      if (currentValue !== newValue) {
        historyEntries.push({
          field: key,
          oldValue: String(currentValue ?? ""),
          newValue: String(newValue ?? ""),
          changedById: user.id
        });
      }
    }

    // Update und History in einer Transaktion
    const updatedInputPlan = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.inputPlan.update({
        where: { id: params.id },
        data: {
          ...updateData,
          updatedById: user.id,
        }
      });

      if (historyEntries.length > 0) {
        await prisma.inputPlanHistory.createMany({
          data: historyEntries.map(entry => ({
            ...entry,
            inputPlanId: params.id,
            action: "UPDATE" as ActionType,
          }))
        });
      }

      return updated;
    });

    return NextResponse.json(updatedInputPlan);
  } catch (error: any) {
    console.error("Error updating input plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Input Plans" },
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

    const currentPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id },
      select: { locationId: true },
    });

    if (!currentPlan) {
      return NextResponse.json(
        { error: "Input Plan nicht gefunden" },
        { status: 404 }
      );
    }

    if (!(await canAccessLocation(user, currentPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    // Soft delete
    const deleted = await prisma.inputPlan.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
      }
    });

    // Historie-Eintrag
    await prisma.inputPlanHistory.create({
      data: {
        inputPlanId: params.id,
        changedById: user.id,
        previousData: deleted,
        newData: Prisma.JsonNull,
        changedAt: new Date(),
        action: "DELETE" as ActionType,
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}