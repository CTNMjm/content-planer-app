"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { ClockIcon } from "@heroicons/react/24/outline";
// WICHTIG: Import des richtigen Modals
import InputPlanModal from "@/app/inputplan/InputPlanModal";
// Korrekter Import - default export
import InputPlanHistory from "@/components/InputPlanHistory";

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
  locationId: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: {
    id: string;
    name: string;
  };
  updatedBy?: {
    id: string;
    name: string;
  };
}

interface InputPlanListProps {
  searchTerm: string;
  refreshKey: number;
}

export default function InputPlanList({
  searchTerm,
  refreshKey,
}: InputPlanListProps) {
  const [inputPlans, setInputPlans] = useState<InputPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [locations, setLocations] = useState<Array<{ id: string; name: string }>>([]);
  const [locationFilter, setLocationFilter] = useState("all");
  const [sortBy, setSortBy] = useState("monat");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  
  // Modal State hinzufügen
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<InputPlan | null>(null);
  
  // History State hinzufügen
  const [showHistory, setShowHistory] = useState(false);
  const [historyPlanId, setHistoryPlanId] = useState<string | null>(null);

  // Nach den anderen States
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    fetchInputPlans();
  }, [refreshKey]);

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

  const fetchInputPlans = async () => {
    try {
      const response = await fetch("/api/inputplan"); // Geändert von "/api/input-plans" zu "/api/inputplan"
      if (!response.ok) throw new Error("Failed to fetch");
      const data = await response.json();
      setInputPlans(data);
    } catch (error) {
      console.error("Error fetching input plans:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inputplan/${id}`, { // Geändert von "/api/input-plans/" zu "/api/inputplan/"
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchInputPlans();
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  // Edit Handler hinzufügen
  const handleEdit = (plan: InputPlan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  // Modal Close Handler
  const handleModalClose = (updated: boolean) => {
    setShowModal(false);
    setEditingPlan(null);
    if (updated) {
      fetchInputPlans(); // Daten neu laden
    }
  };

  // Transfer Handler für Redaktionsplan
  const handleTransferToRedakPlan = async (plan: InputPlan) => {
    // Prüfen ob VÖ-Datum gesetzt ist
    if (!plan.voe && !plan.voeDate) {
      alert("Bitte setzen Sie zuerst ein Veröffentlichungsdatum (VÖ) für diesen Eintrag.");
      return;
    }

    // Prüfen ob Status APPROVED ist
    if (plan.status !== "APPROVED") {
      alert("Nur freigegebene Einträge können in den Redaktionsplan übertragen werden.");
      return;
    }

    if (!confirm("Möchten Sie diesen Eintrag wirklich in den Redaktionsplan übertragen?")) {
      return;
    }

    try {
      // Konvertiere voeDate zu einem Date-Objekt für RedakPlan
      const voeDateTime = plan.voeDate ? new Date(plan.voeDate) : new Date(plan.voe!);
      
      const response = await fetch("/api/redakplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputPlanId: plan.id,
          monat: plan.monat,
          bezug: plan.bezug,
          mechanikThema: plan.mechanikThema,
          idee: plan.idee,
          platzierung: plan.platzierung,
          voe: voeDateTime.toISOString(),
          locationId: plan.locationId,
          status: "DRAFT"
        }),
      });

      if (response.ok) {
        // Nach erfolgreichem Transfer: Status auf COMPLETED setzen
        const statusResponse = await fetch(`/api/inputplan/${plan.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: "COMPLETED" }),
        });

        if (statusResponse.ok) {
          alert("Erfolgreich in den Redaktionsplan übertragen und als abgeschlossen markiert!");
        } else {
          alert("Übertragen, aber Status konnte nicht aktualisiert werden.");
        }
        
        fetchInputPlans(); // Liste aktualisieren
      } else {
        const error = await response.json();
        alert(`Fehler: ${error.message || "Übertragung fehlgeschlagen"}`);
      }
    } catch (error) {
      console.error("Error transferring to RedakPlan:", error);
      alert("Fehler beim Übertragen in den Redaktionsplan");
    }
  };

  // History Handler - aktivieren
  const handleShowHistory = (planId: string) => {
    console.log("Historie für Plan:", planId);
    setHistoryPlanId(planId);
    setShowHistory(true);
  };

  // Filter und Sortierung - COMPLETED ausschließen wenn nicht in der Abgeschlossen-Ansicht
  const filteredAndSortedPlans = inputPlans
    .filter((plan) => {
      // Filter für abgeschlossene Einträge
      if (showCompleted) {
        return plan.status === "COMPLETED";
      } else {
        return plan.status !== "COMPLETED";
      }
    })
    .filter((plan) => {
      // Location Filter
      if (locationFilter !== "all" && plan.location.id !== locationFilter) {
        return false;
      }

      // Suchbegriff Filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        return (
          plan.monat.toLowerCase().includes(search) ||
          plan.bezug.toLowerCase().includes(search) ||
          plan.idee.toLowerCase().includes(search) ||
          plan.mechanikThema.toLowerCase().includes(search) ||
          plan.platzierung.toLowerCase().includes(search) ||
          (plan.mehrwert && plan.mehrwert.toLowerCase().includes(search)) ||
          (plan.zusatzinfo && plan.zusatzinfo.toLowerCase().includes(search)) ||
          plan.location.name.toLowerCase().includes(search)
        );
      }
      return true;
    })
    .sort((a, b) => {
      let compareValue = 0;
      
      switch (sortBy) {
        case "monat":
          compareValue = a.monat.localeCompare(b.monat);
          break;
        case "status":
          compareValue = a.status.localeCompare(b.status);
          break;
        case "location":
          compareValue = a.location.name.localeCompare(b.location.name);
          break;
        case "updatedAt":
          compareValue = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        default:
          compareValue = a.monat.localeCompare(b.monat);
      }

      return sortOrder === "asc" ? compareValue : -compareValue;
    });

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedPlans = filteredAndSortedPlans.slice(startIndex, startIndex + itemsPerPage);

  // Gruppierung für Kanban-Ansicht
  const groupedPlans = filteredAndSortedPlans.reduce((acc, plan) => {
    if (!acc[plan.status]) {
      acc[plan.status] = [];
    }
    acc[plan.status].push(plan);
    return acc;
  }, {} as Record<string, InputPlan[]>);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div>
      {/* Buttons analog zu ContentPlanList */}
      <div className="flex justify-end items-center mb-6">
        <div className="flex gap-2">
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
          
          {!showCompleted && (
            <button
              onClick={() => {
                setEditingPlan(null);
                setShowModal(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + Neuer Inputplan
            </button>
          )}
        </div>
      </div>

      {/* Überschrift wenn abgeschlossene angezeigt werden */}
      {showCompleted && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Abgeschlossene Input-Pläne
          </h2>
        </div>
      )}

      {/* Filter, Sortierung und View Mode Controls */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Standort Filter
            </label>
            <select
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="all">Alle Standorte</option>
              {locations.map((location) => (
                <option key={location.id} value={location.id}>
                  {location.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sortierung
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="monat">Sortieren nach Monat</option>
              <option value="status">Sortieren nach Status</option>
              <option value="location">Sortieren nach Standort</option>
              <option value="updatedAt">Sortieren nach Aktualisierung</option>
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              {sortOrder === "asc" ? "↑ Aufsteigend" : "↓ Absteigend"}
            </button>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md ${
                viewMode === "list"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Liste
            </button>
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 rounded-md ${
                viewMode === "kanban"
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              Kanban
            </button>
          </div>
          
          {/* Aktive Filter Anzeige */}
          {(locationFilter !== "all" || searchTerm) && (
            <div className="flex items-center gap-2">
              {locationFilter !== "all" && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                  Standort: {locations.find(l => l.id === locationFilter)?.name}
                </span>
              )}
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                  Suche: "{searchTerm}"
                </span>
              )}
              <button
                onClick={() => setLocationFilter("all")}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                Filter zurücksetzen
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredAndSortedPlans.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">Keine Input-Pläne gefunden</p>
        </div>
      ) : viewMode === "list" ? (
        // Tabellen-Ansicht
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Monat</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bezug</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Mechanik/Thema</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">VÖ-Datum</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Standort</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktionen</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedPlans.map((plan) => (
                <tr key={plan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{plan.monat}</td>
                  <td className="px-6 py-4 text-sm">{plan.bezug}</td>
                  <td className="px-6 py-4 text-sm">{plan.mechanikThema}</td>
                  <td className="px-6 py-4">
                    <select
                      value={plan.status}
                      onChange={(e) => handleStatusChange(plan.id, e.target.value)}
                      className="text-sm border rounded px-2 py-1"
                      disabled={showCompleted} // Disable bei abgeschlossenen
                    >
                      <option value="DRAFT">Entwurf</option>
                      <option value="IN_PROGRESS">In Bearbeitung</option>
                      <option value="REVIEW">Review</option>
                      <option value="APPROVED">Freigegeben</option>
                      <option value="COMPLETED">Abgeschlossen</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    {plan.voeDate ? new Date(plan.voeDate).toLocaleDateString('de-DE') : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm">{plan.location.name}</td>
                  <td className="px-6 py-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleShowHistory(plan.id)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Historie anzeigen"
                      >
                        <ClockIcon className="h-4 w-4" />
                      </button>
                      {plan.status === "APPROVED" && !showCompleted && (
                        <button
                          onClick={() => handleTransferToRedakPlan(plan)}
                          className={`text-sm font-medium ${
                            plan.voe || plan.voeDate
                              ? "text-green-600 hover:text-green-900" 
                              : "text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!plan.voe && !plan.voeDate}
                          title={!plan.voe && !plan.voeDate ? "VÖ-Datum erforderlich" : "In Redaktionsplan übertragen"}
                        >
                          → RedakPlan
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        // Kanban-Ansicht
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {Object.entries(
            showCompleted 
              ? { COMPLETED: "Abgeschlossen" }  // Nur Abgeschlossen in der Abgeschlossen-Ansicht
              : {
                  DRAFT: "Entwurf",
                  IN_PROGRESS: "In Bearbeitung", 
                  REVIEW: "Review",
                  APPROVED: "Freigegeben"
                  // COMPLETED wird ausgelassen
                }
          ).map(([status, label]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold text-gray-700 mb-3">{label}</h3>
              <div className="space-y-2">
                {(groupedPlans[status] || []).map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white p-3 rounded shadow hover:shadow-md transition-shadow"
                  >
                    <div 
                      className="cursor-pointer"
                      onClick={() => handleEdit(plan)}
                    >
                      <h4 className="font-medium text-sm">{plan.monat}</h4>
                      <p className="text-xs text-gray-600 mt-1">{plan.bezug}</p>
                      <p className="text-xs text-gray-500 mt-1">{plan.mechanikThema}</p>
                      <p className="text-xs text-gray-400 mt-2">{plan.location.name}</p>
                      {plan.voeDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          VÖ: {new Date(plan.voeDate).toLocaleDateString('de-DE')}
                        </p>
                      )}
                      {plan.flag && (
                        <span className="inline-block mt-1 px-2 py-1 text-xs bg-red-100 text-red-800 rounded">
                          Markiert
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShowHistory(plan.id);
                        }}
                        className="text-gray-500 hover:text-gray-700"
                        title="Historie anzeigen"
                      >
                        <ClockIcon className="h-3.5 w-3.5" />
                      </button>
                      {plan.status === "APPROVED" && !showCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTransferToRedakPlan(plan);
                          }}
                          className={`text-xs font-medium py-1 px-2 rounded ${
                            plan.voe || plan.voeDate
                              ? "bg-green-100 text-green-700 hover:bg-green-200" 
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                          disabled={!plan.voe && !plan.voeDate}
                          title={!plan.voe && !plan.voeDate ? "VÖ-Datum erforderlich" : "In Redaktionsplan übertragen"}
                        >
                          → RedakPlan
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {viewMode === "list" && totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <nav className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded ${
                  currentPage === i + 1
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </nav>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500 text-center">
        {filteredAndSortedPlans.length} von {inputPlans.length} Input-Plänen
      </div>

      {/* Modal */}
      {showModal && (
        <InputPlanModal
          item={editingPlan}
          onClose={handleModalClose}
        />
      )}

      {/* History Modal - mit korrekten Props */}
      <InputPlanHistory
        inputPlanId={historyPlanId || ""}
        isOpen={showHistory}
        onClose={() => {
          setShowHistory(false);
          setHistoryPlanId(null);
        }}
      />
    </div>
  );
}