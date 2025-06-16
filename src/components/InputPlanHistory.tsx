"use client";

import { useState, useEffect } from "react";

interface InputPlanHistoryEntry {
  id: string;
  inputPlanId: string;
  field: string;
  oldValue: string | null;
  newValue: string | null;
  changedBy: {
    id: string;
    name: string;
    email: string;
  };
  changedAt: string;
}

interface InputPlanHistoryProps {
  inputPlanId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function InputPlanHistory({ inputPlanId, isOpen, onClose }: InputPlanHistoryProps) {
  const [history, setHistory] = useState<InputPlanHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && inputPlanId) {
      fetchHistory();
    }
  }, [isOpen, inputPlanId]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/inputplan/${inputPlanId}/history`);
      
      if (!response.ok) {
        throw new Error("Fehler beim Laden der Historie");
      }
      
      const data = await response.json();
      setHistory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unbekannter Fehler");
    } finally {
      setLoading(false);
    }
  };

  const getFieldDisplayName = (field: string): string => {
    const fieldMap: { [key: string]: string } = {
      status: "Status",
      monat: "Monat",
      datum: "Datum",
      voe: "VOE Datum",
      idee: "Idee",
      anlass: "Anlass",
      geschaeft: "Geschäft",
      warengruppe: "Warengruppe",
      verkaufsstaette: "Verkaufsstätte",
      schlagzeileHeader: "Schlagzeile/Header",
      verkaufstext: "Verkaufstext",
      button: "Button",
      disclaimerFussnote: "Disclaimer/Fußnote",
      zusatzinfo: "Zusatzinfo",
      mechanikThema: "Mechanik/Thema",
      verkaufskanaele: "Verkaufskanäle",
      beilagenkartonBeileger: "Beilagen/Karton/Beileger",
      printDigital: "Print/Digital",
      promotion: "Promotion",
      objekteImMarkt: "Objekte im Markt",
      kommunikation: "Kommunikation",
      vorlaufzeitWochen: "Vorlaufzeit (Wochen)",
      locationId: "Standort"
    };
    return fieldMap[field] || field;
  };

  const formatValue = (field: string, value: string | null): string => {
    if (value === null || value === "") return "-";
    
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
    
    if (field === "voe" || field === "datum") {
      try {
        return new Date(value).toLocaleDateString('de-DE');
      } catch {
        return value;
      }
    }
    
    return value;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Änderungshistorie</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
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
              <p className="mt-4 text-gray-600">Lade Historie...</p>
            </div>
          ) : error ? (
            <div className="text-center py-8">
              <p className="text-red-600">{error}</p>
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Keine Änderungen vorhanden</p>
            </div>
          ) : (
            <div className="space-y-4">
              {history.map((entry) => (
                <div key={entry.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-medium text-gray-900">
                        {getFieldDisplayName(entry.field)}
                      </span>
                      <p className="text-sm text-gray-600 mt-1">
                        Geändert von {entry.changedBy.name} ({entry.changedBy.email})
                      </p>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(entry.changedAt).toLocaleString('de-DE')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Vorher:</p>
                      <p className="text-sm text-gray-900 mt-1 bg-white p-2 rounded border border-gray-200">
                        {formatValue(entry.field, entry.oldValue)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-700">Nachher:</p>
                      <p className="text-sm text-gray-900 mt-1 bg-white p-2 rounded border border-gray-200">
                        {formatValue(entry.field, entry.newValue)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Schließen
          </button>
        </div>
      </div>
    </div>
  );
}