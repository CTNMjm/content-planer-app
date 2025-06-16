import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(
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

    const inputPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id },
      include: {
        contentPlan: true,
        location: true,
        createdBy: true,
        updatedBy: true,
        redakPlans: true
      }
    });

    if (!inputPlan) {
      return NextResponse.json(
        { error: "Input-Plan nicht gefunden" },
        { status: 404 }
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
    const historyEntries = [];
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
            inputPlanId: params.id
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
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Nur Status aktualisieren
    const inputPlan = await prisma.inputPlan.update({
      where: { id: params.id },
      data: {
        status: body.status,
        updatedById: session.user?.id,
      }
    });

    return NextResponse.json(inputPlan);
  } catch (error: any) {
    console.error("Error updating input plan status:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Status" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.inputPlan.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Input-Plan gelöscht" });
  } catch (error) {
    console.error("Error deleting input plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Input-Plans" },
      { status: 500 }
    );
  }
}
