import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

console.log("InputPlan route.ts loaded successfully"); // DEBUG

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
    const session = await getServerSession(authOptions);
    console.log("POST /api/inputplan - Session:", session?.user?.email); // DEBUG
    
    if (!session) {
      console.log("POST /api/inputplan - No session found"); // DEBUG
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log("POST /api/inputplan - Body received:", {
      monat: body.monat,
      locationId: body.locationId,
      createdById: body.createdById,
      contentPlanId: body.contentPlanId
    }); // DEBUG nur wichtige Felder
    
    // Bereite die Daten vor und filtere ungültige Werte
    const data: any = {
      // Basis-Felder
      monat: body.monat,
      bezug: body.bezug,
      mehrwert: body.mehrwert,
      mechanikThema: body.mechanikThema,
      idee: body.idee,
      platzierung: body.platzierung,
      
      // Neue Felder vom ContentPlan
      implementationLevel: body.implementationLevel || null,
      creativeFormat: body.creativeFormat || null,
      creativeBriefingExample: body.creativeBriefingExample || null,
      copyExample: body.copyExample || null,
      copyExampleCustomized: body.copyExampleCustomized || null,
      firstCommentForEngagement: body.firstCommentForEngagement || null,
      notes: body.notes || null,
      action: body.action || null,
      
      // InputPlan spezifische Felder
      status: body.status || "DRAFT",
      zusatzinfo: body.zusatzinfo || "",
      gptResult: body.gptResult || null,
      n8nResult: body.n8nResult || null,
      flag: body.flag || false,
      voe: body.voe ? new Date(body.voe) : null,
      voeDate: body.voeDate ? new Date(body.voeDate) : null,
      
      // Meta-Felder
      locationId: body.locationId,
      createdById: session.user.id,
      updatedById: session.user.id,
    };

    // Nur hinzufügen wenn contentPlanId vorhanden
    if (body.contentPlanId) {
      data.contentPlanId = body.contentPlanId;
    }

    console.log("POST /api/inputplan - Creating with data fields:", Object.keys(data));
    console.log("Required fields check:");
    console.log("- locationId:", data.locationId);
    console.log("- createdById:", data.createdById);
    console.log("- monat:", data.monat);
    
    // Validierung
    if (!data.locationId || !data.createdById) {
      console.error("Missing required fields!");
      return NextResponse.json(
        { error: "LocationId oder CreatedById fehlt" },
        { status: 400 }
      );
    }

    console.log("About to create InputPlan with prisma...");
    
    const inputPlan = await prisma.inputPlan.create({
      data: {
        ...data,
        createdById: session.user.id,
        locationId: data.locationId,
      },
    });
    
    // NEU: Historie-Eintrag für neue Erstellung
    await prisma.inputPlanHistory.create({
      data: {
        inputPlanId: inputPlan.id,
        field: "created",
        oldValue: null,
        newValue: "Neuer InputPlan erstellt",
        changedById: session.user.id,
      }
    });

    console.log("InputPlan created successfully:", inputPlan.id);

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

