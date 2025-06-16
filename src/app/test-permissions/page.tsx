import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export default async function TestPermissionsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div>Not logged in</div>;
  }

  const userWithDetails = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      userLocations: {
        include: {
          location: true,
          roles: {
            include: {
              role: true
            }
          },
          permissions: true
        }
      }
    }
  });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Test Permissions</h1>
      
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Current User</h2>
        <p className="text-gray-600">Email: {userWithDetails?.email}</p>
        <p className="text-gray-600">Name: {userWithDetails?.name}</p>
        <p className="text-gray-600">ID: {userWithDetails?.id}</p>
      </div>

      {userWithDetails?.userLocations.map((ul) => (
        <div key={ul.id} className="bg-white rounded-lg shadow p-6 mb-4">
          <h3 className="text-lg font-semibold mb-4">
            Location: {ul.location.name}
          </h3>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Rollen:</h4>
            <div className="flex gap-2">
              {ul.roles.map((r) => (
                <span key={r.id} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  {r.role.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-medium mb-2">Berechtigungen:</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {ul.permissions.map((p) => (
                <div key={p.id} className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{p.code}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}

      <div className="bg-yellow-50 rounded-lg p-6 mt-8">
        <h3 className="text-lg font-semibold mb-2">Test-Aktionen</h3>
        <div className="space-y-4">
          <div>
            <a 
              href="/api/contentplan" 
              target="_blank"
              className="text-blue-600 hover:underline"
            >
              Test API: GET /api/contentplan
            </a>
          </div>
          <div>
            <a 
              href="/contentplan" 
              className="text-blue-600 hover:underline"
            >
              Gehe zu Content-Pläne
            </a>
          </div>
          <div>
            <a 
              href="/inputplan" 
              className="text-blue-600 hover:underline"
            >
              Gehe zu Input-Pläne
            </a>
          </div>
          <div>
            <a 
              href="/redakplan" 
              className="text-blue-600 hover:underline"
            >
              Gehe zu Redaktionspläne
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}