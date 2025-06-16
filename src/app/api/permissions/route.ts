import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const locationId = searchParams.get('locationId');

    if (!locationId) {
      return NextResponse.json({ error: "Location ID required" }, { status: 400 });
    }

    // Hole die Berechtigungen des Users für diese Location
    const userLocation = await prisma.userLocation.findUnique({
      where: {
        userId_locationId: {
          userId: session.user.id,
          locationId: locationId,
        },
      },
      include: {
        permissions: true,
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!userLocation) {
      return NextResponse.json({ permissions: [] });
    }

    // Sammle alle Permissions
    const permissions = userLocation.permissions.map(p => p.name);

    // Admin-Rolle hat automatisch alle Rechte
    const isAdmin = userLocation.roles.some(r => r.role.name === 'ADMIN');
    if (isAdmin) {
      permissions.push('content.approve', 'content.create', 'content.edit', 'content.delete');
    }

    return NextResponse.json({ 
      permissions: [...new Set(permissions)], // Duplikate entfernen
      roles: userLocation.roles.map(r => r.role.name),
    });
  } catch (error) {
    console.error("Error fetching permissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}