import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Erstelle ein einfaches JWT Token
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
    
    const sessionToken = jwt.sign(
      {
        name: "Admin User",
        email: "admin@example.com",
        sub: "cuid_a36cffc3b959c3f76063",
        id: "cuid_a36cffc3b959c3f76063",
        role: "ADMIN",
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days
      },
      secret
    );
    
    const cookieStore = cookies();
    
    // Versuche verschiedene Cookie-Namen
    const cookieNames = [
      'next-auth.session-token',
      '__Secure-next-auth.session-token',
      'authjs.session-token',
      '__Secure-authjs.session-token'
    ];
    
    const usedCookieName = process.env.NODE_ENV === 'production' 
      ? '__Secure-next-auth.session-token' 
      : 'next-auth.session-token';
    
    cookieStore.set({
      name: usedCookieName,
      value: sessionToken,
      httpOnly: true,
      secure: true, // Immer true für HTTPS
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });
    
    return NextResponse.json({
      success: true,
      cookieSet: usedCookieName,
      token: sessionToken.substring(0, 20) + "...",
      message: "Cookie set. Try accessing /dashboard",
      allPossibleNames: cookieNames
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Manual login failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}