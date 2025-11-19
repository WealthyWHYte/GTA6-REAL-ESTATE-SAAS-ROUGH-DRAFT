// src/components/CloserDealList.tsx

export default function CloserDealList({ deals, onSelect }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {deals.map((deal) => (
        <div
          key={deal.id}
          onClick={() => onSelect(deal)}
          className="bg-card p-4 rounded-xl shadow hover:scale-[1.01] transition cursor-pointer"
        >
          <h2 className="font-bold text-lg">{deal.address}</h2>
          <p className="text-sm text-muted-foreground">${deal.price.toLocaleString()}</p>
          <p className="text-xs text-accent">{deal.status}</p>
        </div>
      ))}
    </div>
  );
}
