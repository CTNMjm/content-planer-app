import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const users = await prisma.user.findMany() // wenn du ein User-Modell hast!
  return NextResponse.json(users)
}
