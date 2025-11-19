export default function HeistMeter({ closedEquity = 3_200_000 }) {
  const percent = Math.min((closedEquity / 100_000_000) * 100, 100);

  return (
    <div className="bg-zinc-800 rounded-full w-full h-6 overflow-hidden shadow-inner mb-4">
      <div
        style={{ width: `${percent}%` }}
        className="bg-vice-cyan h-full transition-all duration-700"
      />
      <p className="text-xs text-center mt-1 font-mono">
        💰 ${closedEquity.toLocaleString()} / $100M
      </p>
    </div>
  );
}
