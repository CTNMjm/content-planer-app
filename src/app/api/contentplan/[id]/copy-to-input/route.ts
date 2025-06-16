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
    return new Response(JSON.stringify({ error: "Nur freigegebene Pläne können übertragen werden." }), { status: 400 });
  }

  // 2. Prüfen, ob es bereits einen InputPlan mit Bezug gibt
  const alreadyCopied = await prisma.inputPlan.findFirst({
    where: { contentPlanId: id }
  });
  if (alreadyCopied) {
    return new Response(JSON.stringify({ error: "Bereits übertragen." }), { status: 409 });
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
    },
  });

  // NEU: Historie-Eintrag für die Erstellung
  await prisma.inputPlanHistory.create({
    data: {
      inputPlanId: inputPlan.id,
      field: "created_from_contentplan",
      oldValue: null,
      newValue: `Erstellt aus ContentPlan: ${contentPlan.id} - ${contentPlan.idee}`,
      changedById: session.user.id,
    }
  });

  // 4. Status im ContentPlan auf COMPLETED setzen mit Tracking-Feldern
  await prisma.contentPlan.update({
    where: { id: contentPlan.id },
    data: { 
      status: "COMPLETED",
      updatedById: session.user.id,
      statusChangedAt: new Date(),
      statusChangedById: session.user.id,
    },
  });

  // 5. History-Eintrag erstellen
  await prisma.contentPlanHistory.create({
    data: {
      contentPlanId: contentPlan.id,
      action: 'STATUS_CHANGE',
      fieldName: 'status',
      oldValue: 'APPROVED',
      newValue: 'COMPLETED',
      changedById: session.user.id,
      metadata: JSON.stringify({
        reason: 'Erfolgreich in Input-Plan übertragen',
        inputPlanId: inputPlan.id,
        timestamp: new Date().toISOString(),
      }),
    },
  });

  return new Response(JSON.stringify({
    success: true,
    inputPlan,
    message: "Plan erfolgreich in Input-Liste übertragen"
  }), { status: 201 });
}
