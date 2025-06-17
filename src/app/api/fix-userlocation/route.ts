import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fixes = [];
    
    // 1. Lösche die alte UserLocation Tabelle
    try {
      await prisma.$executeRaw`DROP TABLE IF EXISTS "UserLocation" CASCADE`;
      fixes.push("Dropped old UserLocation table");
    } catch (e) {
      fixes.push(`Drop UserLocation: ${e}`);
    }
    
    // 2. Erstelle UserLocation mit id Spalte neu
    try {
      await prisma.$executeRaw`
        CREATE TABLE "UserLocation" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "locationId" TEXT NOT NULL,
          "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "assignedBy" TEXT,
          CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("id")
        )
      `;
      fixes.push("Created new UserLocation table with id");
    } catch (e) {
      fixes.push(`Create UserLocation: ${e}`);
    }
    
    // 3. Füge Foreign Keys hinzu
    try {
      await prisma.$executeRaw`
        ALTER TABLE "UserLocation" 
        ADD CONSTRAINT "UserLocation_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      `;
      await prisma.$executeRaw`
        ALTER TABLE "UserLocation" 
        ADD CONSTRAINT "UserLocation_locationId_fkey" 
        FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE
      `;
      fixes.push("Added foreign keys");
    } catch (e) {
      fixes.push(`Foreign keys: ${e}`);
    }
    
    // 4. Erstelle unique constraint für userId + locationId
    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "UserLocation_userId_locationId_key" 
        ON "UserLocation"("userId", "locationId")
      `;
      fixes.push("Added unique constraint");
    } catch (e) {
      fixes.push(`Unique constraint: ${e}`);
    }
    
    // 5. Verbinde Admin User mit Default Location
    try {
      await prisma.$executeRaw`
        INSERT INTO "UserLocation" (id, "userId", "locationId") 
        VALUES (
          'default-user-location',
          'cuid_a36cffc3b959c3f76063',
          'default-location'
        )
        ON CONFLICT DO NOTHING
      `;
      fixes.push("Connected admin user to default location");
    } catch (e) {
      fixes.push(`Connect user to location: ${e}`);
    }
    
    return NextResponse.json({ 
      message: "UserLocation fixed successfully",
      fixes: fixes
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to fix UserLocation",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}