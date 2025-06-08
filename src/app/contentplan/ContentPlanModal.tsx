"use client";

import { useEffect, useState } from "react";

type ContentPlan = {
  id?: string;
  monat: string;
  bezug: string;
  mechanikThema: string;
  idee: string;
  mehrwert?: string;
  platzierung: string;
  status: string;
  locationId?: string;
};

type Props = {
  item: ContentPlan | null;
  onClose: (updated: boolean) => void;
};

export default function ContentPlanModal({ item, onClose }: Props) {
  const [form, setForm] = useState<ContentPlan>(
    item || {
      monat: "",
      bezug: "",
      mechanikThema: "",
      idee: "",
      mehrwert: "",
      platzierung: "",
      status: "DRAFT",
      locationId: ""
    }
  );
  const [locations, setLocations] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Standorte für Auswahl laden
  useEffect(() => {
    fetch("/api/locations")
      .then(res => res.json())
      .then(data => setLocations(data));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Validation (kann erweitert werden)
    if (!form.monat || !form.bezug || !form.mechanikThema || !form.idee || !form.platzierung || !form.locationId) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      setLoading(false);
      return;
    }

    try {
      const method = item ? "PUT" : "POST";
      const url = item ? `/api/contentplan/${item.id}` : "/api/contentplan";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      setLoading(false);
      if (res.ok) {
        onClose(true);
      } else {
        setError("Fehler beim Speichern");
      }
    } catch {
      setError("Fehler beim Speichern");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">
          {item ? "Content-Idee bearbeiten" : "Neue Content-Idee"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Monat *</label>
              <input
                name="monat"
                value={form.monat}
                onChange={handleChange}
                required
                className="w-full border rounded px-2 py-1"
                placeholder="z.B. Juli"
              />
            </div>
            <div>
              <label className="font-medium">Bezug *</label>
              <input
                name="bezug"
                value={form.bezug}
                onChange={handleChange}
                required
                className="w-full border rounded px-2 py-1"
                placeholder="z.B. Event"
              />
            </div>
            <div>
              <label className="font-medium">Mechanik/Thema *</label>
              <input
                name="mechanikThema"
                value={form.mechanikThema}
                onChange={handleChange}
                required
                className="w-full border rounded px-2 py-1"
                placeholder="z.B. Summer Vibes"
              />
            </div>
            <div>
              <label className="font-medium">Platzierung *</label>
              <input
                name="platzierung"
                value={form.platzierung}
                onChange={handleChange}
                required
                className="w-full border rounded px-2 py-1"
                placeholder="z.B. Instagram"
              />
            </div>
            <div>
              <label className="font-medium">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              >
                <option value="DRAFT">Entwurf</option>
                <option value="APPROVED">Bereit</option>
                <option value="IN_PROGRESS">In Arbeit</option>
                <option value="COMPLETED">Abgeschlossen</option>
              </select>
            </div>
            <div>
              <label className="font-medium">Mehrwert</label>
              <input
                name="mehrwert"
                value={form.mehrwert}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
                placeholder="optional"
              />
            </div>
            <div>
              <label className="font-medium">Standort *</label>
              <select
                name="locationId"
                value={form.locationId}
                onChange={handleChange}
                required
                className="w-full border rounded px-2 py-1"
              >
                <option value="">Standort wählen…</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.id}>{loc.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="font-medium">Idee *</label>
            <textarea
              name="idee"
              value={form.idee}
              onChange={handleChange}
              required
              className="w-full border rounded px-2 py-1 min-h-[60px]"
              placeholder="z.B. Was glaubst du, was der Artikel kostet? ..."
            />
          </div>
          {error && <div className="text-red-600 bg-red-50 px-3 py-2 rounded">{error}</div>}
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              onClick={() => onClose(false)}
              className="bg-gray-200 rounded px-4 py-2"
              disabled={loading}
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="bg-violet-600 text-white rounded px-4 py-2"
              disabled={loading}
            >
              {loading ? "Speichert..." : "Speichern"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
