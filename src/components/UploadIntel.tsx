import { useState } from "react";

export default function UploadIntel({ onUpload }) {
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    setFileName(file.name);
    const text = await file.text();
    const rows = text.split("\n").map((row) => row.split(","));
    onUpload(rows); // 🔁 Call parent with parsed rows
  };

  return (
    <div className="p-4 bg-zinc-900 rounded-xl shadow mb-6">
      <label className="text-sm font-bold block mb-2">📤 Upload Lead CSV</label>
      <input
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="bg-zinc-800 text-white rounded p-2"
      />
      {fileName && <p className="text-sm mt-2">Uploaded: {fileName}</p>}
    </div>
  );
}
// src/components/UploadIntel.tsx
