"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ContentPlanModal } from "@/components/ContentPlanModal";

interface ContentPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  status: "DRAFT" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
  location: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
}

export default function AbgeschlossenContentPlans() {
  const router = useRouter();
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("completedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [selectedPlan, setSelectedPlan] = useState<ContentPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchCompletedContentPlans();
  }, []);

  useEffect(() => {
    let filtered = [...contentPlans];

    // Textsuche
    if (searchTerm) {
      filtered = filtered.filter((plan) =>
        plan.bezug.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.mechanikThema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.idee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.monat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.platzierung.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Location-Filter
    if (locationFilter !== "all") {
      filtered = filtered.filter((plan) => plan.location.id === locationFilter);
    }

    // Sortierung
    filtered.sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "monat":
          compareValue = a.monat.localeCompare(b.monat);
          break;
        case "bezug":
          compareValue = a.bezug.localeCompare(b.bezug);
          break;
        case "location":
          compareValue = a.location.name.localeCompare(b.location.name);
          break;
        case "completedAt":
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          compareValue = 0;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredPlans(filtered);
    setCurrentPage(1); // Reset auf erste Seite bei Filteränderung
  }, [searchTerm, contentPlans, locationFilter, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = filteredPlans.slice(startIndex, endIndex);

  const fetchCompletedContentPlans = async () => {
    try {
      const response = await fetch("/api/content-plans?status=COMPLETED");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der abgeschlossenen Content-Pläne");
      }
      const data = await response.json();
      // Nur abgeschlossene Pläne anzeigen
      const completedPlans = data.filter((plan: ContentPlan) => plan.status === 'COMPLETED');
      setContentPlans(completedPlans);
      setFilteredPlans(completedPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (planId: string) => {
    if (!confirm("Möchten Sie diesen Content-Plan wirklich reaktivieren?")) {
      return;
    }

    try {
      const response = await fetch(`/api/content-plans/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'APPROVED'
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Reaktivieren');
      }

      // Plan aus der Liste entfernen
      setContentPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      
      // Erfolgsmeldung
      alert('Content-Plan wurde erfolgreich reaktiviert und ist wieder in der Hauptansicht verfügbar.');
    } catch (error) {
      console.error('Error reactivating content plan:', error);
      alert('Fehler beim Reaktivieren des Content-Plans');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen abgeschlossenen Content-Plan wirklich endgültig löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/content-plans/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen des Content-Plans");
      }

      await fetchCompletedContentPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fehler beim Löschen");
    }
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              Zeige <span className="font-medium">{filteredPlans.length > 0 ? startIndex + 1 : 0}</span> bis{' '}
              <span className="font-medium">{Math.min(endIndex, filteredPlans.length)}</span> von{' '}
              <span className="font-medium">{filteredPlans.length}</span> Ergebnissen
            </p>
          </div>
          <div>
            <nav className="inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                const pageNumber = index + 1;
                return (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                      currentPage === pageNumber
                        ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    } border`}
                  >
                    {pageNumber}
                  </button>
                );
              })}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="p-8">Lade abgeschlossene Content-Pläne...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Fehler: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/contentplan"
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Abgeschlossene Content-Pläne</h1>
        </div>
        <div className="text-sm text-gray-600">
          {filteredPlans.length} abgeschlossene Pläne
        </div>
      </div>

      {/* Such- und Filterleiste */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Suchfeld */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Suchen in abgeschlossenen Plänen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Location-Filter */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Standorte</option>
            {Array.from(new Set(contentPlans.map(p => p.location.id))).map(locationId => {
              const location = contentPlans.find(p => p.location.id === locationId)?.location;
              return location ? (
                <option key={location.id} value={location.id}>{location.name}</option>
              ) : null;
            })}
          </select>

          {/* Sortierung */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="completedAt">Sortieren nach Abschlussdatum</option>
            <option value="monat">Sortieren nach Monat</option>
            <option value="bezug">Sortieren nach Bezug</option>
            <option value="location">Sortieren nach Standort</option>
          </select>

          {/* Sortierreihenfolge */}
          <button
            onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
            className="px-3 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            title={sortOrder === "asc" ? "Aufsteigend" : "Absteigend"}
          >
            {sortOrder === "asc" ? (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="text-center py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="mt-2 text-gray-600">Keine abgeschlossenen Content-Pläne gefunden.</p>
          <Link
            href="/contentplan"
            className="mt-4 inline-block text-blue-600 hover:text-blue-700"
          >
            Zurück zur Hauptansicht
          </Link>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monat
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bezug
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mechanik/Thema
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Standort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Abgeschlossen am
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentPlans.map((plan) => (
                  <tr 
                    key={plan.id} 
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setSelectedPlan(plan);
                      setIsModalOpen(true);
                    }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">{plan.monat}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{plan.bezug}</td>
                    <td className="px-6 py-4">{plan.mechanikThema}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{plan.location.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(plan.updatedAt).toLocaleDateString('de-DE')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleReactivate(plan.id)}
                        className="mr-3 text-green-600 hover:text-green-900"
                        title="Plan reaktivieren"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Reaktivieren
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Endgültig löschen"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Löschen
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination />
        </>
      )}

      {/* ContentPlan Modal für Details */}
      {isModalOpen && selectedPlan && (
        <ContentPlanModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlan(null);
          }}
          contentPlan={{
            ...selectedPlan,
            mehrwert: selectedPlan.mehrwert ?? undefined,
          }}
          onSave={async () => {
            alert("Abgeschlossene Pläne können nicht bearbeitet werden. Nutzen Sie 'Reaktivieren' um den Plan wieder zu bearbeiten.");
          }}
          readOnly={true}
        />
      )}
    </div>
  );
}