import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: "Nicht authentifiziert" },
        { status: 401 }
      );
    }

    // Hole alle Content-Pläne mit Location-Daten
    const contentPlans = await prisma.contentPlan.findMany({
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
        ...body,
        createdById: session.user.id,
        updatedById: session.user.id
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