import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export const GET = async (req: NextRequest) => {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    // Query Parameter auslesen
    const { searchParams } = new URL(req.url);
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
    where.location = {
      userLocations: {
        some: {
          userId: session.user.id
        }
      }
    };

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
    
    if (!session) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    const contentPlan = await prisma.contentPlan.create({
      data: {
        // Bestehende Felder
        monat: body.monat,
        bezug: body.bezug,
        mehrwert: body.mehrwert,
        mechanikThema: body.mechanikThema,
        idee: body.idee,
        platzierung: body.platzierung,
        status: body.status || "DRAFT",
        locationId: body.locationId,
        createdById: session.user.id,
        
        // Neue Felder
        implementationLevel: body.implementationLevel || null,
        creativeFormat: body.creativeFormat || null,
        creativeBriefingExample: body.creativeBriefingExample || null,
        copyExample: body.copyExample || null,
        copyExampleCustomized: body.copyExampleCustomized || null,
        firstCommentForEngagement: body.firstCommentForEngagement || null,
        notes: body.notes || null,
        action: body.action || null,
        
        // Status-Tracking
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