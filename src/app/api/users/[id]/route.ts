import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const updateData: any = {
      email: body.email,
      name: body.name,
      role: body.role,
      isActive: body.isActive,
      limitedLocations: typeof body.limitedLocations === 'boolean' ? body.limitedLocations : undefined,
    };

    // Nur wenn ein neues Passwort gesetzt wurde
    if (body.password) {
      updateData.password = await bcrypt.hash(body.password, 10);
    }

    const user = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        limitedLocations: true, // <--- NEU
        createdAt: true,
        updatedAt: true,
      },
    });

    // UserLocation-Relationen synchronisieren
    if (Array.isArray(body.locationIds)) {
      // Lösche alle bisherigen UserLocations
      await prisma.userLocation.deleteMany({ where: { userId: params.id } });
      // Lege neue UserLocations an
      for (const locationId of body.locationIds) {
        await prisma.userLocation.create({
          data: { userId: params.id, locationId }
        });
      }
    }

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verhindere das Löschen des eigenen Accounts
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot delete your own account" },
        { status: 400 }
      );
    }

    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to delete user" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const params = await context.params;
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isActive: body.isActive, limitedLocations: typeof body.limitedLocations === 'boolean' ? body.limitedLocations : undefined }, // <--- NEU
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        limitedLocations: true, // <--- NEU
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 }
    );
  }
}