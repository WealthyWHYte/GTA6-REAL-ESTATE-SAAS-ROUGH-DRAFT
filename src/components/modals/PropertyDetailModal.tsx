import { useState } from "react"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, DollarSign, Mail, Phone, Building, User, Copy, BarChart3 } from "lucide-react"
import { useNavigate } from "react-router-dom"

interface PropertyDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Record<string, unknown> | null
  marketContext?: { comp_avg_ppsqft?: number; median_price?: number; avg_dom?: number } | null
}

export default function PropertyDetailModal({ open, onOpenChange, property, marketContext }: PropertyDetailModalProps) {
  const [activeTab, setActiveTab] = useState("overview")
  const navigate = useNavigate()
  if (!property) return null

  const fmt = (n: number | null | undefined) => {
    if (!n || n === 0) return "-"
    if (n >= 1000000) return "$" + (n / 1000000).toFixed(2) + "M"
    if (n >= 1000) return "$" + Math.round(n / 1000) + "K"
    return "$" + n.toLocaleString()
  }

  const listPrice = Number(property.listing_price) || 0
  const estValue = Number(property.estimated_value) || 0
  const mortgage = Number(property.open_mortgage_balance) || 0
  const sqft = Number(property.sqft) || 0
  const dom = Number(property.days_on_market) || 0
  const equity = estValue > 0 ? estValue - mortgage : Number(property.estimated_equity) || 0
  const equityPct = listPrice > 0 ? Math.round((equity / listPrice) * 100) : 0
  const compPPSqft = marketContext?.comp_avg_ppsqft || 0
  const arv = compPPSqft && sqft ? compPPSqft * sqft : estValue
  const valueGapPct = arv > 0 && listPrice > 0 ? Math.round(((arv - listPrice) / listPrice) * 100) : 0
  const isFreeAndClear = !mortgage || mortgage === 0
  const isMotivated = dom >= 90
  const isSubjectTo = mortgage > 0 && equity > 0

  // Entry fee
  const cashToSeller = Math.round(listPrice * 0.03)
  const agentCommission = Math.round(listPrice * 0.03)
  const payMyself = Math.round(listPrice * 0.03)
  const closingCosts = Math.round(listPrice * 0.02)
  const renovation = Number(property.estimated_repairs) || 10000
  const totalEntryFee = cashToSeller + agentCommission + payMyself + closingCosts + renovation + 4000
  const entryFeePct = listPrice > 0 ? Math.round((totalEntryFee / listPrice) * 100) : 0

  let dealScore = 50
  if (valueGapPct > 20) dealScore += 20
  if (valueGapPct > 40) dealScore += 10
  if (dom >= 90) dealScore += 15
  if (dom >= 180) dealScore += 5
  if (equityPct >= 40) dealScore += 10
  if (isFreeAndClear) dealScore += 5
  dealScore = Math.min(100, dealScore)

  const recommendation = isFreeAndClear
    ? "Seller Finance — No existing mortgage. Negotiate 0% down, seller holds note at <5% for 40+ years."
    : isSubjectTo
    ? "Subject-To — Take over existing " + fmt(mortgage) + " mortgage + negotiate seller finance for equity gap."
    : isMotivated
    ? "Wholesale Target — " + dom + " days DOM signals motivation. Push hard for 70% + terms."
    : "Negotiate terms based on equity position and seller motivation."

  const goToEmail = () => { onOpenChange(false); navigate("/agent/email-closer", { state: { property, selected_level: 3 } }) }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            {property.address as string}
            <span className="text-sm font-normal text-slate-500">{property.city as string}, {property.state as string} {property.zip as string}</span>
          </DialogTitle>
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <Badge variant="secondary">{property.pipeline_status as string || "scouted"}</Badge>
            {isMotivated && <Badge className="bg-red-500">🔥 {dom}d DOM</Badge>}
            {isFreeAndClear && <Badge className="bg-green-600">Free & Clear</Badge>}
            {isSubjectTo && <Badge className="bg-blue-600">Subject-To</Badge>}
            <span className="ml-auto text-sm font-bold text-purple-700">Deal Score: {dealScore}/100</span>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 w-full">
            <TabsTrigger value="overview" className="text-xs">📋 Overview</TabsTrigger>
            <TabsTrigger value="underwriting" className="text-xs">💰 Underwriting</TabsTrigger>
            <TabsTrigger value="market" className="text-xs">📊 Market</TabsTrigger>
            <TabsTrigger value="contact" className="text-xs">📞 Contact</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-green-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">List Price</div>
                <div className="text-xl font-bold text-green-700">{fmt(listPrice)}</div>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">Est. Value / ARV</div>
                <div className="text-xl font-bold text-blue-700">{fmt(arv || estValue)}</div>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">Equity Position</div>
                <div className="text-xl font-bold text-purple-700">{fmt(equity)}</div>
                <div className="text-xs text-slate-400">{equityPct}% of list</div>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {[["Beds", property.bedrooms], ["Baths", property.bathrooms], ["Sqft", sqft > 0 ? sqft.toLocaleString() : "-"], ["Year", property.year_built]].map(([l, v]) => (
                <div key={String(l)} className="p-2 bg-slate-50 rounded text-center">
                  <div className="text-xs text-slate-500">{String(l)}</div>
                  <div className="font-bold">{String(v || "-")}</div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2 bg-slate-50 rounded"><div className="text-xs text-slate-500">DOM</div><div className={`font-bold ${dom >= 90 ? "text-red-600" : ""}`}>{dom > 0 ? dom + "d" : "-"}</div></div>
              <div className="p-2 bg-slate-50 rounded"><div className="text-xs text-slate-500">Mortgage</div><div className="font-bold">{mortgage > 0 ? fmt(mortgage) : "Free & Clear"}</div></div>
              <div className="p-2 bg-slate-50 rounded"><div className="text-xs text-slate-500">$/Sqft</div><div className="font-bold">{sqft > 0 && listPrice > 0 ? "$" + Math.round(listPrice / sqft) : "-"}</div></div>
            </div>
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="text-xs font-bold text-yellow-800 mb-1">🧠 Strategy Recommendation</div>
              <div className="text-sm text-yellow-900">{recommendation}</div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div><span className="text-slate-500">County: </span><span className="font-medium">{String(property.county || "-")}</span></div>
              <div><span className="text-slate-500">Lot: </span><span className="font-medium">{property.lot_sqft ? Number(property.lot_sqft).toLocaleString() + " sqft" : "-"}</span></div>
              <div><span className="text-slate-500">Property Use: </span><span className="font-medium">{String(property.property_use || "-")}</span></div>
              <div><span className="text-slate-500">Tax: </span><span className="font-medium">{property.tax_amount ? fmt(Number(property.tax_amount)) : "-"}</span></div>
            </div>
          </TabsContent>

          <TabsContent value="underwriting" className="mt-4 space-y-4">
            <div className="p-3 bg-slate-50 rounded-lg text-sm">
              <div className="font-semibold mb-2">Entry Fee Breakdown</div>
              {[["Cash to Seller (3%)", cashToSeller], ["Agent Commission (3%)", agentCommission], ["Pay Myself / Acquisition (3%)", payMyself], ["Close Escrow (2%)", closingCosts], ["Renovation Estimate", renovation], ["Maintenance + Marketing", 4000]].map(([l, v]) => (
                <div key={String(l)} className="flex justify-between py-0.5"><span className="text-slate-600">{String(l)}</span><span className="font-medium">{fmt(Number(v))}</span></div>
              ))}
              <div className="flex justify-between border-t pt-1 font-bold">
                <span>Total Entry Fee</span>
                <span className={entryFeePct < 10 ? "text-green-600" : entryFeePct < 20 ? "text-yellow-600" : "text-red-600"}>{fmt(totalEntryFee)} ({entryFeePct}%) {entryFeePct < 10 ? "🔥 Steal" : entryFeePct < 20 ? "✅ Good" : "⚠️ Pass"}</span>
              </div>
            </div>

            <div className="p-4 border-2 border-red-200 bg-red-50 rounded-lg">
              <div className="flex justify-between items-center mb-2"><span className="font-bold text-red-700">Level 1 — Negotiation Anchor</span><Badge className="bg-red-600">70% + Terms</Badge></div>
              <div className="text-2xl font-bold text-red-800">{fmt(Math.round(listPrice * 0.7))}</div>
              <div className="text-xs text-red-600 mt-1">Low ball offer for counter positioning. Never expect acceptance — use for leverage.</div>
              <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                <div>Rate Target: <span className="font-bold">{"< 5%"}</span></div>
                <div>Term: <span className="font-bold">40+ years</span></div>
                <div>Balloon: <span className="font-bold">10+ year min</span></div>
                <div>Entry Fee: <span className="font-bold">{fmt(totalEntryFee)}</span></div>
              </div>
            </div>

            <div className="p-4 border-2 border-orange-200 bg-orange-50 rounded-lg">
              <div className="flex justify-between items-center mb-2"><span className="font-bold text-orange-700">Level 2 — Cash Leverage</span><Badge className="bg-orange-600">70% All Cash</Badge></div>
              <div className="text-2xl font-bold text-orange-800">{fmt(Math.round(listPrice * 0.7))}</div>
              <div className="text-xs text-orange-600 mt-1">Cash offer for fast close. Use when seller needs speed over price. Rarely executed.</div>
            </div>

            <div className="p-4 border-2 border-green-200 bg-green-50 rounded-lg">
              <div className="flex justify-between items-center mb-2"><span className="font-bold text-green-700">Level 3 — Creative Win-Win</span><Badge className="bg-green-600">100% + Terms</Badge></div>
              <div className="text-2xl font-bold text-green-800">{fmt(listPrice)}</div>
              <div className="text-xs text-green-600 mt-1">Seller gets full price. We get favorable terms that beat any bank offer.</div>
              <div className="grid grid-cols-2 gap-1 mt-2 text-xs">
                <div>Target Rate: <span className="font-bold">5% (bank gives 7-9%)</span></div>
                <div>Term: <span className="font-bold">40yr (bank gives 30yr)</span></div>
                <div>Balloon: <span className="font-bold">10yr min (bank 7yr)</span></div>
                <div>Entry Fee: <span className="font-bold">{fmt(totalEntryFee)} ({entryFeePct}%)</span></div>
              </div>
              {isSubjectTo && <div className="mt-2 p-2 bg-blue-50 rounded text-xs"><span className="font-bold text-blue-700">Subject-To: </span>Assume {fmt(mortgage)} mortgage + seller finance {fmt(Math.max(0, listPrice - mortgage))} equity gap</div>}
            </div>
          </TabsContent>

          <TabsContent value="market" className="mt-4 space-y-4">
            {marketContext ? (
              <>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs text-slate-500">Market Median</div>
                    <div className="text-xl font-bold">{fmt(marketContext.median_price || 0)}</div>
                    <div className="text-xs text-slate-400">vs this: {fmt(listPrice)}</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs text-slate-500">Comp $/Sqft</div>
                    <div className="text-xl font-bold">${marketContext.comp_avg_ppsqft || 0}/sqft</div>
                    <div className="text-xs text-slate-400">this: ${sqft > 0 && listPrice > 0 ? Math.round(listPrice / sqft) : 0}/sqft</div>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-lg text-center">
                    <div className="text-xs text-slate-500">ARV (comp-based)</div>
                    <div className="text-xl font-bold text-green-700">{fmt(arv)}</div>
                    <div className={`text-xs font-bold ${valueGapPct > 0 ? "text-green-600" : "text-red-600"}`}>{valueGapPct > 0 ? "+" : ""}{valueGapPct}% vs list</div>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg space-y-2 text-sm">
                  {[["List Price", fmt(listPrice)], ["Comp ARV", fmt(arv)], ["Value Gap", fmt(Math.abs(arv - listPrice)) + " (" + (valueGapPct > 0 ? "underpriced ✅" : "overpriced ⚠️") + ")"], ["Market Avg DOM", (marketContext.avg_dom || 0) + " days"], ["This DOM", dom > 0 ? dom + " days" : "New listing"]].map(([l, v]) => (
                    <div key={String(l)} className="flex justify-between"><span className="text-slate-500">{String(l)}</span><span className="font-medium">{String(v)}</span></div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-slate-500">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">Upload comps list to see market context for this property</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="contact" className="mt-4 space-y-4">
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="font-semibold mb-3">Listing Agent</div>
              <div className="font-medium text-lg">{String(property.listing_agent_full_name || property.agent_name || "Not Available")}</div>
              {property.listing_agent_email && <div className="flex items-center gap-2 mt-2"><Mail className="w-4 h-4 text-slate-400" /><a href={"mailto:" + property.listing_agent_email} className="text-blue-600 hover:underline text-sm">{String(property.listing_agent_email)}</a></div>}
              {property.listing_agent_phone && <div className="flex items-center gap-2 mt-1"><Phone className="w-4 h-4 text-slate-400" /><a href={"tel:" + property.listing_agent_phone} className="text-blue-600 hover:underline text-sm">{String(property.listing_agent_phone)}</a></div>}
              {property.listing_brokerage_name && <div className="flex items-center gap-2 mt-1"><Building className="w-4 h-4 text-slate-400" /><span className="text-sm">{String(property.listing_brokerage_name)}</span></div>}
            </div>
            <div className="p-4 bg-slate-50 rounded-lg">
              <div className="font-semibold mb-3">Owner</div>
              <div className="font-medium">{[property.owner_1_first_name, property.owner_1_last_name].filter(Boolean).join(" ") || "Not Available"}</div>
              {property.owner_2_first_name && <div className="text-slate-500 text-sm">{[property.owner_2_first_name, property.owner_2_last_name].filter(Boolean).join(" ")}</div>}
              {property.owner_mailing_address && <div className="text-xs text-slate-400 mt-2">Mailing: {String(property.owner_mailing_address)}, {String(property.owner_mailing_city || "")}, {String(property.owner_mailing_state || "")} {String(property.owner_mailing_zip || "")}</div>}
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-4 border-t flex-wrap">
          <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(property.address + ", " + property.city + ", " + property.state)}>
            <Copy className="w-3 h-3 mr-1" /> Copy Address
          </Button>
          <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={goToEmail}>
            <Mail className="w-3 h-3 mr-1" /> Send Offer Email
          </Button>
          <Button variant="outline" size="sm" onClick={() => setActiveTab("underwriting")}>
            <DollarSign className="w-3 h-3 mr-1" /> Underwrite
          </Button>
          {property.listing_agent_email && <Button variant="outline" size="sm" onClick={() => window.open("mailto:" + property.listing_agent_email, "_blank")}><Mail className="w-3 h-3 mr-1" /> Email Agent</Button>}
        </div>
      </DialogContent>
    </Dialog>
  )
}
