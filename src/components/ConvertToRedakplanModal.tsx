"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

interface InputPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  status: "DRAFT" | "IN_PROGRESS" | "REVIEW" | "APPROVED" | "COMPLETED";
  location: {
    id: string;
    name: string;
  };
  locationId: string;
  createdAt: string;
  updatedAt: string;
  implementationLevel?: string | null;
  creativeFormat?: string | null;
  creativeBriefingExample?: string | null;
  copyExample?: string | null;
  copyExampleCustomized?: string | null;
  firstCommentForEngagement?: string | null;
  notes?: string | null;
  action?: string | null;
  zusatzinfo?: string | null;
  voe?: string | null;
}

interface ConvertToRedakplanModalProps {
  isOpen: boolean;
  onClose: () => void;
  inputPlan: InputPlan;
  onSuccess: () => void;
}

const ConvertToRedakplanModal = ({
  isOpen,
  onClose,
  inputPlan,
  onSuccess,
}: ConvertToRedakplanModalProps) => {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  const handleConvert = async () => {
    if (!inputPlan.voe) {
      alert("Bitte setzen Sie zuerst ein Veröffentlichungsdatum (VÖ) für diesen Eintrag.");
      return;
    }
    if (!window.confirm("Möchten Sie diesen Input-Plan wirklich in den Redaktionsplan übertragen?")) {
      return;
    }
    setLoading(true);
    try {
      // Redakplan anlegen
      const redakPlanData = {
        inputPlanId: inputPlan.id,
        monat: inputPlan.monat,
        bezug: inputPlan.bezug,
        mechanikThema: inputPlan.mechanikThema,
        idee: inputPlan.idee ?? "",
        voe: inputPlan.voe,
        platzierung: inputPlan.platzierung,
        locationId: inputPlan.locationId,
        status: "DRAFT",
      };

      const response = await fetch("/api/redakplan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(redakPlanData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || errorText || "Fehler beim Übertragen");
        } catch {
          throw new Error(errorText || "Fehler beim Übertragen");
        }
      }

      // Status auf COMPLETED setzen (mit allowCompleted-Flag)
      const updateResponse = await fetch(`/api/inputplan/${inputPlan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "COMPLETED",
          allowCompleted: true,
        }),
      });

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.error || "Status konnte nicht aktualisiert werden");
      }

      alert("Erfolgreich zu RedakPlan übertragen und abgeschlossen!");
      onSuccess();
      onClose();
    } catch (error) {
      alert(`Fehler beim Übertragen: ${error instanceof Error ? error.message : "Unbekannter Fehler"}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !inputPlan) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Input-Plan in Redaktionsplan übertragen</h2>
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h3 className="font-semibold mb-3">Ausgewählter Input-Plan:</h3>
          <div className="mb-4">
            <span className="px-3 py-1 text-sm rounded-full bg-blue-100 text-blue-800 font-medium">
              Status: {inputPlan.status === "APPROVED" ? "Freigegeben" : inputPlan.status}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Monat</span>
                <p className="font-medium">{inputPlan.monat}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Standort</span>
                <p className="font-medium">{inputPlan.location.name}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Bezug</span>
                <p className="font-medium">{inputPlan.bezug}</p>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-sm text-gray-500">Mechanik/Thema</span>
                <p className="font-medium">{inputPlan.mechanikThema}</p>
              </div>
              <div>
                <span className="text-sm text-gray-500">Platzierung</span>
                <p className="font-medium">{inputPlan.platzierung}</p>
              </div>
              {inputPlan.mehrwert && (
                <div>
                  <span className="text-sm text-gray-500">Mehrwert</span>
                  <p className="font-medium">{inputPlan.mehrwert}</p>
                </div>
              )}
            </div>
          </div>
          <div className="border-t pt-4 mb-4">
            <span className="text-sm text-gray-500">Idee</span>
            <p className="font-medium mt-1">{inputPlan.idee}</p>
          </div>
          {inputPlan.notes && (
            <div className="border-t pt-4 mt-4">
              <details className="bg-amber-50 rounded-md border border-amber-200">
                <summary className="px-4 py-2 cursor-pointer hover:bg-amber-100 font-medium text-sm text-amber-800">
                  📝 Notizen
                </summary>
                <div className="px-4 pb-3 pt-1 text-sm text-gray-700">
                  {inputPlan.notes}
                </div>
              </details>
            </div>
          )}
        </div>
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800">
            <strong>Hinweis:</strong> Dieser Input-Plan wird als neuer Redaktionsplan-Eintrag erstellt und danach automatisch abgeschlossen.
          </p>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
            disabled={loading}
          >
            Abbrechen
          </button>
          <button
            onClick={handleConvert}
            disabled={loading}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? "Übertrage..." : "In Redaktionsplan übertragen"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConvertToRedakplanModal;