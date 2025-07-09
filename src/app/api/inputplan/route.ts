import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma"; // ggf. anpassen

export async function POST(req: NextRequest) {
  // HIER: Debug-Logging hinzufügen
  console.log("=== InputPlan POST Request ===");
  console.log("Headers:", Object.fromEntries(req.headers.entries()));
  console.log("Cookies:", req.cookies.getAll());
  
  try {
    const session = await getServerSession(authOptions);
    console.log("Session:", session ? "Found" : "Not found");
    console.log("User ID:", session?.user?.id);
    console.log("Full session:", JSON.stringify(session, null, 2));
    
    if (!session?.user?.id) {
      console.error("No session found - returning 401");
      return NextResponse.json(
        { error: "Nicht autorisiert" },
        { status: 401 }
      );
    }

    const data = await req.json();
    console.log("Request data:", data);
    
    // Füge die userId aus der Session hinzu
    const inputPlanData = {
      ...data,
      createdById: session.user.id,
      updatedById: session.user.id,
    };

    console.log("Creating InputPlan with data:", inputPlanData);

    const inputPlan = await prisma.inputPlan.create({
      data: inputPlanData,
      include: {
        location: true,
        createdBy: true,
      },
    });

    return NextResponse.json(inputPlan);
  } catch (error) {
    console.error("Error in POST /api/inputplan:", error);
    
    // Detailliertere Fehlerausgabe
    if (error instanceof Error) {
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);
      
      // Prisma-spezifische Fehler
      if (error.message.includes("Foreign key constraint")) {
        return NextResponse.json(
          { error: "Ungültige Referenz (z.B. Location ID)" },
          { status: 400 }
        );
      }
      
      if (error.message.includes("Unique constraint")) {
        return NextResponse.json(
          { error: "Dieser Eintrag existiert bereits" },
          { status: 409 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: "Fehler beim Erstellen des Input-Plans",
        details: error instanceof Error ? error.message : "Unbekannter Fehler"
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const inputPlans = await prisma.inputPlan.findMany({
      include: { location: true },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json(inputPlans);
  } catch (error) {
    return NextResponse.json(
      { error: "Fehler beim Laden der Input-Pläne" },
      { status: 500 }
    );
  }
}

