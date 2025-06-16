import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), { status: 401 });
  }
  const id = params.id as string;

  // 1. InputPlan holen
  const inputPlan = await prisma.inputPlan.findUnique({ where: { id } });
  if (!inputPlan) {
    return new Response(JSON.stringify({ error: "Nicht gefunden" }), { status: 404 });
  }
  if (!inputPlan.voe) {
    return new Response(JSON.stringify({ error: "VÖ-Datum ist erforderlich!" }), { status: 400 });
  }

  // 2. Prüfen, ob bereits ein RedakPlan existiert
  const alreadyCopied = await prisma.redakPlan.findFirst({
    where: { inputPlanId: id }
  });
  if (alreadyCopied) {
    return new Response(JSON.stringify({ error: "Schon in RedakPlan übernommen." }), { status: 409 });
  }

  // 3. Kopieren: Felder übernehmen, Status setzen, Referenz speichern
  const redakPlan = await prisma.redakPlan.create({
    data: {
      inputPlanId: inputPlan.id,
      monat: inputPlan.monat,
      bezug: inputPlan.bezug,
      mechanikThema: inputPlan.mechanikThema,
      idee: inputPlan.idee,
      platzierung: inputPlan.platzierung,
      voe: inputPlan.voe, // angepasst
      status: "DRAFT", // Initialstatus im RedakPlan
      publiziert: false,
      locationId: inputPlan.locationId,
      createdById: session.user.id,
      updatedById: session.user.id,
    },
  });

  return new Response(JSON.stringify(redakPlan), { status: 201 });
}
