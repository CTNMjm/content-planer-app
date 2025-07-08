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

interface InputPlanModalProps {
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
  const MONATE = [
    "Januar",
    "Februar",
    "März",
    "April",
    "Mai",
    "Juni",
    "Juli",
    "August",
    "September",
    "Oktober",
    "November",
    "Dezember",
  ];

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

  useEffect(() => {
    if (inputPlan) {
      setFormData({
        ...inputPlan,
        voe: inputPlan.voe ? new Date(inputPlan.voe).toISOString().split("T")[0] : "",
      });
    }
  }, [inputPlan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(formData);
    onClose();
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
                            <option value="">Bitte wählen…</option>
                            {MONATE.map((monat) => (
                              <option key={monat} value={monat}>
                                {monat}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">VOE Datum</label>
                          <input
                            type="date"
                            value={formData.voe}
                            onChange={(e) => setFormData({ ...formData, voe: e.target.value })}
                            disabled={readOnly}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          />
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
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as InputPlan["status"] })}
                            disabled={readOnly}
                            className={`mt-1 w-full p-2 border rounded ${readOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                          >
                            <option value="DRAFT">Entwurf</option>
                            <option value="IN_PROGRESS">In Bearbeitung</option>
                            <option value="REVIEW">Review</option>
                            <option value="APPROVED">Freigegeben</option>
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
                  <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end space-x-2">
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
                        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Speichern
                      </button>
                    )}
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