import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

// GET - Alle InputPläne abrufen
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const inputPlans = await prisma.inputPlan.findMany({
      include: {
        location: true,
        contentPlan: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        voe: 'desc'
      }
    });

    return NextResponse.json(inputPlans);
  } catch (error) {
    console.error("Error fetching input plans:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Input-Pläne" },
      { status: 500 }
    );
  }
}

// POST - Neuen InputPlan erstellen
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Erstelle den Input-Plan
    const inputPlan = await prisma.inputPlan.create({
      data: {
        monat: body.monat,
        bezug: body.bezug,
        mehrwert: body.mehrwert,
        mechanikThema: body.mechanikThema,
        idee: body.idee,
        platzierung: body.platzierung,
        status: body.status || "DRAFT",
        voe: new Date(body.voe),
        zusatzinfo: body.zusatzinfo || "",
        contentPlanId: body.contentPlanId,
        locationId: body.locationId,
        createdById: session.user.id,
        updatedById: session.user.id
      },
      include: {
        location: true,
        contentPlan: true
      }
    });

    return NextResponse.json(inputPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating input plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Input-Plans" },
      { status: 500 }
    );
  }
}

// PUT - InputPlan aktualisieren
export async function PUT(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    const { id, ...updateData } = data;

    if (!id) {
      return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
    }

    // Prüfe ob der User Zugriff hat
    const existingPlan = await prisma.inputPlan.findUnique({
      where: { id },
      include: {
        location: {
          include: {
            userLocations: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });

    if (!existingPlan || existingPlan.location.userLocations.length === 0) {
      return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
    }

    // Update InputPlan
    const updatedPlan = await prisma.inputPlan.update({
      where: { id },
      data: {
        ...updateData,
        veroeffentlichungsdatum: updateData.veroeffentlichungsdatum ? new Date(updateData.veroeffentlichungsdatum) : undefined,
        updatedById: session.user.id,
        updatedAt: new Date()
      },
      include: {
        location: true,
        contentPlan: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error updating input plan:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}

// DELETE - InputPlan löschen
export async function DELETE(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: "ID fehlt" }, { status: 400 });
    }

    // Prüfe ob der User Zugriff hat
    const existingPlan = await prisma.inputPlan.findUnique({
      where: { id },
      include: {
        location: {
          include: {
            userLocations: {
              where: { userId: session.user.id }
            }
          }
        },
        redakPlans: true
      }
    });

    if (!existingPlan || existingPlan.location.userLocations.length === 0) {
      return NextResponse.json({ error: "Kein Zugriff" }, { status: 403 });
    }

    // Prüfe ob RedakPläne existieren
    if (existingPlan.redakPlans.length > 0) {
      return NextResponse.json({ 
        error: "Kann nicht gelöscht werden. Es existieren abhängige Redaktionspläne." 
      }, { status: 400 });
    }

    // Lösche InputPlan
    await prisma.inputPlan.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting input plan:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}
