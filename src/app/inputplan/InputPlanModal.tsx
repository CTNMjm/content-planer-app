"use client";

import { useState } from "react";

type InputPlan = {
  id?: string;
  monat: string;
  bezug: string;
  mechanikThema: string;
  idee: string;
  mehrwert?: string;
  platzierung: string;
  status: string;
  voe?: string;  // ÄNDERUNG: von veröffentlichkeitsdatum zu voe
  zusatzinfo?: string;
  gptResult?: string;
  locationId?: string;
};

type Props = {
  item: InputPlan | null;
  onClose: (updated: boolean) => void;
};

export default function InputPlanModal({ item, onClose }: Props) {
  const [form, setForm] = useState<InputPlan>(
    item || {
      monat: "",
      bezug: "",
      mechanikThema: "",
      idee: "",
      mehrwert: "",
      platzierung: "",
      status: "DRAFT",
      voe: "",  // ÄNDERUNG: von veröffentlichkeitsdatum zu voe
      zusatzinfo: "",
      gptResult: "",
      locationId: ""
    }
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    // Simple validation
    if (!form.monat || !form.bezug || !form.mechanikThema || !form.idee || !form.platzierung) {
      setError("Bitte alle Pflichtfelder ausfüllen.");
      setLoading(false);
      return;
    }

    try {
      const method = item ? "PUT" : "POST";
      const url = item ? `/api/inputplan/${item.id}` : "/api/inputplan";
      
      // Bereite die Daten vor - entferne undefined Werte
      const dataToSend = {
        monat: form.monat,
        bezug: form.bezug,
        mechanikThema: form.mechanikThema,
        idee: form.idee,
        mehrwert: form.mehrwert || "",
        platzierung: form.platzierung,
        status: form.status,
        zusatzinfo: form.zusatzinfo || "",
        gptResult: form.gptResult || null,
        locationId: form.locationId || undefined,
        // WICHTIG: Konvertiere zu ISO-8601 DateTime
        voe: form.voe ? new Date(form.voe).toISOString() : null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Fehler beim Speichern");
      }

      onClose(true);
    } catch (error) {
      setError(error instanceof Error ? error.message : "Ein Fehler ist aufgetreten");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">
          {item ? "InputPlan-Eintrag bearbeiten" : "Neuer InputPlan-Eintrag"}
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
              <label className="font-medium">VÖ-Datum</label>
              <input
                type="date"
                name="voe"
                value={form.voe ? form.voe.slice(0, 10) : ""}
                onChange={handleChange}
                className="w-full border rounded px-2 py-1"
              />
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
          <div>
            <label className="font-medium">Zusatzinfo/Briefing</label>
            <textarea
              name="zusatzinfo"
              value={form.zusatzinfo}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 min-h-[40px]"
              placeholder="optional"
            />
          </div>
          <div>
            <label className="font-medium">AI-Text (nur lesbar)</label>
            <textarea
              name="gptResult"
              value={form.gptResult || ""}
              readOnly
              className="w-full border bg-gray-100 rounded px-2 py-1 min-h-[40px]"
              placeholder="Hier erscheint der KI-optimierte Text, falls vorhanden."
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
              className="bg-emerald-600 text-white rounded px-4 py-2"
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
