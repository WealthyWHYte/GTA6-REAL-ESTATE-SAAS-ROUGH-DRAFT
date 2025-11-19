// src/components/CloserNotes.tsx

import { useState } from "react";

export default function CloserNotes({ dealId, savedNotes, onSave }) {
  const [note, setNote] = useState("");

  return (
    <div className="space-y-2">
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="w-full border p-2 rounded-md"
        placeholder="Add internal note..."
      />
      <button
        onClick={() => {
          onSave(dealId, note);
          setNote("");
        }}
        className="btn-vice-cyan"
      >
        💾 Save Note
      </button>

      <ul className="text-sm mt-4 space-y-1">
        {(savedNotes[dealId] || []).map((n, i) => (
          <li key={i}>• {n}</li>
        ))}
      </ul>
    </div>
  );
}
