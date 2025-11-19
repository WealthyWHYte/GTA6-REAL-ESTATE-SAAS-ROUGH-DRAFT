// src/pages/deals/[id].tsx

import { useParams } from "react-router-dom";
import { mockDeals } from "@/src/data/mockDeals";
import { DealAssignModal } from "@/components/modals/DealAssignModal";

export default function DealDetailPage() {
  const { id } = useParams();
  const deal = mockDeals.find((d) => d.id === id);

  if (!deal) return <p className="p-6">Deal not found.</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Deal Image + Status */}
      <div className="relative">
        <img src={deal.image} alt={deal.address} className="w-full h-64 object-cover rounded-xl" />
        <div className="absolute top-4 right-4 bg-green-600 text-white px-3 py-1 rounded-full text-xs shadow-lg">
          🔒 {deal.status || "Under Contract"}
        </div>
      </div>

      {/* Deal Headline */}
      <div>
        <h1 className="text-4xl font-bold">{deal.address}</h1>
        <p className="text-muted-foreground text-xl">${deal.price.toLocaleString()}</p>
      </div>

      {/* Deal Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center text-sm">
        <div className="bg-card p-4 rounded-xl shadow"><strong>Entry Fee</strong><br />💰 ${deal.entryFee.toLocaleString()}</div>
        <div className="bg-card p-4 rounded-xl shadow"><strong>Profit Spread</strong><br />📈 ${deal.estimatedEquity.toLocaleString()}</div>
        <div className="bg-card p-4 rounded-xl shadow"><strong>Monthly Rent</strong><br />🏠 ${deal.estimatedRent.toLocaleString()}</div>
        <div className="bg-card p-4 rounded-xl shadow"><strong>Exit Strategy</strong><br />🛣️ {deal.exitStrategy}</div>
      </div>

      {/* Deal Details */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm border-t pt-4">
        <div>🛏️ Bedrooms: {deal.bedrooms}</div>
        <div>🛁 Bathrooms: {deal.bathrooms}</div>
        <div>📐 Square Feet: {deal.sqft}</div>
        <div>📆 Year Built: {deal.yearBuilt}</div>
        <div>🧱 Rehab: {deal.rehab}</div>
        <div>🧾 Deal Type: {deal.dealType}</div>
      </div>

      {/* Mortgage Info */}
      <div className="border-t pt-4">
        <h2 className="font-bold">🏦 Mortgage Info</h2>
        <ul className="text-sm space-y-1">
          <li>Initial Mortgage: ${deal.originalLoanAmount.toLocaleString()}</li>
          <li>Current Balance: ${deal.currentBalance.toLocaleString()}</li>
          <li>Interest Rate: {deal.interestRate}%</li>
          <li>PITI: ${deal.piti.toLocaleString()}</li>
          <li>
            Statement:{" "}
            <a href={deal.mortgageStatementLink} target="_blank" className="text-accent underline">
              View PDF
            </a>
          </li>
        </ul>
      </div>

      {/* Entry Fee Breakdown */}
      <div className="border-t pt-4">
        <h2 className="font-bold">💸 Entry Fee Breakdown</h2>
        <ul className="text-sm space-y-1 text-muted-foreground">
          <li>• Cash to Seller: ${deal.cashToSeller.toLocaleString()}</li>
          <li>• Arrears/Liens: ${deal.arrears.toLocaleString()}</li>
          <li>• Closing Costs: ${deal.closingCosts.toLocaleString()}</li>
          <li>• Repairs: ${deal.repairs.toLocaleString()}</li>
          <li>• Maintenance/Marketing: ${deal.marketing.toLocaleString()}</li>
        </ul>
      </div>

      {/* Estimated Values */}
      <div className="border-t pt-4">
        <h2 className="font-bold">📊 Estimated Values</h2>
        <p>💰 Estimated Equity: ${deal.estimatedEquity.toLocaleString()}</p>
        <p>📈 Estimated Rent: ${deal.estimatedRent.toLocaleString()}</p>
        <p>🧾 Comps: {deal.comps.join(", ")}</p>
      </div>

      {/* Call-to-Actions */}
      <div className="border-t pt-6 flex flex-wrap gap-4 justify-center">
        <DealAssignModal />
        <button className="btn-vice-orange">📩 Make an Offer</button>
        <button className="btn-vice-cyan">📄 View OM</button>
        <button className="btn-vice-yellow">📅 Book Call</button>
        <button className="btn-outline">⬇️ Download Summary</button>
      </div>
    </div>
  );
}
