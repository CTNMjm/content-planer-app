"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface InputPlanFormData {
  monat: string;
  bezug: string;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  status: string;
  locationId: string;
  contentPlanId?: string;
}

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
}

interface Location {
  id: string;
  name: string;
}

interface InputPlanModalProps {
  inputPlan: InputPlan | null;
  onClose: () => void;
  onSave: () => void;
}

export default function InputPlanModal({
  inputPlan,
  onClose,
  onSave,
}: InputPlanModalProps) {
  const [formData, setFormData] = useState<InputPlanFormData>({
    monat: "",
    bezug: "",
    mechanikThema: "",
    idee: "",
    platzierung: "",
    status: "DRAFT",
    locationId: "",
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (inputPlan) {
      setFormData({
        monat: inputPlan.monat || "",
        bezug: inputPlan.bezug || "",
        mechanikThema: inputPlan.mechanikThema || "",
        idee: inputPlan.idee || "",
        platzierung: inputPlan.platzierung || "",
        status: inputPlan.status || "DRAFT",
        locationId: inputPlan.location?.id || "",
        contentPlanId: inputPlan.contentPlanId,
      });
    } else {
      setFormData({
        monat: "",
        bezug: "",
        mechanikThema: "",
        idee: "",
        platzierung: "",
        status: "DRAFT",
        locationId: locations[0]?.id || "",
      });
    }
  }, [inputPlan, locations]);

  const fetchLocations = async () => {
    try {
      const response = await fetch("/api/locations");
      if (response.ok) {
        const data = await response.json();
        setLocations(data);
        if (!inputPlan && data.length > 0) {
          setFormData(prev => ({ ...prev, locationId: data[0].id }));
        }
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = inputPlan
        ? `/api/inputplan/${inputPlan.id}`
        : "/api/inputplan";
      
      const method = inputPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern");
      }

      onSave();
    } catch (error) {
      console.error("Error saving input plan:", error);
      alert("Fehler beim Speichern des Input-Plans");
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
    <Transition appear show={true} as={Fragment}>
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
                <div className="bg-gradient-to-r from-green-600 to-green-700 px-8 py-6">
                  <Dialog.Title as="h3" className="text-xl font-semibold text-white">
                    {inputPlan ? "Input-Plan bearbeiten" : "Neuer Input-Plan"}
                  </Dialog.Title>
                  <p className="mt-1 text-sm text-green-100">
                    {inputPlan 
                      ? "Bearbeiten Sie die Details Ihres Input-Plans"
                      : "Erstellen Sie einen detaillierten Input-Plan für die Umsetzung"
                    }
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="p-8">
                  <div className="space-y-8">
                    {/* Basis Information */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                        <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Basis Information
                      </h4>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          >
                            <option value="">Bitte wählen</option>
                            <option value="Vielfalt">Vielfalt</option>
                            <option value="Saisonal">Saisonal</option>
                            <option value="Event">Event</option>
                            <option value="Trend">Trend</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Mechanik & Platzierung */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                        <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Mechanik & Platzierung
                      </h4>
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
                            placeholder="z.B. Gewinnspiel, Tutorial, Produktvorstellung"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Platzierung *
                          </label>
                          <select
                            name="platzierung"
                            value={formData.platzierung}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          >
                            <option value="">Bitte wählen</option>
                            <option value="FB + IG">FB + IG</option>
                            <option value="Instagram">Instagram</option>
                            <option value="Facebook">Facebook</option>
                            <option value="TikTok">TikTok</option>
                            <option value="Blog">Blog</option>
                            <option value="TikTok + IG">TikTok + IG</option>
                            <option value="Blog + FB">Blog + FB</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Status & Location */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                        <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Status & Zuordnung
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Status
                          </label>
                          <select
                            name="status"
                            value={formData.status}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          >
                            <option value="DRAFT">Entwurf</option>
                            <option value="IN_PROGRESS">In Bearbeitung</option>
                            <option value="REVIEW">Überprüfung</option>
                            <option value="APPROVED">Freigegeben</option>
                          </select>
                          <p className="mt-1 text-xs text-gray-500">
                            Aktueller Bearbeitungsstatus des Input-Plans
                          </p>
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors"
                          >
                            <option value="">Bitte wählen</option>
                            {locations.map(location => (
                              <option key={location.id} value={location.id}>
                                {location.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Detaillierte Beschreibung */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                        <svg className="h-5 w-5 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        Detaillierte Beschreibung
                      </h4>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Umsetzungsdetails *
                        </label>
                        <textarea
                          name="idee"
                          value={formData.idee}
                          onChange={handleChange}
                          required
                          rows={6}
                          placeholder="Beschreiben Sie detailliert, wie dieser Content umgesetzt werden soll. Geben Sie konkrete Anweisungen für Text, Bilder, Videos etc."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-colors resize-none"
                        />
                        <div className="mt-2 flex items-start space-x-2">
                          <svg className="h-4 w-4 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-sm text-gray-500">
                            Je präziser Ihre Angaben, desto besser kann das Redaktionsteam Ihre Vorstellungen umsetzen.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Referenz zu Content Plan */}
                    {formData.contentPlanId && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <svg className="h-5 w-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                          </svg>
                          <p className="text-sm text-blue-800">
                            Dieser Input-Plan wurde aus einem Content-Plan erstellt
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-10 flex justify-end space-x-4 pt-6 border-t border-gray-200">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Speichern...
                        </>
                      ) : (
                        "Speichern"
                      )}
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