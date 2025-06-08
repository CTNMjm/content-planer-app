import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return null;
  }

  // Lade User mit Locations und Permissions
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

  const isAdmin = userWithDetails?.userLocations.some(ul => 
    ul.roles.some(r => r.role.name === 'LOCATION_ADMIN')
  ) || userWithDetails?.role === 'ADMIN';

  const locationIds = userWithDetails?.userLocations.map(ul => ul.location.id) || [];
  const locationCount = locationIds.length;

  // Lade Statistiken
  const [contentPlanCount, inputPlanCount, redakPlanCount] = await Promise.all([
    prisma.contentPlan.count({
      where: { locationId: { in: locationIds } }
    }),
    prisma.inputPlan.count({
      where: { locationId: { in: locationIds } }
    }),
    prisma.redakPlan.count({
      where: { locationId: { in: locationIds } }
    })
  ]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
      
      {/* Statistik-Kacheln */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Standorte</p>
              <p className="text-2xl font-semibold text-gray-900">{locationCount}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-full">
              <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="mt-2 text-sm text-gray-500">Zugewiesene Standorte</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Content-Pläne</p>
              <p className="text-2xl font-semibold text-indigo-600">{contentPlanCount}</p>
            </div>
            <div className="p-3 bg-indigo-100 rounded-full">
              <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <Link href="/contentplan" className="mt-2 text-sm text-indigo-600 hover:text-indigo-700">
            Anzeigen →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Input-Pläne</p>
              <p className="text-2xl font-semibold text-emerald-600">{inputPlanCount}</p>
            </div>
            <div className="p-3 bg-emerald-100 rounded-full">
              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <Link href="/inputplan" className="mt-2 text-sm text-emerald-600 hover:text-emerald-700">
            Anzeigen →
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Redaktionspläne</p>
              <p className="text-2xl font-semibold text-purple-600">{redakPlanCount}</p>
            </div>
            <div className="p-3 bg-purple-100 rounded-full">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
          <Link href="/redakplan" className="mt-2 text-sm text-purple-600 hover:text-purple-700">
            Anzeigen →
          </Link>
        </div>
      </div>

      {/* Plan Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Link href="/contentplan" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Content-Pläne</h2>
            <p className="text-gray-600">Verwalten Sie Ihre Content-Pläne</p>
          </div>
        </Link>
        
        <Link href="/inputplan" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Input-Pläne</h2>
            <p className="text-gray-600">Verwalten Sie Ihre Input-Pläne</p>
          </div>
        </Link>
        
        <Link href="/redakplan" className="block">
          <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold mb-2">Redaktionspläne</h2>
            <p className="text-gray-600">Verwalten Sie Ihre Redaktionspläne</p>
          </div>
        </Link>
      </div>

      {/* Reports Section */}
      <div className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Reports</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Statistiken</h3>
            <p className="text-gray-600">Übersicht über alle Pläne und deren Status</p>
            <Link href="/reports/statistics" className="text-orange-600 hover:text-orange-700 mt-2 inline-block">
              Ansehen →
            </Link>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Timeline</h3>
            <p className="text-gray-600">Zeitliche Übersicht der Veröffentlichungen</p>
            <Link href="/reports/timeline" className="text-green-600 hover:text-green-700 mt-2 inline-block">
              Ansehen →
            </Link>
          </div>
        </div>
      </div>

      {/* Admin Section - nur für Admins sichtbar */}
      {isAdmin && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Administration</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link href="/admin/users" className="block">
              <div className="bg-red-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Benutzer verwalten</h3>
                <p className="text-gray-600">Benutzer und Berechtigungen verwalten</p>
              </div>
            </Link>
            
            <Link href="/admin/locations" className="block">
              <div className="bg-red-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Standorte verwalten</h3>
                <p className="text-gray-600">Standorte und Zuordnungen verwalten</p>
              </div>
            </Link>
            
            <Link href="/admin/settings" className="block">
              <div className="bg-red-50 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-center mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Einstellungen</h3>
                <p className="text-gray-600">Systemeinstellungen verwalten</p>
              </div>
            </Link>
          </div>
        </div>
      )}

      {/* User Info Section - jetzt am Ende */}
      <div className="bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Ihre Informationen</h2>
        <p className="mb-4">Angemeldet als: <strong>{session.user.name || session.user.email}</strong></p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-medium mb-2">Ihre Standorte:</h3>
            <div className="space-y-2">
              {userWithDetails?.userLocations.map((ul) => (
                <div key={ul.id} className="bg-white rounded p-3">
                  <p className="font-medium">{ul.location.name}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {ul.roles.map((r) => (
                      <span key={r.id} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded">
                        {r.role.name}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-2">Ihre Berechtigungen:</h3>
            <div className="bg-white rounded p-3">
              <div className="grid grid-cols-2 gap-2 text-sm">
                {userWithDetails?.userLocations.flatMap(ul => 
                  ul.permissions.map(p => (
                    <div key={`${ul.id}-${p.id}`} className="flex items-center">
                      <svg className="w-4 h-4 text-green-500 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      {p.code}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
