import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  return NextResponse.json({
    session: session,
    hasSession: !!session,
    userId: session?.user?.id,
    userRole: session?.user?.role,
    isAdmin: session?.user?.role === "ADMIN"
  });
}