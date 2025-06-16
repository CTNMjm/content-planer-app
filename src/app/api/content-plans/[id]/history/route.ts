import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
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

    // Hole auch den Erstellungseintrag aus dem ContentPlan
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