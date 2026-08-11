import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUser,
  getAllowedLocationIds,
  canAccessLocation,
  locationScope,
} from "@/lib/location-access";

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const data = await req.json();

    // Audit-/System-Felder dürfen nicht vom Client gesetzt werden
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      deletedAt: _deletedAt,
      deletedById: _deletedById,
      createdById: _createdById,
      updatedById: _updatedById,
      ...planData
    } = data;

    if (!(await canAccessLocation(user, planData.locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    const inputPlan = await prisma.inputPlan.create({
      data: {
        ...planData,
        createdById: user.id,
        updatedById: user.id,
      },
      include: {
        location: true,
        createdBy: true,
      },
    });

    return NextResponse.json(inputPlan);
  } catch (error) {
    console.error("Error in POST /api/inputplan:", error);

    if (error instanceof Error) {
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Ungültige Referenz (z.B. Location ID)" },
          { status: 400 }
        );
      }

      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Dieser Eintrag existiert bereits" },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: "Fehler beim Erstellen des Input-Plans" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht autorisiert" }, { status: 401 });
    }

    const allowed = await getAllowedLocationIds(user);
    const inputPlans = await prisma.inputPlan.findMany({
      where: { ...locationScope(allowed) },
      include: { location: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(inputPlans);
  } catch (error) {
    console.error("Error in GET /api/inputplan:", error);
    return NextResponse.json(
      { error: "Fehler beim Laden der Input-Pläne" },
      { status: 500 }
    );
  }
}
