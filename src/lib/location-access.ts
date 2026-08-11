import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export type SessionUser = {
  id: string;
  role: string;
};

// Eingeloggten User aus der Session holen (null = nicht eingeloggt)
export async function getSessionUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return null;
  return { id: session.user.id, role: session.user.role };
}

function isGlobalAdmin(user: SessionUser): boolean {
  return user.role === "ADMIN";
}

// IDs aller Locations, auf die der User Zugriff hat.
// null = Zugriff auf alle Locations (globaler Admin).
export async function getAllowedLocationIds(
  user: SessionUser
): Promise<string[] | null> {
  if (isGlobalAdmin(user)) return null;
  const userLocations = await prisma.userLocation.findMany({
    where: { userId: user.id },
    select: { locationId: true },
  });
  return userLocations.map((ul) => ul.locationId);
}

// Prüft, ob der User auf eine konkrete Location zugreifen darf.
export async function canAccessLocation(
  user: SessionUser,
  locationId: string
): Promise<boolean> {
  if (!locationId) return false;
  if (isGlobalAdmin(user)) return true;
  const userLocation = await prisma.userLocation.findUnique({
    where: { userId_locationId: { userId: user.id, locationId } },
    select: { id: true },
  });
  return userLocation !== null;
}

// Prisma-where-Fragment, das Listen-Queries auf erlaubte Locations einschränkt.
export function locationScope(
  allowedLocationIds: string[] | null
): { locationId?: { in: string[] } } {
  if (allowedLocationIds === null) return {};
  return { locationId: { in: allowedLocationIds } };
}
