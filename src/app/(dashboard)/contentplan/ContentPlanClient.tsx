"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ContentPlanModal from "@/components/ContentPlanModal";
import ConvertToInputModal from "@/components/ConvertToInputModal";

interface ContentPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  status: "DRAFT" | "READY" | "IN_PROGRESS" | "COMPLETED";
  location: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
}

export default function ContentPlanClient() {
  const router = useRouter();
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ContentPlan | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ContentPlan | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  useEffect(() => {
    fetchContentPlans();
  }, []);

  useEffect(() => {
    // Filter plans based on search term
    const filtered = contentPlans.filter((plan) =>
      plan.bezug.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.mechanikThema.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.idee.toLowerCase().includes(searchTerm.toLowerCase()) ||
      plan.monat.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPlans(filtered);
  }, [searchTerm, contentPlans]);

  const fetchContentPlans = async () => {
    try {
      const response = await fetch("/api/content-plans");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Content-Pläne");
      }
      const data = await response.json();
      setContentPlans(data);
      setFilteredPlans(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const handleEdit = (plan: ContentPlan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Content-Plan wirklich löschen?")) {
      return;
    }

    try {
      const response = await fetch(`/api/content-plans/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Fehler beim Löschen des Content-Plans");
      }

      await fetchContentPlans();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Fehler beim Löschen");
    }
  };

  const handleSave = async (data: any) => {
    try {
      const url = editingPlan 
        ? `/api/content-plans/${editingPlan.id}`
        : '/api/content-plans';
      
      const method = editingPlan ? 'PUT' : 'POST';

      console.log("Saving to:", url, "Method:", method, "Data:", data);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get("content-type");
      
      if (!response.ok) {
        let errorMessage = 'Fehler beim Speichern';
        
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
        } else {
          const errorText = await response.text();
          console.error("Error response:", errorText);
        }
        
        throw new Error(errorMessage);
      }

      // Erfolgreich gespeichert
      await fetchContentPlans();
      setShowModal(false);
      setEditingPlan(null);
      
    } catch (error) {
      console.error('Fehler:', error);
      alert(error instanceof Error ? error.message : 'Fehler beim Speichern');
    }
  };

  const handleConvert = (plan: ContentPlan) => {
    setSelectedPlan(plan);
    setShowConvertModal(true);
  };

  const handleConvertSuccess = () => {
    setShowConvertModal(false);
    setSelectedPlan(null);
    router.push("/inputplan");
  };

  const handleExport = async () => {
    try {
      const response = await fetch("/api/content-plans/export");
      if (!response.ok) throw new Error("Export fehlgeschlagen");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `content-plans-${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      alert("Fehler beim Export: " + (err instanceof Error ? err.message : "Unbekannter Fehler"));
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/content-plans/import", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) throw new Error("Import fehlgeschlagen");

      alert("Import erfolgreich!");
      fetchContentPlans();
    } catch (err) {
      alert("Fehler beim Import: " + (err instanceof Error ? err.message : "Unbekannter Fehler"));
    }
  };

  if (loading) {
    return <div className="p-8">Lade Content-Pläne...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Fehler: {error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content-Pläne</h1>
        <button
          onClick={handleCreate}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Neuer Content-Plan
        </button>
      </div>

      {/* Such- und Filterleiste */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        {/* Suchfeld */}
        <div className="flex-1">
          <input
            type="text"
            placeholder="Suchen..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Ansicht-Toggle */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setViewMode("list")}
            className={`p-2 rounded-md ${viewMode === "list" ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            title="Listenansicht"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={`p-2 rounded-md ${viewMode === "grid" ? "bg-gray-200 text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
            title="Kachelansicht"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
            </svg>
          </button>
        </div>

        {/* Export/Import Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleExport}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Export
          </button>
          <label className="px-3 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer">
            Import
            <input type="file" className="sr-only" accept=".csv" onChange={handleImport} />
          </label>
        </div>
      </div>

      {filteredPlans.length === 0 ? (
        <p>{searchTerm ? "Keine Content-Pläne gefunden" : "Keine Content-Pläne vorhanden."}</p>
      ) : viewMode === "list" ? (
        <div className="overflow-x-auto">
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Aktionen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPlans.map((plan) => (
                <tr key={plan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.monat}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.bezug}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.mechanikThema}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.location.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${plan.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                        plan.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                        plan.status === 'READY' ? 'bg-blue-100 text-blue-800' : 
                        'bg-gray-100 text-gray-800'}`}>
                      {plan.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleConvert(plan)}
                      className="text-green-600 hover:text-green-900 mr-3"
                      title="In Input-Plan übernehmen"
                    >
                      → Input
                    </button>
                    <button
                      onClick={() => router.push(`/contentplan/${plan.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Anzeigen
                    </button>
                    <button
                      onClick={() => handleEdit(plan)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                    >
                      Bearbeiten
                    </button>
                    <button
                      onClick={() => handleDelete(plan.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Löschen
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Kachelansicht */
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredPlans.map((plan) => (
            <div key={plan.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{plan.monat}</h3>
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${plan.status === 'COMPLETED' ? 'bg-green-100 text-green-800' : 
                      plan.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' : 
                      plan.status === 'READY' ? 'bg-blue-100 text-blue-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {plan.status}
                  </span>
                </div>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Bezug</dt>
                    <dd className="text-sm text-gray-900">{plan.bezug}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Mechanik/Thema</dt>
                    <dd className="text-sm text-gray-900">{plan.mechanikThema}</dd>
                  </div>
                  <div>
                    <dt className="text-sm font-medium text-gray-500">Standort</dt>
                    <dd className="text-sm text-gray-900">{plan.location.name}</dd>
                  </div>
                </dl>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm space-x-3">
                  <button
                    onClick={() => handleConvert(plan)}
                    className="text-green-600 hover:text-green-900 font-medium"
                  >
                    → Input
                  </button>
                  <button
                    onClick={() => handleEdit(plan)}
                    className="text-indigo-600 hover:text-indigo-900 font-medium"
                  >
                    Bearbeiten
                  </button>
                  <button
                    onClick={() => handleDelete(plan.id)}
                    className="text-red-600 hover:text-red-900 font-medium"
                  >
                    Löschen
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <ContentPlanModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPlan(null);
          }}
          onSave={handleSave}
          contentPlan={editingPlan}
        />
      )}

      {showConvertModal && selectedPlan && (
        <ConvertToInputModal
          isOpen={showConvertModal}
          onClose={() => {
            setShowConvertModal(false);
            setSelectedPlan(null);
          }}
          contentPlan={selectedPlan}
          onSuccess={handleConvertSuccess}
        />
      )}
    </div>
  );
}