"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { useRouter } from "next/navigation";

interface ImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locationId?: string;
}

export default function ContentPlanImportDialog({ isOpen, onClose, locationId }: ImportDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === "text/csv") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Bitte wählen Sie eine CSV-Datei aus.");
    }
  };

  const handleImport = async () => {
    if (!file || !locationId) {
      setError("Bitte wählen Sie zuerst einen Standort im Filter aus.");
      return;
    }

    setImporting(true);
    setError("");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("locationId", locationId);

    try {
      const response = await fetch("/api/contentplan/import", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Import fehlgeschlagen");
      }

      alert(`Erfolgreich ${data.imported} Einträge importiert!`);
      router.refresh();
      onClose();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Import fehlgeschlagen");
    } finally {
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const template = `monat,bezug,mehrwert,mechanikThema,idee,platzierung,implementationLevel,creativeFormat,creativeBriefingExample,copyExample,copyExampleCustomized,firstCommentForEngagement,notes,action,status
Januar,Bezug 1,Mehrwert 1,Mechanik 1,Idee 1,Platzierung 1,Level 1,Format 1,Briefing 1,Copy 1,Custom Copy 1,Kommentar 1,Notizen 1,Aktion 1,DRAFT
Februar,Bezug 2,Mehrwert 2,Mechanik 2,Idee 2,Platzierung 2,Level 2,Format 2,Briefing 2,Copy 2,Custom Copy 2,Kommentar 2,Notizen 2,Aktion 2,IN_PROGRESS`;

    const blob = new Blob([template], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "content-plan-template.csv";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 dark:text-gray-100 mb-4"
                >
                  Content Plan importieren
                </Dialog.Title>

                <div className="space-y-4">
                  <div>
                    <button
                      onClick={downloadTemplate}
                      className="w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      📥 Vorlage herunterladen
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">CSV-Datei auswählen</label>
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileChange}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 rounded-md"
                    />
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-md text-sm">
                      {error}
                    </div>
                  )}

                  <div className="bg-blue-50 dark:bg-blue-900/40 p-4 rounded-md text-sm dark:text-blue-300">
                    <p className="font-semibold mb-2">Wichtige Hinweise:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Die CSV-Datei muss UTF-8 kodiert sein</li>
                      <li>Die erste Zeile muss die Spaltenüberschriften enthalten</li>
                      <li>Status-Werte: DRAFT, IN_PROGRESS, REVIEW, APPROVED, COMPLETED</li>
                      <li>Pflichtfelder: monat, bezug, mechanikThema, idee, platzierung</li>
                      <li className="text-red-600 dark:text-red-400 font-semibold">Wählen Sie einen Standort im Filter aus!</li>
                    </ul>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={onClose}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleImport}
                      disabled={!file || importing || !locationId}
                    >
                      {importing ? "Importiere..." : "Importieren"}
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