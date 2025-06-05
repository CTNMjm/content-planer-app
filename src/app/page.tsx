import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/authOptions";
import Link from "next/link";

export default async function HomePage() {
  const session = await getServerSession(authOptions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-emerald-50">
      {/* Navigation Header */}
      <header className="absolute top-0 w-full z-10">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">ContentPlaner</h1>
            </div>
            <div className="flex items-center gap-4">
              {session?.user ? (
                <>
                  <span className="text-sm text-gray-600">
                    {session.user.name || session.user.email}
                  </span>
                  <Link
                    href="/dashboard"
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                  <form action="/api/auth/signout" method="post" className="inline">
                    <button
                      type="submit"
                      className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Registrieren
                  </Link>
                </>
              )}
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-16">
          <div className="text-center">
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6">
              Content-Planung
              <span className="block text-violet-600">leicht gemacht</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-10">
              Verwalten Sie Ihre Content-Pläne effizient an einem Ort. 
              Von der Idee bis zur Veröffentlichung – alles in einer übersichtlichen Plattform.
            </p>
            
            {session?.user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Zum Dashboard →
                </Link>
                <Link
                  href="/content-plans"
                  className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors border-2 border-gray-200"
                >
                  Content-Pläne ansehen
                </Link>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg hover:shadow-xl"
                >
                  Jetzt kostenlos starten →
                </Link>
                <Link
                  href="/login"
                  className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-lg font-semibold text-lg transition-colors border-2 border-gray-200"
                >
                  Anmelden
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-violet-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Content-Planung</h3>
              <p className="text-gray-600">
                Erstellen und verwalten Sie Ihre Content-Pläne mit einer intuitiven Oberfläche.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Input-Management</h3>
              <p className="text-gray-600">
                Sammeln Sie Ideen und Inputs von verschiedenen Quellen an einem zentralen Ort.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Redaktionsplan</h3>
              <p className="text-gray-600">
                Behalten Sie den Überblick über alle Veröffentlichungen und Deadlines.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section for logged-in users */}
        {session?.user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-gradient-to-r from-violet-600 to-emerald-600 rounded-3xl p-12 text-white text-center">
              <h3 className="text-3xl font-bold mb-4">
                Bereit, Ihre Content-Strategie zu optimieren?
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Greifen Sie auf alle Ihre Pläne zu und starten Sie noch heute.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/content-plans"
                  className="bg-white text-violet-600 hover:bg-gray-100 px-6 py-3 rounded-lg font-semibold transition-colors"
                >
                  Content-Pläne →
                </Link>
                <Link
                  href="/input-plans"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold transition-colors border border-white/30"
                >
                  Input-Pläne →
                </Link>
                <Link
                  href="/redak-plans"
                  className="bg-white/20 hover:bg-white/30 backdrop-blur text-white px-6 py-3 rounded-lg font-semibold transition-colors border border-white/30"
                >
                  Redaktionspläne →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* CTA Section for non-logged-in users */}
        {!session?.user && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="bg-gradient-to-r from-violet-600 to-emerald-600 rounded-3xl p-12 text-white text-center">
              <h3 className="text-3xl font-bold mb-4">
                Starten Sie jetzt mit ContentPlaner
              </h3>
              <p className="text-xl mb-8 opacity-90">
                Kostenlos registrieren und sofort loslegen. Keine Kreditkarte erforderlich.
              </p>
              <Link
                href="/register"
                className="inline-block bg-white text-violet-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors"
              >
                Kostenlos registrieren →
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 ContentPlaner. Alle Rechte vorbehalten.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
