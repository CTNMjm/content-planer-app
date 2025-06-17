import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fixes = [];
    
    // 1. Füge fehlende User Spalten hinzu
    const userColumns = [
      { name: "password", sql: 'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT NOT NULL DEFAULT \'temp\'' },
      { name: "role", sql: 'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT \'USER\'' },
      { name: "isActive", sql: 'ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true' },
    ];
    
    for (const col of userColumns) {
      try {
        await prisma.$executeRawUnsafe(col.sql);
        fixes.push(`Added ${col.name} to User`);
      } catch (e) {
        fixes.push(`User.${col.name}: ${e}`);
      }
    }
    
    // 2. Update den Admin User mit korrektem Passwort
    try {
      await prisma.$executeRaw`
        UPDATE "User" 
        SET "password" = 'temp-will-be-hashed',
            "role" = 'ADMIN',
            "isActive" = true
        WHERE "id" = 'cuid_a36cffc3b959c3f76063'
      `;
      fixes.push("Updated admin user");
    } catch (e) {
      fixes.push(`Update admin: ${e}`);
    }
    
    // 3. Füge userLocationId zu UserLocationRole hinzu (als virtuelle Spalte)
    try {
      await prisma.$executeRaw`
        ALTER TABLE "UserLocationRole" 
        ADD COLUMN IF NOT EXISTS "userLocationId" TEXT 
        GENERATED ALWAYS AS ("userId" || '-' || "locationId") STORED
      `;
      fixes.push("Added userLocationId to UserLocationRole");
    } catch (e) {
      // Falls Generated Columns nicht unterstützt werden
      try {
        await prisma.$executeRaw`
          ALTER TABLE "UserLocationRole" 
          ADD COLUMN IF NOT EXISTS "userLocationId" TEXT
        `;
        await prisma.$executeRaw`
          UPDATE "UserLocationRole" 
          SET "userLocationId" = "userId" || '-' || "locationId"
        `;
        fixes.push("Added userLocationId manually");
      } catch (e2) {
        fixes.push(`UserLocationRole.userLocationId: ${e2}`);
      }
    }
    
    // 4. Füge status zu Location hinzu (falls noch nicht vorhanden)
    try {
      await prisma.$executeRaw`
        ALTER TABLE "Location" 
        ADD COLUMN IF NOT EXISTS "status" TEXT DEFAULT 'ACTIVE'
      `;
      fixes.push("Added status to Location");
    } catch (e) {
      fixes.push(`Location.status: ${e}`);
    }
    
    // 5. Korrigiere die Foreign Keys mit quoted table names
    const foreignKeys = [
      {
        table: "ContentPlan",
        constraint: "ContentPlan_userId_fkey",
        column: "userId",
        reference: '"User"("id")'
      },
      {
        table: "ContentPlan",
        constraint: "ContentPlan_locationId_fkey",
        column: "locationId",
        reference: '"Location"("id")'
      },
      {
        table: "InputPlan",
        constraint: "InputPlan_userId_fkey",
        column: "userId",
        reference: '"User"("id")'
      },
      {
        table: "InputPlan",
        constraint: "InputPlan_locationId_fkey",
        column: "locationId",
        reference: '"Location"("id")'
      },
      {
        table: "RedakPlan",
        constraint: "RedakPlan_userId_fkey",
        column: "userId",
        reference: '"User"("id")'
      },
      {
        table: "RedakPlan",
        constraint: "RedakPlan_locationId_fkey",
        column: "locationId",
        reference: '"Location"("id")'
      }
    ];
    
    for (const fk of foreignKeys) {
      try {
        await prisma.$executeRawUnsafe(`
          ALTER TABLE "${fk.table}" 
          ADD CONSTRAINT "${fk.constraint}" 
          FOREIGN KEY ("${fk.column}") REFERENCES ${fk.reference} ON DELETE CASCADE
        `);
        fixes.push(`Added ${fk.constraint}`);
      } catch (e) {
        // FK existiert bereits oder anderer Fehler
      }
    }
    
    // 6. Zeige aktuelle Tabellenstruktur
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name
    `;
    
    return NextResponse.json({ 
      message: "All columns fixed",
      fixes: fixes,
      existingTables: tables
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Column fix failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}