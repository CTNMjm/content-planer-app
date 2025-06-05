import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  console.log("Admin locations GET - Session:", session);
  console.log("User role:", session?.user?.role);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const locations = await prisma.location.findMany({
    orderBy: { name: "asc" },
  });
  
  return NextResponse.json(locations);
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  
  console.log("Admin locations POST - Session:", session);
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name } = await request.json();

  if (!name || !name.trim()) {
    return NextResponse.json(
      { error: "Name ist erforderlich" },
      { status: 400 }
    );
  }

  const location = await prisma.location.create({
    data: {
      name: name.trim(),
      status: "ACTIVE",
    },
  });

  return NextResponse.json(location);
}