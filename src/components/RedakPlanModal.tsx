"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface RedakPlan {
  id: string;
  monat: string;
  bezug: string;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  voe: string;
  status: "COMPLETED" | "DRAFT" | "IN_PROGRESS" | "REVIEW" | "APPROVED";
  publiziert: boolean;
  locationId: string;
  location: {
    id: string;
    name: string;
  };
  inputPlan?: {
    id: string;
    idee: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

interface RedakPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  redakPlan: RedakPlan | null;
  onSave: (plan: RedakPlan) => Promise<void>;
  readOnly?: boolean;
  locations?: Array<{ id: string; name: string }>;
}

export function RedakPlanModal({
  isOpen,
  onClose,
  redakPlan,
  onSave,
  readOnly = false,
  locations = []
}: RedakPlanModalProps) {
  const [formData, setFormData] = useState<RedakPlan>({
    id: "",
    monat: "",
    bezug: "",
    mechanikThema: "",
    idee: "",
    platzierung: "",
    voe: "",
    status: "DRAFT",
    publiziert: false,
    locationId: "",
    location: {
      id: "",
      name: "",
    },
    inputPlan: null,
    createdAt: "",
    updatedAt: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (redakPlan) {
      setFormData({
        ...redakPlan,
        voe: redakPlan.voe ? new Date(redakPlan.voe).toISOString().split('T')[0] : "",
      });
    } else {
      // Reset form for new RedakPlan
      setFormData({
        id: "",
        monat: "",
        bezug: "",
        mechanikThema: "",
        idee: "",
        platzierung: "",
        voe: "",
        status: "DRAFT",
        publiziert: false,
        locationId: locations[0]?.id || "",
        location: {
          id: locations[0]?.id || "",
          name: locations[0]?.name || "",
        },
        inputPlan: null,
        createdAt: "",
        updatedAt: "",
      });
    }
  }, [redakPlan, locations]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!readOnly && !isSubmitting) {
      setIsSubmitting(true);
      try {
        await onSave(formData);
        toast.success(redakPlan ? "RedakPlan aktualisiert" : "RedakPlan erstellt");
        onClose();
      } catch (error) {
        toast.error("Fehler beim Speichern");
        console.error("Error saving RedakPlan:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl">
                <form onSubmit={handleSubmit}>
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-orange-600 text-white px-6 py-4 flex justify-between items-center">
                    <Dialog.Title className="text-xl font-semibold">
                      {readOnly ? 'RedakPlan Details' : (redakPlan ? 'RedakPlan bearbeiten' : 'Neuer RedakPlan')}
                    </Dialog.Title>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-orange-100 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 max-h-[calc(90vh-8rem)] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basis-Informationen */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-3">Basis-Informationen</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Monat *</label>
                          <input
                            type="text"
                            value={formData.monat}
                            onChange={(e) => setFormData({...formData, monat: e.target.value})}
                            disabled={readOnly}
                            required
                            placeholder="z.B. 2025-01"
                            className={`mt-1 w-full p-2 border rounded-md ${
                              readOnly ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">VOE Datum *</label>
                          <input
                            type="date"
                            value={formData.voe}
                            onChange={(e) => setFormData({...formData, voe: e.target.value})}
                            disabled={readOnly}
                            required
                            className={`mt-1 w-full p-2 border rounded-md ${
                              readOnly ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Bezug *</label>
                          <input
                            type="text"
                            value={formData.bezug}
                            onChange={(e) => setFormData({...formData, bezug: e.target.value})}
                            disabled={readOnly}
                            required
                            className={`mt-1 w-full p-2 border rounded-md ${
                              readOnly ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Mechanik/Thema *</label>
                          <input
                            type="text"
                            value={formData.mechanikThema}
                            onChange={(e) => setFormData({...formData, mechanikThema: e.target.value})}
                            disabled={readOnly}
                            required
                            className={`mt-1 w-full p-2 border rounded-md ${
                              readOnly ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Platzierung *</label>
                          <input
                            type="text"
                            value={formData.platzierung}
                            onChange={(e) => setFormData({...formData, platzierung: e.target.value})}
                            disabled={readOnly}
                            required
                            className={`mt-1 w-full p-2 border rounded-md ${
                              readOnly ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                            }`}
                          />
                        </div>

                        {locations.length > 0 && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Standort *</label>
                            <select
                              value={formData.locationId}
                              onChange={(e) => setFormData({...formData, locationId: e.target.value})}
                              disabled={readOnly}
                              required
                              className={`mt-1 w-full p-2 border rounded-md ${
                                readOnly ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                              }`}
                            >
                              <option value="">Bitte wählen...</option>
                              {locations.map((location) => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>

                      {/* Status und Content */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-3">Status & Content</h3>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <select
                            value={formData.status}
                            onChange={(e) => setFormData({...formData, status: e.target.value as RedakPlan['status']})}
                            disabled={readOnly}
                            className={`mt-1 w-full p-2 border rounded-md ${
                              readOnly ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                            }`}
                          >
                            <option value="DRAFT">Entwurf</option>
                            <option value="IN_PROGRESS">In Bearbeitung</option>
                            <option value="REVIEW">Review</option>
                            <option value="APPROVED">Freigegeben</option>
                            <option value="COMPLETED">Abgeschlossen</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={formData.publiziert}
                              onChange={(e) => setFormData({...formData, publiziert: e.target.checked})}
                              disabled={readOnly}
                              className="mr-2 text-orange-600 focus:ring-orange-500"
                            />
                            Veröffentlicht
                          </label>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Idee *</label>
                          <textarea
                            value={formData.idee}
                            onChange={(e) => setFormData({...formData, idee: e.target.value})}
                            disabled={readOnly}
                            required
                            rows={6}
                            className={`mt-1 w-full p-2 border rounded-md ${
                              readOnly ? 'bg-gray-100 cursor-not-allowed' : 'border-gray-300 focus:border-orange-500 focus:ring-1 focus:ring-orange-500'
                            }`}
                          />
                        </div>
                      </div>

                      {/* Zusätzliche Informationen */}
                      {redakPlan && (
                        <div className="space-y-4 md:col-span-2">
                          <h3 className="font-semibold text-lg mb-3">Zusätzliche Informationen</h3>
                          
                          {redakPlan.inputPlan && (
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Erstellt aus InputPlan</label>
                              <p className="mt-1 text-gray-900 bg-gray-50 p-2 rounded">
                                ID: {redakPlan.inputPlan.id}
                                {redakPlan.inputPlan.idee && (
                                  <>
                                    <br />
                                    Idee: {redakPlan.inputPlan.idee}
                                  </>
                                )}
                              </p>
                            </div>
                          )}

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Erstellt am</label>
                              <p className="mt-1 text-gray-900">
                                {redakPlan.createdAt ? new Date(redakPlan.createdAt).toLocaleString('de-DE') : '-'}
                              </p>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">Zuletzt geändert</label>
                              <p className="mt-1 text-gray-900">
                                {redakPlan.updatedAt ? new Date(redakPlan.updatedAt).toLocaleString('de-DE') : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-gray-50 px-6 py-4 flex justify-end space-x-3 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                    >
                      {readOnly ? 'Schließen' : 'Abbrechen'}
                    </button>
                    {!readOnly && (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? 'Speichern...' : 'Speichern'}
                      </button>
                    )}
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}