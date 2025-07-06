import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const history = await prisma.inputPlanHistory.findMany({
      where: { inputPlanId: params.id },
      orderBy: { changedAt: "desc" },
      include: {
        changedByUser: {
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