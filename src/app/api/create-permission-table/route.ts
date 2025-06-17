import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Prüfe ob die description Spalte existiert
    const columnExists = await prisma.$queryRaw`
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'Permission' 
      AND column_name = 'description';
    `;

    if ((columnExists as any[]).length === 0) {
      // Füge die description Spalte hinzu
      await prisma.$executeRaw`
        ALTER TABLE "Permission" 
        ADD COLUMN "description" TEXT;
      `;
    }

    return NextResponse.json({ 
      message: "Permission table updated successfully" 
    });
  } catch (error) {
    console.error("Error updating table:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}