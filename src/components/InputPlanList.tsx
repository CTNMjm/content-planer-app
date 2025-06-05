"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import InputPlanModal from "./InputPlanModal";

interface InputPlan {
  id: string;
  monat: string;
  bezug: string;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  status: string;
  contentPlanId?: string;
  location: {
    id: string;
    name: string;
  };
  createdBy?: {
    id: string;
    name: string | null;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface InputPlanListProps {
  // ... bestehende Props
}

export default function InputPlanList(props: InputPlanListProps) {
  const [inputPlans, setInputPlans] = useState<InputPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<InputPlan | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "kanban">("kanban");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPlans, setSelectedPlans] = useState<Set<string>>(new Set());
  const [showConvertModal, setShowConvertModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchInputPlans();
  }, []);

  const fetchInputPlans = async () => {
    try {
      const response = await fetch("/api/inputplan");
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Fehler beim Laden der Daten");
      }
      
      const data = await response.json();
      setInputPlans(data);
    } catch (error) {
      console.error("Error fetching input plans:", error);
      setError("Fehler beim Laden der Input-Pläne");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: InputPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Input-Plan wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/inputplan/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen");
      }

      await fetchInputPlans();
    } catch (error) {
      console.error("Error deleting input plan:", error);
    }
  };

  const handleSave = async () => {
    await fetchInputPlans();
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/inputplan/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Status-Update");
      }

      await fetchInputPlans();
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  const toggleSelection = (planId: string) => {
    const newSelection = new Set(selectedPlans);
    if (newSelection.has(planId)) {
      newSelection.delete(planId);
    } else {
      newSelection.add(planId);
    }
    setSelectedPlans(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedPlans.size === filteredPlans.length) {
      setSelectedPlans(new Set());
    } else {
      setSelectedPlans(new Set(filteredPlans.map(plan => plan.id)));
    }
  };

  const handleBatchConvert = () => {
    if (selectedPlans.size === 0) {
      alert("Bitte wählen Sie mindestens einen Eintrag aus.");
      return;
    }
    setShowConvertModal(true);
  };

  const filteredPlans = inputPlans.filter(plan => 
    plan.idee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.mechanikThema.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.monat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const plansByStatus = {
    DRAFT: filteredPlans.filter(p => p.status === "DRAFT"),
    IN_PROGRESS: filteredPlans.filter(p => p.status === "IN_PROGRESS"),
    REVIEW: filteredPlans.filter(p => p.status === "REVIEW"),
    APPROVED: filteredPlans.filter(p => p.status === "APPROVED"),
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded w-1/4 mb-6"></div>
        <div className="grid grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gray-200 h-96 rounded-lg"></div>
          ))}
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
              onClick={fetchInputPlans}
              className="mt-2 text-sm font-medium text-red-600 hover:text-red-500"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Action Bar */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4 justify-between">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          {/* Search Box */}
          <div className="flex items-center bg-white border border-gray-300 rounded-lg px-4 py-2 min-w-[300px] focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Suche nach Ideen, Mechaniken, Monaten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-3 flex-1 border-none outline-none text-sm"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode("kanban")}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                viewMode === "kanban" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                viewMode === "list" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              Liste
            </button>
          </div>
        </div>

        <button
          onClick={handleCreate}
          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Neuer Input
        </button>
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries({
            DRAFT: { title: "Entwurf", color: "gray" },
            IN_PROGRESS: { title: "In Bearbeitung", color: "yellow" },
            REVIEW: { title: "Überprüfung", color: "blue" },
            APPROVED: { title: "Freigegeben", color: "green" },
          }).map(([status, config]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{config.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
                  {plansByStatus[status as keyof typeof plansByStatus].length}
                </span>
              </div>
              
              <div className="space-y-3">
                {plansByStatus[status as keyof typeof plansByStatus].map((plan) => (
                  <div
                    key={plan.id}
                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleEdit(plan)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                        {plan.mechanikThema}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(plan.id);
                        }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">{plan.idee}</p>
                    
                    <div className="flex flex-wrap gap-2">
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {plan.monat}
                      </span>
                      <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                        {plan.platzierung}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {plansByStatus[status as keyof typeof plansByStatus].length === 0 && (
                <div className="text-center py-8 text-gray-500 text-sm">
                  Keine Einträge
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && filteredPlans.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPlans.map((plan) => (
              <li key={plan.id}>
                <div className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-indigo-600">
                            {plan.mechanikThema}
                          </h4>
                          <p className="mt-1 text-sm text-gray-600">{plan.idee}</p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-xs text-gray-500 space-x-4">
                        <span>{plan.monat}</span>
                        <span>{plan.platzierung}</span>
                        <span>{plan.bezug}</span>
                      </div>
                    </div>
                    <div className="ml-4 flex items-center space-x-2">
                      <select
                        value={plan.status}
                        onChange={(e) => handleStatusChange(plan.id, e.target.value)}
                        className="text-sm border-gray-300 rounded-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <option value="DRAFT">Entwurf</option>
                        <option value="IN_PROGRESS">In Bearbeitung</option>
                        <option value="REVIEW">Überprüfung</option>
                        <option value="APPROVED">Freigegeben</option>
                      </select>
                      <button
                        onClick={() => handleEdit(plan)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Über der Tabelle, nach den Filter-Buttons */}
      {selectedPlans.size > 0 && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 px-4 py-3 rounded-md">
          <span className="text-sm text-blue-700">
            {selectedPlans.size} Einträge ausgewählt
          </span>
          <button
            onClick={handleBatchConvert}
            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            In Redak-Plan übertragen
          </button>
        </div>
      )}

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {searchTerm ? "Keine Ergebnisse gefunden" : "Keine Input-Pläne vorhanden"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Versuchen Sie einen anderen Suchbegriff" : "Erstellen Sie Ihren ersten Input-Plan."}
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ersten Input-Plan erstellen
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <InputPlanModal
          inputPlan={selectedPlan}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlan(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}