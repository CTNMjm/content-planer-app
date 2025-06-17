import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Prüfe welche Spalten existieren mit raw SQL
    const columns = await prisma.$queryRaw<Array<{
      column_name: string;
      data_type: string;
    }>>`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `;
    
    // Zähle User - konvertiere BigInt zu Number
    const userCountResult = await prisma.$queryRaw<Array<{count: bigint}>>`
      SELECT COUNT(*) as count FROM "User"
    `;
    
    const userCount = Number(userCountResult[0]?.count || 0);
    
    // Hole ein paar User ohne problematische Felder
    let sampleUsers = [];
    try {
      sampleUsers = await prisma.$queryRaw`
        SELECT id, email, name FROM "User" LIMIT 3
      `;
    } catch (e) {
      sampleUsers = [];
    }
    
    return NextResponse.json({ 
      existingColumns: columns,
      userCount: userCount,
      sampleUsers: sampleUsers,
      message: "Schema check completed"
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Schema check failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}