"use client";

import { useState, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { ContentStatus } from "@prisma/client";

interface ExportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  locationId?: string;
}

export default function ContentPlanExportDialog({ isOpen, onClose, locationId }: ExportDialogProps) {
  const [filters, setFilters] = useState({
    status: "all",
    monat: "all",
    fields: {
      monat: true,
      bezug: true,
      mehrwert: true,
      mechanikThema: true,
      idee: true,
      platzierung: true,
      implementationLevel: true,
      creativeFormat: true,
      creativeBriefingExample: true,
      copyExample: true,
      copyExampleCustomized: true,
      firstCommentForEngagement: true,
      notes: true,
      action: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    }
  });

  const handleExport = async () => {
    try {
      const params = new URLSearchParams({
        ...(locationId && { locationId }),
        status: filters.status,
        monat: filters.monat,
        fields: Object.keys(filters.fields).filter(key => filters.fields[key as keyof typeof filters.fields]).join(',')
      });

      const response = await fetch(`/api/contentplan/export?${params}`);
      const blob = await response.blob();
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `content-plan-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      
      onClose();
    } catch (error) {
      console.error("Export error:", error);
    }
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Content Plan exportieren
                </Dialog.Title>

                <div className="space-y-4">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                    <select 
                      value={filters.status} 
                      onChange={(e) => setFilters({...filters, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Alle</option>
                      <option value={ContentStatus.DRAFT}>Entwurf</option>
                      <option value={ContentStatus.IN_PROGRESS}>In Bearbeitung</option>
                      <option value={ContentStatus.REVIEW}>Review</option>
                      <option value={ContentStatus.APPROVED}>Genehmigt</option>
                      <option value={ContentStatus.COMPLETED}>Abgeschlossen</option>
                    </select>
                  </div>

                  {/* Monat Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monat</label>
                    <select 
                      value={filters.monat} 
                      onChange={(e) => setFilters({...filters, monat: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="all">Alle</option>
                      {["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"].map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>

                  {/* Felder Auswahl */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Zu exportierende Felder</label>
                    <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border border-gray-200 rounded">
                      {Object.entries(filters.fields).map(([field, checked]) => (
                        <label key={field} className="flex items-center space-x-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={(e) => 
                              setFilters({
                                ...filters, 
                                fields: {...filters.fields, [field]: e.target.checked}
                              })
                            }
                            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <span className="text-sm">{field}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-6">
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={onClose}
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      onClick={handleExport}
                    >
                      Exportieren
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