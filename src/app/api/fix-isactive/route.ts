import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Füge isActive Spalte hinzu
    await prisma.$executeRaw`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true
    `;
    
    // Setze alle existierenden User auf aktiv
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "isActive" = true 
      WHERE "isActive" IS NULL
    `;
    
    // Prüfe die Spalten
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `;
    
    return NextResponse.json({ 
      message: "isActive column added successfully",
      columns: columns
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to add isActive column",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}