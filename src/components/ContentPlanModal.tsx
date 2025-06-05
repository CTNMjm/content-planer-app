// filepath: \\wsl.localhost\Ubuntu-24.04\home\johann\content-planer-app\src\components\ContentPlanModal.tsx
"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface ContentPlanFormData {
  monat: string;
  bezug: string;
  mehrwert: string;
  mechanikThema: string;
  platzierung: string;
  idee: string;
  status: string;
  locationId: string;
}

interface ContentPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string;
  mechanikThema: string;
  platzierung: string;
  idee: string;
  status: string;
  location: {
    id: string;
    name: string;
  };
}

interface Location {
  id: string;
  name: string;
}

interface ContentPlanModalProps {
  isOpen: boolean;
  contentPlan: ContentPlan | null;
  onClose: () => void;
  onSave: (data: ContentPlanFormData) => void;
}

export function ContentPlanModal({
  isOpen,
  contentPlan,
  onClose,
  onSave,
}: ContentPlanModalProps) {
  const [formData, setFormData] = useState<ContentPlanFormData>({
    monat: "",
    bezug: "",
    mehrwert: "",
    mechanikThema: "",
    platzierung: "",
    idee: "",
    status: "DRAFT",
    locationId: "",
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (contentPlan && locations.length > 0) {
      setFormData({
        monat: contentPlan.monat || "",
        bezug: contentPlan.bezug || "",
        mehrwert: contentPlan.mehrwert || "",
        mechanikThema: contentPlan.mechanikThema || "",
        platzierung: contentPlan.platzierung || "",
        idee: contentPlan.idee || "",
        status: contentPlan.status || "DRAFT",
        locationId: contentPlan.location?.id || locations[0]?.id || "",
      });
    } else if (!contentPlan && locations.length > 0) {
      setFormData(prev => ({
        ...prev,
        locationId: locations[0].id,
      }));
    }
  }, [contentPlan, locations]);

  const fetchLocations = async () => {
    setLocationsLoading(true);
    try {
      const response = await fetch("/api/locations");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setLocations(data);
        
        if (!contentPlan && data.length > 0) {
          setFormData(prev => ({ ...prev, locationId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
      setLocations([]);
    } finally {
      setLocationsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Validierung
      if (!formData.monat || !formData.bezug || !formData.mechanikThema || !formData.idee || !formData.platzierung || !formData.locationId) {
        alert('Bitte füllen Sie alle Pflichtfelder aus');
        return;
      }

      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern des Content-Plans');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-8 py-6">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                    {contentPlan ? "Content-Plan bearbeiten" : "Neuer Content-Plan"}
                  </Dialog.Title>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                  <div className="space-y-6">
                    {/* Basis Information */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Monat *
                        </label>
                        <select
                          name="monat"
                          value={formData.monat}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Bitte wählen</option>
                          {["Januar", "Februar", "März", "April", "Mai", "Juni", 
                            "Juli", "August", "September", "Oktober", "November", "Dezember"].map(month => (
                            <option key={month} value={month}>{month}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Bezug *
                        </label>
                        <select
                          name="bezug"
                          value={formData.bezug}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Bitte wählen</option>
                          <option value="Vielfalt">Vielfalt</option>
                          <option value="Saisonal">Saisonal</option>
                          <option value="Event">Event</option>
                          <option value="Trend">Trend</option>
                        </select>
                      </div>
                    </div>

                    {/* Mechanik/Thema und Mehrwert */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mechanik/Thema *
                        </label>
                        <input
                          type="text"
                          name="mechanikThema"
                          value={formData.mechanikThema}
                          onChange={handleChange}
                          required
                          placeholder="z.B. Rabattaktion, Gewinnspiel"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Mehrwert
                        </label>
                        <input
                          type="text"
                          name="mehrwert"
                          value={formData.mehrwert}
                          onChange={handleChange}
                          placeholder="z.B. 20% Rabatt, Kostenlose Lieferung"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Platzierung und Status */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Platzierung *
                        </label>
                        <select
                          name="platzierung"
                          value={formData.platzierung}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Bitte wählen</option>
                          <option value="FB + IG">FB + IG</option>
                          <option value="Instagram">Instagram</option>
                          <option value="Facebook">Facebook</option>
                          <option value="TikTok">TikTok</option>
                          <option value="Blog">Blog</option>
                          <option value="TikTok + IG">TikTok + IG</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Status
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="DRAFT">Entwurf</option>
                          <option value="PUBLISHED">Bereit</option>
                          <option value="IN_PROGRESS">In Arbeit</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Location *
                        </label>
                        <select
                          name="locationId"
                          value={formData.locationId}
                          onChange={handleChange}
                          required
                          disabled={locationsLoading}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-100"
                        >
                          <option value="">
                            {locationsLoading ? "Lade..." : "Bitte wählen"}
                          </option>
                          {locations.map(location => (
                            <option key={location.id} value={location.id}>
                              {location.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Idee */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Idee *
                      </label>
                      <textarea
                        name="idee"
                        value={formData.idee}
                        onChange={handleChange}
                        required
                        rows={4}
                        placeholder="Beschreiben Sie Ihre Content-Idee..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
                      />
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-8 flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={loading || locationsLoading || locations.length === 0}
                      className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Speichern..." : "Speichern"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
