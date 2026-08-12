import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessLocation } from "@/lib/location-access";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    // Hole den ContentPlan zuerst (für Location-Check und Erstellungseintrag)
    const contentPlan = await prisma.contentPlan.findUnique({
      where: { id: params.id },
      include: {
        createdBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
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

    // Hole Historie mit User-Informationen
    const history = await prisma.contentPlanHistory.findMany({
      where: { contentPlanId: params.id },
      include: {
        changedBy: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: { changedAt: 'desc' },
    });

    // Füge Erstellungseintrag hinzu, falls ContentPlan existiert
    const historyWithCreation = [...history];
    
    if (contentPlan) {
      historyWithCreation.push({
        id: `created-${contentPlan.id}`,
        contentPlanId: contentPlan.id,
        action: 'CREATE',
        fieldName: null,
        oldValue: null,
        newValue: null,
        changedAt: contentPlan.createdAt,
        changedById: contentPlan.createdById,
        changedBy: contentPlan.createdBy,
        metadata: null,
      });
    }

    // Sortiere nach Datum (neueste zuerst)
    const sortedHistory = historyWithCreation.sort(
      (a, b) => new Date(b.changedAt).getTime() - new Date(a.changedAt).getTime()
    );

    return NextResponse.json(sortedHistory);
  } catch (error) {
    console.error("Error fetching history:", error);
    return NextResponse.json(
      { error: "Fehler beim Abrufen der Historie" },
      { status: 500 }
    );
  }
}