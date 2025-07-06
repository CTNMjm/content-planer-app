import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

// Hilfsfunktion zum Extrahieren des Users aus dem Token
async function getUserFromRequest(request: NextRequest) {
  try {
    // Erst NextAuth-Session prüfen
    const session = await getServerSession(authOptions);
    console.log("=== USER DEBUG ===");
    console.log("Session found:", !!session);
    console.log("Session user:", session?.user);
    
    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { id: true, email: true, name: true }
      });
      console.log("User from DB:", user);
      if (user) return user;
    }

    // Fallback: JWT-Token prüfen
    const token = request.cookies.get("token")?.value;
    console.log("JWT Token found:", !!token);
    
    // TEMPORÄR für Entwicklung - später entfernen!
    if (!token && process.env.NODE_ENV === "development") {
      console.log("No token found, using development user");
      const devUser = await prisma.user.findFirst({
        select: { id: true, email: true, name: true }
      });
      if (devUser) {
        console.log("Development user found:", devUser);
        return devUser;
      }
    }
    
    if (!token) {
      console.log("No token found and no dev user");
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true, name: true }
    });
    
    return user;
  } catch (error) {
    console.error("getUserFromRequest error:", error);
    return null;
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const inputPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id },
      include: {
        location: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!inputPlan) {
      return NextResponse.json({ error: "InputPlan not found" }, { status: 404 });
    }

    return NextResponse.json(inputPlan);
  } catch (error) {
    console.error("GET error:", error);
    return NextResponse.json({ error: "Failed to fetch InputPlan" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request as NextRequest);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    console.log("PATCH received data:", data);

    // "COMPLETED" darf nicht direkt gesetzt werden!
    if (data.status === "COMPLETED" && !data.allowCompleted) {
      return NextResponse.json({ error: "Status 'COMPLETED' kann nicht direkt gesetzt werden." }, { status: 400 });
    }

    // Entferne read-only Felder
    const { id, createdAt, updatedAt, createdBy, updatedBy, ...updateData } = data;

    // Fix: allowCompleted darf NICHT an Prisma übergeben werden!
    if ("allowCompleted" in updateData) {
      delete updateData.allowCompleted;
    }

    // Fix für voe
    if (updateData.voe && typeof updateData.voe === "string" && !updateData.voe.endsWith("Z")) {
      updateData.voe = new Date(updateData.voe).toISOString();
    }

    const currentInputPlan = await prisma.inputPlan.findUnique({
      where: { id: params.id }
    });

    if (!currentInputPlan) {
      return NextResponse.json({ error: "InputPlan not found" }, { status: 404 });
    }

    // Update durchführen
    const updated = await prisma.inputPlan.update({
      where: { id: params.id },
      data: {
        ...updateData,
        updatedById: user.id,
      },
      include: {
        location: true,
        createdBy: {
          select: { id: true, name: true, email: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Feldweise History-Einträge
    for (const field of Object.keys(updateData)) {
      if (Object.prototype.hasOwnProperty.call(currentInputPlan, field)) {
        const oldVal = currentInputPlan[field as keyof typeof currentInputPlan];
        let newVal = updateData[field as keyof typeof updateData];
        
        // Normalisiere Werte für Vergleich
        let normalizedOldVal: any = oldVal;
        let normalizedNewVal: any = newVal;
        
        // Spezialbehandlung für Datumsfelder
        if (field === 'voe' || field === 'voeDate') {
          if (oldVal instanceof Date) {
            normalizedOldVal = oldVal.toISOString();
          }
          if (typeof newVal === 'string') {
            normalizedNewVal = new Date(newVal).toISOString();
          }
        }
        
        // Konvertiere null zu undefined für Vergleich
        if (normalizedOldVal === null) normalizedOldVal = undefined;
        if (normalizedNewVal === null) normalizedNewVal = undefined;
        
        // Vergleiche normalisierte Werte
        const isChanged = normalizedOldVal !== normalizedNewVal;
        
        if (isChanged) {
          console.log(`Field ${field} WIRKLICH geändert von "${oldVal}" zu "${newVal}"`);
          
          await prisma.inputPlanHistory.create({
            data: {
              inputPlanId: params.id,
              action: "UPDATE",
              changedBy: user.name ?? user.email ?? user.id ?? "Unknown",
              changedById: user.id,
              field,
              oldValue: oldVal !== undefined && oldVal !== null ? String(oldVal) : null,
              newValue: newVal !== undefined && newVal !== null ? String(newVal) : null,
              previousData: currentInputPlan,
              newData: updated,
              changedAt: new Date(),
            }
          });
        }
      }
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Soft delete
    const deleted = await prisma.inputPlan.update({
      where: { id: params.id },
      data: {
        deletedAt: new Date(),
        deletedById: user.id,
      }
    });

    // Historie-Eintrag
    await prisma.inputPlanHistory.create({
      data: {
        inputPlanId: params.id,
        action: "DELETE",
        changedBy: user.name ?? user.email ?? user.id ?? "Unknown",
        changedById: user.id,
        previousData: deleted,
        newData: Prisma.JsonNull,
        changedAt: new Date(),
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
