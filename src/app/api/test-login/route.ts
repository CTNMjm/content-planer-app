import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Hole User
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" });
    }
    
    // Teste Passwort
    const isValid = await bcrypt.compare(password, user.password);
    
    // Teste auch mit sync
    const isValidSync = bcrypt.compareSync(password, user.password);
    
    // Generiere neuen Hash zum Vergleich
    const newHash = await bcrypt.hash(password, 10);
    
    return NextResponse.json({ 
      userFound: true,
      email: user.email,
      role: user.role,
      passwordLength: user.password.length,
      passwordStartsWith: user.password.substring(0, 10),
      isValidAsync: isValid,
      isValidSync: isValidSync,
      testPassword: password,
      newHashWouldBe: newHash.substring(0, 10) + "...",
      debug: {
        providedPassword: password,
        storedHashLength: user.password.length,
        bcryptVersion: "$2a$10"
      }
    });
  } catch (error) {
    return NextResponse.json({ 
      error: "Test failed",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}