import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions"; // KORREKTER PFAD
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    const history = await prisma.inputPlanHistory.findMany({
      where: {
        inputPlanId: params.id
      },
      include: {
        changedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        changedAt: 'desc'
      }
    });

    return NextResponse.json(history);
  } catch (error) {
    console.error("Error fetching input plan history:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Historie" },
      { status: 500 }
    );
  }
}