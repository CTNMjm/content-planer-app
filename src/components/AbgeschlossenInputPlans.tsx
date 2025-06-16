"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { InputPlanModal } from "@/components/InputPlanModal";

interface InputPlan {
  id: string;
  contentPlanId?: string;
  monat: string;
  bezug: string;
  mehrwert?: string;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  implementationLevel?: string;
  creativeFormat?: string;
  creativeBriefingExample?: string;
  copyExample?: string;
  copyExampleCustomized?: string;
  firstCommentForEngagement?: string;
  notes?: string;
  action?: string;
  zusatzinfo?: string;
  gptResult?: string;
  n8nResult?: string;
  flag: boolean;
  voe?: string;
  voeDate?: string;
  status: "DRAFT" | "IN_PROGRESS" | "REVIEW" | "APPROVED" | "COMPLETED";
  location: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  anlass?: string | null;
  geschaeft?: string | null;
}

export default function AbgeschlossenInputPlans() {
  const router = useRouter();
  const [inputPlans, setInputPlans] = useState<InputPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<InputPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("completedAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedPlan, setSelectedPlan] = useState<InputPlan | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchCompletedInputPlans();
  }, []);

  useEffect(() => {
    let filtered = [...inputPlans];

    // Textsuche
    if (searchTerm) {
      filtered = filtered.filter((plan) =>
        plan.idee.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.mechanikThema.toLowerCase().includes(searchTerm.toLowerCase()) ||
        plan.monat.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.anlass && plan.anlass.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (plan.geschaeft && plan.geschaeft.toLowerCase().includes(searchTerm.toLowerCase()))
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
        case "datum":
          if (a.voe && b.voe) {
            compareValue = new Date(a.voe).getTime() - new Date(b.voe).getTime();
          } else if (a.voe) {
            compareValue = 1;
          } else if (b.voe) {
            compareValue = -1;
          } else {
            compareValue = 0;
          }
          break;
        case "idee":
          compareValue = a.idee.localeCompare(b.idee);
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
    setCurrentPage(1);
  }, [searchTerm, inputPlans, locationFilter, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = filteredPlans.slice(startIndex, endIndex);

  const fetchCompletedInputPlans = async () => {
    try {
      const response = await fetch("/api/inputplan");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der abgeschlossenen Input-Pläne");
      }
      const data = await response.json();
      
      // DEBUG: Zeige alle Status-Werte
      console.log("Alle InputPläne:", data);
      console.log("Vorhandene Status:", [...new Set(data.map((p: InputPlan) => p.status))]);
      
      // Nur abgeschlossene Pläne anzeigen - prüfe beide möglichen Werte
      const completedPlans = data.filter((plan: InputPlan) =>
        plan.status === 'COMPLETED'
      );
      
      console.log("Gefilterte abgeschlossene Pläne:", completedPlans);
      
      setInputPlans(completedPlans);
      setFilteredPlans(completedPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handleReactivate = async (planId: string) => {
    if (!confirm("Möchten Sie diesen Input-Plan wirklich reaktivieren?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inputplan/${planId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'FREIGEBEBEN'
        }),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Reaktivieren');
      }

      // Plan aus der Liste entfernen
      setInputPlans(prevPlans => prevPlans.filter(plan => plan.id !== planId));
      
      // Erfolgsmeldung
      alert('Input-Plan wurde erfolgreich reaktiviert und ist wieder in der Hauptansicht verfügbar.');
    } catch (error) {
      console.error('Error reactivating input plan:', error);
      alert('Fehler beim Reaktivieren des Input-Plans');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen abgeschlossenen Input-Plan wirklich endgültig löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inputplan?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen des Input-Plans");
      }

      await fetchCompletedInputPlans();
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
    return <div className="p-8">Lade abgeschlossene Input-Pläne...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Fehler: {error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Link
            href="/inputplan"
            className="text-gray-600 hover:text-gray-900"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">Abgeschlossene Input-Pläne</h1>
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
            {Array.from(new Set(inputPlans.map(p => p.location.id))).map(locationId => {
              const location = inputPlans.find(p => p.location.id === locationId)?.location;
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
            <option value="datum">Sortieren nach VOE Datum</option>
            <option value="idee">Sortieren nach Idee</option>
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
          <p className="mt-2 text-gray-600">Keine abgeschlossenen Input-Pläne gefunden.</p>
          <Link
            href="/inputplan"
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
                    VOE Datum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Mechanik/Thema
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Anlass
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
                    <td className="px-6 py-4 whitespace-nowrap">
                      {plan.voe ? new Date(plan.voe).toLocaleDateString('de-DE') : '-'}
                    </td>
                    <td className="px-6 py-4">{plan.idee}</td>
                    <td className="px-6 py-4">{plan.mechanikThema}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{plan.anlass || '-'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{plan.location.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(plan.updatedAt).toLocaleDateString('de-DE')}
                    </td>
                    <td 
                      className="px-6 py-4 whitespace-nowrap text-sm"
                      onClick={(e) => e.stopPropagation()} // Verhindert das Öffnen des Modals bei Button-Klick
                    >
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

      {/* Detail Modal für abgeschlossene Pläne */}
      {isModalOpen && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-green-600 text-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">Details: {selectedPlan.idee.substring(0, 50)}...</h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedPlan(null);
                }}
                className="text-green-100 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basis-Informationen */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-3">Basis-Informationen</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Monat</label>
                    <p className="mt-1 text-gray-900">{selectedPlan.monat}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">VOE Datum</label>
                    <p className="mt-1 text-gray-900">
                      {selectedPlan.voe ? 
                        new Date(selectedPlan.voe).toLocaleDateString('de-DE', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        }) : '-'
                      }
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Bezug</label>
                    <p className="mt-1 text-gray-900">{selectedPlan.bezug}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mehrwert</label>
                    <p className="mt-1 text-gray-900">{selectedPlan.mehrwert || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mechanik/Thema</label>
                    <p className="mt-1 text-gray-900">{selectedPlan.mechanikThema}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Platzierung</label>
                    <p className="mt-1 text-gray-900">{selectedPlan.platzierung}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Standort</label>
                    <p className="mt-1 text-gray-900">{selectedPlan.location.name}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Status</label>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Abgeschlossen
                    </span>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Flag</label>
                    <p className="mt-1 text-gray-900">
                      {selectedPlan.flag ? 
                        <span className="text-red-600">✓ Markiert</span> : 
                        <span className="text-gray-400">Nicht markiert</span>
                      }
                    </p>
                  </div>
                </div>

                {/* Content-Informationen */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg mb-3">Content-Informationen</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Idee</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap">{selectedPlan.idee}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Umsetzungslevel</label>
                    <p className="mt-1 text-gray-900">{selectedPlan.implementationLevel || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Format</label>
                    <p className="mt-1 text-gray-900">{selectedPlan.creativeFormat || '-'}</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Action</label>
                    <p className="mt-1 text-gray-900">{selectedPlan.action || '-'}</p>
                  </div>
                </div>

                {/* Zusätzliche Informationen - volle Breite */}
                <div className="space-y-4 md:col-span-2">
                  <h3 className="font-semibold text-lg mb-3">Zusätzliche Informationen</h3>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Creative Briefing + Beispiel</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedPlan.creativeBriefingExample || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Copy-Beispiel</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedPlan.copyExample || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Copy-Beispiel (individuell aufbereitet)</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedPlan.copyExampleCustomized || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Erster Kommentar zur Interaktionsförderung</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedPlan.firstCommentForEngagement || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Notes</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedPlan.notes || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Zusatzinfo</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded">
                      {selectedPlan.zusatzinfo || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">N8N Ergebnis</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                      {selectedPlan.n8nResult || '-'}
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">GPT Ergebnis</label>
                    <p className="mt-1 text-gray-900 whitespace-pre-wrap bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
                      {selectedPlan.gptResult || '-'}
                    </p>
                  </div>
                </div>

                {/* Zeitstempel */}
                <div className="space-y-4 md:col-span-2 pt-4 border-t">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Erstellt am</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(selectedPlan.createdAt).toLocaleString('de-DE')}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Abgeschlossen am</label>
                      <p className="mt-1 text-gray-900">
                        {new Date(selectedPlan.updatedAt).toLocaleString('de-DE')}
                      </p>
                    </div>
                  </div>
                  {selectedPlan.contentPlanId && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Ursprung</label>
                      <p className="mt-1 text-gray-900">
                        Erstellt aus ContentPlan ID: {selectedPlan.contentPlanId}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedPlan(null);
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Schließen
                </button>
                <button
                  onClick={() => {
                    handleReactivate(selectedPlan.id);
                    setIsModalOpen(false);
                    setSelectedPlan(null);
                  }}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  Reaktivieren
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}