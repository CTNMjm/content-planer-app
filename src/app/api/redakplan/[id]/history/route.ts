import { NextRequest, NextResponse } from "next/server";

// Dummy-Daten als Beispiel – ersetze dies durch deine echte Datenbankabfrage!
const dummyHistory = [
  {
    id: "hist1",
    redakPlanId: "1",
    updatedAt: "2024-07-01T10:00:00Z",
    updatedBy: { id: "u1", name: "Max Mustermann" },
    changes: { status: "APPROVED", idee: "Neue Idee" },
  },
  {
    id: "hist2",
    redakPlanId: "1",
    updatedAt: "2024-07-02T12:00:00Z",
    updatedBy: { id: "u2", name: "Anna Beispiel" },
    changes: { status: "COMPLETED" },
  },
];

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  // Hier solltest du die Historie aus deiner Datenbank holen, z.B.:
  // const history = await prisma.redakPlanHistory.findMany({ where: { redakPlanId: id }, orderBy: { updatedAt: 'desc' } });

  // Für das Beispiel filtern wir die Dummy-Daten:
  const history = dummyHistory.filter((h) => h.redakPlanId === id);

  return NextResponse.json(history);
}