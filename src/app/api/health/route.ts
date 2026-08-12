import { NextResponse } from "next/server";

// Health-Check-Endpoint fuer Coolify/Traefik: immer 200, keine Auth, keine DB.
// proxy.ts schuetzt nur Seiten-Pfade (/dashboard, /contentplan, ...), nicht /api/*,
// daher ist dieser Endpoint ungeschuetzt erreichbar.
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json({ status: "ok" }, { status: 200 });
}
