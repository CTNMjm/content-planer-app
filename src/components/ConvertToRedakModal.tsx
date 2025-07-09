"use client";

import { useState, useEffect } from "react";

interface InputPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  voe?: string | null;
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
  onSuccess: () => Promise<void>;
  inputPlans: InputPlan[];
}

export default function ConvertToRedakModal({
  isOpen,
  onClose,
  onSuccess,
  inputPlans,
}: ConvertToRedakModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<InputPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) setSelectedPlan(null);
  }, [isOpen]);

  const handleConvert = async () => {
    if (!selectedPlan) return;
    setLoading(true);
    try {
      const response = await fetch("/api/redakplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          inputPlanId: selectedPlan.id,
          monat: selectedPlan.monat,
          bezug: selectedPlan.bezug,
          mehrwert: selectedPlan.mehrwert,
          mechanikThema: selectedPlan.mechanikThema,
          idee: selectedPlan.idee,
          platzierung: selectedPlan.platzierung,
          voe: selectedPlan.voe,
          zusatzinfo: selectedPlan.zusatzinfo,
          locationId: selectedPlan.location?.id,
          status: "IN_BEARBEITUNG",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Fehler beim Übertragen");
      }

      // Status im InputPlan auf "COMPLETED" setzen
      await fetch(`/api/inputplan/${selectedPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "COMPLETED" }),
      });

      alert("Plan erfolgreich in Redak-Plan übertragen!");
      await onSuccess();
      onClose();
      setSelectedPlan(null);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Fehler beim Übertragen");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Input-Plan in Redak-Plan übertragen</h2>
        {!selectedPlan ? (
          <>
            <p className="text-gray-600 mb-4">
              Wähle einen Input-Plan aus, der in den Redak-Plan übertragen werden soll:
            </p>
            {inputPlans.length === 0 ? (
              <p className="text-gray-500 italic">Keine Input-Pläne verfügbar.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {inputPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className="border rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold">{plan.idee}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          <span className="font-medium">Monat:</span> {plan.monat} | 
                          <span className="font-medium ml-2">Standort:</span> {plan.location?.name} |
                          <span className="font-medium ml-2">Bezug:</span> {plan.bezug}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Mechanik/Thema:</span> {plan.mechanikThema}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-green-100 text-green-800">
                        {plan.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-3">Ausgewählter Input-Plan:</h3>
              <div className="mb-4">
                <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-800 font-medium">
                  {selectedPlan.status}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Monat</span>
                    <p className="font-medium">{selectedPlan.monat}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Standort</span>
                    <p className="font-medium">{selectedPlan.location?.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Bezug</span>
                    <p className="font-medium">{selectedPlan.bezug}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500">Mechanik/Thema</span>
                    <p className="font-medium">{selectedPlan.mechanikThema}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Platzierung</span>
                    <p className="font-medium">{selectedPlan.platzierung}</p>
                  </div>
                  {selectedPlan.mehrwert && (
                    <div>
                      <span className="text-sm text-gray-500">Mehrwert</span>
                      <p className="font-medium">{selectedPlan.mehrwert}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="border-t pt-4 mb-4">
                <span className="text-sm text-gray-500">Idee</span>
                <p className="font-medium mt-1">{selectedPlan.idee}</p>
              </div>
              {/* Weitere Felder nach Bedarf */}
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-800">
                <strong>Hinweis:</strong> Dieser Input-Plan wird als neuer Redak-Plan mit Status "In Bearbeitung" erstellt.
              </p>
            </div>
          </>
        )}
        <div className="flex justify-end space-x-3 mt-6">
          {selectedPlan && (
            <button
              onClick={() => setSelectedPlan(null)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
              disabled={loading}
            >
              Zurück
            </button>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Abbrechen
          </button>
          {selectedPlan && (
            <button
              onClick={handleConvert}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
            >
              {loading ? "Übertrage..." : "In Redak-Plan übertragen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}