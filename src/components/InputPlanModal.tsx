"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface InputPlan {
  id: string;
  contentPlanId?: string;
  monat: string;
  bezug: string;
  mehrwert?: string;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  implementationLevel?: string;
  creativeFormat?: string;
  creativeBriefingExample?: string;
  copyExample?: string;
  copyExampleCustomized?: string;
  firstCommentForEngagement?: string;
  notes?: string;
  action?: string;
  zusatzinfo?: string;
  gptResult?: string;
  n8nResult?: string;
  flag: boolean;
  voe?: string;
  voeDate?: string;
  status: "DRAFT" | "IN_PROGRESS" | "REVIEW" | "APPROVED" | "COMPLETED";
  locationId: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface InputPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputPlan: InputPlan | null;
  onSave: (plan: InputPlan) => Promise<void>;
  readOnly?: boolean;
}

export function InputPlanModal({
  isOpen,
  onClose,
  inputPlan,
  onSave,
  readOnly = false,
}: InputPlanModalProps) {
  const [formData, setFormData] = useState<InputPlan>({
    id: "",
    monat: "",
    bezug: "",
    mehrwert: "",
    mechanikThema: "",
    idee: "",
    platzierung: "",
    implementationLevel: "",
    creativeFormat: "",
    creativeBriefingExample: "",
    copyExample: "",
    copyExampleCustomized: "",
    firstCommentForEngagement: "",
    notes: "",
    action: "",
    zusatzinfo: "",
    gptResult: "",
    n8nResult: "",
    flag: false,
    voe: "",
    status: "DRAFT",
    locationId: "",
  });

  const [errors, setErrors] = useState<{ voe?: string }>({});

  useEffect(() => {
    if (inputPlan) {
      setFormData({
        ...inputPlan,
        voe: inputPlan.voe
          ? new Date(inputPlan.voe).toISOString().split("T")[0] // immer "YYYY-MM-DD"
          : "",
      });
    }
  }, [inputPlan]);

  const validateForm = () => {
    const newErrors: { voe?: string } = {};

    // Wenn Status APPROVED ist, muss VÖ-Datum gesetzt sein
    if (formData.status === "APPROVED" && !formData.voe) {
      newErrors.voe = "Veröffentlichungsdatum ist erforderlich für freigegebene Einträge";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Bitte korrigieren Sie die Fehler im Formular");
      return;
    }

    if (!readOnly) {
      // Nur beim Speichern in ISO-String umwandeln!
      const planToSave = {
        ...formData,
        voe: formData.voe ? new Date(formData.voe + "T00:00:00Z").toISOString() : undefined,
      };
      await onSave(planToSave);
      onClose();
    }
  };

  if (!isOpen) return null;

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
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                <form onSubmit={handleSubmit}>
                  {/* Modal Header */}
                  <div className="sticky top-0 bg-green-600 text-white border-b px-6 py-4 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      {readOnly ? "Details anzeigen" : inputPlan ? "InputPlan bearbeiten" : "Neuer InputPlan"}
                    </h2>
                    <button
                      type="button"
                      onClick={onClose}
                      className="text-green-100 hover:text-white transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-6 overflow-y-auto max-h-[calc(90vh-8rem)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Basis-Informationen */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-3">Basis-Informationen</h3>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Monat *</label>
                          <select
                            value={formData.monat}
                            onChange={(e) => setFormData({ ...formData, monat: e.target.value })}
                            disabled={readOnly}
                            required
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          >
                            <option value="">Bitte wählen...</option>
                            <option value="Januar">Januar</option>
                            <option value="Februar">Februar</option>
                            <option value="März">März</option>
                            <option value="April">April</option>
                            <option value="Mai">Mai</option>
                            <option value="Juni">Juni</option>
                            <option value="Juli">Juli</option>
                            <option value="August">August</option>
                            <option value="September">September</option>
                            <option value="Oktober">Oktober</option>
                            <option value="November">November</option>
                            <option value="Dezember">Dezember</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            Veröffentlichungsdatum (VÖ) {formData.status === "APPROVED" && "*"}
                          </label>
                          <input
                            type="date"
                            value={formData.voe || ""}
                            onChange={e => setFormData({ ...formData, voe: e.target.value })}
                            disabled={readOnly}
                            className={`mt-1 w-full p-2 border rounded ${
                              errors.voe
                                ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                                : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                            } ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                          {errors.voe && <p className="mt-1 text-sm text-red-600">{errors.voe}</p>}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Bezug *</label>
                          <input
                            type="text"
                            value={formData.bezug}
                            onChange={(e) => setFormData({ ...formData, bezug: e.target.value })}
                            disabled={readOnly}
                            required
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Mehrwert</label>
                          <input
                            type="text"
                            value={formData.mehrwert || ""}
                            onChange={(e) => setFormData({ ...formData, mehrwert: e.target.value })}
                            disabled={readOnly}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Mechanik/Thema *</label>
                          <input
                            type="text"
                            value={formData.mechanikThema}
                            onChange={(e) => setFormData({ ...formData, mechanikThema: e.target.value })}
                            disabled={readOnly}
                            required
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Platzierung *</label>
                          <input
                            type="text"
                            value={formData.platzierung}
                            onChange={(e) => setFormData({ ...formData, platzierung: e.target.value })}
                            disabled={readOnly}
                            required
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <select
                            value={formData.status}
                            onChange={(e) => {
                              const newStatus = e.target.value as InputPlan["status"];
                              setFormData({ ...formData, status: newStatus });
                              // Trigger Validierung wenn Status geändert wird
                              if (newStatus === "APPROVED" && !formData.voe) {
                                setErrors({ ...errors, voe: "Veröffentlichungsdatum ist erforderlich für freigegebene Einträge" });
                              } else if (newStatus !== "APPROVED" && errors.voe) {
                                setErrors({ ...errors, voe: undefined });
                              }
                            }}
                            disabled={readOnly}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          >
                            <option value="DRAFT">Entwurf</option>
                            <option value="IN_PROGRESS">In Bearbeitung</option>
                            <option value="REVIEW">Review</option>
                            <option value="APPROVED">Freigabe</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={formData.flag}
                              onChange={(e) => setFormData({ ...formData, flag: e.target.checked })}
                              disabled={readOnly}
                              className="mr-2"
                            />
                            Flag (Markierung)
                          </label>
                        </div>
                      </div>

                      {/* Content-Informationen */}
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg mb-3">Content-Informationen</h3>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Idee *</label>
                          <textarea
                            value={formData.idee}
                            onChange={(e) => setFormData({ ...formData, idee: e.target.value })}
                            disabled={readOnly}
                            required
                            rows={3}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Umsetzungslevel</label>
                          <input
                            type="text"
                            value={formData.implementationLevel || ""}
                            onChange={(e) => setFormData({ ...formData, implementationLevel: e.target.value })}
                            disabled={readOnly}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Format</label>
                          <input
                            type="text"
                            value={formData.creativeFormat || ""}
                            onChange={(e) => setFormData({ ...formData, creativeFormat: e.target.value })}
                            disabled={readOnly}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Action</label>
                          <input
                            type="text"
                            value={formData.action || ""}
                            onChange={(e) => setFormData({ ...formData, action: e.target.value })}
                            disabled={readOnly}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>
                      </div>

                      {/* Zusätzliche Informationen - volle Breite */}
                      <div className="space-y-4 md:col-span-2">
                        <h3 className="font-semibold text-lg mb-3">Zusätzliche Informationen</h3>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Creative Briefing + Beispiel</label>
                          <textarea
                            value={formData.creativeBriefingExample || ""}
                            onChange={(e) => setFormData({ ...formData, creativeBriefingExample: e.target.value })}
                            disabled={readOnly}
                            rows={3}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Copy-Beispiel</label>
                          <textarea
                            value={formData.copyExample || ""}
                            onChange={(e) => setFormData({ ...formData, copyExample: e.target.value })}
                            disabled={readOnly}
                            rows={3}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Copy-Beispiel (individuell aufbereitet)</label>
                          <textarea
                            value={formData.copyExampleCustomized || ""}
                            onChange={(e) => setFormData({ ...formData, copyExampleCustomized: e.target.value })}
                            disabled={readOnly}
                            rows={3}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Erster Kommentar zur Interaktionsförderung</label>
                          <textarea
                            value={formData.firstCommentForEngagement || ""}
                            onChange={(e) => setFormData({ ...formData, firstCommentForEngagement: e.target.value })}
                            disabled={readOnly}
                            rows={2}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Notes</label>
                          <textarea
                            value={formData.notes || ""}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            disabled={readOnly}
                            rows={3}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Zusatzinfo</label>
                          <textarea
                            value={formData.zusatzinfo || ""}
                            onChange={(e) => setFormData({ ...formData, zusatzinfo: e.target.value })}
                            disabled={readOnly}
                            rows={3}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
                        </div>

                        {/* Automatisch generierte Felder - nur Anzeige */}
                        {(formData.n8nResult || formData.gptResult) && (
                          <>
                            <div>
                              <label className="block text-sm font-medium text-gray-700">N8N Ergebnis</label>
                              <textarea
                                value={formData.n8nResult || ""}
                                disabled
                                rows={4}
                                className="mt-1 w-full p-2 border rounded bg-gray-100"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">GPT Ergebnis</label>
                              <textarea
                                value={formData.gptResult || ""}
                                disabled
                                rows={4}
                                className="mt-1 w-full p-2 border rounded bg-gray-100"
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-between">
                    <div className="text-sm text-gray-500">
                      {errors.voe && (
                        <span className="text-red-600">
                          Bitte beheben Sie die Fehler vor dem Speichern
                        </span>
                      )}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                      >
                        {readOnly ? "Schließen" : "Abbrechen"}
                      </button>
                      {!readOnly && (
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed"
                          disabled={!!errors.voe}
                        >
                          Speichern
                        </button>
                      )}
                    </div>
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

const handleConvert = async () => {
  // ... existing code ...
  
  // VOR dem fetch:
  console.log("Sending InputPlan data:", inputPlanData);
  console.log("LocationId:", selectedPlan.locationId);
  console.log("ContentPlanId:", selectedPlan.id);
  
  const response = await fetch("/api/inputplan", {
    // ... existing fetch config ...
  });
  
  // NACH dem response check:
  if (!response.ok) {
    const errorText = await response.text();
    console.error("Error response:", errorText);
    
    try {
      const errorJson = JSON.parse(errorText);
      console.error("Error details:", errorJson);
      throw new Error(errorJson.error || errorJson.details || errorText || "Fehler beim Übertragen");
    } catch (e) {
      throw new Error(errorText || "Fehler beim Übertragen");
    }
  }
}