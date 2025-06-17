import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "fallback-secret";
    
    const token = await encode({
      token: {
        email: "admin@example.com",
        id: "cuid_a36cffc3b959c3f76063",
        name: "Admin User",
        role: "ADMIN"
      },
      secret: secret,
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    const cookieStore = cookies();
    
    // Set the session cookie
    cookieStore.set({
      name: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    // Redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", "https://dev.cp-app.control-monitor.de"));
  } catch (error) {
    console.error("Session creation error:", error);
    return NextResponse.json({ 
      error: "Failed to create session",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}