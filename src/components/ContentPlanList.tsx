"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ContentPlanModal } from "@/components/ContentPlanModal";
import ConvertToInputModal from "@/components/ConvertToInputModal";
import dynamic from 'next/dynamic';
import ContentPlanExportDialog from "./ContentPlanExportDialog";
import ContentPlanImportDialog from "./ContentPlanImportDialog";
import Link from "next/link";

// Dynamic import für ContentPlanHistory (um Circular Dependencies zu vermeiden)
const ContentPlanHistory = dynamic(
  () => import('@/components/ContentPlanHistory').then(mod => mod.ContentPlanHistory),
  { 
    loading: () => <div>Lade Historie...</div>,
    ssr: false 
  }
);

interface ContentPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null;  // <-- null hinzufügen!
  mechanikThema: string;
  idee: string;
  platzierung: string;
  status: "DRAFT" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
  location: {
    id: string;
    name: string;
  };
  locationId: string;
  createdAt: string;
  updatedAt: string;
}

// NEU: Erweitere ContentPlan um locationId
interface ContentPlanWithLocationId extends ContentPlan {
  locationId: string;
}

export default function ContentPlanList() {
  const router = useRouter();
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [filteredPlans, setFilteredPlans] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<ContentPlan | null>(null);        
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<ContentPlanWithLocationId | null>(null); // <-- Typ ändern!
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = viewMode === 'grid' ? 9 : 10; // 9 für Kacheln, 10 für Tabelle
  // Historie States
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [selectedPlanForHistory, setSelectedPlanForHistory] = useState<ContentPlan | null>(null);
  // Filter States
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("monat");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  // Export/Import Dialog States
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    fetchContentPlans();
    fetchLocations();
  }, []);

  useEffect(() => {
    let filtered = [...contentPlans];

    // NEU: Abgeschlossene Pläne ausfiltern
    filtered = filtered.filter(plan => plan.status !== 'COMPLETED');

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

    // Status-Filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((plan) => plan.status === statusFilter);
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
          compareValue = 0;
      }
      
      return sortOrder === "asc" ? compareValue : -compareValue;
    });

    setFilteredPlans(filtered);
  }, [searchTerm, contentPlans, statusFilter, locationFilter, sortBy, sortOrder]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredPlans.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentPlans = filteredPlans.slice(startIndex, endIndex);

  // Reset to page 1 when filter or view mode changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, viewMode, statusFilter, locationFilter, sortBy, sortOrder]);

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

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Standorte");
      }
      const data = await response.json();
      setLocations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"); 
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
    if (plan.status !== 'APPROVED') {
      alert('Nur Pläne mit Status "Freigegeben" können in den Input-Plan übernommen werden.');
      return;
    }
    setSelectedPlan({
      ...plan,
      locationId: plan.location.id, // <--- locationId ergänzen!
    });
    setShowConvertModal(true);
  };

  const handleConvertSuccess = async () => {
    if (!selectedPlan) return;

    try {
      // Status auf COMPLETED setzen
      const response = await fetch(`/api/content-plans/${selectedPlan.id}`, {      
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...selectedPlan,
          status: 'COMPLETED'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update status');
      }

      // Liste aktualisieren
      await fetchContentPlans();

      setShowConvertModal(false);
      setSelectedPlan(null);
    } catch (error) {
      console.error('Error updating content plan status:', error);
      alert('Fehler beim Aktualisieren des Status');
    }
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { text: "Entwurf", class: "bg-gray-100 text-gray-800" },
      IN_PROGRESS: { text: "In Bearbeitung", class: "bg-yellow-100 text-yellow-800" },
      REVIEW: { text: "Überprüfung", class: "bg-orange-100 text-orange-800" },     
      APPROVED: { text: "Freigegeben", class: "bg-green-100 text-green-800" },     
      COMPLETED: { text: "Abgeschlossen", class: "bg-blue-100 text-blue-800" },    
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.class}`}>
        {config.text}
      </span>
    );
  };

  const handleShowHistory = (plan: ContentPlan) => {
    console.log("Historie Modal öffnen für Plan:", plan.id);
    setSelectedPlanForHistory(plan);
    setHistoryModalOpen(true);
  };

  const Pagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="flex items-center justify-between px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
        <div className="flex justify-between flex-1 sm:hidden">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Zurück
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center px-4 py-2 ml-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Weiter
          </button>
        </div>
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
                <span className="sr-only">Zurück</span>
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              {[...Array(totalPages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => setCurrentPage(index + 1)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    currentPage === index + 1
                      ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                      : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                  } border`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-2 text-gray-400 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="sr-only">Weiter</span>
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
    return <div className="p-8">Lade Content-Pläne...</div>;
  }

  if (error) {
    return <div className="p-8 text-red-600">Fehler: {error}</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Content-Pläne</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setImportDialogOpen(true)}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Importieren
          </button>
          <button
            onClick={() => setExportDialogOpen(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded hover:bg-orange-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
            </svg>
            Exportieren
          </button>
          
          {/* NEU: Abgeschlossen Button */}
          <Link
            href="/contentplan/abgeschlossen"
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Abgeschlossen
          </Link>
          
          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Neuer Content-Plan
          </button>
        </div>
      </div>

      {/* Such- und Filterleiste */}
      <div className="mb-6 space-y-4">
        {/* Erste Zeile: Suche und Ansicht */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Suchfeld */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Suchen in Bezug, Mechanik/Thema, Idee, Monat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Ansicht-Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode("list")}
              className={`px-4 py-2 rounded-md border ${viewMode === "list" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
              title="Listenansicht"
            >
              Listenansicht
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`px-4 py-2 rounded-md border ${viewMode === "grid" ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}
              title="Kanbanansicht"
            >
              Kanbanansicht
            </button>
          </div>
        </div>

        {/* Zweite Zeile: Filter und Sortierung */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Status-Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Status</option>
            <option value="DRAFT">Entwurf</option>
            <option value="IN_PROGRESS">In Bearbeitung</option>
            <option value="APPROVED">Freigegeben</option>
            {/* COMPLETED entfernt, da diese jetzt auf separater Seite sind */}
          </select>

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
            <option value="monat">Sortieren nach Monat</option>
            <option value="bezug">Sortieren nach Bezug</option>
            <option value="status">Sortieren nach Status</option>
            <option value="location">Sortieren nach Standort</option>
            <option value="updatedAt">Sortieren nach Änderungsdatum</option>
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

        {/* Aktive Filter anzeigen */}
        {(searchTerm || statusFilter !== "all" || locationFilter !== "all") && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600">Aktive Filter:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                Suche: {searchTerm}
                <button onClick={() => setSearchTerm("")} className="hover:text-blue-900">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {statusFilter !== "all" && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                Status: {getStatusBadge(statusFilter).props.children}
                <button onClick={() => setStatusFilter("all")} className="hover:text-green-900">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            {locationFilter !== "all" && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full flex items-center gap-1">
                Standort: {contentPlans.find(p => p.location.id === locationFilter)?.location.name}
                <button onClick={() => setLocationFilter("all")} className="hover:text-purple-900">
                  <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            )}
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setLocationFilter("all");
              }}
              className="text-gray-500 hover:text-gray-700 underline"
            >
              Alle zurücksetzen
            </button>
          </div>
        )}
      </div>

      {filteredPlans.length === 0 ? (
        <p>{searchTerm ? "Keine Content-Pläne gefunden" : "Keine Content-Pläne vorhanden."}</p>
      ) : viewMode === "list" ? (
        <>
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
                {currentPlans.map((plan) => (
                  <tr key={plan.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{plan.monat}</td>    
                    <td className="px-6 py-4 whitespace-nowrap">{plan.bezug}</td>    
                    <td className="px-6 py-4 whitespace-nowrap">{plan.mechanikThema}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{plan.location.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(plan.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => handleShowHistory(plan)}
                        className="mr-3 text-blue-600 hover:text-blue-900"
                        title="Historie anzeigen"
                      >
                        Historie
                      </button>
                      <button
                        onClick={() => handleConvert(plan)}
                        className={`mr-3 ${
                          plan.status === 'APPROVED'
                            ? 'text-green-600 hover:text-green-900 cursor-pointer'   
                            : 'text-gray-400 cursor-not-allowed'
                        }`}
                        title={
                          plan.status === 'APPROVED'
                            ? "In Input-Plan übernehmen"
                            : plan.status === 'COMPLETED'
                            ? "Bereits übernommen"
                            : "Nur Pläne mit Status 'Freigegeben' können übernommen werden"
                        }
                        disabled={plan.status !== 'APPROVED'}
                      >
                        → Input
                      </button>
                      <button
                        onClick={() => handleEdit(plan)}
                        className={`mr-3 ${
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination />
        </>
      ) : (
        /* Kachelansicht */
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {currentPlans.map((plan) => (
              <div key={plan.id} className="bg-white overflow-hidden shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">{plan.monat}</h3>
                    {getStatusBadge(plan.status)}
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
                      onClick={() => handleShowHistory(plan)}
                      className="text-blue-600 hover:text-blue-900 font-medium"
                    >
                      Historie
                    </button>
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
          <Pagination />
        </>
      )}

      {showModal && (
        <ContentPlanModal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false);
            setEditingPlan(null);
          }}
          contentPlan={editingPlan}
          onSave={handleSave}
          locations={locations} // <-- hier!
        />
      )}

      {showConvertModal && selectedPlan && (
        <ConvertToInputModal
          isOpen={true}
          onClose={() => {
            setShowConvertModal(false);
            setSelectedPlan(null);
          }}
          contentPlan={{
            ...selectedPlan,
            locationId: selectedPlan.location.id  // locationId explizit setzen
          }}
          onSuccess={handleConvertSuccess}
        />
      )}

      {/* History Modal */}
      {historyModalOpen && selectedPlanForHistory && (
        <ContentPlanHistory
          isOpen={historyModalOpen}
          onClose={() => {
            setHistoryModalOpen(false);
            setSelectedPlanForHistory(null);
          }}
          contentPlanId={selectedPlanForHistory.id}
          contentPlanTitle={`${selectedPlanForHistory.monat} - ${selectedPlanForHistory.bezug}`}
        />
      )}

      {/* Export/Import Dialogs */}
      <ContentPlanExportDialog
        isOpen={exportDialogOpen}
        onClose={() => setExportDialogOpen(false)}
        locationId={locationFilter !== "all" ? locationFilter : undefined}
      />

      <ContentPlanImportDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
        locationId={locationFilter !== "all" ? locationFilter : undefined}
      />
    </div>
  );
}