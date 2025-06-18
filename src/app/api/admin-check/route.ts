import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const secret = searchParams.get('secret');
    
    if (secret !== process.env.ADMIN_IMPORT_SECRET) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Zähle alle Datensätze
    const [
      userCount,
      contentPlanCount,
      inputPlanCount,
      redakPlanCount,
      locationCount,
      userLocationCount
    ] = await Promise.all([
      prisma.user.count(),
      prisma.contentPlan.count(),
      prisma.inputPlan.count(),
      prisma.redakPlan.count(),
      prisma.location.count(),
      prisma.userLocation.count()
    ]);

    // Sample Daten
    const users = await prisma.user.findMany({
      take: 3,
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    const contentPlans = await prisma.contentPlan.findMany({
      take: 3,
      select: {
        id: true,
        monat: true,
        bezug: true,
        createdAt: true
      }
    });

    return NextResponse.json({
      success: true,
      counts: {
        users: userCount,
        contentPlans: contentPlanCount,
        inputPlans: inputPlanCount,
        redakPlans: redakPlanCount,
        locations: locationCount,
        userLocations: userLocationCount
      },
      samples: {
        users,
        contentPlans
      }
    });
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json({ 
      error: 'Check failed', 
      details: error instanceof Error ? error.message : 'Unknown error' 
    }, { status: 500 });
  }
}