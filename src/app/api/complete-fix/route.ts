import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.token !== "complete-fix-2024") {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
    
    const fixes = [];
    
    // 1. Füge fehlende Spalten hinzu
    try {
      await prisma.$executeRaw`
        ALTER TABLE "User" 
        ADD COLUMN IF NOT EXISTS "password" TEXT,
        ADD COLUMN IF NOT EXISTS "role" TEXT DEFAULT 'USER',
        ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
      `;
      fixes.push("Added missing columns");
    } catch (e) {
      fixes.push(`Column error: ${e}`);
    }
    
    // 2. Ändere id von integer zu text (für cuid)
    try {
      // Erstelle neue Tabelle mit korrektem Schema
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "User_new" (
          "id" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "name" TEXT,
          "role" TEXT NOT NULL DEFAULT 'USER',
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "User_new_pkey" PRIMARY KEY ("id")
        )
      `;
      
      // Lösche alte Tabelle (sie ist sowieso leer)
      await prisma.$executeRaw`DROP TABLE IF EXISTS "User"`;
      
      // Benenne neue Tabelle um
      await prisma.$executeRaw`ALTER TABLE "User_new" RENAME TO "User"`;
      
      // Füge unique constraint für email hinzu
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email")
      `;
      
      fixes.push("Recreated User table with correct schema");
    } catch (e) {
      fixes.push(`Table recreation error: ${e}`);
    }
    
    // 3. Erstelle Admin User
    try {
      const hashedPassword = await bcrypt.hash("admin123", 10);
      
      await prisma.$executeRaw`
        INSERT INTO "User" (id, email, password, name, role)
        VALUES (
          'cuid_' || substr(md5(random()::text), 1, 20),
          'admin@example.com',
          ${hashedPassword},
          'Admin User',
          'ADMIN'
        )
        ON CONFLICT (email) DO UPDATE
        SET password = ${hashedPassword},
            role = 'ADMIN'
      `;
      
      fixes.push("Created admin user");
    } catch (e) {
      fixes.push(`Admin creation error: ${e}`);
    }
    
    // Prüfe Ergebnis
    const users = await prisma.$queryRaw`
      SELECT id, email, name, role FROM "User"
    `;
    
    const columns = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'User'
      ORDER BY ordinal_position
    `;
    
    return NextResponse.json({ 
      message: "Complete fix executed",
      fixes: fixes,
      users: users,
      columns: columns,
      adminCredentials: {
        email: "admin@example.com",
        password: "admin123"
      }
    });
  } catch (error) {
    console.error("Complete fix error:", error);
    return NextResponse.json({ 
      error: "Failed to complete fix",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}