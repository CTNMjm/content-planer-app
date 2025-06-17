import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fixes = [];
    
    // 1. Füge status zu Location hinzu
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Location" 
        ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE'
      `;
      fixes.push("Added status to Location");
    } catch (e) {
      fixes.push(`Location status: ${e}`);
    }
    
    // 2. Füge description zu Location hinzu
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Location" 
        ADD COLUMN IF NOT EXISTS "description" TEXT
      `;
      fixes.push("Added description to Location");
    } catch (e) {
      fixes.push(`Location description: ${e}`);
    }
    
    // 3. Füge address zu Location hinzu
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Location" 
        ADD COLUMN IF NOT EXISTS "address" TEXT
      `;
      fixes.push("Added address to Location");
    } catch (e) {
      fixes.push(`Location address: ${e}`);
    }
    
    // 4. Füge fehlende User Spalten hinzu
    const userColumns = [
      { name: "image", sql: "ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"image\" TEXT" },
      { name: "emailVerified", sql: "ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"emailVerified\" TIMESTAMP(3)" },
      { name: "image", sql: "ALTER TABLE \"User\" ADD COLUMN IF NOT EXISTS \"image\" TEXT" },
    ];
    
    for (const col of userColumns) {
      try {
        await prisma.$executeRawUnsafe(col.sql);
        fixes.push(`Added ${col.name} to User`);
      } catch (e) {
        // Spalte existiert bereits
      }
    }
    
    // 5. Füge History Tabellen hinzu
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ContentPlanHistory" (
          "id" TEXT NOT NULL,
          "contentPlanId" TEXT NOT NULL,
          "changeType" TEXT NOT NULL,
          "changedBy" TEXT NOT NULL,
          "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "previousData" JSONB,
          "newData" JSONB,
          CONSTRAINT "ContentPlanHistory_pkey" PRIMARY KEY ("id")
        )
      `;
      fixes.push("Created ContentPlanHistory table");
    } catch (e) {
      fixes.push(`ContentPlanHistory: ${e}`);
    }
    
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "InputPlanHistory" (
          "id" TEXT NOT NULL,
          "inputPlanId" TEXT NOT NULL,
          "changeType" TEXT NOT NULL,
          "changedBy" TEXT NOT NULL,
          "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "previousData" JSONB,
          "newData" JSONB,
          CONSTRAINT "InputPlanHistory_pkey" PRIMARY KEY ("id")
        )
      `;
      fixes.push("Created InputPlanHistory table");
    } catch (e) {
      fixes.push(`InputPlanHistory: ${e}`);
    }
    
    // 6. Update default location
    try {
      await prisma.$executeRaw`
        UPDATE "Location" 
        SET "status" = 'ACTIVE', 
            "description" = 'Hauptstandort der Organisation',
            "address" = 'Musterstraße 1, 12345 Musterstadt'
        WHERE "id" = 'default-location'
      `;
      fixes.push("Updated default location");
    } catch (e) {
      fixes.push(`Update location: ${e}`);
    }
    
    return NextResponse.json({ 
      message: "Complete schema fix applied",
      fixes: fixes
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Schema fix failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}