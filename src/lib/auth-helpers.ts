import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export async function requireAuth() {
  const session = await getServerSession();
  if (!session) {
    redirect("/login");
  }
  return session;
}

export function hasPermission(
  session: any,
  locationId: string,
  permission: string
): boolean {
  if (!session?.user?.userLocations) return false;
  
  const userLocation = session.user.userLocations.find(
    (ul: any) => ul.location.id === locationId
  );
  
  if (!userLocation) return false;
  
  // Check if user has admin role
  const hasAdminRole = userLocation.roles.some(
    (r: any) => r.role.name === "Admin"
  );
  
  if (hasAdminRole) return true;
  
  // Check specific permission
  return userLocation.permissions.some(
    (p: any) => p.code === permission
  );
}

export function getUserLocations(session: any) {
  return session?.user?.userLocations || [];
}