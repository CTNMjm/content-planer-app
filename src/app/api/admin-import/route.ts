import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    const email = searchParams.get('email');
    
    if (secret !== process.env.ADMIN_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!email) {
      return NextResponse.json({ error: 'Email parameter required' }, { status: 400 });
    }

    // Finde User mit allen Beziehungen
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        userLocations: {
          include: {
            location: true,
            permissions: true
          }
        }
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Hole alle ContentPlans mit Location-Info
    const allContentPlans = await prisma.contentPlan.findMany({
      take: 5,
      include: {
        location: true,
        inputPlans: {
          include: {
            redakPlans: true
          }
        }
      }
    });

    // Prüfe welche Locations der User sehen darf
    const userLocationIds = user.userLocations.map(ul => ul.locationId);

    // Filtere ContentPlans nach User-Berechtigungen
    const visibleContentPlans = allContentPlans.filter(cp => 
      !cp.locationId || userLocationIds.includes(cp.locationId) || user.role === 'ADMIN'
    );

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        userLocations: user.userLocations.map(ul => ({
          locationId: ul.locationId,
          locationName: ul.location.name,
          permissions: ul.permissions
        }))
      },
      debug: {
        totalContentPlans: await prisma.contentPlan.count(),
        userLocationIds,
        allContentPlansSample: allContentPlans.map(cp => ({
          id: cp.id,
          monat: cp.monat,
          bezug: cp.bezug,
          locationId: cp.locationId,
          locationName: cp.location?.name || 'No location'
        })),
        visibleContentPlans: visibleContentPlans.length,
        isAdmin: user.role === 'ADMIN'
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Debug failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.ADMIN_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hole alle ContentPlans ohne Location
    const contentPlansWithoutLocation = await prisma.contentPlan.findMany({
      where: { locationId: null }
    });

    // Hole die erste Location als Default
    const defaultLocation = await prisma.location.findFirst();

    if (!defaultLocation) {
      return NextResponse.json({ error: 'No locations found' }, { status: 400 });
    }

    // Update alle ContentPlans ohne Location
    let updated = 0;
    if (contentPlansWithoutLocation.length > 0) {
      const result = await prisma.contentPlan.updateMany({
        where: { locationId: null },
        data: { locationId: defaultLocation.id }
      });
      updated = result.count;
    }

    // Stelle sicher, dass Admin-User alle Locations sehen kann
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (adminUser) {
      // Hole alle Locations
      const allLocations = await prisma.location.findMany();
      
      // Erstelle UserLocation für jede Location, die der Admin noch nicht hat
      for (const location of allLocations) {
        const exists = await prisma.userLocation.findFirst({
          where: {
            userId: adminUser.id,
            locationId: location.id
          }
        });

        if (!exists) {
          await prisma.userLocation.create({
            data: {
              userId: adminUser.id,
              locationId: location.id,
              permissions: {
                create: {
                  name: 'FULL_ACCESS'
                }
              }
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      results: {
        contentPlansWithoutLocation: contentPlansWithoutLocation.length,
        updated,
        defaultLocation: defaultLocation.name
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Fix failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}