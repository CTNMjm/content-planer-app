import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

// POST: Kopiert einen ContentPlan nach InputPlan
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), { status: 401 });
  }
  const id = params.id;
  // 1. ContentPlan holen (alle Felder laden)
  const contentPlan = await prisma.contentPlan.findUnique({ where: { id } });
  if (!contentPlan) {
    return new Response(JSON.stringify({ error: "Nicht gefunden" }), { status: 404 });
  }
  if (contentPlan.status === "COMPLETED") {
    return new Response(JSON.stringify({ error: "Abgeschlossene Beiträge können nicht mehr übertragen werden." }), { status: 400 });
  }
  if (contentPlan.status !== "APPROVED") {
    return new Response(JSON.stringify({ error: "Nur Einträge mit Status 'Bereit' können kopiert werden." }), { status: 400 });
  }

  // 2. Prüfen, ob es bereits einen InputPlan mit Bezug gibt
  const alreadyCopied = await prisma.inputPlan.findFirst({
    where: { contentPlanId: id }
  });
  if (alreadyCopied) {
    return new Response(JSON.stringify({ error: "Schon kopiert." }), { status: 409 });
  }

  // 3. Kopieren: Alle Felder übernehmen, Referenz setzen
  const inputPlan = await prisma.inputPlan.create({
    data: {
      contentPlanId: contentPlan.id,
      monat: contentPlan.monat,
      bezug: contentPlan.bezug,
      mehrwert: contentPlan.mehrwert,
      mechanikThema: contentPlan.mechanikThema,
      idee: contentPlan.idee,
      platzierung: contentPlan.platzierung,
      status: "DRAFT", // InputPlan startet immer als Entwurf!
      locationId: contentPlan.locationId,
      createdById: session.user.id,
      updatedById: session.user.id,
      // weitere Felder können hier ergänzt werden, falls im Schema vorhanden
    },
  });

  // 4. Status im ContentPlan auf COMPLETED setzen
  await prisma.contentPlan.update({
    where: { id: contentPlan.id },
    data: { status: "COMPLETED" },
  });

  return new Response(JSON.stringify(inputPlan), { status: 201 });
}
