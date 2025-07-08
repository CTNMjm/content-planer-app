import React, { useEffect, useState } from "react";

interface HistoryEntry {
  id: string;
  redakPlanId: string;
  changedAt: string;
  changedBy?: { id: string; name: string };
  action: string;
  fieldName?: string;
  oldValue?: string;
  newValue?: string;
  metadata?: Record<string, any>;
}

interface RedakPlanHistoryProps {
  redakPlanId: string;
  isOpen: boolean;
  onClose: () => void;
}

export default function RedakPlanHistory({ redakPlanId, isOpen, onClose }: RedakPlanHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !redakPlanId) return;
    setLoading(true);
    fetch(`/api/redakplan/${redakPlanId}/history`)
      .then(res => res.json())
      .then(setHistory)
      .finally(() => setLoading(false));
  }, [isOpen, redakPlanId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded shadow-lg max-w-lg w-full p-6 relative">
        <button className="absolute top-2 right-2 text-gray-500" onClick={onClose}>✕</button>
        <h2 className="text-lg font-semibold mb-4">Historie</h2>
        {loading ? (
          <div>Lade Historie...</div>
        ) : (
          <ul className="space-y-3 max-h-96 overflow-y-auto">
            {history.length === 0 && <li className="text-gray-500">Keine Änderungen gefunden.</li>}
            {history.map(entry => (
              <li key={entry.id} className="border-b pb-2">
                <div className="text-xs text-gray-500">
                  {entry.changedAt && new Date(entry.changedAt).toLocaleString("de-DE")}
                  {entry.changedBy && <> – {entry.changedBy.name}</>}
                </div>
                <div className="text-sm font-medium">{entry.action}</div>
                <div className="text-xs text-gray-700">
                  {entry.fieldName && <><span className="font-semibold">{entry.fieldName}:</span> </>}
                  {entry.oldValue && <span className="line-through text-red-500">{entry.oldValue}</span>}
                  {entry.newValue && <span className="text-green-500">{entry.newValue}</span>}
                </div>
                {entry.metadata && (
                  <pre className="text-xs bg-gray-100 rounded p-2 mt-1 overflow-x-auto">
                    {JSON.stringify(entry.metadata, null, 2)}
                  </pre>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}