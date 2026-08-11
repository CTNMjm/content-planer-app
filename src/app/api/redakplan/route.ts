import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  getSessionUser,
  getAllowedLocationIds,
  canAccessLocation,
  locationScope,
} from "@/lib/location-access";

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const body = await request.json();

    const {
      monat,
      bezug,
      mehrwert,
      mechanikThema,
      idee,
      platzierung,
      voe,
      zusatzinfo,
      locationId,
      status,
      inputPlanId
    } = body;

    if (!(await canAccessLocation(user, locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    const data: any = {
      monat,
      bezug,
      mehrwert,
      mechanikThema,
      idee,
      platzierung,
      zusatzinfo,
      locationId,
      status: "IN_PROGRESS",
      inputPlanId,
      createdById: user.id,
      updatedById: user.id,
    };

    if (voe) {
      data.voe = new Date(voe);
    }

    const redakPlan = await prisma.redakPlan.create({
      data,
      include: {
        location: true,
        inputPlan: true,
        createdBy: true,
        updatedBy: true
      }
    });

    await prisma.redakPlanHistory.create({
      data: {
        redakPlanId: redakPlan.id,
        changedAt: new Date(),
        changedById: user.id,
        action: "CREATED_FROM_INPUTPLAN",
        fieldName: "created_from_inputplan",
        oldValue: inputPlanId,
        newValue: null,
      }
    });

    return NextResponse.json(redakPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating RedakPlan:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen des RedakPlans" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monat = searchParams.get("monat");
    const status = searchParams.get("status");

    const allowedStatus = ["DRAFT", "IN_PROGRESS", "REVIEW", "APPROVED", "COMPLETED"];
    // Scope: alle Pläne der Standorte, auf die der User Zugriff hat
    // (vorher: nur eigene Pläne via createdById — Kollegen am selben Standort sahen nichts)
    const allowed = await getAllowedLocationIds(user);
    const where: any = { ...locationScope(allowed) };
    if (monat) where.monat = monat;
    if (status && allowedStatus.includes(status)) where.status = status;

    const redakPläne = await prisma.redakPlan.findMany({
      where,
      include: {
        location: true,
        inputPlan: true,
        createdBy: true,
        updatedBy: true
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(redakPläne, { status: 200 });
  } catch (error) {
    console.error("Error fetching RedakPläne:", error);
    return NextResponse.json({ error: "Fehler beim Laden der RedakPläne" }, { status: 500 });
  }
}

