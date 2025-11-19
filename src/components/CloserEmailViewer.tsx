// src/components/CloserEmailViewer.tsx

export default function CloserEmailViewer({ url }) {
  if (!url) return <p>No email thread linked yet.</p>;

  return (
    <iframe
      src={url}
      className="w-full h-[600px] rounded-xl border"
      title="Agent Email Thread"
    />
  );
}
