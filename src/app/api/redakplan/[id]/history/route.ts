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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const redakPlan = await prisma.redakPlan.findUnique({
      where: { id: params.id },
      select: { locationId: true },
    });
    if (!redakPlan) {
      return NextResponse.json(
        { error: "RedakPlan nicht gefunden" },
        { status: 404 }
      );
    }
    if (!(await canAccessLocation(user, redakPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    const history = await prisma.redakPlanHistory.findMany({
      where: { redakPlanId: params.id },
      orderBy: { changedAt: "desc" },
      include: {
        changedBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Historie" },
      { status: 500 }
    );
  }
}