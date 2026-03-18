// src/pages/deals/[id].tsx - Property Detail Page
import { useParams, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, MapPin, DollarSign, Home, TrendingUp, Calendar,
  Bed, Bath, Square, Building, Phone, Mail, FileText, Download
} from "lucide-react"
import NavigationHeader from "@/components/NavigationHeader"

export default function DealDetailPage() {
  const { id } = useParams()

  const { data: property, isLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()
      return data
    }
  })

  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return "N/A"
    return `$${price.toLocaleString()}`
  }

  const formatNumber = (num: number | null | undefined) => {
    if (!num || num === 0) return "N/A"
    return num.toLocaleString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-yellow-500"
    return "text-red-500"
  }

  const getScoreLabel = (score: number) => {
    if (score >= 90) return "TOP TIER DEAL 🔥"
    if (score >= 70) return "Solid Deal"
    return "Risky Deal"
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="mt-4">Loading property...</p>
        </div>
      </div>
    )
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto text-center py-12">
          <h1 className="text-2xl font-bold mb-4">Property Not Found</h1>
          <p className="text-muted-foreground mb-4">This property may have been deleted or moved.</p>
          <Button asChild>
            <Link to="/properties">View All Properties</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Calculate mock scores based on property data
  const listPrice = property.listing_price || 0
  const arv = property.estimated_value || 0
  const profitSpread = arv - listPrice
  const profitPercent = arv > 0 ? ((profitSpread / arv) * 100).toFixed(1) : 0
  const roiScore = profitPercent >= 20 ? 95 : profitPercent >= 15 ? 85 : profitPercent >= 10 ? 75 : 60
  const cashFlowScore = 75 // Mock - would need rent data
  const dealCertaintyScore = 80 // Mock
  const marketTimingScore = 85 // Mock
  const financingScore = 82 // Mock
  const overallScore = Math.round((roiScore + cashFlowScore + dealCertaintyScore + marketTimingScore + financingScore) / 5)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto">
        <NavigationHeader
          title=""
          showBack={true}
          showUpload={false}
          showStats={false}
        />

        {/* Property Header */}
        <div className="mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold">{property.address || "N/A"}</h1>
              <div className="flex items-center gap-2 text-xl text-muted-foreground mt-1">
                <MapPin className="w-5 h-5" />
                {property.city}, {property.state} {property.zip}
              </div>
            </div>
            <Badge className="text-lg px-4 py-1">
              {getScoreLabel(overallScore)}
            </Badge>
          </div>

          {/* Price Display */}
          <div className="text-5xl font-bold text-primary mb-2">
            {formatPrice(property.listing_price)}
          </div>
          <div className="text-xl text-green-500 font-medium">
            ARV: {formatPrice(property.estimated_value)}
          </div>
        </div>

        {/* Scores */}
        <Card className="mb-6 bg-gradient-to-r from-gray-900 to-gray-800 text-white border-0">
          <CardContent className="pt-6">
            <div className="grid grid-cols-5 gap-4 text-center mb-4">
              <div>
                <p className="text-3xl font-bold text-green-400">{roiScore}%</p>
                <p className="text-xs text-gray-400">Roi Potential</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-400">{cashFlowScore}%</p>
                <p className="text-xs text-gray-400">Cash Flow</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-400">{dealCertaintyScore}%</p>
                <p className="text-xs text-gray-400">Deal Certainty</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-yellow-400">{marketTimingScore}%</p>
                <p className="text-xs text-gray-400">Market Timing</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-cyan-400">{financingScore}%</p>
                <p className="text-xs text-gray-400">Financing</p>
              </div>
            </div>
            <div className="text-center border-t border-gray-700 pt-4">
              <p className="text-4xl font-bold">OVERALL SCORE: {overallScore}/100</p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Overview */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">List Price</p>
              <p className="text-2xl font-bold">{formatPrice(property.listing_price)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">ARV</p>
              <p className="text-2xl font-bold text-green-500">{formatPrice(property.estimated_value)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Profit Spread</p>
              <p className="text-2xl font-bold text-blue-500">{formatPrice(profitSpread)} ({profitPercent}%)</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Est. Rehab</p>
              <p className="text-2xl font-bold">{formatPrice(property.repair_cost || 50000)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Cap Rate</p>
              <p className="text-2xl font-bold">6.2%</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-muted-foreground mb-1">Cash-on-Cash</p>
              <p className="text-2xl font-bold">14.7%</p>
            </CardContent>
          </Card>
        </div>

        {/* Property Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Home className="w-5 h-5" />
              Property Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="flex items-center gap-3">
                <Bed className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Bedrooms</p>
                  <p className="text-xl font-bold">{property.bedrooms || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bath className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Bathrooms</p>
                  <p className="text-xl font-bold">{property.bathrooms || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Square className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Square Feet</p>
                  <p className="text-xl font-bold">{formatNumber(property.sqft)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Year Built</p>
                  <p className="text-xl font-bold">{property.year_built || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Building className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="text-xl font-bold">{property.property_type || property.land_use || "-"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Days on Market</p>
                  <p className="text-xl font-bold">{property.days_on_market || "-"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Location Intelligence */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Location Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-muted-foreground">County</p>
                <p className="text-lg font-bold">{property.county || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subdivision</p>
                <p className="text-lg font-bold">{property.subdivision || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Lot Size</p>
                <p className="text-lg font-bold">{formatNumber(property.lot_sqft)} sqft</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tax Amount</p>
                <p className="text-lg font-bold">{formatPrice(property.tax_amount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Listing Agent */}
        {(property.listing_agent_full_name || property.listing_agent_email) && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Listing Agent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold">{property.listing_agent_full_name || "-"}</p>
                  {property.listing_brokerage_name && (
                    <p className="text-muted-foreground">{property.listing_brokerage_name}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  {property.listing_agent_email && (
                    <Button variant="outline" asChild>
                      <a href={`mailto:${property.listing_agent_email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </a>
                    </Button>
                  )}
                  {property.listing_agent_phone && (
                    <Button variant="outline" asChild>
                      <a href={`tel:${property.listing_agent_phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* APN & MLS */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 gap-4 text-sm">
              {property.apn && (
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">APN:</span>
                  <span className="font-medium">{property.apn}</span>
                </div>
              )}
              {property.mls_type && (
                <div className="flex items-center gap-2">
                  <Building className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">MLS Type:</span>
                  <span className="font-medium">{property.mls_type}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 justify-center pt-6 border-t">
          <Button className="bg-green-600 hover:bg-green-700">
            <DollarSign className="w-4 h-4 mr-2" />
            Make Offer
          </Button>
          <Button variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            View OM
          </Button>
          <Button variant="outline">
            <Calendar className="w-4 h-4 mr-2" />
            Book Call
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Summary
          </Button>
        </div>
      </div>
    </div>
  )
}
