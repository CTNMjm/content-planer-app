import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.ADMIN_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Hole alle ContentPlans ohne Location
    const contentPlansWithoutLocation = await prisma.contentPlan.findMany({
      where: { 
        locationId: {
          isNull: true
        }
      }
    });

    // Hole die erste Location als Default
    const defaultLocation = await prisma.location.findFirst();

    if (!defaultLocation) {
      return NextResponse.json({ error: 'No locations found' }, { status: 400 });
    }

    let updated = 0;
    if (contentPlansWithoutLocation.length > 0) {
      const result = await prisma.contentPlan.updateMany({
        where: { 
          locationId: {
            isNull: true
          }
        },
        data: { locationId: defaultLocation.id }
      });
      updated = result.count;
    }

    // Stelle sicher, dass Admin-User Zugriff auf alle Locations hat
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (adminUser) {
      const allLocations = await prisma.location.findMany();
      
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
                create: [
                  { name: 'FULL_ACCESS' }
                ]
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
        defaultLocation: defaultLocation.name,
        adminUserUpdated: adminUser ? true : false
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: 'Fix failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}