import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    userLocation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    inputPlan: {
      findMany: vi.fn(),
    },
    contentPlan: {
      findUnique: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

vi.mock("@/app/api/auth/[...nextauth]/authOptions", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import { GET as getInputPlans } from "@/app/api/inputplan/route";
import {
  GET as getContentPlan,
  DELETE as deleteContentPlan,
} from "@/app/api/content-plans/[id]/route";

const mockedGetServerSession = vi.mocked(getServerSession);

function loginAs(user: { id: string; role: string } | null) {
  mockedGetServerSession.mockResolvedValue(user ? { user } : null);
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("GET /api/inputplan", () => {
  it("liefert 401 ohne Session", async () => {
    loginAs(null);
    const res = await getInputPlans();
    expect(res.status).toBe(401);
    expect(prisma.inputPlan.findMany).not.toHaveBeenCalled();
  });

  it("scopet die Liste auf die Standorte des Users", async () => {
    loginAs({ id: "user-1", role: "USER" });
    vi.mocked(prisma.userLocation.findMany).mockResolvedValue([
      { locationId: "loc-1" },
    ] as any);
    vi.mocked(prisma.inputPlan.findMany).mockResolvedValue([] as any);

    const res = await getInputPlans();
    expect(res.status).toBe(200);
    expect(prisma.inputPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { locationId: { in: ["loc-1"] } },
      })
    );
  });

  it("scopet für Admins nicht (alle Standorte)", async () => {
    loginAs({ id: "admin-1", role: "ADMIN" });
    vi.mocked(prisma.inputPlan.findMany).mockResolvedValue([] as any);

    const res = await getInputPlans();
    expect(res.status).toBe(200);
    expect(prisma.inputPlan.findMany).toHaveBeenCalledWith(
      expect.objectContaining({ where: {} })
    );
  });
});

describe("GET /api/content-plans/[id]", () => {
  const req = new NextRequest("http://localhost/api/content-plans/plan-1");
  const params = { params: Promise.resolve({ id: "plan-1" }) };

  it("liefert 401 ohne Session", async () => {
    loginAs(null);
    const res = await getContentPlan(req, params);
    expect(res.status).toBe(401);
  });

  it("liefert 403 für Pläne fremder Standorte", async () => {
    loginAs({ id: "user-1", role: "USER" });
    vi.mocked(prisma.contentPlan.findUnique).mockResolvedValue({
      id: "plan-1",
      locationId: "loc-fremd",
    } as any);
    vi.mocked(prisma.userLocation.findUnique).mockResolvedValue(null);

    const res = await getContentPlan(req, params);
    expect(res.status).toBe(403);
  });

  it("liefert den Plan bei vorhandener Standort-Zuweisung", async () => {
    loginAs({ id: "user-1", role: "USER" });
    vi.mocked(prisma.contentPlan.findUnique).mockResolvedValue({
      id: "plan-1",
      locationId: "loc-1",
    } as any);
    vi.mocked(prisma.userLocation.findUnique).mockResolvedValue({
      id: "ul-1",
    } as any);

    const res = await getContentPlan(req, params);
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ id: "plan-1" });
  });
});

describe("DELETE /api/content-plans/[id]", () => {
  const req = new NextRequest("http://localhost/api/content-plans/plan-1", {
    method: "DELETE",
  });
  const params = { params: Promise.resolve({ id: "plan-1" }) };

  it("löscht nicht ohne Standort-Zuweisung (403)", async () => {
    loginAs({ id: "user-1", role: "USER" });
    vi.mocked(prisma.contentPlan.findUnique).mockResolvedValue({
      locationId: "loc-fremd",
    } as any);
    vi.mocked(prisma.userLocation.findUnique).mockResolvedValue(null);

    const res = await deleteContentPlan(req, params);
    expect(res.status).toBe(403);
    expect(prisma.contentPlan.delete).not.toHaveBeenCalled();
  });

  it("löscht bei vorhandener Standort-Zuweisung", async () => {
    loginAs({ id: "user-1", role: "USER" });
    vi.mocked(prisma.contentPlan.findUnique).mockResolvedValue({
      locationId: "loc-1",
    } as any);
    vi.mocked(prisma.userLocation.findUnique).mockResolvedValue({
      id: "ul-1",
    } as any);
    vi.mocked(prisma.contentPlan.delete).mockResolvedValue({} as any);

    const res = await deleteContentPlan(req, params);
    expect(res.status).toBe(200);
    expect(prisma.contentPlan.delete).toHaveBeenCalledWith({
      where: { id: "plan-1" },
    });
  });

  it("liefert 404 für unbekannte Pläne", async () => {
    loginAs({ id: "user-1", role: "USER" });
    vi.mocked(prisma.contentPlan.findUnique).mockResolvedValue(null);

    const res = await deleteContentPlan(req, params);
    expect(res.status).toBe(404);
  });
});
