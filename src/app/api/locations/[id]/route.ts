import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name } = await request.json();

    const location = await prisma.location.update({
      where: { id: params.id },
      data: { name },
    });

    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Standorts" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Prüfen ob der Standort verwendet wird
    const contentPlansCount = await prisma.contentPlan.count({
      where: { locationId: params.id },
    });

    const inputPlansCount = await prisma.inputPlan.count({
      where: { locationId: params.id },
    });

    if (contentPlansCount > 0 || inputPlansCount > 0) {
      return NextResponse.json(
        { error: "Dieser Standort wird noch verwendet und kann nicht gelöscht werden" },
        { status: 400 }
      );
    }

    await prisma.location.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Löschen des Standorts" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { status } = await request.json();

    if (!["ACTIVE", "INACTIVE"].includes(status)) {
      return NextResponse.json({ error: "Ungültiger Status" }, { status: 400 });
    }

    const location = await prisma.location.update({
      where: { id: params.id },
      data: { status },
    });

    return NextResponse.json(location);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Aktualisieren des Status" },
      { status: 500 }
    );
  }
}