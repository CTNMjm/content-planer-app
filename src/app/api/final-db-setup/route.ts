import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const fixes = [];
    
    // 1. Erstelle Role Tabelle
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "Role" (
          "id" TEXT NOT NULL,
          "name" TEXT NOT NULL,
          "description" TEXT,
          "permissions" TEXT[],
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "Role_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "Role_name_key" UNIQUE ("name")
        )
      `;
      fixes.push("Created Role table");
    } catch (e) {
      fixes.push(`Role table: ${e}`);
    }
    
    // 2. Erstelle UserLocationRole Tabelle
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "UserLocationRole" (
          "id" TEXT NOT NULL,
          "userId" TEXT NOT NULL,
          "locationId" TEXT NOT NULL,
          "roleId" TEXT NOT NULL,
          "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "assignedBy" TEXT,
          CONSTRAINT "UserLocationRole_pkey" PRIMARY KEY ("id")
        )
      `;
      fixes.push("Created UserLocationRole table");
    } catch (e) {
      fixes.push(`UserLocationRole table: ${e}`);
    }
    
    // 3. Füge Foreign Keys für UserLocationRole hinzu
    try {
      await prisma.$executeRaw`
        ALTER TABLE "UserLocationRole" 
        ADD CONSTRAINT "UserLocationRole_userId_fkey" 
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      `;
      await prisma.$executeRaw`
        ALTER TABLE "UserLocationRole" 
        ADD CONSTRAINT "UserLocationRole_locationId_fkey" 
        FOREIGN KEY ("locationId") REFERENCES "Location"("id") ON DELETE CASCADE
      `;
      await prisma.$executeRaw`
        ALTER TABLE "UserLocationRole" 
        ADD CONSTRAINT "UserLocationRole_roleId_fkey" 
        FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE
      `;
      fixes.push("Added UserLocationRole foreign keys");
    } catch (e) {
      fixes.push(`UserLocationRole FKs: ${e}`);
    }
    
    // 4. Erstelle unique constraint
    try {
      await prisma.$executeRaw`
        CREATE UNIQUE INDEX "UserLocationRole_userId_locationId_roleId_key" 
        ON "UserLocationRole"("userId", "locationId", "roleId")
      `;
      fixes.push("Added unique constraint to UserLocationRole");
    } catch (e) {
      fixes.push(`Unique constraint: ${e}`);
    }
    
    // 5. Erstelle Standard-Rollen
    try {
      await prisma.$executeRaw`
        INSERT INTO "Role" (id, name, description, permissions) VALUES
        ('admin-role', 'Admin', 'Administrator mit vollen Rechten', ARRAY['ALL']::TEXT[]),
        ('manager-role', 'Manager', 'Manager mit erweiterten Rechten', ARRAY['READ', 'WRITE', 'DELETE']::TEXT[]),
        ('editor-role', 'Editor', 'Editor mit Schreibrechten', ARRAY['READ', 'WRITE']::TEXT[]),
        ('viewer-role', 'Viewer', 'Betrachter mit Leserechten', ARRAY['READ']::TEXT[])
        ON CONFLICT DO NOTHING
      `;
      fixes.push("Created default roles");
    } catch (e) {
      fixes.push(`Default roles: ${e}`);
    }
    
    // 6. Verbinde Admin User mit Admin Rolle
    try {
      await prisma.$executeRaw`
        INSERT INTO "UserLocationRole" (id, "userId", "locationId", "roleId") 
        VALUES (
          'admin-location-role',
          'cuid_a36cffc3b959c3f76063',
          'default-location',
          'admin-role'
        )
        ON CONFLICT DO NOTHING
      `;
      fixes.push("Assigned admin role to admin user");
    } catch (e) {
      fixes.push(`Assign admin role: ${e}`);
    }
    
    // 7. Füge fehlende Foreign Keys für andere Tabellen hinzu
    const foreignKeys = [
      {
        table: "ContentPlan",
        constraint: "ContentPlan_userId_fkey",
        column: "userId",
        reference: "User(id)"
      },
      {
        table: "ContentPlan",
        constraint: "ContentPlan_locationId_fkey",
        column: "locationId",
        reference: "Location(id)"
      },
      {
        table: "InputPlan",
        constraint: "InputPlan_userId_fkey",
        column: "userId",
        reference: "User(id)"
      },
      {
        table: "InputPlan",
        constraint: "InputPlan_locationId_fkey",
        column: "locationId",
        reference: "Location(id)"
      },
      {
        table: "RedakPlan",
        constraint: "RedakPlan_userId_fkey",
        column: "userId",
        reference: "User(id)"
      },
      {
        table: "RedakPlan",
        constraint: "RedakPlan_locationId_fkey",
        column: "locationId",
        reference: "Location(id)"
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
        // FK existiert bereits
      }
    }
    
    return NextResponse.json({ 
      message: "Final database setup completed",
      fixes: fixes
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Database setup failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}