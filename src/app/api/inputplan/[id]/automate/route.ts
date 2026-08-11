import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessLocation } from "@/lib/location-access";
import axios from "axios";

const N8N_WEBHOOK_URL = process.env.N8N_AI_WEBHOOK_URL || "https://dein-n8n-server/webhook/ai-generate";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getSessionUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), { status: 401 });
  }

  const inputPlanId = params.id;

  try {
    const inputPlan = await prisma.contentPlan.findUnique({  // Geändert zu contentPlan
      where: { id: inputPlanId },
      include: { location: true },
    });

    if (!inputPlan) {
      return new Response(JSON.stringify({ error: "ContentPlan nicht gefunden" }), { status: 404 });
    }

    if (!inputPlan.location) {
        return new Response(JSON.stringify({ error: "Location für ContentPlan nicht gefunden" }), { status: 400 });
    }

    if (!(await canAccessLocation(user, inputPlan.locationId))) {
      return new Response(
        JSON.stringify({ error: "Kein Zugriff auf diesen Standort" }),
        { status: 403 }
      );
    }

    // Daten für den Webhook vorbereiten - angepasst an ContentPlan Felder
    const webhookData = {
      inputPlanId: inputPlan.id,
      monat: inputPlan.monat,
      mechanikThema: inputPlan.mechanikThema,
      bezug: inputPlan.bezug,
      platzierung: inputPlan.platzierung,
      locationName: inputPlan.location.name,
      // Weitere relevante Daten hinzufügen
    };

    // Webhook aufrufen
    const n8nResponse = await axios.post(N8N_WEBHOOK_URL, webhookData);

    // Optional: Antwort von n8n loggen oder verarbeiten
    console.log("n8n Webhook response:", n8nResponse.data);

    return NextResponse.json({ message: "Automatisierung gestartet", data: n8nResponse.data });
  } catch (error) {
    console.error("Fehler beim Starten der Automatisierung:", error);
    let errorMessage = "Fehler beim Starten der Automatisierung.";
    if (axios.isAxiosError(error) && error.response) {
      errorMessage = `Fehler vom Webhook: ${error.response.status} ${JSON.stringify(error.response.data)}`;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new Response(JSON.stringify({ error: errorMessage }), { status: 500 });
  }
}
