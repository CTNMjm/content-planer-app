"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { RedakPlanModal } from "@/components/RedakPlanModal";
import RedakPlanHistory from "@/components/RedakPlanHistory";

interface RedakPlan {
  id: string;
  monat: string;
  bezug: string;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  voe: string;
  status: "COMPLETED" | "DRAFT" | "IN_PROGRESS" | "REVIEW" | "APPROVED";
  publiziert: boolean;
  locationId: string;
  location: {
    id: string;
    name: string;
  };
  inputPlan?: {
    id: string;
    idee: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

type SortField = 'voe' | 'monat' | 'status' | 'location' | 'createdAt';
type SortOrder = 'asc' | 'desc';

export default function RedakPlanList() {
  const [redakPlans, setRedakPlans] = useState<RedakPlan[]>([]);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRedakPlan, setSelectedRedakPlan] = useState<RedakPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [publishedFilter, setPublishedFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>('voe');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [showCompleted, setShowCompleted] = useState(false); // NEU: State für abgeschlossene Ansicht
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    fetchRedakPlans();
    fetchLocations();
  }, []);

  const fetchRedakPlans = async () => {
    try {
      const response = await fetch("/api/redakplan");
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Fehler beim Laden der Daten");
      }
      
      const data = await response.json();
      setRedakPlans(data);
    } catch (error) {
      console.error("Error fetching redak plans:", error);
      setError("Fehler beim Laden der Redaktionspläne");
    } finally {
      setLoading(false);
    }
  };

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleSaveRedakPlan = async (plan: RedakPlan) => {
    try {
      const url = plan.id ? `/api/redakplan/${plan.id}` : '/api/redakplan';
      const method = plan.id ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(plan),
      });

      if (!response.ok) {
        throw new Error('Fehler beim Speichern');
      }

      await fetchRedakPlans();
      setIsModalOpen(false);
      setSelectedRedakPlan(null);
    } catch (error) {
      console.error('Error saving RedakPlan:', error);
      throw error;
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  // Filter und Sortierung anwenden
  const filteredAndSortedPlans = redakPlans
    .filter(plan => {
      // NEU: Filter für abgeschlossene Einträge
      if (showCompleted) {
        return plan.status === 'COMPLETED';
      } else {
        return plan.status !== 'COMPLETED';
      }
    })
    .filter(plan => {
      // Suchfilter
      if (searchTerm && !plan.idee.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !plan.bezug.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !plan.mechanikThema.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Status Filter - nur wenn nicht in abgeschlossener Ansicht
      if (!showCompleted && statusFilter !== 'all' && plan.status !== statusFilter) {
        return false;
      }
      
      // Location Filter
      if (locationFilter !== 'all' && plan.locationId !== locationFilter) {
        return false;
      }
      
      // Published Filter
      if (publishedFilter === 'published' && !plan.publiziert) {
        return false;
      }
      if (publishedFilter === 'unpublished' && plan.publiziert) {
        return false;
      }
      
      return true;
    })
    .sort((a, b) => {
      let aValue: any;
      let bValue: any;
      
      switch (sortField) {
        case 'voe':
          aValue = new Date(a.voe).getTime();
          bValue = new Date(b.voe).getTime();
          break;
        case 'monat':
          aValue = a.monat;
          bValue = b.monat;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'location':
          aValue = a.location.name;
          bValue = b.location.name;
          break;
        case 'createdAt':
          aValue = new Date(a.createdAt).getTime();
          bValue = new Date(b.createdAt).getTime();
          break;
        default:
          return 0;
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const totalPages = Math.ceil(filteredAndSortedPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlans = filteredAndSortedPlans.slice(startIndex, startIndex + itemsPerPage);

  const getStatusDisplay = (status: string) => {
    const statusMap: { [key: string]: { text: string; class: string } } = {
      'DRAFT': { text: 'Entwurf', class: 'bg-gray-100 text-gray-800' },
      'IN_PROGRESS': { text: 'In Bearbeitung', class: 'bg-blue-100 text-blue-800' },
      'REVIEW': { text: 'Review', class: 'bg-yellow-100 text-yellow-800' },
      'APPROVED': { text: 'Freigegeben', class: 'bg-green-100 text-green-800' },
      'COMPLETED': { text: 'Abgeschlossen', class: 'bg-purple-100 text-purple-800' }
    };
    
    return statusMap[status] || { text: status, class: 'bg-gray-100 text-gray-800' };
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="bg-white shadow rounded-md p-6">
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <button
              onClick={fetchRedakPlans}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  const Pager = (): JSX.Element | null => {
    if (totalPages <= 1) return null;
    return (
      <div className="mt-4 flex justify-center">
        <nav className="flex space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </div>
    );
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <div className="flex justify-end items-center mb-4">
          <div className="flex gap-2">
            {/* Abgeschlossen-Button */}
            <button
              onClick={() => setShowCompleted(!showCompleted)}
              className={`px-4 py-2 rounded-md ${
                showCompleted
                  ? "bg-gray-600 text-white hover:bg-gray-700"
                  : "bg-gray-600 text-white hover:bg-gray-700"
              }`}
            >
              {showCompleted ? "← Zurück" : "Abgeschlossen"}
            </button>
            {/* + Neuer Redakplan nur wenn nicht abgeschlossen */}
            {!showCompleted && (
              <button
                onClick={() => {
                  setSelectedRedakPlan(null);
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
              >
                + Neuer Redakplan
              </button>
            )}
            {/* Ansicht-Umschalter */}
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md ${
                viewMode === "list"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 rounded-md ${
                viewMode === "kanban"
                  ? "bg-orange-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Kanban
            </button>
          </div>
        </div>

        {/* Überschrift für abgeschlossene Ansicht */}
        {showCompleted && (
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Abgeschlossene Redaktionspläne
            </h2>
          </div>
        )}

        {/* Filter und Suche */}
        <div className="bg-white p-4 rounded-lg shadow space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Suchfeld */}
            <div className="md:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Suche</label>
              <input
                type="text"
                placeholder="Suchen..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            {/* Status Filter - nur anzeigen wenn nicht in abgeschlossener Ansicht */}
            {!showCompleted && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="all">Alle Status</option>
                  <option value="DRAFT">Entwurf</option>
                  <option value="IN_PROGRESS">In Bearbeitung</option>
                  <option value="REVIEW">Review</option>
                  <option value="APPROVED">Freigegeben</option>
                </select>
              </div>
            )}

            {/* Standort Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Standort</label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Alle Standorte</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Veröffentlicht Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veröffentlichung</label>
              <select
                value={publishedFilter}
                onChange={(e) => setPublishedFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="all">Alle</option>
                <option value="published">Veröffentlicht</option>
                <option value="unpublished">Nicht veröffentlicht</option>
              </select>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {showCompleted 
              ? `${filteredAndSortedPlans.length} abgeschlossene Einträge`
              : `${filteredAndSortedPlans.length} von ${redakPlans.filter(p => p.status !== 'COMPLETED').length} aktiven Einträgen`
            }
          </div>
        </div>
      </div>

      {/* Tabelle */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {filteredAndSortedPlans.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {showCompleted ? 'Keine abgeschlossenen Redaktionspläne gefunden' : 'Keine Redaktionspläne gefunden'}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || (!showCompleted && statusFilter !== 'all') || locationFilter !== 'all' || publishedFilter !== 'all' 
                ? 'Versuchen Sie es mit anderen Filterkriterien.'
                : showCompleted ? 'Es gibt noch keine abgeschlossenen Redaktionspläne.' : 'Erstellen Sie Ihren ersten Redaktionsplan.'}
            </p>
          </div>
        ) : viewMode === "list" ? (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('voe')}
                  >
                    <div className="flex items-center">
                      VOE Datum
                      {sortField === 'voe' && (
                        <svg className={`ml-1 w-4 h-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('monat')}
                  >
                    <div className="flex items-center">
                      Monat
                      {sortField === 'monat' && (
                        <svg className={`ml-1 w-4 h-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Idee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bezug
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('status')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortField === 'status' && (
                        <svg className={`ml-1 w-4 h-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSort('location')}
                  >
                    <div className="flex items-center">
                      Standort
                      {sortField === 'location' && (
                        <svg className={`ml-1 w-4 h-4 ${sortOrder === 'desc' ? 'transform rotate-180' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veröffentlicht
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedPlans.map((plan) => {
                  const statusInfo = getStatusDisplay(plan.status);
                  return (
                    <tr 
                      key={plan.id} 
                      className="hover:bg-gray-50 cursor-pointer"
                      onClick={() => {
                        setSelectedRedakPlan(plan);
                        setIsModalOpen(true);
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(plan.voe).toLocaleDateString('de-DE')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plan.monat}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="max-w-xs truncate" title={plan.idee}>
                          {plan.idee}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plan.bezug}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${statusInfo.class}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {plan.location.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {plan.publiziert ? (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Ja
                          </span>
                        ) : (
                          <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Nein
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedRedakPlan(plan);
                            setIsModalOpen(true);
                          }}
                          className="text-orange-600 hover:text-orange-900"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // <-- Das ist wichtig!
                            setSelectedRedakPlan(plan);
                            setShowHistory(true);
                          }}
                          className="text-gray-600 hover:text-gray-900 text-sm font-medium"
                        >
                          Historie
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <Pager />
          </>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {["DRAFT", "IN_PROGRESS", "REVIEW", "APPROVED", "COMPLETED"].map((status) => (
                <div key={status} className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-700 mb-3">
                    {getStatusDisplay(status).text}
                  </h3>
                  <div className="space-y-2">
                    {paginatedPlans.filter(plan => plan.status === status).map(plan => (
                      <div
                        key={plan.id}
                        className="bg-white p-3 rounded shadow hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => {
                          setSelectedRedakPlan(plan);
                          setIsModalOpen(true);
                        }}
                      >
                        <div className="font-medium text-sm">{plan.monat}</div>
                        <div className="text-xs text-gray-600">{plan.bezug}</div>
                        <div className="text-xs text-gray-500">{plan.mechanikThema}</div>
                        <div className="text-xs text-gray-400">{plan.location.name}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          VOE: {new Date(plan.voe).toLocaleDateString('de-DE')}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <span className={`px-2 py-1 text-xs rounded ${getStatusDisplay(plan.status).class}`}>
                            {getStatusDisplay(plan.status).text}
                          </span>
                          {plan.publiziert && (
                            <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">Veröffentlicht</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <Pager />
          </>
        )}
      </div>

      {/* RedakPlan Modal */}
      <RedakPlanModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRedakPlan(null);
        }}
        redakPlan={selectedRedakPlan}
        onSave={handleSaveRedakPlan}
        locations={locations}
      />

      {/* RedakPlan History */}
      {selectedRedakPlan && showHistory && (
        <RedakPlanHistory
          redakPlanId={selectedRedakPlan.id}
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
        />
      )}
    </div>
  );
}