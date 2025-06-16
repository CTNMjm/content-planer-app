import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    // ADMIN-KONTEXT: Für die Admin-Verwaltungsseite
    // Admins sehen ALLE Locations zur Verwaltung
    const isAdminPage = req.headers.get('referer')?.includes('/admin/locations');
    
    if (isAdminPage && session.user.role === "ADMIN") {
      const allLocations = await prisma.location.findMany({
        orderBy: { name: "asc" },
      });
      
      return new Response(JSON.stringify(allLocations), { status: 200 });
    }

    // USER-KONTEXT: Für Content-/Input-Plan
    // User sehen nur ihre zugeordneten Locations
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        userLocations: {
          include: { location: true }
        }
      }
    });

    const locations = user?.userLocations
      .map((ul) => ul.location)
      .filter((loc) => loc.status === "ACTIVE") || [];

    return new Response(JSON.stringify(locations), { status: 200 });
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
