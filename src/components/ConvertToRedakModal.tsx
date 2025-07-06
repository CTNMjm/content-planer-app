"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { format } from "date-fns";
import { de } from "date-fns/locale";

interface InputPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  voe?: string;
  voeDate?: string;
  zusatzinfo?: string;
  implementationLevel?: string;
  creativeFormat?: string;
  creativeBriefingExample?: string;
  copyExample?: string;
  copyExampleCustomized?: string;
  firstCommentForEngagement?: string;
  notes?: string;
  action?: string;
  status: string;
  location?: {
    id: string;
    name: string;
  };
}

interface ConvertToRedakModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputPlans: InputPlan[];
  selectedIds: Set<string>;
  onSuccess: () => void;
}

export default function ConvertToRedakModal({
  isOpen,
  onClose,
  inputPlans,
  selectedIds,
  onSuccess,
}: ConvertToRedakModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [redaktionshinweise, setRedaktionshinweise] = useState("");
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);

  if (!isOpen) return null;

  const selectedPlans = inputPlans.filter(plan => selectedIds.has(plan.id));
  const currentPlan = selectedPlans[currentPlanIndex];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const promises = selectedPlans.map(async (plan) => {
        if (!plan.voe && !plan.voeDate) {
          throw new Error(`VÖ-Datum fehlt für: ${plan.bezug}`);
        }

        const response = await fetch(`/api/inputplan/${plan.id}/copy-to-redak`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || `Fehler bei ${plan.bezug}`);
        }

        return response;
      });

      await Promise.all(promises);
      
      toast.success(`${selectedPlans.length} ${selectedPlans.length === 1 ? 'Eintrag' : 'Einträge'} erfolgreich übertragen und abgeschlossen!`);
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Transfer error:", error);
      toast.error(error instanceof Error ? error.message : "Fehler bei der Übertragung");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Nicht gesetzt";
    try {
      return format(new Date(dateString), "dd.MM.yyyy", { locale: de });
    } catch {
      return "Ungültiges Datum";
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">In Redaktionsplan übertragen</h2>
        
        {selectedPlans.length === 1 ? (
          // Einzelner Plan - Detailansicht
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold mb-3">Ausgewählter Input-Plan:</h3>
            
            {/* Status Badge */}
            <div className="mb-4">
              <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">
                ✓ {currentPlan.status === 'APPROVED' ? 'Freigegeben' : currentPlan.status}
              </span>
            </div>

            {/* Basis-Informationen in Spalten */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Monat</span>
                  <p className="font-medium">{currentPlan.monat}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Standort</span>
                  <p className="font-medium">{currentPlan.location?.name || "Nicht zugeordnet"}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Bezug</span>
                  <p className="font-medium">{currentPlan.bezug}</p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">Mechanik/Thema</span>
                  <p className="font-medium">{currentPlan.mechanikThema}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Platzierung</span>
                  <p className="font-medium">{currentPlan.platzierung}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">VÖ-Datum</span>
                  <p className="font-medium">{formatDate(currentPlan.voe || currentPlan.voeDate)}</p>
                </div>
              </div>
            </div>

            {/* Hauptidee */}
            <div className="border-t pt-4 mb-4">
              <span className="text-sm text-gray-500">Idee</span>
              <p className="font-medium mt-1">{currentPlan.idee}</p>
            </div>

            {/* Umsetzungsdetails */}
            {(currentPlan.implementationLevel || currentPlan.creativeFormat || currentPlan.action) && (
              <div className="border-t pt-4 mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Umsetzungsdetails</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {currentPlan.implementationLevel && (
                    <div className="bg-white rounded-md p-3 border border-gray-200">
                      <span className="text-xs text-gray-500">Umsetzungslevel</span>
                      <p className="font-medium text-sm mt-1">{currentPlan.implementationLevel}</p>
                    </div>
                  )}
                  {currentPlan.creativeFormat && (
                    <div className="bg-white rounded-md p-3 border border-gray-200">
                      <span className="text-xs text-gray-500">Kreativformat</span>
                      <p className="font-medium text-sm mt-1">{currentPlan.creativeFormat}</p>
                    </div>
                  )}
                  {currentPlan.action && (
                    <div className="bg-white rounded-md p-3 border border-gray-200">
                      <span className="text-xs text-gray-500">Aktion</span>
                      <p className="font-medium text-sm mt-1">{currentPlan.action}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Zusatzinfo */}
            {currentPlan.zusatzinfo && (
              <div className="border-t pt-4">
                <details className="bg-amber-50 rounded-md border border-amber-200">
                  <summary className="px-4 py-2 cursor-pointer hover:bg-amber-100 font-medium text-sm text-amber-800">
                    📝 Zusatzinformationen
                  </summary>
                  <div className="px-4 pb-3 pt-1 text-sm text-gray-700">
                    {currentPlan.zusatzinfo}
                  </div>
                </details>
              </div>
            )}
          </div>
        ) : (
          // Mehrere Pläne - Listenansicht
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-3">
              {selectedPlans.length} Input-Plan(e) werden in den Redaktionsplan übertragen und als abgeschlossen markiert.
            </p>
            
            <div className="bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto">
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                Ausgewählte Einträge:
              </h4>
              <ul className="text-sm space-y-2">
                {selectedPlans.map(plan => (
                  <li key={plan.id} className="flex justify-between items-center p-2 bg-white rounded border">
                    <span className="text-gray-700 font-medium">{plan.bezug}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{plan.monat}</span>
                      {(!plan.voe && !plan.voeDate) && (
                        <span className="text-red-500 text-xs">⚠️ VÖ fehlt</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redaktionshinweise für mehrere Einträge */}
            <div className="mt-4">
              <label
                htmlFor="redaktionshinweise"
                className="block text-sm font-medium text-gray-700"
              >
                Allgemeine Redaktionshinweise (optional)
              </label>
              <textarea
                id="redaktionshinweise"
                rows={3}
                value={redaktionshinweise}
                onChange={(e) => setRedaktionshinweise(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Hinweise für die Redaktion..."
              />
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Hinweis:</strong> Die Input-Pläne werden in den Redaktionsplan übertragen und automatisch als "Abgeschlossen" markiert.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || selectedPlans.some(p => !p.voe && !p.voeDate)}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Übertrage..." : `${selectedPlans.length} ${selectedPlans.length === 1 ? 'Eintrag' : 'Einträge'} übertragen`}
          </button>
        </div>
      </div>
    </div>
  );
}