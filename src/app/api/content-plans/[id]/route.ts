import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessLocation } from "@/lib/location-access";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const contentPlan = await prisma.contentPlan.findUnique({
      where: { id: params.id },
      include: {
        location: true
      }
    });

    if (!contentPlan) {
      return NextResponse.json(
        { error: "Content-Plan nicht gefunden" },
        { status: 404 }
      );
    }

    if (!(await canAccessLocation(user, contentPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    return NextResponse.json(contentPlan);
  } catch (error) {
    console.error("Error fetching content plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden des Content-Plans" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validStatuses = ['DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED'];

    // Hole den aktuellen Plan für Vergleiche
    const currentPlan = await prisma.contentPlan.findUnique({
      where: { id: params.id },
      include: {
        location: true  // Wichtig: Location-Daten einschließen
      }
    });

    if (!currentPlan) {
      return NextResponse.json({ error: "Plan nicht gefunden" }, { status: 404 });
    }

    if (!(await canAccessLocation(user, currentPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    // Ziel-Standort validieren (Plan darf nur in erlaubte Standorte verschoben werden)
    if (body.locationId && body.locationId !== currentPlan.locationId) {
      if (!(await canAccessLocation(user, body.locationId))) {
        return NextResponse.json(
          { error: "Kein Zugriff auf den Ziel-Standort" },
          { status: 403 }
        );
      }
    }

    // Validiere den Status
    const status = body.status && validStatuses.includes(body.status)
      ? body.status
      : 'DRAFT';

    const updateData = {
      monat: body.monat,
      bezug: body.bezug,
      mehrwert: body.mehrwert || null,
      mechanikThema: body.mechanikThema,
      idee: body.idee,
      platzierung: body.platzierung,
      status: status,
      locationId: body.locationId,
      
      // ALLE neuen Felder hinzufügen:
      implementationLevel: body.implementationLevel || null,
      creativeFormat: body.creativeFormat || null,
      creativeBriefingExample: body.creativeBriefingExample || null,
      copyExample: body.copyExample || null,
      copyExampleCustomized: body.copyExampleCustomized || null,
      firstCommentForEngagement: body.firstCommentForEngagement || null,
      notes: body.notes || null,
      action: body.action || null,
      
      updatedAt: new Date(),
    };

    // Update den Plan
    const updatedPlan = await prisma.contentPlan.update({
      where: { id: params.id },
      data: updateData,
      include: {
        location: true,
      },
    });

    // Erstelle Historie-Einträge für alle Änderungen
    const historyEntries = [];
    const fields = [
      'monat', 'bezug', 'mehrwert', 'mechanikThema', 
      'idee', 'platzierung', 'status', 'locationId',
      'implementationLevel', 'creativeFormat', 'notes',
      'creativeBriefingExample', 'copyExample', 'copyExampleCustomized',
      'firstCommentForEngagement', 'action'
    ];
    
    for (const field of fields) {
      let oldValue = currentPlan[field as keyof typeof currentPlan];
      let newValue = updateData[field as keyof typeof updateData];
      
      // Spezialbehandlung für locationId - hole die Namen der Standorte
      if (field === 'locationId') {
        // Hole den alten Standort-Namen
        oldValue = currentPlan.location?.name || '';
        
        // Hole den neuen Standort-Namen
        if (newValue && newValue !== currentPlan.locationId) {
          const newLocation = await prisma.location.findUnique({
            where: { id: newValue as string }
          });
          newValue = newLocation?.name || newValue;
        } else {
          continue; // Keine Änderung
        }
      }
      
      // Prüfe ob sich der Wert geändert hat
      if (newValue !== undefined && oldValue !== newValue) {
        historyEntries.push({
          contentPlanId: params.id,
          action: field === 'status' ? 'STATUS_CHANGE' : 'UPDATE',
          fieldName: field === 'locationId' ? 'Standort' : field,
          oldValue: String(oldValue || ''),
          newValue: String(newValue || ''),
          changedById: user.id,
        });
      }
    }

    // Speichere alle Historie-Einträge
    if (historyEntries.length > 0) {
      await prisma.contentPlanHistory.createMany({
        data: historyEntries,
      });
    }

    return NextResponse.json(updatedPlan);
  } catch (error) {
    console.error('Fehler beim Aktualisieren des Content Plans:', error);
    return NextResponse.json(
      { error: 'Fehler beim Aktualisieren des Content Plans' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const contentPlan = await prisma.contentPlan.findUnique({
      where: { id: params.id },
      select: { locationId: true },
    });

    if (!contentPlan) {
      return NextResponse.json(
        { error: "Content-Plan nicht gefunden" },
        { status: 404 }
      );
    }

    if (!(await canAccessLocation(user, contentPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    await prisma.contentPlan.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Content-Plan gelöscht" });
  } catch (error) {
    console.error("Error deleting:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen" },
      { status: 500 }
    );
  }
}