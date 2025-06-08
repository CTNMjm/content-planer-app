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

    const inputPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id },
      include: {
        contentPlan: true,
        location: true,
        createdBy: true,
        updatedBy: true,
        redakPlans: true
      }
    });

    if (!inputPlan) {
      return NextResponse.json(
        { error: "Input-Plan nicht gefunden" },
        { status: 404 }
      );
    }

    return NextResponse.json(inputPlan);
  } catch (error) {
    console.error("Error fetching input plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden des Input-Plans" },
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
    
    console.log("Received update data:", body);
    
    // Validiere die Status-Werte
    const validStatuses = ['DRAFT', 'IN_PROGRESS', 'REVIEW', 'APPROVED', 'COMPLETED'];
    
    // Update Input Plan mit den korrekten Feldern
    const updateData: any = {};
    
    // Nur Felder hinzufügen, die tatsächlich gesendet wurden und nicht undefined sind
    if (body.monat !== undefined) updateData.monat = body.monat;
    if (body.bezug !== undefined) updateData.bezug = body.bezug;
    if (body.mehrwert !== undefined) updateData.mehrwert = body.mehrwert || null;
    if (body.mechanikThema !== undefined) updateData.mechanikThema = body.mechanikThema;
    if (body.idee !== undefined) updateData.idee = body.idee;
    if (body.platzierung !== undefined) updateData.platzierung = body.platzierung;
    if (body.status !== undefined && validStatuses.includes(body.status)) {
      updateData.status = body.status;
    }
    if (body.voe !== undefined) updateData.voe = body.voe ? new Date(body.voe) : null;
    if (body.zusatzinfo !== undefined) updateData.zusatzinfo = body.zusatzinfo || null;
    if (body.gptResult !== undefined) updateData.gptResult = body.gptResult || null;
    if (body.contentPlanId !== undefined) updateData.contentPlanId = body.contentPlanId;
    if (body.locationId !== undefined) updateData.locationId = body.locationId;
    
    // User ID für updatedBy
    if (session.user?.id) {
      updateData.updatedById = session.user.id;
    }
    
    console.log("Update data to be saved:", updateData);
    
    const inputPlan = await prisma.inputPlan.update({
      where: { id: params.id },
      data: updateData
    });

    // Fetch updated plan with relations
    const updatedPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id },
      include: {
        contentPlan: true,
        location: true,
        createdBy: true,
        updatedBy: true,
        redakPlans: true
      }
    });

    return NextResponse.json(updatedPlan);
  } catch (error: any) {
    console.error("Error updating input plan:", error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Input-Plan nicht gefunden" },
        { status: 404 }
      );
    }
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: "Eindeutigkeitsverletzung" },
        { status: 400 }
      );
    }
    
    if (error.code === 'P2003') {
      return NextResponse.json(
        { error: "Referenzfehler: Verknüpfte Daten nicht gefunden" },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Input-Plans: " + error.message },
      { status: 500 }
    );
  }
}

export async function PATCH(
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
    
    // Nur Status aktualisieren
    const inputPlan = await prisma.inputPlan.update({
      where: { id: params.id },
      data: {
        status: body.status,
        updatedById: session.user?.id,
      }
    });

    return NextResponse.json(inputPlan);
  } catch (error: any) {
    console.error("Error updating input plan status:", error);
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Status" },
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

    await prisma.inputPlan.delete({
      where: { id: params.id }
    });

    return NextResponse.json({ message: "Input-Plan gelöscht" });
  } catch (error) {
    console.error("Error deleting input plan:", error);
    return NextResponse.json(
      { error: "Fehler beim Löschen des Input-Plans" },
      { status: 500 }
    );
  }
}
