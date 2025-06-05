"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface Location {
  id: string;
  name: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function LocationsPage() {
  const router = useRouter();
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [newLocationName, setNewLocationName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/admin/locations", {
        credentials: "include", // Wichtig für Session-Cookies
      });
      
      console.log("Fetch locations response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched locations:", data);
        setLocations(data);
      } else if (response.status === 401) {
        console.log("Unauthorized - redirecting to dashboard");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocationName.trim()) return;

    try {
      console.log("Creating location:", newLocationName);
      
      const response = await fetch("/api/admin/locations", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ name: newLocationName }),
      });

      console.log("Create response status:", response.status);
      const data = await response.json();
      console.log("Create response data:", data);

      if (response.ok) {
        setNewLocationName("");
        fetchLocations();
      } else {
        if (response.status === 401) {
          alert("Sie sind nicht eingeloggt.");
          router.push("/login");
        } else if (response.status === 403) {
          alert("Sie benötigen Admin-Rechte.");
          router.push("/dashboard");
        } else {
          alert(data.error || "Fehler beim Erstellen");
        }
      }
    } catch (error) {
      console.error("Error creating location:", error);
      alert("Netzwerkfehler beim Erstellen");
    }
  };

  const handleUpdate = async (id: string) => {
    if (!editingName.trim()) return;

    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editingName }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditingName("");
        fetchLocations();
      }
    } catch (error) {
      console.error("Error updating location:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Möchten Sie diesen Standort wirklich löschen?")) return;

    try {
      const response = await fetch(`/api/locations/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchLocations();
      } else {
        const data = await response.json();
        alert(data.error || "Fehler beim Löschen");
      }
    } catch (error) {
      console.error("Error deleting location:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Standortverwaltung</h1>
          <p className="mt-2 text-sm text-gray-600">
            Verwalten Sie hier die verfügbaren Standorte für Content- und Input-Pläne.
          </p>
        </div>

        {/* Neuer Standort */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Neuen Standort hinzufügen</h2>
          <form onSubmit={handleCreate} className="flex gap-4">
            <input
              type="text"
              value={newLocationName}
              onChange={(e) => setNewLocationName(e.target.value)}
              placeholder="Standortname eingeben..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Hinzufügen
            </button>
          </form>
        </div>

        {/* Standortliste */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Vorhandene Standorte</h2>
          </div>
          
          {locations.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Keine Standorte vorhanden. Fügen Sie oben einen neuen Standort hinzu.
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {locations.map((location) => (
                <div key={location.id} className="p-6 flex items-center justify-between">
                  {editingId === location.id ? (
                    <div className="flex-1 flex items-center gap-4">
                      <input
                        type="text"
                        value={editingName}
                        onChange={(e) => setEditingName(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleUpdate(location.id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  ) : (
                    <>
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{location.name}</h3>
                        {location.status && (
                          <p className="text-sm text-gray-500">
                            Status: {location.status}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setEditingId(location.id);
                            setEditingName(location.name);
                          }}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Bearbeiten"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(location.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Löschen"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Zurück zum Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}