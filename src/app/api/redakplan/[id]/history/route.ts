import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
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