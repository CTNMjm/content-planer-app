import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    
    const session = await getServerSession(authOptions);
    
    const env = {
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || "NOT SET",
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? "SET" : "NOT SET",
      JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
      NODE_ENV: process.env.NODE_ENV || "NOT SET",
    };
    
    return NextResponse.json({
      environment: env,
      cookies: allCookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      session: session,
      headers: {
        host: cookieStore.get('host')?.value || "unknown",
      },
      debug: {
        productionMode: process.env.NODE_ENV === 'production',
        expectedCookieName: process.env.NODE_ENV === 'production' ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Debug failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}