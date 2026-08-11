import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUser,
  getAllowedLocationIds,
  canAccessLocation,
  locationScope,
} from "@/lib/location-access";

export const GET = async (req: NextRequest) => {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    // Query Parameter auslesen
    const { searchParams } = new URL(req.url);
    const locationId = searchParams.get("locationId");
    const status = searchParams.get("status");

    // Where-Klausel aufbauen: immer auf erlaubte Locations eingeschränkt
    const allowed = await getAllowedLocationIds(user);
    const where: any = { ...locationScope(allowed) };

    // Nach Status filtern
    if (status) {
      where.status = status;
    }

    // Nach Location filtern (nur wenn der User darauf Zugriff hat)
    if (locationId) {
      if (!(await canAccessLocation(user, locationId))) {
        return NextResponse.json(
          { error: "Kein Zugriff auf diesen Standort" },
          { status: 403 }
        );
      }
      where.locationId = locationId;
    }

    // Hole gefilterte Content-Pläne
    const contentPlans = await prisma.contentPlan.findMany({
      where,
      include: {
        location: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(contentPlans);
  } catch (error) {
    console.error("Error fetching content plans:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Content-Pläne" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const body = await request.json();

    const {
      monat,
      bezug,
      mehrwert,
      mechanikThema,
      idee,
      platzierung,
      status,
      locationId,
      implementationLevel,
      creativeFormat,
      creativeBriefingExample,
      copyExample,
      copyExampleCustomized,
      firstCommentForEngagement,
      notes,
      action
    } = body;

    if (!(await canAccessLocation(user, locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    const contentPlan = await prisma.contentPlan.create({
      data: {
        monat,
        bezug,
        mehrwert,
        mechanikThema,
        idee,
        platzierung,
        status: status || "DRAFT",
        locationId,
        createdById: user.id,
        implementationLevel: implementationLevel || null,
        creativeFormat: creativeFormat || null,
        creativeBriefingExample: creativeBriefingExample || null,
        copyExample: copyExample || null,
        copyExampleCustomized: copyExampleCustomized || null,
        firstCommentForEngagement: firstCommentForEngagement || null,
        notes: notes || null,
        action: action || null,
        statusChangedAt: new Date(),
        statusChangedById: user.id,
      },
      include: {
        location: true
      }
    });

    return NextResponse.json(contentPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating content plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Content-Plans" },
      { status: 500 }
    );
  }
}