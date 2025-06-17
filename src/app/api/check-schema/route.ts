import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Hole einen User ohne password Feld
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      },
      take: 5
    });
    
    return NextResponse.json({ 
      users,
      message: "Schema check successful"
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Schema check failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}