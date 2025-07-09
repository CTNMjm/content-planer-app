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
    if (isOpen && redakPlanId) {
      fetchHistory();
    }
  }, [isOpen, redakPlanId]);

  const fetchHistory = async () => {
    const response = await fetch(`/api/redakplan/${redakPlanId}/history`);
    if (!response.ok) return;
    const data = await response.json();
    setHistory(data);
  };

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
            {history.map((entry) => (
              <div key={entry.id}>
                {/* Felder wie entry.fieldName, entry.oldValue, entry.newValue, entry.changedBy?.name usw. */}
              </div>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}