import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Hole alle UserLocations mit Permissions
    const userLocations = await prisma.userLocation.findMany({
      where: { userId: session.user.id },
      include: {
        permissions: true,
        roles: {
          include: {
            role: true
          }
        }
      }
    });

    // Sammle alle Permissions über alle Locations
    const allPermissions = new Set<string>();
    
    userLocations.forEach(userLocation => {
      // Direkte Permissions
      userLocation.permissions.forEach(p => allPermissions.add(p.name));
      
      // Admin-Rolle gibt automatisch alle Rechte
      const isLocationAdmin = userLocation.roles.some(r => 
        r.role.name === 'ADMIN' || r.role.name === 'LOCATION_ADMIN'
      );
      
      if (isLocationAdmin) {
        // Füge alle möglichen Permissions hinzu
        ['content', 'input', 'redak'].forEach(prefix => {
          ['view', 'create', 'edit', 'delete', 'approve'].forEach(action => {
            allPermissions.add(`${prefix}.${action}`);
          });
        });
      }
    });

    // Globaler Admin hat alle Rechte
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role === 'ADMIN') {
      ['content', 'input', 'redak'].forEach(prefix => {
        ['view', 'create', 'edit', 'delete', 'approve'].forEach(action => {
          allPermissions.add(`${prefix}.${action}`);
        });
      });
    }

    return NextResponse.json({ 
      permissions: Array.from(allPermissions).sort() 
    });
  } catch (error) {
    console.error("Error fetching all permissions:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}