import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ContentStatus } from "@prisma/client";
import { getSessionUser, canAccessLocation } from "@/lib/location-access";

export async function POST(request: NextRequest) {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const locationId = formData.get("locationId") as string;

    if (!file || !locationId) {
      return NextResponse.json({ error: "File and locationId required" }, { status: 400 });
    }

    if (!(await canAccessLocation(user, locationId))) {
      return NextResponse.json(
        { error: "Kein Zugriff auf diesen Standort" },
        { status: 403 }
      );
    }

    const text = await file.text();
    const lines = text.split("\n").filter(line => line.trim());
    
    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty" }, { status: 400 });
    }

    const headers = lines[0].split(",").map(h => h.trim());
    const requiredFields = ["monat", "bezug", "mechanikThema", "idee", "platzierung"];
    // Nur fachliche Felder aus der CSV übernehmen (keine IDs/Audit-Felder)
    const allowedFields = [
      "monat", "bezug", "mehrwert", "mechanikThema", "idee", "platzierung",
      "status", "implementationLevel", "creativeFormat", "creativeBriefingExample",
      "copyExample", "copyExampleCustomized", "firstCommentForEngagement",
      "notes", "action",
    ];
    
    // Validierung der Pflichtfelder
    for (const field of requiredFields) {
      if (!headers.includes(field)) {
        return NextResponse.json({ error: `Required field missing: ${field}` }, { status: 400 });
      }
    }

    const imported = [];
    const errors = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = lines[i].match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g) || [];
        const cleanValues = values.map(v => v.replace(/^"|"$/g, "").replace(/""/g, '"'));
        
        const data: any = {};
        headers.forEach((header, index) => {
          if (cleanValues[index] && allowedFields.includes(header)) {
            data[header] = cleanValues[index];
          }
        });

        // Validierung
        for (const field of requiredFields) {
          if (!data[field]) {
            errors.push(`Line ${i + 1}: Missing required field ${field}`);
            continue;
          }
        }

        // Status Validierung
        if (data.status && !Object.values(ContentStatus).includes(data.status)) {
          errors.push(`Line ${i + 1}: Invalid status ${data.status}`);
          continue;
        }

        // Create content plan
        await prisma.contentPlan.create({
          data: {
            ...data,
            locationId,
            createdById: user.id,
            status: data.status || ContentStatus.DRAFT,
          },
        });

        imported.push(i);
      } catch (error) {
        errors.push(`Line ${i + 1}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    return NextResponse.json({
      imported: imported.length,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Import failed" }, { status: 500 });
  }
}