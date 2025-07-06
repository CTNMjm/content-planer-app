import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";

console.log("InputPlan route.ts loaded successfully"); // DEBUG

// Hilfsfunktion um User aus dem Request zu extrahieren
async function getUserFromRequest(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");

  if (!token) {
    return null;
  }

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
    return decoded.user;
  } catch (error) {
    console.error("JWT verification error:", error);
    return null;
  }
}

// GET - Alle InputPläne abrufen
export async function GET(request: NextRequest) {
  console.log("GET /api/inputplan called"); // DEBUG
  
  try {
    console.log("Trying to get session..."); // DEBUG
    const session = await getServerSession(authOptions);
    console.log("Session result:", !!session); // DEBUG

    if (!session) {
      console.log("No session found, returning 401"); // DEBUG
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    console.log("Fetching input plans from database..."); // DEBUG
    const inputPlans = await prisma.inputPlan.findMany({
      include: {
        location: true,
        contentPlan: true,
      },
      orderBy: { updatedAt: "desc" },
    });
    
    console.log("Found input plans:", inputPlans.length); // DEBUG
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
  console.log("POST /api/inputplan - Start"); // DEBUG

  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Entferne Felder, die nicht gesetzt werden dürfen
    const { id, createdAt, updatedAt, createdBy, updatedBy, ...createData } = data;

    // InputPlan anlegen
    const created = await prisma.inputPlan.create({
      data: {
        ...createData,
        createdById: user.id,
        updatedById: user.id,
      },
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

    // History-Eintrag anlegen
    await prisma.inputPlanHistory.create({
      data: {
        inputPlanId: created.id,
        action: "CREATE",
        changedBy: user.name ?? user.email ?? user.id ?? "Unknown",
        changedById: user.id,
        newData: created,
        previousData: Prisma.JsonNull,
        changedAt: new Date(),
      }
    });

    console.log("InputPlan created successfully:", created.id);

    return NextResponse.json(created, { status: 201 });
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

    // Entferne Felder die nicht aktualisiert werden sollen
    delete updateData.id;
    delete updateData.createdAt;
    delete updateData.createdById;

    // Konvertiere Datum-Felder
    if (updateData.voe) {
      updateData.voe = new Date(updateData.voe);
    }
    if (updateData.voeDate) {
      updateData.voeDate = new Date(updateData.voeDate);
    }

    // Update InputPlan
    const updatedPlan = await prisma.inputPlan.update({
      where: { id },
      data: {
        ...updateData,
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

    try {
      const fields = Object.keys(updateData);
      for (const field of fields) {
        if ((existingPlan as any)[field] !== (updatedPlan as any)[field]) {
          await prisma.inputPlanHistory.create({
            data: {
              inputPlanId: id,
              action: "UPDATE",
              changedBy: session.user.name ?? session.user.email ?? session.user.id ?? "Unknown",
              changedById: session.user.id,
              field,
              oldValue: (existingPlan as any)[field]?.toString() ?? null,
              newValue: (updatedPlan as any)[field]?.toString() ?? null,
              previousData: existingPlan,
              newData: updatedPlan,
              changedAt: new Date(),
            }
          });
        }
      }
    } catch (historyError) {
      console.error("Fehler beim Schreiben der History:", historyError);
    }

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

    try {
      await prisma.inputPlanHistory.create({
        data: {
          inputPlanId: id,
          action: "DELETE",
          changedBy: session.user.name ?? session.user.email ?? session.user.id ?? "Unknown",
          changedById: session.user.id,
          previousData: existingPlan,
          newData: Prisma.JsonNull,
          changedAt: new Date(),
        }
      });
    } catch (historyError) {
      console.error("Fehler beim Schreiben der History (DELETE):", historyError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting input plan:", error);
    return NextResponse.json({ error: "Fehler beim Löschen" }, { status: 500 });
  }
}

