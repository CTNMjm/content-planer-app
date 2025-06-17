// filepath: \\wsl.localhost\Ubuntu-24\home\johann\content-planer-app\src\components\ContentPlanModal.tsx
"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useSession } from "next-auth/react";

interface ContentPlanFormData {
  monat: string;
  bezug: string;
  mehrwert: string;
  mechanikThema: string;
  platzierung: string;
  idee: string;
  status: string;
  locationId: string;
  implementationLevel?: string;
  creativeFormat?: string;
  action?: string;
  creativeBriefingExample?: string;
  copyExample?: string;
  copyExampleCustomized?: string;
  firstCommentForEngagement?: string;
  notes?: string;
}

interface ContentPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null | undefined;
  mechanikThema: string;
  platzierung: string;
  idee: string;
  status: string;
  location: {
    id: string;
    name: string;
  };
  implementationLevel?: string | null | undefined;
  creativeFormat?: string | null | undefined;
  creativeBriefingExample?: string | null | undefined;
  copyExample?: string | null | undefined;
  copyExampleCustomized?: string | null | undefined;
  firstCommentForEngagement?: string | null | undefined;
  notes?: string | null | undefined;
  action?: string | null | undefined;
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
  selectedLocation?: string;
  readOnly?: boolean; // <--- Diese Zeile ergänzen!
}

interface ConvertToInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentPlan: ContentPlan | null;
  onSuccess: () => Promise<void>;
}

