import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const locationId = searchParams.get("locationId");
  const status = searchParams.get("status");
  const monat = searchParams.get("monat");
  const fields = searchParams.get("fields")?.split(",") || [];

  if (!locationId) {
    return NextResponse.json({ error: "LocationId required" }, { status: 400 });
  }

  try {
    const where: any = { locationId };
    if (status && status !== "all") where.status = status;
    if (monat && monat !== "all") where.monat = monat;

    const contentPlans = await prisma.contentPlan.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // CSV erstellen
    const headers = fields.join(",");
    const rows = contentPlans.map(plan => 
      fields.map(field => {
        const value = plan[field as keyof typeof plan];
        // Escape quotes and handle newlines
        if (typeof value === "string") {
          return `"${value.replace(/"/g, '""').replace(/\n/g, " ")}"`;
        }
        return value || "";
      }).join(",")
    );

    const csv = [headers, ...rows].join("\n");
    
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="content-plan-export.csv"`,
      },
    });
  } catch (error) {
    console.error("Export error:", error);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}