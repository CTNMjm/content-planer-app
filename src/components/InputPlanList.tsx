"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { InputPlanModal } from "./InputPlanModal";
import ConvertToRedakModal from "./ConvertToRedakModal";

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
  voe?: string;
  zusatzinfo?: string;
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
  const [locations, setLocations] = useState<any[]>([]); // NEU: Locations State
  const router = useRouter();

  useEffect(() => {
    fetchInputPlans();
    fetchLocations(); // NEU: Locations laden
  }, []);

  // NEU: Funktion zum Laden der Locations
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

  const handleConvertToRedak = (plan: InputPlan) => {
    if (plan.status !== 'APPROVED') {
      alert('Nur Pläne mit Status "Freigegeben" können in den Redaktionsplan übernommen werden.');
      return;
    }
    
    if (!plan.voe) {
      alert('Es muss ein Veröffentlichungsdatum gesetzt sein, bevor der Plan übernommen werden kann.');
      return;
    }
    
    // Zu Mehrfachauswahl hinzufügen
    const newSelected = new Set(selectedPlans);
    newSelected.add(plan.id);
    setSelectedPlans(newSelected);
    setShowConvertModal(true);
  };

  const updateStatusAfterConversion = async () => {
    try {
      // Alle konvertierten Pläne auf COMPLETED setzen
      const updatePromises = Array.from(selectedPlans).map(async (planId) => {
        const response = await fetch(`/api/inputplan/${planId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            status: 'COMPLETED'
          }),
        });
        
        if (!response.ok) {
          throw new Error(`Failed to update status for plan ${planId}`);
        }
      });
      
      await Promise.all(updatePromises);
      
      // Liste aktualisieren
      await fetchInputPlans();
      
    } catch (error) {
      console.error('Error updating input plan status:', error);
      alert('Fehler beim Aktualisieren des Status');
    }
  };

  const filteredPlans = inputPlans.filter(plan => 
    plan.idee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.mechanikThema.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.monat.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Update plansByStatus to use only the 5 valid statuses
  const plansByStatus = {
    DRAFT: filteredPlans.filter(p => p.status === "DRAFT"),
    IN_PROGRESS: filteredPlans.filter(p => p.status === "IN_PROGRESS"),
    REVIEW: filteredPlans.filter(p => p.status === "REVIEW"),
    APPROVED: filteredPlans.filter(p => p.status === "APPROVED"),
    COMPLETED: filteredPlans.filter(p => p.status === "COMPLETED"),
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

        <div className="flex gap-2">
          {/* Button für Redaktionsplan-Übertragung */}
          <button
            onClick={() => {
              // Alle Pläne mit Status APPROVED und VOE-Datum finden
              const eligiblePlans = filteredPlans.filter(plan => 
                plan.status === 'APPROVED' && plan.voe
              );
              
              if (eligiblePlans.length === 0) {
                alert('Keine Pläne mit Status "Freigegeben" und gesetztem VOE-Datum gefunden.');
                return;
              }
              
              // Alle berechtigten Pläne zur Auswahl hinzufügen
              setSelectedPlans(new Set(eligiblePlans.map(p => p.id)));
              setShowConvertModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            title="Alle freigegebenen Pläne mit VOE-Datum in Redaktionsplan übertragen"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
            → Redaktionsplan
          </button>

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
      </div>

      {/* Kanban View */}
      {viewMode === "kanban" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {Object.entries({
            DRAFT: { title: "Entwurf", color: "gray" },
            IN_PROGRESS: { title: "In Bearbeitung", color: "blue" },
            REVIEW: { title: "Überprüfung", color: "yellow" },
            APPROVED: { title: "Freigegeben", color: "green" },
            COMPLETED: { title: "Abgeschlossen", color: "purple" },
          }).map(([status, config]) => (
            <div key={status} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium text-gray-900">{config.title}</h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
                  {plansByStatus[status as keyof typeof plansByStatus].length}
                </span>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
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
                      {/* VOE-Datum immer anzeigen mit Label */}
                      <span className={`inline-flex px-2 py-1 text-xs rounded ${
                        plan.voe 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-500'
                      }`}>
                        VOE: {plan.voe 
                          ? new Date(plan.voe).toLocaleDateString('de-DE') 
                          : '[leer]'
                        }
                      </span>
                    </div>
                    
                    {/* Status-Dropdown */}
                    <div className="mt-3">
                      <select
                        value={plan.status}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(plan.id, e.target.value);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-xs border-gray-300 rounded-md"
                        disabled={plan.status === 'COMPLETED'}
                      >
                        <option value="DRAFT">Entwurf</option>
                        <option value="IN_PROGRESS">In Bearbeitung</option>
                        <option value="REVIEW">Überprüfung</option>
                        <option value="APPROVED">Freigegeben</option>
                        <option value="COMPLETED">Abgeschlossen</option>
                      </select>
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

      {/* Über der Tabelle, nach den Filter-Buttons */}
      {selectedPlans.size > 0 && (
        <div className="mb-4 flex items-center justify-between bg-blue-50 px-4 py-3 rounded-md">
          <span className="text-sm text-blue-700">
            {selectedPlans.size} Einträge ausgewählt
          </span>
          <button
            onClick={() => {
              // Prüfen ob alle ausgewählten Pläne die Bedingungen erfüllen
              const selectedPlansArray = Array.from(selectedPlans);
              const eligiblePlans = selectedPlansArray.filter(id => {
                const plan = filteredPlans.find(p => p.id === id);
                return plan && plan.status === 'APPROVED' && plan.voe;
              });
              
              if (eligiblePlans.length === 0) {
                alert('Keine der ausgewählten Pläne erfüllt die Bedingungen für die Übernahme (Status: Freigegeben, VOE-Datum gesetzt).');
                return;
              }
              
              if (eligiblePlans.length < selectedPlansArray.length) {
                const proceed = confirm(`Nur ${eligiblePlans.length} von ${selectedPlansArray.length} ausgewählten Plänen erfüllen die Bedingungen. Möchten Sie fortfahren?`);
                if (!proceed) return;
                
                // Nur die berechtigten Pläne auswählen
                setSelectedPlans(new Set(eligiblePlans));
              }
              
              setShowConvertModal(true);
            }}
            className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
          >
            Ausgewählte in Redaktionsplan ({selectedPlans.size})
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
    isOpen={isModalOpen}  // NEU: isOpen prop hinzufügen
    inputPlan={selectedPlan}
    locations={locations}
    onClose={() => {
      setIsModalOpen(false);
      setSelectedPlan(null);
    }}
    onSave={handleSave}
  />
)}

      {/* Debug output */}
      {showConvertModal && (
        <>
          {console.log('ConvertToRedakModal type:', typeof ConvertToRedakModal)}
          {console.log('ConvertToRedakModal:', ConvertToRedakModal)}
          <ConvertToRedakModal
            isOpen={showConvertModal}
            onClose={() => {
              setShowConvertModal(false);
              setSelectedPlans(new Set());
            }}
            inputPlans={filteredPlans}
            selectedIds={selectedPlans}
            onSuccess={async () => {
              setShowConvertModal(false);
              await updateStatusAfterConversion();
              setSelectedPlans(new Set());
              alert("Erfolgreich in Redaktionsplan übertragen!");
            }}
          />
        </>
      )}

      {/* Tabelle mit den Input-Plänen */}
      {viewMode === "list" && filteredPlans.length > 0 && (
        <div className="mt-6">
          <div className="overflow-hidden border-b border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        onChange={toggleSelectAll}
                        checked={selectedPlans.size === filteredPlans.length}
                        className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                      />
                      <span className="ml-2">Auswählen</span>
                    </div>
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Monat
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Mechanik/Idee
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Platzierung
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Bezug
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Aktionen
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={selectedPlans.has(plan.id)}
                          onChange={() => toggleSelection(plan.id)}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.monat}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex flex-col">
                        <span className="font-medium text-gray-900">{plan.mechanikThema}</span>
                        <span className="text-gray-500 text-xs">{plan.idee}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.platzierung}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {plan.bezug}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${plan.status === 'DRAFT' ? 'gray' : plan.status === 'IN_PROGRESS' ? 'blue' : plan.status === 'REVIEW' ? 'yellow' : plan.status === 'APPROVED' ? 'green' : 'purple'}-100 text-${plan.status === 'DRAFT' ? 'gray' : plan.status === 'IN_PROGRESS' ? 'blue' : plan.status === 'REVIEW' ? 'yellow' : plan.status === 'APPROVED' ? 'green' : 'purple'}-800`}>
                        {plan.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleConvertToRedak(plan)}
                        className={`${
                          plan.status === 'APPROVED' && plan.voe
                            ? 'text-orange-600 hover:text-orange-900 cursor-pointer' 
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={
                          plan.status === 'APPROVED' && plan.voe
                            ? "In Redaktionsplan übernehmen" 
                            : plan.status === 'COMPLETED'
                            ? "Bereits übernommen"
                            : !plan.voe
                            ? "Veröffentlichungsdatum muss gesetzt sein"
                            : "Nur Pläne mit Status 'Freigegeben' können übernommen werden"
                        }
                        disabled={plan.status !== 'APPROVED' || !plan.voe}
                      >
                        → Redak
                      </button>
                      <button
                        onClick={() => handleEdit(plan)}
                        className={`${
                          plan.status !== 'COMPLETED'
                            ? 'text-indigo-600 hover:text-indigo-900 cursor-pointer'
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        disabled={plan.status === 'COMPLETED'}
                      >
                        Bearbeiten
                      </button>
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        Löschen
                      </button>
                    </div>
                  </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}