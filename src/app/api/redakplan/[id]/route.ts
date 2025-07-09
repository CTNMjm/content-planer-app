import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

// Hilfsfunktion zum Extrahieren des Users aus dem Token
async function getUserFromRequest(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true },
      });
      if (user) return user;
    }

    const token = request.cookies.get("token")?.value;
    if (!token && process.env.NODE_ENV === "development") {
      const devUser = await prisma.user.findFirst({
        select: { id: true, email: true, name: true },
      });
      if (devUser) return devUser;
    }
    if (!token) return null;

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true },
    });
    return user;
  } catch {
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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
      locationId,
      ...updateData
    } = data;

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
          changedById: session.user.id,
        });
      }
    }

    // Update mit History in einer Transaktion
    const updatedRedakPlan = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.redakPlan.update({
        where: { id: params.id },
        data: {
          ...updateData,
          updatedById: session.user.id,
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
            action: "UPDATE", // <--- hinzugefügt!
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}