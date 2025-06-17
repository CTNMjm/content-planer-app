import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Zähle User
    const userCount = await prisma.user.count();
    
    // Hole ersten User (ohne Passwort)
    const firstUser = await prisma.user.findFirst({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      }
    });
    
    return NextResponse.json({
      status: "Database connected",
      userCount,
      firstUser,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      status: "Database error",
      error: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}