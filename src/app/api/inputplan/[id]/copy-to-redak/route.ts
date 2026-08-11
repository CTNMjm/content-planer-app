import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser, canAccessLocation } from "@/lib/location-access";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await getSessionUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), { status: 401 });
    }

    const id = params.id as string;

    // 1. InputPlan holen
    const inputPlan = await prisma.inputPlan.findUnique({ where: { id } });
    if (!inputPlan) {
      return new Response(JSON.stringify({ error: "Nicht gefunden" }), { status: 404 });
    }

    if (!(await canAccessLocation(user, inputPlan.locationId))) {
      return new Response(
        JSON.stringify({ error: "Kein Zugriff auf diesen Standort" }),
        { status: 403 }
      );
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

    // 3. Transaktion: Kopieren UND Status ändern
    const result = await prisma.$transaction(async (tx) => {
      // 3a. RedakPlan erstellen
      const redakPlan = await tx.redakPlan.create({
        data: {
          inputPlanId: inputPlan.id,
          monat: inputPlan.monat,
          bezug: inputPlan.bezug,
          mechanikThema: inputPlan.mechanikThema,
          idee: inputPlan.idee,
          platzierung: inputPlan.platzierung,
          voe: inputPlan.voe as Date,
          status: "DRAFT",
          publiziert: false,
          locationId: inputPlan.locationId,
          createdById: user.id,
          updatedById: user.id,
        },
      });

      // 3b. InputPlan Status auf COMPLETED setzen
      const updatedInputPlan = await tx.inputPlan.update({
        where: { id: inputPlan.id },
        data: {
          status: "COMPLETED",
          updatedById: user.id,
        }
      });

      // 3c. History-Eintrag für die Statusänderung
      await tx.inputPlanHistory.create({
        data: {
          inputPlanId: inputPlan.id,
          action: "UPDATE",
          changedById: user.id,
          field: "status",
          oldValue: inputPlan.status,
          newValue: "COMPLETED",
          previousData: inputPlan,
          newData: updatedInputPlan,
          changedAt: new Date(),
        }
      });
      return { redakPlan, updatedInputPlan };
    });

    return new Response(JSON.stringify(result.redakPlan), { status: 201 });

  } catch (error) {
    console.error("Fehler beim Kopieren in den RedakPlan:", error);
    return new Response(
      JSON.stringify({ error: "Fehler beim Kopieren", details: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500 }
    );
  }
}
