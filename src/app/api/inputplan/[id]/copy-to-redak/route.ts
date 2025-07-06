import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    console.log("=== COPY TO REDAK START ===");
    
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), { status: 401 });
    }
    
    const id = params.id as string;
    console.log("InputPlan ID:", id);

    // 1. InputPlan holen
    const inputPlan = await prisma.inputPlan.findUnique({ where: { id } });
    if (!inputPlan) {
      return new Response(JSON.stringify({ error: "Nicht gefunden" }), { status: 404 });
    }
    console.log("InputPlan Status vorher:", inputPlan.status);
    
    if (!inputPlan.voe) {
      return new Response(JSON.stringify({ error: "VÖ-Datum ist erforderlich!" }), { status: 400 });
    }

    // 2. Prüfen, ob bereits ein RedakPlan existiert
    const alreadyCopied = await prisma.redakPlan.findFirst({
      where: { inputPlanId: id }
    });
    if (alreadyCopied) {
      console.log("Bereits kopiert!");
      return new Response(JSON.stringify({ error: "Schon in RedakPlan übernommen." }), { status: 409 });
    }

    // 3. Transaktion: Kopieren UND Status ändern
    const result = await prisma.$transaction(async (tx) => {
      console.log("Transaktion startet...");
      
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
          createdById: session.user.id,
          updatedById: session.user.id,
        },
      });
      console.log("RedakPlan erstellt:", redakPlan.id);

      // 3b. InputPlan Status auf COMPLETED setzen
      const updatedInputPlan = await tx.inputPlan.update({
        where: { id: inputPlan.id },
        data: {
          status: "COMPLETED",
          updatedById: session.user.id,
        }
      });
      console.log("InputPlan Status nachher:", updatedInputPlan.status);

      // 3c. History-Eintrag für die Statusänderung
      await tx.inputPlanHistory.create({
        data: {
          inputPlanId: inputPlan.id,
          action: "UPDATE",
          changedBy: session.user.name || session.user.email || session.user.id || "System",
          changedById: session.user.id,
          field: "status",
          oldValue: inputPlan.status,
          newValue: "COMPLETED",
          previousData: inputPlan,
          newData: updatedInputPlan,
          changedAt: new Date(),
        }
      });
      console.log("History-Eintrag erstellt");

      return { redakPlan, updatedInputPlan };
    });

    console.log("=== COPY TO REDAK SUCCESS ===");
    return new Response(JSON.stringify(result.redakPlan), { status: 201 });
    
  } catch (error) {
    console.error("=== COPY TO REDAK ERROR ===", error);
    return new Response(
      JSON.stringify({ error: "Fehler beim Kopieren", details: error instanceof Error ? error.message : "Unknown error" }), 
      { status: 500 }
    );
  }
}
