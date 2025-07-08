import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const body = await request.json();
    // Optional: Logge den Body zur Kontrolle
    console.log("RedakPlan POST body:", body);

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
      createdById: session.user.id,
      updatedById: session.user.id,
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

    return NextResponse.json(redakPlan, { status: 201 });
  } catch (error) {
    console.error("Error creating RedakPlan:", error);
    return NextResponse.json({ error: "Fehler beim Erstellen des RedakPlans" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Nicht eingeloggt" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const monat = searchParams.get("monat");
    const status = searchParams.get("status");

    // Optional: Logge die Suchparameter zur Kontrolle
    console.log("RedakPlan GET searchParams:", { monat, status });

    const allowedStatus = ["DRAFT", "IN_PROGRESS", "REVIEW", "APPROVED", "COMPLETED"];
    const where: any = { createdById: session.user.id };
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

