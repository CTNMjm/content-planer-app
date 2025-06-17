import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Prüfe welche Spalten existieren mit raw SQL
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `;
    
    // Zähle User
    const userCount = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "User"
    `;
    
    return NextResponse.json({ 
      existingColumns: columns,
      userCount: userCount,
      message: "Schema check completed"
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Schema check failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}