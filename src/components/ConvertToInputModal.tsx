"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

interface ContentPlan {
  id: string;
  monat: string;
  bezug: string;
  mehrwert?: string | null;
  mechanikThema: string;
  idee: string;
  platzierung: string;
  status: "DRAFT" | "APPROVED" | "IN_PROGRESS" | "COMPLETED";
  location: {
    id: string;
    name: string;
  };
  locationId: string;
  createdAt: string;
  updatedAt: string;
  
  // Neue optionale Felder hinzufügen
  implementationLevel?: string | null;
  creativeFormat?: string | null;
  creativeBriefingExample?: string | null;
  copyExample?: string | null;
  copyExampleCustomized?: string | null;
  firstCommentForEngagement?: string | null;
  notes?: string | null;
  action?: string | null;
}

interface ConvertToInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => Promise<void>;
  contentPlan: ContentPlan; // <--- HINZUGEFÜGT
}

const ConvertToInputModal: React.FC<ConvertToInputModalProps> = ({
  isOpen,
  onClose,
  contentPlan,
  onSuccess,
}) => {
  const { data: session } = useSession();
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<ContentPlan | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchApprovedContentPlans();
    }
  }, [isOpen, contentPlan]);

  const fetchApprovedContentPlans = async () => {
    try {
      const params = new URLSearchParams();
      params.append("status", "APPROVED");

      const url = `/api/content-plans?${params}`;
      console.log("Fetching approved plans from:", url);

      const response = await fetch(url);
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Received content plans:", data.length, "items");
        if (data.length > 0) {
          console.log("First content plan details:", data[0]);
          console.log("Available fields:", Object.keys(data[0]));
        }
        setContentPlans(data);
      } else {
        const errorText = await response.text();
        console.error("API Error:", response.status, errorText);
      }
    } catch (error) {
      console.error("Error fetching content plans:", error);
    }
  };

  const handleConvert = async () => {
    if (!selectedPlan) return;

    setLoading(true);
    try {
      const inputPlanData = {
        // Basis-Felder
        monat: selectedPlan.monat,
        bezug: selectedPlan.bezug,
        mehrwert: selectedPlan.mehrwert || "",
        mechanikThema: selectedPlan.mechanikThema,
        idee: selectedPlan.idee,
        platzierung: selectedPlan.platzierung,
        
        // Neue Felder vom ContentPlan übernehmen
        implementationLevel: selectedPlan.implementationLevel || null,
        creativeFormat: selectedPlan.creativeFormat || null,
        creativeBriefingExample: selectedPlan.creativeBriefingExample || null,
        copyExample: selectedPlan.copyExample || null,
        copyExampleCustomized: selectedPlan.copyExampleCustomized || null,
        firstCommentForEngagement: selectedPlan.firstCommentForEngagement || null,
        notes: selectedPlan.notes || null,
        action: selectedPlan.action || null,
        
        // Meta-Felder
        status: "DRAFT",
        locationId: selectedPlan.locationId,
        contentPlanId: selectedPlan.id,
        
        // InputPlan spezifische Felder (initial leer)
        zusatzinfo: "",
        gptResult: null,
        n8nResult: null,
        flag: false,
        voe: null,
        voeDate: null,
      };

      // WICHTIG: credentials: 'include' für Cookie-Weiterleitung
      const response = await fetch("/api/inputplan", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json" 
        },
        credentials: "include", // <-- WICHTIG für Session-Cookies
        body: JSON.stringify(inputPlanData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        
        try {
          const errorJson = JSON.parse(errorText);
          throw new Error(errorJson.error || errorText || "Fehler beim Übertragen");
        } catch (e) {
          throw new Error(errorText || "Fehler beim Übertragen");
        }
      }

      const result = await response.json();
      console.log("Success! Created InputPlan:", result);

      alert("Plan erfolgreich in Input-Plan übertragen!");
      onSuccess();
      onClose();
      setSelectedPlan(null);
    } catch (error) {
      console.error("Fehler beim Übertragen:", error);
      let errorMessage = "Unbekannter Fehler";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      alert(`Fehler beim Übertragen: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 dark:text-gray-100">Content-Plan in Input-Plan übertragen</h2>

        {!selectedPlan ? (
          <>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Wählen Sie einen freigegebenen Content-Plan aus, der in einen Input-Plan übertragen werden soll:
            </p>

            {contentPlans.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400 italic">Keine freigegebenen Content-Pläne verfügbar.</p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {contentPlans.map((plan) => (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan)}
                    className="border dark:border-gray-700 rounded-lg p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold dark:text-gray-100">{plan.idee}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          <span className="font-medium">Monat:</span> {plan.monat} |
                          <span className="font-medium ml-2">Standort:</span> {plan.location.name} |
                          <span className="font-medium ml-2">Bezug:</span> {plan.bezug}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <span className="font-medium">Mechanik/Thema:</span> {plan.mechanikThema}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300">
                        Freigegeben
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <>
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-4">
              <h3 className="font-semibold mb-3 dark:text-gray-100">Ausgewählter Content-Plan:</h3>

              {/* Status Badge */}
              <div className="mb-4">
                <span className="px-3 py-1 text-sm rounded-full bg-green-100 dark:bg-green-900/40 text-green-800 dark:text-green-300 font-medium">
                  ✓ Freigegeben
                </span>
              </div>

              {/* Basis-Informationen in Spalten */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Monat</span>
                    <p className="font-medium dark:text-gray-100">{selectedPlan.monat}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Standort</span>
                    <p className="font-medium dark:text-gray-100">{selectedPlan.location.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Bezug</span>
                    <p className="font-medium dark:text-gray-100">{selectedPlan.bezug}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Mechanik/Thema</span>
                    <p className="font-medium dark:text-gray-100">{selectedPlan.mechanikThema}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">Platzierung</span>
                    <p className="font-medium dark:text-gray-100">{selectedPlan.platzierung}</p>
                  </div>
                  {selectedPlan.mehrwert && (
                    <div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Mehrwert</span>
                      <p className="font-medium dark:text-gray-100">{selectedPlan.mehrwert}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Hauptidee */}
              <div className="border-t dark:border-gray-700 pt-4 mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">Idee</span>
                <p className="font-medium mt-1 dark:text-gray-100">{selectedPlan.idee}</p>
              </div>

              {/* Umsetzungsdetails */}
              {(selectedPlan.implementationLevel || selectedPlan.creativeFormat || selectedPlan.action) && (
                <div className="border-t dark:border-gray-700 pt-4 mb-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Umsetzungsdetails</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedPlan.implementationLevel && (
                      <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Umsetzungslevel</span>
                        <p className="font-medium text-sm mt-1 dark:text-gray-100">{selectedPlan.implementationLevel}</p>
                      </div>
                    )}
                    {selectedPlan.creativeFormat && (
                      <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Kreativformat</span>
                        <p className="font-medium text-sm mt-1 dark:text-gray-100">{selectedPlan.creativeFormat}</p>
                      </div>
                    )}
                    {selectedPlan.action && (
                      <div className="bg-white dark:bg-gray-800 rounded-md p-3 border border-gray-200 dark:border-gray-700">
                        <span className="text-xs text-gray-500 dark:text-gray-400">Aktion</span>
                        <p className="font-medium text-sm mt-1 dark:text-gray-100">{selectedPlan.action}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Kreative Inhalte */}
              {(selectedPlan.creativeBriefingExample || selectedPlan.copyExample || 
                selectedPlan.copyExampleCustomized || selectedPlan.firstCommentForEngagement) && (
                <div className="border-t dark:border-gray-700 pt-4">
                  <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Kreative Inhalte</h4>
                  <div className="space-y-3">
                    {selectedPlan.creativeBriefingExample && (
                      <details className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        <summary className="px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm dark:text-gray-100">
                          Kreativ-Briefing Beispiel
                        </summary>
                        <div className="px-4 pb-3 pt-1 text-sm text-gray-700 dark:text-gray-300">
                          {selectedPlan.creativeBriefingExample}
                        </div>
                      </details>
                    )}
                    
                    {selectedPlan.copyExample && (
                      <details className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        <summary className="px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm dark:text-gray-100">
                          Text-Beispiel
                        </summary>
                        <div className="px-4 pb-3 pt-1 text-sm text-gray-700 dark:text-gray-300">
                          {selectedPlan.copyExample}
                        </div>
                      </details>
                    )}
                    
                    {selectedPlan.copyExampleCustomized && (
                      <details className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        <summary className="px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm dark:text-gray-100">
                          Angepasstes Text-Beispiel
                        </summary>
                        <div className="px-4 pb-3 pt-1 text-sm text-gray-700 dark:text-gray-300">
                          {selectedPlan.copyExampleCustomized}
                        </div>
                      </details>
                    )}
                    
                    {selectedPlan.firstCommentForEngagement && (
                      <details className="bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700">
                        <summary className="px-4 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm dark:text-gray-100">
                          Erster Kommentar
                        </summary>
                        <div className="px-4 pb-3 pt-1 text-sm text-gray-700 dark:text-gray-300">
                          {selectedPlan.firstCommentForEngagement}
                        </div>
                      </details>
                    )}
                  </div>
                </div>
              )}

              {/* Notizen */}
              {selectedPlan.notes && (
                <div className="border-t dark:border-gray-700 pt-4 mt-4">
                  <details className="bg-amber-50 dark:bg-amber-900/40 rounded-md border border-amber-200 dark:border-amber-800">
                    <summary className="px-4 py-2 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900/60 font-medium text-sm text-amber-800 dark:text-amber-300">
                      📝 Notizen
                    </summary>
                    <div className="px-4 pb-3 pt-1 text-sm text-gray-700">
                      {selectedPlan.notes}
                    </div>
                  </details>
                </div>
              )}
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/40 border border-blue-200 dark:border-blue-800 rounded-md p-3 mb-4">
              <p className="text-sm text-blue-800 dark:text-blue-300">
                <strong>Hinweis:</strong> Dieser Content-Plan wird als neuer Input-Plan mit Status &quot;Entwurf&quot; erstellt.
              </p>
            </div>
          </>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          {selectedPlan && (
            <button
              onClick={() => setSelectedPlan(null)}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800"
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
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? "Übertrage..." : "In Input-Plan übertragen"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConvertToInputModal;