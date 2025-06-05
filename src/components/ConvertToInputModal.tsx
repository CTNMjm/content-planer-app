"use client";

import { useState } from "react";

interface ContentPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  locationId?: string;
  location?: {
    id: string;
    name: string;
  };
}

interface ConvertToInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  contentPlan: ContentPlan;
  onSuccess: () => void;
}

// WICHTIG: Verwenden Sie export default
export default function ConvertToInputModal({
  isOpen,
  onClose,
  contentPlan,
  onSuccess,
}: ConvertToInputModalProps) {
  const [voe, setVoe] = useState(new Date().toISOString().split("T")[0]);
  const [zusatzinfo, setZusatzinfo] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const checkSession = async () => {
    const response = await fetch("/api/auth/session");
    const session = await response.json();
    console.log("Current session:", session);
    return session;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const session = await checkSession();
      if (!session || !session.user) {
        throw new Error("Bitte melden Sie sich erneut an.");
      }

      const response = await fetch("/api/inputplan", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          contentPlanId: contentPlan.id,
          monat: contentPlan.monat,
          bezug: contentPlan.bezug,
          mehrwert: contentPlan.mehrwert,
          mechanikThema: contentPlan.mechanikThema,
          idee: contentPlan.idee,
          platzierung: contentPlan.platzierung,
          status: "DRAFT",
          voe: new Date(voe),
          zusatzinfo,
          locationId: contentPlan.location?.id || contentPlan.locationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error("API Error:", errorData); // Debug-Ausgabe

        if (response.status === 403) {
          throw new Error(
            "Keine Berechtigung zum Erstellen von Input-Plänen. Bitte melden Sie sich erneut an."
          );
        }

        throw new Error(
          errorData?.error || `Fehler beim Übertragen (${response.status})`
        );
      }

      onSuccess();
    } catch (error) {
      console.error("Submit error:", error); // Debug-Ausgabe
      alert(error instanceof Error ? error.message : "Fehler beim Übertragen");
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
                <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    In Input-Plan übernehmen
                  </h3>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">
                      Content-Plan "{contentPlan.bezug}" wird in Input-Plan
                      übertragen.
                    </p>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <label
                        htmlFor="voe"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Veröffentlichungsdatum (VÖ)
                      </label>
                      <input
                        type="date"
                        id="voe"
                        value={voe}
                        onChange={(e) => setVoe(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="zusatzinfo"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Zusatzinformationen
                      </label>
                      <textarea
                        id="zusatzinfo"
                        rows={3}
                        value={zusatzinfo}
                        onChange={(e) => setZusatzinfo(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                        placeholder="Weitere Informationen für die Umsetzung..."
                      />
                    </div>

                    <div className="bg-gray-50 p-3 rounded-md">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Zu übernehmende Daten:
                      </h4>
                      <dl className="text-sm space-y-1">
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Monat:</dt>
                          <dd className="text-gray-900">{contentPlan.monat}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Bezug:</dt>
                          <dd className="text-gray-900">{contentPlan.bezug}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-gray-500">Mechanik/Thema:</dt>
                          <dd className="text-gray-900">
                            {contentPlan.mechanikThema}
                          </dd>
                        </div>
                      </dl>
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
                {isLoading ? "Übertrage..." : "In Input-Plan übernehmen"}
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