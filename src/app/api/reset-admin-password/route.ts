import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    // Hash das Passwort
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Update den Admin User
    const updatedUser = await prisma.user.update({
      where: { 
        email: "admin@example.com" 
      },
      data: {
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }
    });
    
    return NextResponse.json({
      message: "Admin password reset successfully",
      user: updatedUser,
      loginInfo: {
        email: "admin@example.com",
        password: "admin123"
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to reset password",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}