// src/components/StatsBar.tsx

export default function StatsBar({ deals }) {
  const totalDeals = deals.length;

  const wholesalers = deals.reduce((acc, deal) => {
    const wholesaler = deal.wholesaler || "Unknown";
    acc[wholesaler] = (acc[wholesaler] || 0) + 1;
    return acc;
  }, {});

  const mostActiveWholesaler = Object.entries(wholesalers).sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

  const totalProfits = deals.reduce((acc, deal) => acc + (deal.assignmentProfit || 0), 0);

  const totalInquiries = deals.reduce((acc, deal) => acc + (deal.buyerInquiries || 0), 0);

  return (
    <div className="bg-zinc-800 text-white p-4 rounded-xl shadow mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
      <div>
        <p className="text-lg font-bold">{totalDeals}</p>
        <p className="text-sm text-muted-foreground">Deals Posted</p>
      </div>
      <div>
        <p className="text-lg font-bold">{mostActiveWholesaler}</p>
        <p className="text-sm text-muted-foreground">Most Active Wholesaler</p>
      </div>
      <div>
        <p className="text-lg font-bold">${totalProfits.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground">Total Assignment Profits</p>
      </div>
      <div>
        <p className="text-lg font-bold">{totalInquiries}</p>
        <p className="text-sm text-muted-foreground">Buyer Inquiries</p>
      </div>
    </div>
  );
}
