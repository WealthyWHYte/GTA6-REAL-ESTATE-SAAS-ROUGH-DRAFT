import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  MapPin, DollarSign, Home, TrendingUp, Calendar,
  ChevronDown, ChevronUp, Edit, Mail, Phone, FileText,
  Ruler, Scale, User, Building
} from "lucide-react"
import { formatValue } from "@/config/csvColumns"

interface PropertyCardProps {
  property: Record<string, unknown>
  onClick?: () => void
}

export default function PropertyCard({ property, onClick }: PropertyCardProps) {
  const [expanded, setExpanded] = useState(false)

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500",
      scouting: "bg-blue-500/20 text-blue-500 border-blue-500",
      researched: "bg-purple-500/20 text-purple-500 border-purple-500",
      scouted: "bg-blue-500/20 text-blue-500 border-blue-500",
      underwriting: "bg-orange-500/20 text-orange-500 border-orange-500",
      qualified: "bg-green-500/20 text-green-500 border-green-500",
      offer_generation: "bg-pink-500/20 text-pink-500 border-pink-500",
      offer_sent: "bg-cyan-500/20 text-cyan-500 border-cyan-500",
      under_contract: "bg-green-500/20 text-green-500 border-green-500",
      closed: "bg-gray-500/20 text-gray-500 border-gray-500"
    }
    return (
      <Badge variant="outline" className={colors[status] || colors.pending}>
        {status?.replace(/_/g, " ")}
      </Badge>
    )
  }

  const formatNumber = (num: number | null) => {
    if (!num || num === 0) return "-"
    return num.toLocaleString()
  }

  const formatCurrency = (val: unknown) => formatValue('listing_price', val)

  return (
    <Card className={`hover:shadow-lg transition-all cursor-pointer ${expanded ? "ring-2 ring-primary" : ""}`}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="flex-1" onClick={onClick}>
            <CardTitle className="text-lg leading-tight">
              {property.address || "N/A"}
            </CardTitle>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
              <MapPin className="w-3 h-3" />
              {property.city}, {property.state} {property.zip}
            </div>
          </div>
          {getStatusBadge((property.pipeline_status || property.status) as string)}
        </div>
      </CardHeader>

      <CardContent onClick={onClick}>
        {/* Quick Stats - Always Visible */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="text-center p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">List Price</p>
            <p className="font-bold text-sm">{formatCurrency(property.listing_price)}</p>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Est. Value</p>
            <p className="font-bold text-sm text-green-500">{formatCurrency(property.estimated_value)}</p>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Equity</p>
            <p className="font-bold text-sm text-blue-500">{formatValue('estimated_equity', property.estimated_equity)}</p>
          </div>
          <div className="text-center p-2 bg-muted/30 rounded">
            <p className="text-xs text-muted-foreground">Equity %</p>
            <p className="font-bold text-sm text-blue-500">{formatValue('estimated_equity_percent', property.estimated_equity_percent)}</p>
          </div>
        </div>

        {/* Property Specs */}
        <div className="grid grid-cols-5 gap-1 text-center mb-3">
          <div className="p-1 bg-muted/20 rounded">
            <p className="text-xs text-muted-foreground">Beds</p>
            <p className="font-medium text-sm">{property.bedrooms || "-"}</p>
          </div>
          <div className="p-1 bg-muted/20 rounded">
            <p className="text-xs text-muted-foreground">Baths</p>
            <p className="font-medium text-sm">{property.bathrooms || "-"}</p>
          </div>
          <div className="p-1 bg-muted/20 rounded">
            <p className="text-xs text-muted-foreground">Sqft</p>
            <p className="font-medium text-sm">{formatNumber(property.living_sqft as number)}</p>
          </div>
          <div className="p-1 bg-muted/20 rounded">
            <p className="text-xs text-muted-foreground">Year</p>
            <p className="font-medium text-sm">{property.year_built || "-"}</p>
          </div>
          <div className="p-1 bg-muted/20 rounded">
            <p className="text-xs text-muted-foreground">Acres</p>
            <p className="font-medium text-sm">{property.lot_acres || "-"}</p>
          </div>
        </div>

        {/* Expand Button */}
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-xs"
          onClick={(e) => {
            e.stopPropagation()
            setExpanded(!expanded)
          }}
        >
          {expanded ? (
            <>Less Details <ChevronUp className="w-3 h-3 ml-1" /></>
          ) : (
            <>More Details <ChevronDown className="w-3 h-3 ml-1" /></>
          )}
        </Button>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-4 pt-4 border-t space-y-4" onClick={(e) => e.stopPropagation()}>
            <Tabs defaultValue="property" className="w-full">
              <TabsList className="grid w-full grid-cols-4 text-xs">
                <TabsTrigger value="property" className="text-xs">Property</TabsTrigger>
                <TabsTrigger value="owner" className="text-xs">Owner</TabsTrigger>
                <TabsTrigger value="financial" className="text-xs">Financial</TabsTrigger>
                <TabsTrigger value="listing" className="text-xs">Listing</TabsTrigger>
              </TabsList>

              <TabsContent value="property" className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-muted-foreground" />
                    <span>Type: {property.property_type || property.land_use || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Home className="w-4 h-4 text-muted-foreground" />
                    <span>Use: {property.property_use || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Ruler className="w-4 h-4 text-muted-foreground" />
                    <span>Lot Sqft: {formatNumber(property.lot_sqft as number)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span>Built: {property.year_built || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-muted-foreground" />
                    <span>Stories: {property.stories || "-"}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground" />
                    <span>APN: {property.apn || "-"}</span>
                  </div>
                </div>
                {property.subdivision && (
                  <div className="p-2 bg-muted/30 rounded text-sm">
                    <span className="text-muted-foreground">Subdivision: </span>
                    {property.subdivision}
                  </div>
                )}
                {property.legal_description && (
                  <div className="p-2 bg-muted/30 rounded text-sm">
                    <span className="text-muted-foreground">Legal: </span>
                    {(property.legal_description as string).substring(0, 100)}
                    {(property.legal_description as string).length > 100 && "..."}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="owner" className="mt-3 space-y-3">
                {(property.owner1_first_name || property.owner1_last_name) && (
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">
                      {property.owner1_first_name} {property.owner1_last_name}
                      {(property.owner2_first_name || property.owner2_last_name) &&
                        ` & ${property.owner2_first_name} ${property.owner2_last_name}`}
                    </span>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Owner Type: {property.owner_type || "-"}</div>
                  <div>Owner Occupied: {property.owner_occupied ? "Yes" : "No"}</div>
                  <div>Vacant: {property.vacant ? "Yes" : "No"}</div>
                  <div>Ownership: {property.ownership_length_months ? `${property.ownership_length_months} mo` : "-"}</div>
                </div>
                {(property.owner_mailing_address || property.owner_mailing_city) && (
                  <div className="p-2 bg-muted/30 rounded text-sm">
                    <p className="text-muted-foreground text-xs mb-1">Mailing Address</p>
                    {property.owner_mailing_address}, {property.owner_mailing_city}, {property.owner_mailing_state} {property.owner_mailing_zip}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="financial" className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground text-xs">Est. Value</p>
                    <p className="font-bold">{formatCurrency(property.estimated_value)}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground text-xs">Est. Equity</p>
                    <p className="font-bold text-green-500">{formatValue('estimated_equity', property.estimated_equity)}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground text-xs">Mortgage Balance</p>
                    <p className="font-bold">{formatValue('open_mortgage_balance', property.open_mortgage_balance)}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground text-xs">Interest Rate</p>
                    <p className="font-bold">{formatValue('mortgage_interest_rate', property.mortgage_interest_rate)}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>Last Sale: {formatValue('last_sale_date', property.last_sale_date)}</div>
                  <div>Last Sale Amt: {formatValue('last_sale_amount', property.last_sale_amount)}</div>
                  <div>Lender: {property.lender_name || "-"}</div>
                  <div>Loan Type: {property.mortgage_loan_type || "-"}</div>
                </div>
                <div className="p-2 bg-muted/30 rounded text-sm">
                  <p className="text-muted-foreground text-xs mb-1">Tax Info</p>
                  <div className="grid grid-cols-3 gap-2">
                    <div>Tax: {formatValue('tax_amount', property.tax_amount)}</div>
                    <div>Assessed: {formatValue('assessed_total_value', property.assessed_total_value)}</div>
                    <div>Market: {formatValue('market_value', property.market_value)}</div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="listing" className="mt-3 space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground text-xs">List Price</p>
                    <p className="font-bold">{formatCurrency(property.listing_price)}</p>
                  </div>
                  <div className="p-2 bg-muted/30 rounded">
                    <p className="text-muted-foreground text-xs">Days on Market</p>
                    <p className="font-bold">{property.days_on_market || "-"}</p>
                  </div>
                  <div>Status: {property.listing_status || "-"}</div>
                  <div>MLS Type: {property.mls_type || "-"}</div>
                </div>
                {property.listing_agent_full_name && (
                  <div className="p-2 bg-muted/30 rounded text-sm">
                    <p className="text-muted-foreground text-xs mb-1">Listing Agent</p>
                    <div className="font-medium">{property.listing_agent_full_name}</div>
                    <div className="flex gap-3 mt-1">
                      {property.listing_agent_email && (
                        <a href={`mailto:${property.listing_agent_email}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                          <Mail className="w-3 h-3" /> Email
                        </a>
                      )}
                      {property.listing_agent_phone && (
                        <a href={`tel:${property.listing_agent_phone}`} className="flex items-center gap-1 text-blue-500 hover:underline">
                          <Phone className="w-3 h-3" /> {property.listing_agent_phone}
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {property.listing_brokerage_name && (
                  <div className="p-2 bg-muted/30 rounded text-sm">
                    <p className="text-muted-foreground text-xs mb-1">Brokerage</p>
                    <div className="font-medium">{property.listing_brokerage_name}</div>
                    {property.listing_brokerage_phone && <div>{property.listing_brokerage_phone}</div>}
                  </div>
                )}
              </TabsContent>
            </Tabs>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" className="flex-1">
                <Edit className="w-3 h-3 mr-1" /> Edit
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                <TrendingUp className="w-3 h-3 mr-1" /> Research
              </Button>
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                <DollarSign className="w-3 h-3 mr-1" /> Make Offer
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
