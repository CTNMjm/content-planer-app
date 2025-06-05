"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ContentPlanModal from "./ContentPlanModal";
import ConvertToInputModal from "./ConvertToInputModal";

interface ContentPlan {
  id: string;
  monat: string;
  bezug: string;
  themaGeschaeft: string;
  themaRedaktion: string;
  platzierung: string;
  idee: string;
  voe: string;
  status: string;
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

export default function ContentPlanList() {
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ContentPlan | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "card">("list");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedConvertPlan, setSelectedConvertPlan] = useState<ContentPlan | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchContentPlans();
  }, []);

  const fetchContentPlans = async () => {
    try {
      const response = await fetch("/api/contentplan");
      
      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Fehler beim Laden der Daten");
      }
      
      const data = await response.json();
      setContentPlans(data);
    } catch (error) {
      console.error("Error fetching content plans:", error);
      setError("Fehler beim Laden der Content-Pläne");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: ContentPlan) => {
    setSelectedPlan(plan);
    setIsModalOpen(true);
  };

  const handleCreate = () => {
    setSelectedPlan(null);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Content-Plan wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/contentplan/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen");
      }

      await fetchContentPlans();
      showToast("Content-Plan erfolgreich gelöscht");
    } catch (error) {
      console.error("Error deleting content plan:", error);
      showToast("Fehler beim Löschen des Content-Plans", "error");
    }
  };

  const handleSave = async () => {
    await fetchContentPlans();
    setIsModalOpen(false);
    setSelectedPlan(null);
  };

  const handleMoveToInput = async (plan: ContentPlan) => {
    try {
      const response = await fetch("/api/inputplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          monat: plan.monat,
          bezug: plan.bezug,
          mechanikThema: plan.themaGeschaeft,
          idee: plan.idee,
          platzierung: plan.platzierung,
          status: "DRAFT",
          locationId: plan.location.id,
          contentPlanId: plan.id,
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Verschieben");
      }

      showToast("Erfolgreich zu InputPlan verschoben");
      await fetchContentPlans();
    } catch (error) {
      console.error("Error moving to input plan:", error);
      showToast("Fehler beim Verschieben", "error");
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/contentplan/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ids: selectedItems.length > 0 ? selectedItems : contentPlans.map(p => p.id),
        }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Export");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `content-plan-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      showToast("Export erfolgreich");
    } catch (error) {
      console.error("Error exporting:", error);
      showToast("Fehler beim Export", "error");
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/contentplan/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Fehler beim Import");
      }

      showToast("Import erfolgreich");
      await fetchContentPlans();
    } catch (error) {
      console.error("Error importing:", error);
      showToast("Fehler beim Import", "error");
    }
  };

  const toggleSelectItem = (id: string) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredPlans.map(p => p.id));
    }
    setSelectAll(!selectAll);
  };

  const showToast = (message: string, type: "success" | "error" = "success") => {
    // Implementierung würde ein Toast-System erfordern
    console.log(`${type}: ${message}`);
  };

  const filteredPlans = contentPlans.filter(plan => 
    plan.idee.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.themaGeschaeft.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.monat.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
              onClick={fetchContentPlans}
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
              placeholder="Suche nach Ideen, Themen, Monaten..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="ml-3 flex-1 border-none outline-none text-sm"
            />
          </div>

          {/* View Toggle */}
          <div className="flex bg-white border border-gray-300 rounded-lg overflow-hidden">
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
            <button
              onClick={() => setViewMode("card")}
              className={`px-4 py-2 flex items-center gap-2 text-sm font-medium transition-colors ${
                viewMode === "card" 
                  ? "bg-indigo-600 text-white" 
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 01-.88-3.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Kacheln
            </button>
          </div>
        </div>

        <div className="flex gap-3">
          {/* Import Button */}
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer">
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Import
            <input
              type="file"
              accept=".csv"
              onChange={handleImport}
              className="sr-only"
            />
          </label>

          {/* Export Button */}
          <button
            onClick={handleExport}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export
          </button>

          {/* New Content Button */}
          <button
            onClick={handleCreate}
            className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neue Idee
          </button>
        </div>
      </div>

      {/* List View */}
      {viewMode === "list" && filteredPlans.length > 0 && (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="min-w-full">
            {/* List Header */}
            <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
              <div className="flex items-center gap-4 text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="w-10">
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={toggleSelectAll}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                </div>
                <div className="w-24">Monat</div>
                <div className="w-32">Bezug</div>
                <div className="flex-1">Idee</div>
                <div className="w-32">Platzierung</div>
                <div className="w-24">Status</div>
                <div className="w-32 text-right">Aktionen</div>
              </div>
            </div>

            {/* List Items */}
            <ul className="divide-y divide-gray-200">
              {filteredPlans.map((plan) => (
                <li
                  key={plan.id}
                  className={`px-6 py-4 hover:bg-gray-50 ${
                    selectedItems.includes(plan.id) ? "bg-indigo-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(plan.id)}
                        onChange={() => toggleSelectItem(plan.id)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                    </div>
                    <div className="w-24 text-sm text-gray-900">{plan.monat}</div>
                    <div className="w-32 text-sm text-gray-900">{plan.bezug}</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-indigo-600 truncate">{plan.idee}</p>
                      <p className="text-sm text-gray-500 truncate">{plan.themaGeschaeft}</p>
                    </div>
                    <div className="w-32 text-sm text-gray-900">{plan.platzierung}</div>
                    <div className="w-24">
                      <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                        plan.status === 'PUBLISHED' 
                          ? 'bg-green-100 text-green-800' 
                          : plan.status === 'DRAFT' 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {plan.status === 'PUBLISHED' ? 'Bereit' : plan.status === 'DRAFT' ? 'Entwurf' : plan.status}
                      </span>
                    </div>
                    <div className="w-32 flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-gray-100 rounded"
                        title="Bearbeiten"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      
                      {/* Neuer Button für Übernahme */}
                      <button
                        onClick={() => handleOpenConvertModal(plan)}
                        className="text-green-600 hover:text-green-900 p-2 hover:bg-gray-100 rounded"
                        title="In Input-Plan überführen"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="text-red-600 hover:text-red-900 p-2 hover:bg-gray-100 rounded"
                        title="Löschen"
                      >
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Card View */}
      {viewMode === "card" && filteredPlans.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPlans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border-2 ${
                selectedItems.includes(plan.id) 
                  ? "border-indigo-500 bg-indigo-50" 
                  : "border-transparent"
              }`}
              onClick={() => handleEdit(plan)}
            >
              <div className="flex justify-between items-start mb-4">
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  plan.status === 'PUBLISHED' 
                    ? 'bg-green-100 text-green-800' 
                    : plan.status === 'DRAFT' 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {plan.status === 'PUBLISHED' ? 'Bereit' : plan.status === 'DRAFT' ? 'Entwurf' : plan.status}
                </span>
                <input
                  type="checkbox"
                  checked={selectedItems.includes(plan.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    toggleSelectItem(plan.id);
                  }}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
              </div>
              
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Monat</p>
                  <p className="text-sm text-gray-900">{plan.monat}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Idee</p>
                  <p className="text-sm text-gray-900 line-clamp-2">{plan.idee}</p>
                </div>
                
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Mechanik/Thema</p>
                  <p className="text-sm text-gray-900">{plan.themaGeschaeft}</p>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                    {plan.platzierung}
                  </span>
                  <span className="inline-flex px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                    {plan.bezug}
                  </span>
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-4 pt-4 border-t">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveToInput(plan);
                  }}
                  className="text-green-600 hover:text-green-900 p-2 hover:bg-gray-100 rounded"
                  title="Zu InputPlan"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(plan.id);
                  }}
                  className="text-red-600 hover:text-red-900 p-2 hover:bg-gray-100 rounded"
                  title="Löschen"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredPlans.length === 0 && (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              {searchTerm ? "Keine Ergebnisse gefunden" : "Keine Content-Pläne vorhanden"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm ? "Versuchen Sie einen anderen Suchbegriff" : "Erstellen Sie Ihren ersten Content-Plan."}
            </p>
            <div className="mt-6">
              <button
                onClick={handleCreate}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {searchTerm ? "Neuen Content-Plan erstellen" : "Ersten Content-Plan erstellen"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={handleCreate}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 hover:scale-110 transition-all duration-200 flex items-center justify-center z-10"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {isModalOpen && (
        <ContentPlanModal
          contentPlan={selectedPlan}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedPlan(null);
          }}
          onSave={handleSave}
        />
      )}

      {showConvertModal && (
        <ConvertToInputModal
          contentPlan={selectedConvertPlan}
          isOpen={showConvertModal}
          onClose={() => {
            setShowConvertModal(false);
            setSelectedConvertPlan(null);
          }}
          onConfirm={handleConvertToInput}
        />
      )}
    </div>
  );
}