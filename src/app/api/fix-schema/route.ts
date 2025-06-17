import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

const RESET_TOKEN = "fix-schema-2024";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.token !== RESET_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
    
    const fixes = [];
    
    // 1. Füge role Spalte hinzu
    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'USER'
      `;
      fixes.push("Added role column");
    } catch (e) {
      fixes.push(`Role column error: ${e}`);
    }
    
    // 2. Füge password Spalte hinzu
    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT
      `;
      fixes.push("Added password column");
    } catch (e) {
      fixes.push(`Password column error: ${e}`);
    }
    
    // 3. Setze Default-Passwort für alle User ohne Passwort
    try {
      await prisma.$executeRaw`
        UPDATE "User" 
        SET "password" = '$2a$10$DJk03IntjCaiqCn3QTCGJuTFI8UNTvnGiQ/w9/620ziMlnwRo9l6i'
        WHERE "password" IS NULL
      `;
      fixes.push("Set default passwords");
    } catch (e) {
      fixes.push(`Password update error: ${e}`);
    }
    
    // 4. Setze Admin-Role für admin@example.com
    try {
      await prisma.$executeRaw`
        UPDATE "User" 
        SET "role" = 'ADMIN'
        WHERE "email" = 'admin@example.com'
      `;
      fixes.push("Set admin role");
    } catch (e) {
      fixes.push(`Admin role error: ${e}`);
    }
    
    // 5. Mache password NOT NULL
    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL
      `;
      fixes.push("Made password NOT NULL");
    } catch (e) {
      fixes.push(`Password NOT NULL error: ${e}`);
    }
    
    // Zeige aktuelle Spalten
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `;
    
    return NextResponse.json({ 
      message: "Schema fix attempted",
      fixes: fixes,
      currentColumns: columns,
      defaultPassword: "admin123"
    });
  } catch (error) {
    console.error("Schema fix error:", error);
    return NextResponse.json({ 
      error: "Failed to fix schema",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}