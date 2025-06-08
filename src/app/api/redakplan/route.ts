import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

// GET - Alle RedakPläne abrufen
export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const userWithLocations = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userLocations: {
          include: {
            location: true,
            roles: {
              include: {
                role: true
              }
            }
          }
        }
      }
    });

    if (!userWithLocations || userWithLocations.userLocations.length === 0) {
      return NextResponse.json([]);
    }

    // User kann alle Pläne seiner Locations sehen
    const locationIds = userWithLocations.userLocations.map(ul => ul.location.id);

    const redakPlans = await prisma.redakPlan.findMany({
      where: {
        locationId: { in: locationIds }
      },
      include: {
        location: true,
        inputPlan: {
          select: { 
            id: true, 
            idee: true,
            mechanikThema: true,
            bezug: true,
            monat: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        updatedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        voe: 'desc'  // Nach Veröffentlichungsdatum sortieren
      }
    });

    return NextResponse.json(redakPlans);
  } catch (error) {
    console.error("Error fetching redak plans:", error);
    return NextResponse.json({ error: "Fehler beim Laden der Daten" }, { status: 500 });
  }
}

// POST - Neuen RedakPlan erstellen
export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const data = await request.json();
    console.log("Creating redak plan with data:", data);

    // Status-Mapping von Deutsch zu Englisch
    const statusMap: { [key: string]: string } = {
      'ENTWURF': 'DRAFT',
      'IN_BEARBEITUNG': 'IN_PROGRESS',
      'ÜBERPRÜFUNG': 'REVIEW',
      'FREIGEGEBEN': 'APPROVED',
      'ABGESCHLOSSEN': 'COMPLETED'
    };

    const mappedStatus = statusMap[data.status] || data.status || 'DRAFT';

    // Erstelle den RedakPlan
    const redakPlan = await prisma.redakPlan.create({
      data: {
        inputPlanId: data.inputPlanId,
        monat: data.monat,
        bezug: data.bezug,
        mechanikThema: data.mechanikThema,
        idee: data.idee,
        platzierung: data.platzierung,
        voe: data.voe ? new Date(data.voe) : new Date(),
        status: mappedStatus, // Verwende den gemappten Status
        publiziert: false,
        locationId: data.locationId,
        createdById: session.user.id,
      },
      include: {
        location: true,
        inputPlan: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(redakPlan);
  } catch (error) {
    console.error("Error creating redak plan:", error);
    return NextResponse.json(
      { error: "Failed to create redak plan" },
      { status: 500 }
    );
  }
}

// PUT - RedakPlan aktualisieren
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
    const existingPlan = await prisma.redakPlan.findUnique({
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

    // Bereite Update-Daten vor
    const preparedData: any = {
      ...updateData,
      updatedById: session.user.id,
      updatedAt: new Date()
    };

    // Konvertiere Datum wenn vorhanden
    if (updateData.voe) {
      preparedData.voe = new Date(updateData.voe);
    }

    // Update RedakPlan
    const updatedPlan = await prisma.redakPlan.update({
      where: { id },
      data: preparedData,
      include: {
        location: true,
        inputPlan: {
          include: {
            contentPlan: true
          }
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        updatedBy: {
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
    console.error("Error updating redak plan:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren" }, { status: 500 });
  }
}

// DELETE - RedakPlan löschen
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
    const existingPlan = await prisma.redakPlan.findUnique({
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

    // Lösche RedakPlan
    await prisma.redakPlan.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting redak plan:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}

// PATCH - RedakPlan publizieren/unpublizieren
export async function PATCH(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
  }

  try {
    const { id, publiziert } = await request.json();

    if (!id || typeof publiziert !== 'boolean') {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }

    // Prüfe ob der User Zugriff hat
    const existingPlan = await prisma.redakPlan.findUnique({
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

    // Update Publiziert-Status
    const updatedPlan = await prisma.redakPlan.update({
      where: { id },
      data: {
        publiziert,
        status: publiziert ? 'published' : 'draft',
        updatedById: session.user.id,
        updatedAt: new Date()
      },
      include: {
        location: true,
        inputPlan: {
          include: {
            contentPlan: true
          }
        }
      }
    });

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error("Error updating publish status:", error);
    return NextResponse.json({ error: "Fehler beim Aktualisieren des Status" }, { status: 500 });
  }
}
