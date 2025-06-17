import { NextResponse } from "next/server";
import { signIn } from "next-auth/react";

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    message: "Direct login test",
    instructions: "Use the login page at /login with admin@example.com and admin123"
  });
}