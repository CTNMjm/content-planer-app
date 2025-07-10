import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type ActionType = "CREATE" | "UPDATE" | "DELETE";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

// Hilfsfunktion zum Extrahieren des Users aus dem Token
async function getUserFromRequest(request: NextRequest) {
  try {
    // Erst NextAuth-Session prüfen
    const session = await getServerSession(authOptions);
    console.log("=== USER DEBUG ===");
    console.log("Session found:", !!session);
    console.log("Session user:", session?.user);
    
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true }
      });
      console.log("User from DB:", user);
      if (user) return user;
    }

    // Fallback: JWT-Token prüfen
    const token = request.cookies.get("token")?.value;
    console.log("JWT Token found:", !!token);
    
    // TEMPORÄR für Entwicklung - später entfernen!
    if (!token && process.env.NODE_ENV === "development") {
      console.log("No token found, using development user");
      const devUser = await prisma.user.findFirst({
        select: { id: true, email: true, name: true }
      });
      if (devUser) {
        console.log("Development user found:", devUser);
        return devUser;
      }
    }
    
    if (!token) {
      console.log("No token found and no dev user");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });
    
    return user;
  } catch (error) {
    console.error("getUserFromRequest error:", error);
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
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
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
      locationId,
      veröffentlichungsdatum,
      ...updateData
    } = data;

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
          changedById: session.user.id
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
          updatedById: session.user.id,
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
  { params }: { params: { id: string } }
) {
  // Session holen!
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const user = await getUserFromRequest(request as NextRequest);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
          changedById: session.user.id
        });
      }
    }

    // Update und History in einer Transaktion
    const updatedInputPlan = await prisma.$transaction(async (prisma) => {
      const updated = await prisma.inputPlan.update({
        where: { id: params.id },
        data: {
          ...updateData,
          updatedById: session.user.id,
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
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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