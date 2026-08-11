import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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