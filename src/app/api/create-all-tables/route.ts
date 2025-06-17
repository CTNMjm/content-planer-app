import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fixes = [];
    
    // 1. Erstelle Location Tabelle
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Location" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Location_pkey" PRIMARY KEY ("id")
        )
      `;
      fixes.push("Created Location table");
    } catch (e) {
      fixes.push(`Location table: ${e}`);
    }
    
    // 2. Erstelle UserLocation Tabelle (Many-to-Many)
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "UserLocation" (
          "userId" TEXT NOT NULL,
          "locationId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "UserLocation_pkey" PRIMARY KEY ("userId","locationId")
        )
      `;
      fixes.push("Created UserLocation table");
    } catch (e) {
      fixes.push(`UserLocation table: ${e}`);
    }
    
    // 3. Erstelle ContentPlan Tabelle
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "ContentPlan" (
          "id" TEXT NOT NULL,
          "date" DATE NOT NULL,
          "locationId" TEXT NOT NULL,
          "time" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "topic" TEXT NOT NULL,
          "format" TEXT NOT NULL,
          "caption" TEXT,
          "visualDescription" TEXT,
          "visualUrl" TEXT,
          "hashtags" TEXT,
          "platforms" TEXT[],
          "targetAudience" TEXT,
          "cta" TEXT,
          "kpi" TEXT,
          "notes" TEXT,
          "status" TEXT NOT NULL DEFAULT 'PLANUNG',
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "ContentPlan_pkey" PRIMARY KEY ("id")
        )
      `;
      fixes.push("Created ContentPlan table");
    } catch (e) {
      fixes.push(`ContentPlan table: ${e}`);
    }
    
    // 4. Erstelle InputPlan Tabelle
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "InputPlan" (
          "id" TEXT NOT NULL,
          "date" DATE NOT NULL,
          "locationId" TEXT NOT NULL,
          "time" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "topic" TEXT NOT NULL,
          "format" TEXT NOT NULL,
          "notes" TEXT,
          "status" TEXT NOT NULL DEFAULT 'PLANUNG',
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "InputPlan_pkey" PRIMARY KEY ("id")
        )
      `;
      fixes.push("Created InputPlan table");
    } catch (e) {
      fixes.push(`InputPlan table: ${e}`);
    }
    
    // 5. Erstelle RedakPlan Tabelle
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "RedakPlan" (
          "id" TEXT NOT NULL,
          "date" DATE NOT NULL,
          "locationId" TEXT NOT NULL,
          "time" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "topic" TEXT NOT NULL,
          "format" TEXT NOT NULL,
          "notes" TEXT,
          "status" TEXT NOT NULL DEFAULT 'IDEE',
          "userId" TEXT NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "RedakPlan_pkey" PRIMARY KEY ("id")
        )
      `;
      fixes.push("Created RedakPlan table");
    } catch (e) {
      fixes.push(`RedakPlan table: ${e}`);
    }
    
    // 6. Füge Foreign Keys hinzu
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
      fixes.push(`Foreign keys: already exist or error`);
    }
    
    // 7. Füge isActive zu User hinzu
    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true
      `;
      fixes.push("Added isActive to User");
    } catch (e) {
      fixes.push(`isActive column: ${e}`);
    }
    
    // 8. Erstelle eine Standard-Location
    try {
      await prisma.$executeRaw`
        INSERT INTO "Location" (id, name) 
        VALUES ('default-location', 'Hauptstandort')
        ON CONFLICT DO NOTHING
      `;
      fixes.push("Created default location");
    } catch (e) {
      fixes.push(`Default location: ${e}`);
    }
    
    return NextResponse.json({ 
      message: "All tables created successfully",
      fixes: fixes
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Failed to create tables",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}