import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Erstelle die Permission Tabelle mit raw SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "Permission" (
        "id" TEXT NOT NULL DEFAULT gen_random_uuid(),
        "userLocationId" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "granted" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
      );
    `;

    await prisma.$executeRaw`
      CREATE UNIQUE INDEX IF NOT EXISTS "Permission_userLocationId_name_key" 
      ON "Permission"("userLocationId", "name");
    `;

    await prisma.$executeRaw`
      ALTER TABLE "Permission" 
      ADD CONSTRAINT IF NOT EXISTS "Permission_userLocationId_fkey" 
      FOREIGN KEY ("userLocationId") 
      REFERENCES "UserLocation"("id") 
      ON DELETE CASCADE;
    `;

    return NextResponse.json({ 
      message: "Permission table created successfully" 
    });
  } catch (error) {
    console.error("Error creating table:", error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : "Unknown error" 
    }, { status: 500 });
  }
}