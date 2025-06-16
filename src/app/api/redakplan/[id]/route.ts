import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/authOptions";

// UPDATE RedakPlan-Eintrag (PUT)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), { status: 401 });
  }
  
  try {
    const data = await req.json();
    const id = params.id;

    // Validiere die Felder gemäß Schema
    const updateData: any = {};
    
    // Nur die Felder updaten, die im Schema existieren
    const allowedFields = ['monat', 'bezug', 'mechanikThema', 'idee', 'platzierung', 'voe', 'status', 'publiziert', 'inputPlanId'];
    
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }
    
    // Datum konvertieren
    if (updateData.voe) {
      updateData.voe = new Date(updateData.voe);
    }

    updateData.updatedById = session.user.id;

    const redakPlan = await prisma.redakPlan.update({
      where: { id },
      data: updateData,
      include: {
        location: true,
        inputPlan: true,
        createdBy: true,
        updatedBy: true
      }
    });
    
    return new Response(JSON.stringify(redakPlan), { status: 200 });
  } catch (error) {
    console.error('Update error:', error);
    return new Response(JSON.stringify({ error: "Fehler beim Update" }), { status: 400 });
  }
}

// DELETE RedakPlan-Eintrag
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return new Response(JSON.stringify({ error: "Nicht eingeloggt" }), { status: 401 });
  }
  
  try {
    const id = params.id;
    
    // Prüfe ob der User berechtigt ist
    const redakPlan = await prisma.redakPlan.findUnique({
      where: { id },
      include: {
        location: {
          include: {
            userLocations: {
              where: { userId: session.user.id }
            }
          }
        }
      }
    });
    
    if (!redakPlan || redakPlan.location.userLocations.length === 0) {
      return new Response(JSON.stringify({ error: "Keine Berechtigung" }), { status: 403 });
    }
    
    await prisma.redakPlan.delete({ where: { id } });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(JSON.stringify({ error: "Fehler beim Löschen" }), { status: 400 });
  }
}