export function ContentPlanModal({
  isOpen,
  contentPlan,
  onClose,
  onSave,
  selectedLocation,
}: ContentPlanModalProps) {
  const { data: session } = useSession();
  const [permissions, setPermissions] = useState<string[]>([]);
  const [formData, setFormData] = useState<ContentPlanFormData>({
    monat: "",
    bezug: "",
    mehrwert: "",
    mechanikThema: "",
    idee: "",
    platzierung: "",
    status: "DRAFT",
    locationId: "",
    // Neue Felder - WICHTIG: Leere Strings statt undefined
    implementationLevel: "",
    creativeFormat: "",
    creativeBriefingExample: "",
    copyExample: "",
    copyExampleCustomized: "",
    firstCommentForEngagement: "",
    notes: "",
    action: "",
  });
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [locationsLoading, setLocationsLoading] = useState(true);

  // Lade Berechtigungen
  useEffect(() => {
    if (session?.user?.id && formData.locationId) {
      console.log('Fetching permissions for location:', formData.locationId);
      fetchUserPermissions(formData.locationId);
    }
  }, [session, formData.locationId]);

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
        // Neue Felder - immer mit || "" absichern
        implementationLevel: contentPlan.implementationLevel || "",
        creativeFormat: contentPlan.creativeFormat || "",
        creativeBriefingExample: contentPlan.creativeBriefingExample || "",
        copyExample: contentPlan.copyExample || "",
        copyExampleCustomized: contentPlan.copyExampleCustomized || "",
        firstCommentForEngagement: contentPlan.firstCommentForEngagement || "",
        notes: contentPlan.notes || "",
        action: contentPlan.action || "",
      });
    } else if (!contentPlan && locations.length > 0) {
      setFormData(prev => ({
        ...prev,
        locationId: locations[0].id || "",
      }));
    }
  }, [contentPlan, locations]);

  // Nach Zeile 130 (nach dem contentPlan useEffect):
  useEffect(() => {
    console.log('FormData changed:', formData);
    console.log('Current locationId:', formData.locationId);
  }, [formData]);

  const fetchUserPermissions = async (locationId: string) => {
    if (!locationId) {
      console.warn('No locationId provided to fetchUserPermissions');
      return;
    }
    
    try {
      const response = await fetch(`/api/permissions?locationId=${locationId}`);
      if (response.ok) {
        const data = await response.json();
        setPermissions(data.permissions || []);
        console.log('Loaded permissions for location:', locationId, data.permissions);
      }
    } catch (error) {
      console.error("Error fetching permissions:", error);
    }
  };

  const fetchLocations = async () => {
    setLocationsLoading(true);
    try {
      const response = await fetch("/api/locations");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Loaded locations:', data); // DEBUG
      
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
    console.log('Field changed:', name, '=', value); // DEBUG
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Spezielle Behandlung für locationId
    if (name === 'locationId') {
      console.log('Location changed to:', value);
      console.log('Available locations:', locations);
    }
  };

  const isAdmin = session?.user?.role === 'ADMIN';
  const canApprove = isAdmin; // Erstmal einfach für Admin

  // Optional: Debug-Info im Modal
  useEffect(() => {
    console.log('Modal Debug:', {
      user: session?.user,
      role: session?.user?.role,
      isAdmin,
      canApprove,
      currentStatus: formData.status
    });
  }, [session, isAdmin, canApprove, formData.status]);

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
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="DRAFT">Entwurf</option>
                          <option value="IN_PROGRESS">In Bearbeitung</option>
                          <option value="REVIEW">Überprüfung</option>
                          {canApprove && (
                            <option value="APPROVED">Freigegeben</option>
                          )}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Standort *
                        </label>
                        <select
                          name="locationId"
                          value={formData.locationId || ''}
                          onChange={handleChange}
                          required
                          disabled={locationsLoading || locations.length === 0}
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
                        
                        {/* Debug Info */}
                        <div className="text-xs text-gray-500 mt-1">
                          Aktuelle ID: {formData.locationId || 'keine'} | 
                          Verfügbar: {locations.length} Standorte
                        </div>
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

                    {/* Neue Felder in einem erweiterbaren Bereich */}
                    <div className="col-span-2 border-t pt-4 mt-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">Erweiterte Felder</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* Implementation Level */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Umsetzungslevel
                          </label>
                          <select
                            name="implementationLevel"
                            value={formData.implementationLevel}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          >
                            <option value="">Bitte wählen</option>
                            <option value="EINFACH">Einfach</option>
                            <option value="MITTEL">Mittel</option>
                            <option value="KOMPLEX">Komplex</option>
                          </select>
                        </div>

                        {/* Creative Format */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kreativformat
                          </label>
                          <input
                            type="text"
                            name="creativeFormat"
                            value={formData.creativeFormat}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="z.B. Video, Infografik, Artikel"
                          />
                        </div>

                        {/* Action */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Aktion
                          </label>
                          <input
                            type="text"
                            name="action"
                            value={formData.action}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="z.B. Call-to-Action, nächste Schritte"
                          />
                        </div>

                        {/* Creative Briefing Example */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Kreativ-Briefing Beispiel
                          </label>
                          <textarea
                            name="creativeBriefingExample"
                            value={formData.creativeBriefingExample}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Detailliertes Briefing für die kreative Umsetzung..."
                          />
                        </div>

                        {/* Copy Example */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Text-Beispiel
                          </label>
                          <textarea
                            name="copyExample"
                            value={formData.copyExample}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Beispieltext für den Content..."
                          />
                        </div>

                        {/* Copy Example Customized */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Angepasstes Text-Beispiel
                          </label>
                          <textarea
                            name="copyExampleCustomized"
                            value={formData.copyExampleCustomized}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Standort-spezifisch angepasster Text..."
                          />
                        </div>

                        {/* First Comment for Engagement */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Erster Kommentar für Engagement
                          </label>
                          <textarea
                            name="firstCommentForEngagement"
                            value={formData.firstCommentForEngagement}
                            onChange={handleChange}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Kommentar um Diskussion anzuregen..."
                          />
                        </div>

                        {/* Notes */}
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Notizen
                          </label>
                          <textarea
                            name="notes"
                            value={formData.notes}
                            onChange={handleChange}
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Interne Notizen und Anmerkungen..."
                          />
                        </div>
                      </div>
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

                  {/* Erfolgsnachricht nach Abschluss */}
                  {formData.status === 'COMPLETED' && (
                    <div className="col-span-3 mt-2">
                      <div className="p-3 bg-green-100 border border-green-300 rounded-md">
                        <p className="text-sm text-green-800">
                          ✓ Dieser Plan wurde erfolgreich in die Input-Liste übertragen
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

function ConvertToInputModal(props: ConvertToInputModalProps) {
  const { isOpen, onClose, contentPlan, onSuccess } = props;
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/convert-to-input", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contentPlanId: contentPlan?.id }),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Konvertieren des Plans");
      }

      await onSuccess();
      onClose();
    } catch (error) {
      console.error("Error converting plan:", error);
      alert("Fehler beim Konvertieren des Plans");
    } finally {
      setLoading(false);
    }
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-white shadow-2xl transition-all">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Plan in Input-Liste übertragen
                  </h3>
                  <p className="text-sm text-gray-500 mb-6">
                    Möchten Sie diesen Content-Plan wirklich in die Input-Liste übertragen?
                  </p>

                  {/* Actions */}
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                    >
                      Abbrechen
                    </button>
                    <button
                      onClick={handleConvert}
                      disabled={loading}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Übertragen..." : "Übertragen"}
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
