import { describe, it, expect, vi, beforeEach } from "vitest";

// Prisma und next-auth mocken, bevor der Helper importiert wird
vi.mock("@/lib/prisma", () => ({
  prisma: {
    userLocation: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("next-auth/next", () => ({
  getServerSession: vi.fn(),
}));

// authOptions zieht PrismaAdapter/bcrypt nach sich — für die Tests irrelevant
vi.mock("@/app/api/auth/[...nextauth]/authOptions", () => ({
  authOptions: {},
}));

import { getServerSession } from "next-auth/next";
import { prisma } from "@/lib/prisma";
import {
  getSessionUser,
  getAllowedLocationIds,
  canAccessLocation,
  locationScope,
} from "@/lib/location-access";

const mockedGetServerSession = vi.mocked(getServerSession);
const mockedFindMany = vi.mocked(prisma.userLocation.findMany);
const mockedFindUnique = vi.mocked(prisma.userLocation.findUnique);

const normalUser = { id: "user-1", role: "USER" };
const adminUser = { id: "admin-1", role: "ADMIN" };

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getSessionUser", () => {
  it("gibt null zurück, wenn keine Session existiert", async () => {
    mockedGetServerSession.mockResolvedValue(null);
    expect(await getSessionUser()).toBeNull();
  });

  it("gibt null zurück, wenn die Session keine User-ID hat", async () => {
    mockedGetServerSession.mockResolvedValue({ user: {} });
    expect(await getSessionUser()).toBeNull();
  });

  it("gibt id und role aus der Session zurück", async () => {
    mockedGetServerSession.mockResolvedValue({
      user: { id: "user-1", role: "USER", email: "a@b.de" },
    });
    expect(await getSessionUser()).toEqual({ id: "user-1", role: "USER" });
  });
});

describe("getAllowedLocationIds", () => {
  it("gibt null (= alle Standorte) für globale Admins zurück", async () => {
    expect(await getAllowedLocationIds(adminUser)).toBeNull();
    expect(mockedFindMany).not.toHaveBeenCalled();
  });

  it("gibt die zugewiesenen Location-IDs für normale User zurück", async () => {
    mockedFindMany.mockResolvedValue([
      { locationId: "loc-1" },
      { locationId: "loc-2" },
    ] as any);
    expect(await getAllowedLocationIds(normalUser)).toEqual(["loc-1", "loc-2"]);
    expect(mockedFindMany).toHaveBeenCalledWith({
      where: { userId: "user-1" },
      select: { locationId: true },
    });
  });

  it("gibt eine leere Liste zurück, wenn der User keine Zuweisungen hat", async () => {
    mockedFindMany.mockResolvedValue([] as any);
    expect(await getAllowedLocationIds(normalUser)).toEqual([]);
  });
});

describe("canAccessLocation", () => {
  it("erlaubt globalen Admins jeden Standort", async () => {
    expect(await canAccessLocation(adminUser, "loc-x")).toBe(true);
    expect(mockedFindUnique).not.toHaveBeenCalled();
  });

  it("erlaubt Zugriff bei vorhandener UserLocation-Zuweisung", async () => {
    mockedFindUnique.mockResolvedValue({ id: "ul-1" } as any);
    expect(await canAccessLocation(normalUser, "loc-1")).toBe(true);
    expect(mockedFindUnique).toHaveBeenCalledWith({
      where: {
        userId_locationId: { userId: "user-1", locationId: "loc-1" },
      },
      select: { id: true },
    });
  });

  it("verweigert Zugriff ohne UserLocation-Zuweisung", async () => {
    mockedFindUnique.mockResolvedValue(null);
    expect(await canAccessLocation(normalUser, "loc-fremd")).toBe(false);
  });

  it("verweigert Zugriff bei leerer locationId (auch für Admins)", async () => {
    expect(await canAccessLocation(normalUser, "")).toBe(false);
    expect(await canAccessLocation(adminUser, "")).toBe(false);
    expect(await canAccessLocation(normalUser, undefined as any)).toBe(false);
  });
});

describe("locationScope", () => {
  it("liefert ein leeres Fragment für Admins (null)", () => {
    expect(locationScope(null)).toEqual({});
  });

  it("liefert einen in-Filter für normale User", () => {
    expect(locationScope(["loc-1", "loc-2"])).toEqual({
      locationId: { in: ["loc-1", "loc-2"] },
    });
  });

  it("liefert einen leeren in-Filter für User ohne Zuweisungen", () => {
    expect(locationScope([])).toEqual({ locationId: { in: [] } });
  });
});
