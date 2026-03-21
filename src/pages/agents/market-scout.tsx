// Market Scout Agent - Shows market intelligence from uploaded property lists

import React from 'react'
import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, Home, DollarSign, MapPin, Search, 
  BarChart3, Calculator, ArrowLeft, RefreshCw, 
  Target, PieChart, Filter, Building, Users
} from 'lucide-react'

export default function MarketScoutPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // Fetch latest market analysis - filtered by account
  const { data: marketAnalysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['latest-market-analysis'],
    queryFn: async () => {
      // Don't filter by account_id - RLS handles it
      const { data, error } = await supabase
        .from('market_analysis')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()  // Use maybeSingle instead of single to handle no rows
      if (error && error.code !== 'PGRST116') {
        console.log('Market analysis query error:', error)
        return null
      }
      return data
    }
  })

  // Fetch properties - filtered by account
  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties-for-market-scout'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('account_id', user?.id)
        .range(0,999)
	
        .order('created_at', { ascending: false })
      if (error) throw error
      return data || []
    }
  })

  // Trigger market analysis manually
  const handleAnalyze = async () => {
    if (!properties || properties.length === 0) {
      alert('Upload properties first!')
      return
    }
    
    // Get current user's session for auth
    const { data: { session } } = await supabase.auth.getSession()
    
    setIsAnalyzing(true)
    try {
      // Get unique cities from properties
      const cities = [...new Set(properties.map(p => p.city).filter(Boolean))]
      const firstCity = cities[0] || 'Los Angeles'
      
      // Get the state from properties
      const state = properties.find(p => p.state)?.state || 'CA'
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-market`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            // city removed - analyze all properties
            // state removed
            property_ids: []
          }),
        }
      )
      
      const result = await response.json()
      console.log('Analysis result:', result)
      
      if (result.success) {
        alert(`✅ Market analysis complete! Analyzed ${result.properties_analyzed} properties.`)
        // Refetch the analysis data
        queryClient.invalidateQueries({ queryKey: ['latest-market-analysis'] })
      } else {
        alert(`❌ Analysis failed: ${result.error}`)
      }
    } catch (error) {
      console.error('Analysis error:', error)
      alert('Failed to analyze market')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Handle both flat columns and nested analysis JSON
  const getField = (field: string, fallback: any = undefined) => {
    // First try direct column access
    if (marketAnalysis && field in marketAnalysis) {
      return marketAnalysis[field]
    }
    // Try parsing analysis JSON if it exists
    if (marketAnalysis?.analysis) {
      try {
        const parsed = typeof marketAnalysis.analysis === 'string' 
          ? JSON.parse(marketAnalysis.analysis) 
          : marketAnalysis.analysis
        if (field in parsed) return parsed[field]
        if (parsed.stats && field in parsed.stats) return parsed.stats[field]
      } catch {}
    }
    return fallback
  }
  
  // REAL MATH — computed directly from properties data, zero AI guessing
  const computedStats = React.useMemo(() => {
    if (!properties || properties.length === 0) return null
    const allPrices = properties.map((p: any) => p.listing_price || 0).filter((v: number) => v > 0)
    const prices = allPrices.filter((v: number) => v <= 3000000) // focus on buy box for stats
    // Filter to buy box range for meaningful stats (exclude luxury outliers)
    const buyBoxProps = properties.filter((p: any) => {
      const price = p.listing_price || 0
      return price >= 400000 && price <= 3000000
    })
    const workingSet = buyBoxProps.length > 0 ? buyBoxProps : properties
    const equities = workingSet.map((p: any) => p.estimated_equity || 0).filter((v: number) => v > 0 && v < 5000000)
    const doms = properties.map((p: any) => p.days_on_market || 0)
    const sqfts = properties.map((p: any) => p.sqft || 0).filter((v: number) => v > 0 && v < 20000)
    const years = properties.map((p: any) => p.year_built || 0).filter((v: number) => v > 1900)
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
    const sorted = [...prices].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)] || 0
    const allSorted = [...allPrices].sort((a, b) => a - b)
    const allMedian = allSorted[Math.floor(allSorted.length / 2)] || 0
    return {
      total: properties.length,
      avg_price: avg(prices),
      median_price: median,
      avg_equity: avg(equities),
      avg_dom: avg(doms),
      avg_sqft: avg(sqfts),
      avg_year: avg(years),
      avg_ppsqft: prices.length && sqfts.length ? Math.round(avg(prices) / avg(sqfts)) : 0,
      // equity = listing_price when no separate equity data exists in CSV
      // so we skip equity % calc and just show DOM-based motivation
      motivated: properties.filter((p: any) => (p.days_on_market || 0) >= 90).length,
      motivated_mild: properties.filter((p: any) => (p.days_on_market || 0) >= 30 && (p.days_on_market || 0) < 90).length,
      no_dom_data: properties.filter((p: any) => p.days_on_market === null || p.days_on_market === undefined).length,
      free_clear: properties.filter((p: any) => !p.open_mortgage_balance || p.open_mortgage_balance === 0).length,
      subject_to: properties.filter((p: any) => (p.open_mortgage_balance || 0) > 0 && (p.estimated_equity || 0) > (p.listing_price || 1) * 0.1).length,
      high_equity: properties.filter((p: any) => (p.estimated_equity || 0) > (p.listing_price || 1) * 0.3).length,
      in_buy_box: buyBoxProps.length,
      price_buckets: [
        { label: 'Under $500K', count: properties.filter((p: any) => (p.listing_price || 0) < 500000).length },
        { label: '$500K-$1M', count: properties.filter((p: any) => (p.listing_price || 0) >= 500000 && (p.listing_price || 0) < 1000000).length },
        { label: '$1M-$2M', count: properties.filter((p: any) => (p.listing_price || 0) >= 1000000 && (p.listing_price || 0) < 2000000).length },
        { label: '$2M+', count: properties.filter((p: any) => (p.listing_price || 0) >= 2000000).length },
      ],
      equity_buckets: [
        { label: 'No Equity', count: properties.filter((p: any) => (p.estimated_equity || 0) <= 0).length },
        { label: 'Low <20%', count: properties.filter((p: any) => { const e = (p.estimated_equity||0)/(p.listing_price||1); return e > 0 && e < 0.2 }).length },
        { label: 'Good 20-40%', count: properties.filter((p: any) => { const e = (p.estimated_equity||0)/(p.listing_price||1); return e >= 0.2 && e < 0.4 }).length },
        { label: 'High 40%+', count: properties.filter((p: any) => { const e = (p.estimated_equity||0)/(p.listing_price||1); return e >= 0.4 }).length },
      ],
      dom_buckets: [
        { label: '0-30 days', count: properties.filter((p: any) => (p.days_on_market || 0) <= 30).length },
        { label: '31-90 days', count: properties.filter((p: any) => (p.days_on_market || 0) > 30 && (p.days_on_market || 0) <= 90).length },
        { label: '90+ days', count: properties.filter((p: any) => (p.days_on_market || 0) > 90).length },
      ]
    }
  }, [properties])

  const stats = {
    total_properties: computedStats?.total || properties?.length || 0,
    avg_listing_price: computedStats?.avg_price || 0,
    avg_equity: computedStats?.avg_equity || 0,
    avg_days_on_market: computedStats?.avg_dom || 0
  }
  const segments = {
    high_equity: computedStats?.high_equity || 0,
    motivated: computedStats?.motivated || 0,
    free_clear: computedStats?.free_clear || 0,
    subject_to_viable: computedStats?.subject_to || 0
  }
  const primaryStrategy = getField('primary_strategy', 'Wholesale')
  const secondaryStrategy = getField('secondary_strategy', 'Lease Option')
  const context = {
    temp: getField('market_context', 'Moderate'),
    grade: getField('investment_grade', 'B')
  }
  const topCities = properties && properties.length > 0
    ? Object.entries(
        properties.reduce((acc: any, p: any) => {
          const city = p.city || 'Unknown'
          acc[city] = (acc[city] || 0) + 1
          return acc
        }, {})
      )
        .map(([city, count]) => ({ city, count }))
        .sort((a: any, b: any) => (b.count as number) - (a.count as number))
        .slice(0, 5)
    : getField('top_cities', []) || []
  const filters = getField('recommended_filters', {}) || {}

  // Compute real buy box from properties
  const buyBox = properties && properties.length > 0 ? (() => {
    const allPrices = properties.map((p: any) => p.listing_price || 0).filter((v: number) => v > 0)
    const prices = allPrices.filter((v: number) => v <= 3000000) // focus on buy box for stats
    const sqfts = properties.map((p: any) => p.sqft || 0).filter((v: number) => v > 0)
    const beds = properties.map((p: any) => p.bedrooms || 0).filter((v: number) => v > 0)
    const baths = properties.map((p: any) => p.bathrooms || 0).filter((v: number) => v > 0)
    const years = properties.map((p: any) => p.year_built || 0).filter((v: number) => v > 1900)
    const avg = (arr: number[]) => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0
    const sorted = [...prices].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)] || 0
    const avgSqft = avg(sqfts)
    const avgBeds = avg(beds)
    const avgBaths = avg(baths)
    const avgYear = avg(years)
    return {
      beds: `${Math.max(1, avgBeds - 1)}-${avgBeds + 1}`,
      baths: `${Math.max(1, avgBaths - 1)}-${avgBaths + 1}`,
      sqft: `${Math.round(avgSqft * 0.8).toLocaleString()}-${Math.round(avgSqft * 1.2).toLocaleString()}`,
      year: `${avgYear - 15}-${avgYear + 15}`,
      price: `$${Math.round(median * 0.7 / 1000)}K-$${Math.round(median * 1.3 / 1000)}K`,
      avgSqft, avgBeds, avgBaths, avgYear, median
    }
  })() : null

  const [currentPage, setCurrentPage] = React.useState(1)
  const PROPS_PER_PAGE = 50
  const totalPages = Math.ceil((properties?.length || 0) / PROPS_PER_PAGE)
  const paginatedProperties = properties?.slice((currentPage - 1) * PROPS_PER_PAGE, currentPage * PROPS_PER_PAGE) || []

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              Market Scout
            </h1>
            <p className="text-slate-600 mt-1">
              Market intelligence from your uploaded property lists
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={handleAnalyze}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Re-Analyze Market
            </Button>
            <Button variant="outline" onClick={() => navigate('/command-center')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-purple-600 mb-2">
                <Home className="w-5 h-5" />
                <span className="text-sm font-medium">Total Properties</span>
              </div>
              <div className="text-3xl font-bold text-purple-700">
                {(properties?.length || 0).toLocaleString()}
              </div>

            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-green-600 mb-2">
                <DollarSign className="w-5 h-5" />
                <span className="text-sm font-medium">Median Price</span>
              </div>
              <div className="text-3xl font-bold text-green-700">
                ${computedStats ? (computedStats.median_price >= 1000000 ? (computedStats.median_price/1000000).toFixed(1)+'M' : Math.round(computedStats.median_price/1000)+'K') : '0'}
              </div>

            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <TrendingUp className="w-5 h-5" />
                <span className="text-sm font-medium">Avg Equity</span>
              </div>
              <div className="text-3xl font-bold text-blue-700">
                {computedStats?.avg_equity ? 
                  (computedStats.avg_equity >= 1000000 
                    ? '$' + (computedStats.avg_equity/1000000).toFixed(2) + 'M'
                    : '$' + Math.round(computedStats.avg_equity/1000) + 'K')
                  : '$0'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-orange-600 mb-2">
                <Calendar className="w-5 h-5" />
                <span className="text-sm font-medium">Avg DOM</span>
              </div>
              <div className="text-3xl font-bold text-orange-700">
                {computedStats?.avg_dom ? Math.round(computedStats.avg_dom) + ' days' : 'N/A'}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Opportunity Segments */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-l-4 border-l-purple-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">High Equity (30%+)</span>
                <Badge variant="secondary">{segments.high_equity || 0}</Badge>
              </div>
              <Progress 
                value={((segments.high_equity || 0) / (stats.total_properties || 1)) * 100} 
                className="h-2"
              />
              <p className="text-xs text-slate-500 mt-2">
                Properties with significant equity position
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-red-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Motivated (90+ DOM)</span>
                <Badge variant="destructive">{segments.motivated || 0}</Badge>
              </div>
              <Progress 
                value={((segments.motivated || 0) / (stats.total_properties || 1)) * 100} 
                className="h-2 bg-red-100"
              />
              <p className="text-xs text-slate-500 mt-2">
                Properties on market 90+ days - highly motivated
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-green-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Free & Clear</span>
                <Badge variant="outline" className="border-green-500 text-green-600">
                  {segments.free_clear || 0}
                </Badge>
              </div>
              <Progress 
                value={((segments.free_clear || 0) / (stats.total_properties || 1)) * 100} 
                className="h-2 bg-green-100"
              />
              <p className="text-xs text-slate-500 mt-2">
                No mortgage - seller finance opportunity
              </p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-500">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-600">Subject-To Viable</span>
                <Badge className="bg-blue-500">{segments.subject_to_viable || 0}</Badge>
              </div>
              <Progress 
                value={((segments.subject_to_viable || 0) / (stats.total_properties || 1)) * 100} 
                className="h-2 bg-blue-100"
              />
              <p className="text-xs text-slate-500 mt-2">
                Existing mortgage + equity = Subject-To
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Recommendations */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Recommended Strategies
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-purple-600">PRIMARY</Badge>
                  <span className="font-bold text-purple-700">
                    {primaryStrategy}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Best strategy for {segments.subject_to_viable || 0} properties in this market
                </p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">SECONDARY</Badge>
                  <span className="font-bold text-blue-700">
                    {secondaryStrategy}
                  </span>
                </div>
                <p className="text-sm text-slate-600">
                  Backup strategy for {segments.subject_to_viable || 0} properties
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Market Context */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-green-600" />
              Market Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <p className="text-sm">
                <span className="font-medium">Insight:</span> {context?.temp || 'Market analysis pending'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Grade:</span> {context?.grade || 'Analysis pending'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Best Fit:</span> {primaryStrategy || 'Wholesale'}
              </p>
              <p className="text-sm">
                <span className="font-medium">Pricing:</span> ${stats?.avg_listing_price ? Math.round(stats.avg_listing_price / 1000000).toFixed(1) + 'M' : '$0'} median
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Top Cities & Recommended Filters */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Top Cities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Top Markets
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topCities && topCities.length > 0 ? (
                <div className="space-y-3">
                  {topCities.map((item: any, i: number) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="font-medium">{item.city || item.name || 'Unknown'}</span>
                      <Badge variant="secondary">{item.count || 1} properties</Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500 text-sm">No city data available</p>
              )}
            </CardContent>
          </Card>

          {/* Recommended Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5" />
                Next List Filters
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filters?.hot_leads ? (
                <div className="space-y-3">
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">🔥 Hot Leads</span>
                      <Badge variant="destructive">~{filters?.hot_leads?.expected || 0}</Badge>
                    </div>
                    <p className="text-xs text-slate-600">{filters?.hot_leads?.reason}</p>
                  </div>
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">📋 Subject-To</span>
                      <Badge className="bg-blue-500">~{filters.subject_to_targets?.expected || 0}</Badge>
                    </div>
                    <p className="text-xs text-slate-600">{filters.subject_to_targets?.reason}</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm">💰 Seller Finance</span>
                      <Badge variant="outline" className="border-green-500">~{filters.seller_finance_targets?.expected || 0}</Badge>
                    </div>
                    <p className="text-xs text-slate-600">{filters.seller_finance_targets?.reason}</p>
                  </div>
                </div>
              ) : buyBox ? (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-purple-700 mb-2">📋 Use these filters to pull your off-market comps list from PropWire/BatchLeads:</p>
                  <div className="grid grid-cols-1 gap-2 text-sm">
                    <div className="flex justify-between p-2 bg-purple-50 rounded"><span className="text-slate-600">Beds</span><span className="font-bold">{buyBox.beds}</span></div>
                    <div className="flex justify-between p-2 bg-purple-50 rounded"><span className="text-slate-600">Baths</span><span className="font-bold">{buyBox.baths}</span></div>
                    <div className="flex justify-between p-2 bg-purple-50 rounded"><span className="text-slate-600">Sqft Range</span><span className="font-bold">{buyBox.sqft}</span></div>
                    <div className="flex justify-between p-2 bg-purple-50 rounded"><span className="text-slate-600">Year Built</span><span className="font-bold">{buyBox.year}</span></div>
                    <div className="flex justify-between p-2 bg-purple-50 rounded"><span className="text-slate-600">Price Range</span><span className="font-bold">{buyBox.price}</span></div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Pull sold comps from past 6-9 months (max 3 years) matching these specs. Upload as off-market list to complete analysis.</p>
                </div>
              ) : (
                <p className="text-slate-500 text-sm">Upload properties to get filter recommendations</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Property List */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="w-5 h-5" />
                Property List ({properties?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {paginatedProperties.map((property: any) => (
                  <div key={property.id} className="p-4 border rounded-lg hover:bg-slate-50 space-y-2">
                    <h4 className="font-medium text-sm truncate">
                      {property.address || property.listing_address || 'No address'}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {property.city}, {property.state} {property.zip}
                    </p>
                    
                    {/* Specs Row */}
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      {property.bedrooms && <span>{property.bedrooms}bd</span>}
                      {property.bathrooms && <span>• {property.bathrooms}ba</span>}
                      {property.sqft && <span>• {property.sqft.toLocaleString()} sqft</span>}
                    </div>
                    
                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-slate-500">Price:</span>
                        <span className="font-medium text-green-600 ml-1">
                          ${(property.listing_price || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Value:</span>
                        <span className="font-medium ml-1">
                          ${(property.estimated_value || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">Equity:</span>
                        <span className="font-medium text-vice-cyan ml-1">
                          ${(property.estimated_equity || 0).toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500">DOM:</span>
                        <span className={`font-medium ml-1 ${(property.days_on_market || 0) >= 90 ? 'text-vice-pink' : ''}`}>
                          {property.days_on_market || 0} days
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between pt-2 border-t">
                      <Badge variant="outline" className="text-xs">
                        {property.pipeline_status || 'new'}
                      </Badge>
                      {property.equity_percent && (
                        <span className="text-xs font-medium text-vice-cyan">
                          {property.equity_percent}% equity
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-slate-100"
                  >← Prev</button>
                  <span className="text-sm text-slate-600">Page {currentPage} of {totalPages} ({properties?.length} properties)</span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded border text-sm disabled:opacity-40 hover:bg-slate-100"
                  >Next →</button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Calendar({ className }: { className?: string }) {
  return <TrendingUp className={className} />
}
