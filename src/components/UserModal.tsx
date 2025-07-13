"use client";

import { useState, useEffect, Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface Location {
  id: string;
  name: string;
}

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  user: any | null;
}

interface FormData {
  name: string;
  email: string;
  password?: string;
  role: string;
  locationId: string;
  isActive: boolean;
  limitedLocations: boolean; // <--- NEU
}

export function UserModal({ isOpen, onClose, onSave, user }: UserModalProps) {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    password: "",
    role: "USER",
    locationId: "",
    isActive: true,
    limitedLocations: false, // <--- NEU
  });

  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState<string[]>([]);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        name: user.name || "",
        password: "",
        role: user.role,
        locationId: user.locationId || "",
        isActive: user.isActive ?? true,
        limitedLocations: user.limitedLocations ?? false, // <--- NEU
      });
    } else {
      setFormData({
        email: "",
        name: "",
        password: "",
        role: "USER",
        locationId: "",
        isActive: true,
        limitedLocations: false, // <--- NEU
      });
    }
  }, [user]);

  // Lade alle Standorte
  useEffect(() => {
    if (!isOpen) return;
    fetch("/api/locations")
      .then((res) => res.json())
      .then((data) => setLocations(data || []));
  }, [isOpen]);

  // Setze vorausgewählte Standorte beim Editieren
  useEffect(() => {
    if (user && user.userLocations) {
      setSelectedLocationIds(user.userLocations.map((ul: any) => ul.location.id));
    } else {
      setSelectedLocationIds([]);
    }
  }, [user]);

  // Beim Speichern Standorte mitsenden
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validierung
    if (!formData.email) {
      alert("E-Mail ist erforderlich");
      return;
    }

    if (!user && !formData.password) {
      alert("Passwort ist erforderlich für neue Benutzer");
      return;
    }

    // Wenn kein Passwort beim Edit, dann nicht senden
    const dataToSend = { ...formData, locationIds: selectedLocationIds };
    if (user && !formData.password) {
      delete dataToSend.password;
    }

    onSave(dataToSend);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-white px-6 pb-6 pt-6 sm:p-8 sm:pb-6 rounded-lg shadow-md">
                    <div className="sm:flex sm:items-start">
                      <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                        <Dialog.Title as="h3" className="text-xl font-semibold leading-6 text-gray-900 mb-6">
                          {user ? "Benutzer bearbeiten" : "Neuer Benutzer"}
                        </Dialog.Title>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              E-Mail *
                            </label>
                            <input
                              type="email"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base px-4 py-3"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Name
                            </label>
                            <input
                              type="text"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base px-4 py-3"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Passwort {!user && "*"}
                            </label>
                            <input
                              type="password"
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base px-4 py-3"
                              placeholder={user ? "Leer lassen für keine Änderung" : ""}
                              required={!user}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Rolle *
                            </label>
                            <select
                              value={formData.role}
                              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                              className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base px-4 py-3"
                            >
                              <option value="USER">Kunde</option>
                              <option value="AGENTUR">Agentur</option>
                              <option value="ADMIN">Admin</option>
                            </select>
                          </div>
                          <div className="flex items-center space-x-3 col-span-2">
                            <input
                              type="checkbox"
                              checked={formData.isActive}
                              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                              className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="block text-base text-gray-900">
                              Aktiv
                            </label>
                          </div>
                          <div className="flex items-center space-x-3 col-span-2">
                            <input
                              type="checkbox"
                              checked={formData.limitedLocations}
                              onChange={(e) => setFormData({ ...formData, limitedLocations: e.target.checked })}
                              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label className="block text-base text-gray-900">
                              Nur explizit zugewiesene Standorte anzeigen (limitedLocations)
                            </label>
                          </div>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Zugewiesene Standorte
                          </label>
                          <select
                            multiple
                            value={selectedLocationIds}
                            onChange={e => {
                              const options = Array.from(e.target.selectedOptions).map(opt => opt.value);
                              setSelectedLocationIds(options);
                            }}
                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500 text-base px-4 py-3 h-40 bg-white"
                          >
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.name}
                              </option>
                            ))}
                          </select>
                          <div className="text-xs text-gray-500 mt-1">
                            Mit Strg/Cmd oder Shift mehrere auswählen
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-6 py-4 sm:flex sm:flex-row-reverse sm:px-8 rounded-b-lg">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-base font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto"
                    >
                      Speichern
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                      onClick={onClose}
                    >
                      Abbrechen
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}