"use client";

import { Fragment, useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { toast } from "react-hot-toast";

interface InputPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  inputPlan?: any;
  contentPlan?: any;
  locations: any[];
}

export function InputPlanModal({
  isOpen,
  onClose,
  onSave,
  inputPlan,
  contentPlan,
  locations,
}: InputPlanModalProps) {
  const [formData, setFormData] = useState({
    monat: "",
    bezug: "",
    mehrwert: "",
    mechanikThema: "",
    idee: "",
    platzierung: "",
    status: "DRAFT",
    voe: "",
    zusatzinfo: "",
    gptResult: "",
    locationId: "",
    contentPlanId: "",
  });

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (inputPlan) {
      // Bearbeiten eines bestehenden InputPlans
      setFormData({
        monat: inputPlan.monat || "",
        bezug: inputPlan.bezug || "",
        mehrwert: inputPlan.mehrwert || "",
        mechanikThema: inputPlan.mechanikThema || "",
        idee: inputPlan.idee || "",
        platzierung: inputPlan.platzierung || "",
        status: inputPlan.status || "DRAFT",
        voe: inputPlan.voe ? new Date(inputPlan.voe).toISOString().split("T")[0] : "",
        zusatzinfo: inputPlan.zusatzinfo || "",
        gptResult: inputPlan.gptResult || "",
        locationId: inputPlan.locationId || "",
        contentPlanId: inputPlan.contentPlanId || "",
      });
    } else if (contentPlan) {
      // Neuen InputPlan basierend auf ContentPlan erstellen
      setFormData({
        monat: contentPlan.monat || "",
        bezug: contentPlan.bezug || "",
        mehrwert: contentPlan.mehrwert || "",
        mechanikThema: contentPlan.mechanikThema || "",
        idee: contentPlan.idee || "",
        platzierung: contentPlan.platzierung || "",
        status: "DRAFT",
        voe: "",
        zusatzinfo: "",
        gptResult: "",
        locationId: contentPlan.locationId || "",
        contentPlanId: contentPlan.id || "",
      });
    } else {
      // Komplett neuer InputPlan
      setFormData({
        monat: "",
        bezug: "",
        mehrwert: "",
        mechanikThema: "",
        idee: "",
        platzierung: "",
        status: "DRAFT",
        voe: "",
        zusatzinfo: "",
        gptResult: "",
        locationId: locations[0]?.id || "",
        contentPlanId: "",
      });
    }
  }, [inputPlan, contentPlan, locations]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const url = inputPlan
        ? `/api/inputplan/${inputPlan.id}`
        : "/api/inputplan";
      const method = inputPlan ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Fehler beim Speichern");
      }

      toast.success(
        inputPlan
          ? "Input-Plan erfolgreich aktualisiert"
          : "Input-Plan erfolgreich erstellt"
      );
      onSave();
      onClose();
    } catch (error) {
      console.error("Error saving input plan:", error);
      toast.error("Fehler beim Speichern des Input-Plans");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Grüner Header */}
                <div className="bg-green-600 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <Dialog.Title className="text-xl font-semibold text-white">
                      {inputPlan ? "Input-Plan bearbeiten" : "Neuer Input-Plan"}
                    </Dialog.Title>
                    <button
                      onClick={onClose}
                      className="text-white hover:text-gray-200 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Monat
                      </label>
                      <input
                        type="text"
                        name="monat"
                        value={formData.monat}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bezug
                      </label>
                      <input
                        type="text"
                        name="bezug"
                        value={formData.bezug}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mehrwert
                    </label>
                    <input
                      type="text"
                      name="mehrwert"
                      value={formData.mehrwert}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mechanik/Thema
                    </label>
                    <input
                      type="text"
                      name="mechanikThema"
                      value={formData.mechanikThema}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Idee
                    </label>
                    <textarea
                      name="idee"
                      value={formData.idee}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Platzierung
                      </label>
                      <input
                        type="text"
                        name="platzierung"
                        value={formData.platzierung}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="DRAFT">Entwurf</option>
                        <option value="IN_PROGRESS">In Bearbeitung</option>
                        <option value="REVIEW">Überprüfung</option>
                        <option value="APPROVED">Freigegeben</option>
                        <option value="COMPLETED">Abgeschlossen</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Veröffentlichungsdatum
                      </label>
                      <input
                        type="date"
                        name="voe"
                        value={formData.voe}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Standort
                      </label>
                      <select
                        name="locationId"
                        value={formData.locationId}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Bitte wählen</option>
                        {locations.map((location) => (
                          <option key={location.id} value={location.id}>
                            {location.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Zusatzinformationen
                    </label>
                    <textarea
                      name="zusatzinfo"
                      value={formData.zusatzinfo}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Weitere Informationen zum Plan..."
                    />
                  </div>

                  {formData.gptResult && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        AI-Generierter Content
                      </label>
                      <textarea
                        name="gptResult"
                        value={formData.gptResult}
                        onChange={handleChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-gray-50"
                        readOnly
                      />
                    </div>
                  )}

                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="px-4 py-2 text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400 rounded-md transition-colors"
                    >
                      {isLoading ? "Speichern..." : inputPlan ? "Speichern" : "Erstellen"}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}