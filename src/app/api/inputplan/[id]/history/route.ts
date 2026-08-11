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

    const inputPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id },
      select: { locationId: true },
    });

    if (!inputPlan) {
      return NextResponse.json(
        { error: "Input Plan nicht gefunden" },
        { status: 404 }
      );
    }

    if (!(await canAccessLocation(user, inputPlan.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    const history = await prisma.inputPlanHistory.findMany({
      where: { inputPlanId: params.id },
      orderBy: { changedAt: "desc" },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    return NextResponse.json(history);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der History" },
      { status: 500 }
    );
  }
}