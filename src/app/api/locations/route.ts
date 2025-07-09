import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json([], { status: 200 });
    }

    // Gib für alle eingeloggten User alle aktiven Standorte zurück
    const locations = await prisma.location.findMany({
      where: { status: "ACTIVE" },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(locations, { status: 200 });
  } catch (error) {
    console.error("GET Locations error:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // NUR System-Admins (role === "ADMIN") dürfen Standorte erstellen
    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Not authorized - System Admin only" }, { status: 403 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: "Name ist erforderlich" },
        { status: 400 }
      );
    }

    // Location erstellen
    const location = await prisma.location.create({
      data: {
        name: name.trim(),
        status: "ACTIVE",
      },
    });

    return NextResponse.json(location);
  } catch (error) {
    console.error("POST Location error:", error);
    return NextResponse.json(
      { error: "Fehler beim Erstellen des Standorts" },
      { status: 500 }
    );
  }
}
