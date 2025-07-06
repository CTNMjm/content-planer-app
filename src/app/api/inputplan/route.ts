import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/authOptions";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Input-Plans" },
      { status: 500 }
    );
  }
}

