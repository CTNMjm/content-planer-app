import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { encode } from "next-auth/jwt";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const secret = process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET || "dev-secret-key";
    
    // Erstelle ein NextAuth-kompatibles Token
    const token = await encode({
      token: {
        email: "admin@example.com",
        name: "Admin User",
        sub: "cuid_a36cffc3b959c3f76063",
        id: "cuid_a36cffc3b959c3f76063",
        role: "ADMIN"
      },
      secret: secret,
      maxAge: 30 * 24 * 60 * 60,
    });
    
    const cookieStore = cookies();
    
    // Production cookie name
    cookieStore.set({
      name: '__Secure-next-auth.session-token',
      value: token,
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 24 * 60 * 60,
    });
    
    // Redirect direkt zum Dashboard
    return NextResponse.redirect('https://dev.cp-app.control-monitor.de/dashboard');
    
  } catch (error) {
    console.error("Bypass login error:", error);
    return NextResponse.json({ 
      error: "Bypass failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}