import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
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

    const contentPlan = await prisma.contentPlan.findUnique({
      where: { id: params.id },
      include: {
        location: true
      }
    });

    if (!contentPlan) {
      return NextResponse.json(
        { error: "Content-Plan nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(contentPlan);
  } catch (error) {
    console.error("Error fetching content plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden des Content-Plans" },
      { status: 500 }
    );
  }
}

export async function PUT(
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

    const body = await request.json();
    
    // Vereinfachtes Update ohne komplexe Includes
    await prisma.contentPlan.update({
      where: { id: params.id },
      data: {
        monat: body.monat,
        bezug: body.bezug,
        mehrwert: body.mehrwert || null,
        mechanikThema: body.mechanikThema,
        idee: body.idee,
        platzierung: body.platzierung,
        status: body.status || "DRAFT",
        locationId: body.locationId,
      }
    });

    // Separater Query für Response
    const updated = await prisma.contentPlan.findUnique({
      where: { id: params.id },
      include: {
        location: true
      }
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Content-Plan nicht gefunden" },
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren" },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    await prisma.contentPlan.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Content-Plan gelöscht" });
  } catch (error) {
    console.error("Error deleting:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen" },
      { status: 500 }
    );
  }
}