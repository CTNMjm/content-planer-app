"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Clock, User, FileText, X } from "lucide-react";

interface HistoryEntry {
  id: string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  changedAt: string;
  changedBy: {
    name: string;
    email: string;
  };
  metadata?: any;
}

interface ContentPlanHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  contentPlanId: string;
  contentPlanTitle?: string;
}

export function ContentPlanHistory({
  isOpen,
  onClose,
  contentPlanId,
  contentPlanTitle,
}: ContentPlanHistoryProps) {
  console.log("ContentPlanHistory rendered:", { isOpen, contentPlanId, contentPlanTitle });
  
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("useEffect triggered:", { isOpen, contentPlanId });
    if (isOpen && contentPlanId) {
      fetchHistory();
    }
  }, [isOpen, contentPlanId]);

  const fetchHistory = async () => {
    console.log("fetchHistory called for ID:", contentPlanId);
    setLoading(true);
    try {
      const url = `/api/content-plans/${contentPlanId}/history`;
      console.log("Fetching from URL:", url);
      
      const response = await fetch(url);
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("History data received:", data);
        setHistory(data);
      } else {
        console.error("Response not ok:", response.status, response.statusText);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const getActionLabel = (action: string) => {
    const labels: { [key: string]: string } = {
      CREATE: "Erstellt",
      UPDATE: "Aktualisiert",
      STATUS_CHANGE: "Status geändert",
      DELETE: "Gelöscht",
    };
    return labels[action] || action;
  };

  const getFieldLabel = (field: string) => {
    const labels: { [key: string]: string } = {
      monat: "Monat",
      bezug: "Bezug",
      mehrwert: "Mehrwert",
      mechanikThema: "Mechanik/Thema",
      idee: "Idee",
      platzierung: "Platzierung",
      status: "Status",
      locationId: "Standort",
      implementationLevel: "Umsetzungslevel",
      creativeFormat: "Kreativformat",
      notes: "Notizen",
    };
    return labels[field] || field;
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      DRAFT: "Entwurf",
      IN_PROGRESS: "In Bearbeitung",
      REVIEW: "Überprüfung",
      APPROVED: "Freigegeben",
      COMPLETED: "Abgeschlossen",
    };
    return labels[status] || status;
  };

  const formatValue = (field: string, value: string) => {
    if (!value) return "-";
    if (field === "status") return getStatusLabel(value);
    return value;
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
          <div className="fixed inset-0 bg-black/25" />
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
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gray-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <Dialog.Title className="text-lg font-semibold text-gray-900">
                        Historie
                      </Dialog.Title>
                      {contentPlanTitle && (
                        <p className="text-sm text-gray-600 mt-1">{contentPlanTitle}</p>
                      )}
                    </div>
                    <button
                      onClick={onClose}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="max-h-[60vh] overflow-y-auto p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="inline-flex items-center">
                        <svg
                          className="animate-spin h-5 w-5 text-gray-500 mr-3"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span className="text-gray-500">Lade Historie...</span>
                      </div>
                    </div>
                  ) : history.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      Keine Historie vorhanden
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {history.map((entry) => (
                        <div
                          key={entry.id}
                          className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 text-sm">
                                <span className="font-medium text-gray-900">
                                  {getActionLabel(entry.action)}
                                </span>
                                {entry.fieldName && (
                                  <>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-700">
                                      {getFieldLabel(entry.fieldName)}
                                    </span>
                                  </>
                                )}
                              </div>

                              {entry.oldValue && entry.newValue && (
                                <div className="mt-2 text-sm">
                                  <span className="text-gray-500">Von:</span>{" "}
                                  <span className="font-medium text-gray-700">
                                    {formatValue(entry.fieldName || "", entry.oldValue)}
                                  </span>
                                  <span className="text-gray-500 mx-2">→</span>
                                  <span className="font-medium text-gray-900">
                                    {formatValue(entry.fieldName || "", entry.newValue)}
                                  </span>
                                </div>
                              )}

                              {entry.metadata?.reason && (
                                <div className="mt-2 text-sm text-gray-600">
                                  Grund: {entry.metadata.reason}
                                </div>
                              )}

                              <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3" />
                                  <span>{entry.changedBy.name}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  <span>
                                    {format(
                                      new Date(entry.changedAt),
                                      "dd.MM.yyyy HH:mm",
                                      { locale: de }
                                    )}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-3 border-t">
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Schließen
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