import { NextRequest } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";

const prisma = new PrismaClient();

const N8N_WEBHOOK_URL = process.env.N8N_AI_WEBHOOK_URL || "https://dein-n8n-server/webhook/ai-generate";

export async function POST(req: NextRequest, { params }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), { status: 401 });
  }
  const id = params.id as string;

  // 1. InputPlan-Eintrag holen
  const inputPlan = await prisma.inputPlan.findUnique({ where: { id } });
  if (!inputPlan) {
    return new Response(JSON.stringify({ error: "Nicht gefunden" }), { status: 404 });
  }

  // 2. KI-Request an n8n schicken
  try {
    const n8nRes = await fetch(N8N_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        idee: inputPlan.idee,
        mechanikThema: inputPlan.mechanikThema,
        mehrwert: inputPlan.mehrwert,
        platzierung: inputPlan.platzierung,
        // Weitere Felder nach Bedarf
      }),
    });
    const n8nData = await n8nRes.json();

    // 3. Ergebnis speichern (z. B. in gptResult)
    await prisma.inputPlan.update({
      where: { id },
      data: { gptResult: n8nData.gptResult || JSON.stringify(n8nData) }
    });

    return new Response(JSON.stringify({ ok: true, gptResult: n8nData.gptResult }), { status: 200 });
  } catch (e) {
    return new Response(JSON.stringify({ error: "KI-Automatisierung fehlgeschlagen" }), { status: 500 });
  }
}
