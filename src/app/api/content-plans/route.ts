import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }
    // Ab hier ist session.user garantiert vorhanden!

    // Query Parameter auslesen
    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get("locationId");
    const status = searchParams.get("status");

    // Where-Klausel aufbauen
    const where: any = {};
    
    // Nach Status filtern
    if (status) {
      where.status = status;
    }
    
    // Nach Location filtern
    if (locationId) {
      where.locationId = locationId;
    }

    // Nur Locations des Users (optional - je nach Anforderung)
    // where.location = {
    //   userLocations: {
    //     some: {
    //       userId: session.user.id
    //     }
    //   }
    // };

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

    // Die Felder sind bereits in den Daten, Prisma gibt alle Felder des Models zurück
    // Wir können zur Sicherheit loggen:
    if (contentPlans.length > 0) {
      console.log("Sample content plan fields:", Object.keys(contentPlans[0]));
    }

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
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    console.log("session.user.id:", session.user.id);

    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id }
    });
    if (!dbUser) {
      return NextResponse.json(
        { error: "User für createdById nicht gefunden!" },
        { status: 400 }
      );
    }

    const body = await request.json();
    console.log("Body empfangen:", body);

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
        createdById: session.user.id,
        implementationLevel: implementationLevel || null,
        creativeFormat: creativeFormat || null,
        creativeBriefingExample: creativeBriefingExample || null,
        copyExample: copyExample || null,
        copyExampleCustomized: copyExampleCustomized || null,
        firstCommentForEngagement: firstCommentForEngagement || null,
        notes: notes || null,
        action: action || null,
        statusChangedAt: new Date(),
        statusChangedById: session.user.id,
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