import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export default async function DebugPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Not logged in</div>;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userLocations: {
        include: {
          location: true,
          roles: {
            include: {
              role: true
            }
          }
        }
      }
    }
  });

  const contentPlans = await prisma.contentPlan.findMany({
    include: { location: true }
  });

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug Info</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Session</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">User with Locations</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(user, null, 2)}
        </pre>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">All Content Plans</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(contentPlans, null, 2)}
        </pre>
      </div>
    </div>
  );
}