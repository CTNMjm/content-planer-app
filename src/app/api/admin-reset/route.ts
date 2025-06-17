import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

// SICHERHEITS-TOKEN zum Schutz
const RESET_TOKEN = process.env.ADMIN_RESET_TOKEN || "fallback-token-2024";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Prüfe Token
    if (body.token !== RESET_TOKEN) {
      return NextResponse.json({ error: "Invalid token" }, { status: 403 });
    }
    
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Prüfe ob User existiert
    const existingUser = await prisma.user.findUnique({
      where: { email: "admin@example.com" }
    });
    
    if (!existingUser) {
      // Erstelle neuen Admin
      const newUser = await prisma.user.create({
        data: {
          email: "admin@example.com",
          password: hashedPassword,
          name: "Admin User",
          role: "ADMIN"
        }
      });
      return NextResponse.json({ 
        message: "Admin user created",
        email: newUser.email
      });
    }
    
    // Update existierenden User
    const user = await prisma.user.update({
      where: { email: "admin@example.com" },
      data: { password: hashedPassword }
    });
    
    return NextResponse.json({ 
      message: "Password reset successful",
      email: user.email
    });
  } catch (error) {
    console.error("Reset error:", error);
    return NextResponse.json({ 
      error: "Failed to reset password",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}