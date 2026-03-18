// src/pages/black-market.tsx - Black Market / Property Detail Page
import { useState } from "react"
import { useParams, useNavigate, Link } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  ArrowLeft, MapPin, DollarSign, Home, TrendingUp, Calendar,
  Bed, Bath, Square, Building, Phone, Mail, FileText, Download,
  Filter, ChevronDown, ChevronUp, Edit, Search
} from "lucide-react"
import NavigationHeader from "@/components/NavigationHeader"

export default function BlackMarketPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    propertyType: "",
  })

  // Fetch properties for list view
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('account_id', user.id)
        .order('created_at', { ascending: false })
      
      return data || []
    }
  })

  // Fetch single property for detail view
  const { data: property, isLoading: propertyLoading } = useQuery({
    queryKey: ['property', id],
    queryFn: async () => {
      if (!id) return null
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single()
      return data
    },
    enabled: !!id
  })

  const formatPrice = (price: number | null | undefined) => {
    if (!price || price === 0) return "N/A"
    return `$${price.toLocaleString()}`
  }

  const formatNumber = (num: number | null | undefined) => {
    if (!num || num === 0) return "N/A"
    return num.toLocaleString()
  }

  // Filter properties
  const filteredProperties = properties?.filter(p => {
    const matchesMinPrice = !filters.minPrice || (p.listing_price || 0) >= Number(filters.minPrice)
    const matchesMaxPrice = !filters.maxPrice || (p.listing_price || 0) <= Number(filters.maxPrice)
    const matchesBeds = !filters.bedrooms || p.bedrooms === Number(filters.bedrooms)
    const matchesBaths = !filters.bathrooms || p.bathrooms === Number(filters.bathrooms)
    const matchesType = !filters.propertyType || p.property_type === filters.propertyType
    return matchesMinPrice && matchesMaxPrice && matchesBeds && matchesBaths && matchesType
  }) || []

  // Calculate scores based on property data
  const calculateScores = (prop: any) => {
    const listPrice = prop.listing_price || 0
    const arv = prop.estimated_value || 0
    const profitSpread = arv - listPrice
    const profitPercent = arv > 0 ? ((profitSpread / arv) * 100) : 0
    
    const roiScore = Math.min(100, Math.round(profitPercent * 3))
    const cashFlowScore = 75
    const dealCertaintyScore = 80
    const marketTimingScore = 85
    const financingScore = 82
    const overallScore = Math.round((roiScore + cashFlowScore + dealCertaintyScore + marketTimingScore + financingScore) / 5)
    
    return { roiScore, cashFlowScore, dealCertaintyScore, marketTimingScore, financingScore, overallScore }
  }

  // If viewing single property detail
  if (id && property) {
    const scores = calculateScores(property)
    const listPrice = property.listing_price || 0
    const arv = property.estimated_value || 0
    const profitSpread = arv - listPrice
    const profitPercent = arv > 0 ? ((profitSpread / arv) * 100).toFixed(1) : 0

    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-5xl mx-auto">
          <NavigationHeader title="" showBack={true} showUpload={false} showStats={false} />

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
              <Badge className="text-lg px-4 py-1 bg-green-600">
                {scores.overallScore >= 90 ? "TOP TIER DEAL 🔥" : scores.overallScore >= 70 ? "Solid Deal" : "Review Needed"}
              </Badge>
            </div>

            {/* Price */}
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
                  <p className="text-3xl font-bold text-green-400">{scores.roiScore}%</p>
                  <p className="text-xs text-gray-400">Roi Potential</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-400">{scores.cashFlowScore}%</p>
                  <p className="text-xs text-gray-400">Cash Flow</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-purple-400">{scores.dealCertaintyScore}%</p>
                  <p className="text-xs text-gray-400">Deal Certainty</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-400">{scores.marketTimingScore}%</p>
                  <p className="text-xs text-gray-400">Market Timing</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-cyan-400">{scores.financingScore}%</p>
                  <p className="text-xs text-gray-400">Financing</p>
                </div>
              </div>
              <div className="text-center border-t border-gray-700 pt-4">
                <p className="text-4xl font-bold">OVERALL SCORE: {scores.overallScore}/100</p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Profit Spread</p>
                <p className="text-2xl font-bold text-blue-500">{formatPrice(profitSpread)}</p>
                <p className="text-xs text-muted-foreground">({profitPercent}%)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Bedrooms</p>
                <p className="text-2xl font-bold">{property.bedrooms || "-"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Bathrooms</p>
                <p className="text-2xl font-bold">{property.bathrooms || "-"}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-sm text-muted-foreground">Square Feet</p>
                <p className="text-2xl font-bold">{formatNumber(property.sqft)}</p>
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
                  <Calendar className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Year Built</p>
                    <p className="text-lg font-bold">{property.year_built || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Type</p>
                    <p className="text-lg font-bold">{property.property_type || property.land_use || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Days on Market</p>
                    <p className="text-lg font-bold">{property.days_on_market || "-"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <DollarSign className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tax Amount</p>
                    <p className="text-lg font-bold">{formatPrice(property.tax_amount)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tax & Assessment */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>TAX & ASSESSMENT</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Assessed Total</p>
                  <p className="text-xl font-bold">{formatPrice(property.assessed_total_value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Assessed Land</p>
                  <p className="text-xl font-bold">{formatPrice(property.assessed_land_value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Market Value</p>
                  <p className="text-xl font-bold">{formatPrice(property.market_value)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Lot Sqft</p>
                  <p className="text-xl font-bold">{formatNumber(property.lot_sqft)}</p>
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
                  <p className="text-sm text-muted-foreground">APN</p>
                  <p className="text-lg font-bold">{property.apn || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">MLS Type</p>
                  <p className="text-lg font-bold">{property.mls_type || "-"}</p>
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
                    {property.listing_agent_phone && (
                      <p className="text-muted-foreground">{property.listing_agent_phone}</p>
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
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

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

  // List view (no id)
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <NavigationHeader
          title="BLACK MARKET"
          subtitle="Where deals go to disappear 🔥"
          showBack={false}
        />

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold">{properties?.length || 0}</p>
              <p className="text-sm text-muted-foreground">TOTAL DEALS</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-green-500">$45K</p>
              <p className="text-sm text-muted-foreground">AVG PROFIT</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-3xl font-bold text-blue-500">{filteredProperties.length}</p>
              <p className="text-sm text-muted-foreground">ACTIVE LISTINGS</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters Toggle */}
        <Button
          variant="outline"
          className="mb-4"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {showFilters ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
        </Button>

        {/* Filters */}
        {showFilters && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground">Min Price</label>
                  <input
                    type="number"
                    placeholder="$0"
                    className="w-full p-2 border rounded"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Max Price</label>
                  <input
                    type="number"
                    placeholder="$999,999"
                    className="w-full p-2 border rounded"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Bedrooms</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={filters.bedrooms}
                    onChange={(e) => setFilters({ ...filters, bedrooms: e.target.value })}
                  >
                    <option value="">Any</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                    <option value="5">5+</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">Bathrooms</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={filters.bathrooms}
                    onChange={(e) => setFilters({ ...filters, bathrooms: e.target.value })}
                  >
                    <option value="">Any</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button variant="outline" className="w-full" onClick={() => setFilters({ minPrice: "", maxPrice: "", bedrooms: "", bathrooms: "", propertyType: "" })}>
                    Reset
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Property List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No properties found</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property: any) => {
              const scores = calculateScores(property)
              const listPrice = property.listing_price || 0
              const arv = property.estimated_value || 0
              const profitSpread = arv - listPrice

              return (
                <Card 
                  key={property.id} 
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => navigate(`/black-market/${property.id}`)}
                >
                  <CardContent className="p-6">
                    {/* Address */}
                    <div className="mb-4">
                      <p className="font-bold text-lg">{property.address || "N/A"}</p>
                      <p className="text-sm text-muted-foreground">
                        {property.city}, {property.state} {property.zip}
                      </p>
                    </div>

                    {/* Prices */}
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">List Price</p>
                        <p className="text-xl font-bold">{formatPrice(property.listing_price)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">ARV</p>
                        <p className="text-xl font-bold text-green-500">{formatPrice(property.estimated_value)}</p>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 text-center mb-4">
                      <div className="flex items-center justify-center gap-1">
                        <Bed className="w-4 h-4 text-muted-foreground" />
                        <span>{property.bedrooms || "-"}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Bath className="w-4 h-4 text-muted-foreground" />
                        <span>{property.bathrooms || "-"}</span>
                      </div>
                      <div className="flex items-center justify-center gap-1">
                        <Square className="w-4 h-4 text-muted-foreground" />
                        <span>{formatNumber(property.sqft)}</span>
                      </div>
                    </div>

                    {/* Score */}
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Badge variant={scores.overallScore >= 90 ? "default" : "secondary"}>
                        Score: {scores.overallScore}/100
                      </Badge>
                      <p className="text-sm text-green-500 font-medium">
                        +{formatPrice(profitSpread)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
