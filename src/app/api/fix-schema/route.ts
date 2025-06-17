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
    
    // Führe raw SQL aus
    await prisma.$executeRaw`
      ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT
    `;
    
    // Setze Default-Passwort
    await prisma.$executeRaw`
      UPDATE "User" 
      SET "password" = '$2a$10$DJk03IntjCaiqCn3QTCGJuTFI8UNTvnGiQ/w9/620ziMlnwRo9l6i'
      WHERE "password" IS NULL
    `;
    
    // Mache password NOT NULL
    await prisma.$executeRaw`
      ALTER TABLE "User" ALTER COLUMN "password" SET NOT NULL
    `;
    
    return NextResponse.json({ 
      message: "Schema fixed! Password column added. Default password is: admin123"
    });
  } catch (error) {
    console.error("Schema fix error:", error);
    return NextResponse.json({ 
      error: "Failed to fix schema",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}