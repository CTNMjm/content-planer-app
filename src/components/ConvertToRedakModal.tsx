"use client";

import { useState } from "react";

interface InputPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  voe: Date | string;
  zusatzinfo?: string;
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

  if (!isOpen) return null;

  const selectedPlans = inputPlans.filter(plan => selectedIds.has(plan.id));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Für jeden ausgewählten Plan einen Redak-Plan erstellen
      const promises = selectedPlans.map(plan => 
        fetch("/api/redakplan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            inputPlanId: plan.id,
            monat: plan.monat,
            bezug: plan.bezug,
            mehrwert: plan.mehrwert,
            mechanikThema: plan.mechanikThema,
            idee: plan.idee,
            platzierung: plan.platzierung,
            voe: plan.voe,
            zusatzinfo: plan.zusatzinfo,
            redaktionshinweise,
            status: "IN_BEARBEITUNG",
            locationId: plan.location?.id,
          }),
        })
      );

      const responses = await Promise.all(promises);
      
      // Prüfe ob alle erfolgreich waren
      const failedCount = responses.filter(r => !r.ok).length;
      
      if (failedCount > 0) {
        throw new Error(`${failedCount} von ${selectedPlans.length} Übertragungen fehlgeschlagen`);
      }

      onSuccess();
    } catch (error) {
      alert(error instanceof Error ? error.message : "Fehler bei der Übertragung");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        <span className="hidden sm:inline-block sm:h-screen sm:align-middle">
          &#8203;
        </span>

        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:align-middle">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    In Redaktionsplan übertragen
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      {selectedPlans.length} Input-Plan(e) werden in den Redaktionsplan übertragen.
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="redaktionshinweise"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Redaktionshinweise für alle ausgewählten Einträge
                      </label>
                      <textarea
                        id="redaktionshinweise"
                        rows={4}
                        value={redaktionshinweise}
                        onChange={(e) => setRedaktionshinweise(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Allgemeine Hinweise für die Redaktion..."
                      />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md max-h-48 overflow-y-auto">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Ausgewählte Einträge:
                      </h4>
                      <ul className="text-sm space-y-1">
                        {selectedPlans.map(plan => (
                          <li key={plan.id} className="flex justify-between">
                            <span className="text-gray-600">{plan.bezug}</span>
                            <span className="text-gray-500">{plan.monat}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
              <button
                type="submit"
                disabled={isLoading}
                className="inline-flex w-full justify-center rounded-md border border-transparent bg-green-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isLoading ? "Übertrage..." : `${selectedPlans.length} Einträge übertragen`}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Abbrechen
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}