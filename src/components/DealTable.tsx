// src/components/DealTable.tsx 

export default function DealTable({ deals }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {deals.map((deal, i) => (
        <div key={i} className="bg-card p-4 rounded-xl shadow space-y-2">
          <h2 className="text-lg font-bold">{deal.address}</h2>
          <p>{deal.state}, {deal.city} | ${deal.price}</p>
          <p>Type: {deal.dealType}</p>
          <button className="btn-vice-cyan">📨 Open Thread</button>
          <button className="btn-vice-orange">📝 Mark Under Contract</button>
        </div>
      ))}
    </div>
  );
}
