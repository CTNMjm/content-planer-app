import React, { useEffect, useState } from "react";

interface HistoryEntry {
  id: string;
  redakPlanId: string;
  changedAt: string;
  changedBy?: { id: string; name?: string; email?: string } | string;
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
}

interface RedakPlanHistoryProps {
  redakPlanId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RedakPlanHistory({ redakPlanId, isOpen, onClose }: RedakPlanHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && redakPlanId) {
      fetchHistory();
    }
    // eslint-disable-next-line
  }, [isOpen, redakPlanId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/redakplan/${redakPlanId}/history`);
      if (!response.ok) throw new Error("Fehler beim Laden der Historie");
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const getFieldDisplayName = (field?: string): string => {
    if (!field) return "-";
    const fieldMap: { [key: string]: string } = {
      status: "Status",
      monat: "Monat",
      idee: "Idee",
      platzierung: "Platzierung",
      implementationLevel: "Umsetzungslevel",
      creativeFormat: "Format",
      creativeBriefingExample: "Briefing-Beispiel",
      copyExample: "Copy-Beispiel",
      copyExampleCustomized: "Copy (angepasst)",
      firstCommentForEngagement: "Erster Kommentar",
      notes: "Notizen",
      action: "Aktion",
      zusatzinfo: "Zusatzinfo",
      locationId: "Standort",
      createdBy: "Erstellt von",
      updatedBy: "Geändert von",
      changedBy: "Geändert von",
      changedAt: "Geändert am",
      created_from_inputplan: "Aus InputPlan übernommen",
      // ...weitere Mappings nach Bedarf...
    };
    return fieldMap[field] || field;
  };

  const formatValue = (field: string | undefined, value: string | null | undefined): string => {
    if (value === null || value === undefined || value === "") return "-";
    if (field === "status") {
      const statusMap: { [key: string]: string } = {
        ENTWURF: "Entwurf",
        EINGEREICHT: "Eingereicht",
        IN_BEARBEITUNG: "In Bearbeitung",
        FREIGEGEBEN: "Freigegeben",
        ABGESCHLOSSEN: "Abgeschlossen",
        COMPLETED: "Abgeschlossen"
      };
      return statusMap[value] || value;
    }
    if (field === "changedAt") {
      try {
        return new Date(value).toLocaleString("de-DE");
      } catch {
        return value;
      }
    }
    return value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold dark:text-gray-100">Änderungshistorie</h2>
          <button
            onClick={onClose}
            className="text-gray-400 dark:text-gray-500 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-8rem)]">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-4 text-gray-600 dark:text-gray-400">Lade Historie...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">Keine Änderungen vorhanden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => {
                // Sonderfall: Übernahme aus InputPlan hervorheben
                if (entry.fieldName === "created_from_inputplan" || entry.action === "CREATED_FROM_INPUTPLAN") {
                  return (
                    <div key={entry.id} className="bg-blue-50 dark:bg-blue-900/40 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-medium text-blue-900 dark:text-blue-300">
                            {getFieldDisplayName("created_from_inputplan")}
                          </span>
                          <p className="text-sm text-blue-700 dark:text-blue-400 mt-1">
                            Übernommen von InputPlan
                            {entry.oldValue && (
                              <> (ID: <span className="font-mono">{entry.oldValue}</span>)</>
                            )}
                          </p>
                        </div>
                        <span className="text-sm text-blue-700 dark:text-blue-400">
                          {entry.changedAt ? new Date(entry.changedAt).toLocaleString('de-DE') : ""}
                        </span>
                      </div>
                    </div>
                  );
                }
                // Standardanzeige
                return (
                  <div key={entry.id} className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {getFieldDisplayName(entry.fieldName)}
                        </span>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Geändert von {
                            typeof entry.changedBy === "object" && entry.changedBy !== null
                              ? (entry.changedBy.name || entry.changedBy.email || entry.changedBy.id)
                              : entry.changedBy
                          }
                          {
                            typeof entry.changedBy === "object" && entry.changedBy?.email
                              ? ` (${entry.changedBy.email})`
                              : ""
                          }
                        </p>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {entry.changedAt ? new Date(entry.changedAt).toLocaleString('de-DE') : ""}
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Vorher:</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                          {formatValue(entry.fieldName, entry.oldValue)}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Nachher:</p>
                        <p className="text-sm text-gray-900 dark:text-gray-100 mt-1 bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-700">
                          {formatValue(entry.fieldName, entry.newValue)}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-t dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}