// MarketIntelligenceHub.tsx - Real market data from user's uploaded properties
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import {
  MapPin,
  TrendingUp,
  DollarSign,
  Target,
  Home,
  Clock,
  Percent,
  Building
} from "lucide-react";

export default function MarketIntelligenceHub() {
  // Fetch user's properties for real market data
  const { data: properties, isLoading } = useQuery({
    queryKey: ['market-intelligence-properties'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('account_id', user.id)
      return data || []
    }
  })

  // Calculate real market intelligence from user's properties
  const marketStats = (() => {
    if (!properties || properties.length === 0) {
      return {
        totalProperties: 0,
        avgPrice: 0,
        avgDaysOnMarket: 0,
        totalValue: 0,
        cities: []
      }
    }

    // Group by city
    const byCity = properties.reduce((acc, p) => {
      const city = p.city || 'Unknown'
      if (!acc[city]) {
        acc[city] = { count: 0, totalPrice: 0, totalSqft: 0, daysOnMarket: 0 }
      }
      acc[city].count++
      acc[city].totalPrice += p.listing_price || 0
      acc[city].totalSqft += p.sqft || 0
      acc[city].daysOnMarket += p.days_on_market || 0
      return acc
    }, {} as Record<string, { count: number; totalPrice: number; totalSqft: number; daysOnMarket: number }>)

    const cities = Object.entries(byCity)
      .map(([city, data]) => ({
        name: city,
        count: data.count,
        avgPrice: Math.round(data.totalPrice / data.count),
        pricePerSqft: data.totalSqft > 0 ? Math.round(data.totalPrice / data.totalSqft) : 0,
        avgDaysOnMarket: Math.round(data.daysOnMarket / data.count)
      }))
      .sort((a, b) => b.count - a.count)

    const totalValue = properties.reduce((sum, p) => sum + (p.listing_price || 0), 0)
    const avgPrice = Math.round(totalValue / properties.length)
    const avgDaysOnMarket = Math.round(
      properties.reduce((sum, p) => sum + (p.days_on_market || 0), 0) / properties.length
    )

    return {
      totalProperties: properties.length,
      avgPrice,
      avgDaysOnMarket,
      totalValue,
      cities
    }
  })()

  // Top opportunity zones (highest equity properties)
  const opportunityZones = (properties || [])
    .filter(p => p.estimated_value && p.listing_price)
    .map(p => ({
      name: p.city || 'Unknown',
      dealCount: 1,
      avgROI: Math.round(((p.estimated_value - p.listing_price) / p.listing_price) * 100),
      price: p.listing_price
    }))
    .sort((a, b) => b.avgROI - a.avgROI)
    .slice(0, 5)

  const formatPrice = (price: number) => {
    if (price >= 1000000) return `$${(price / 1000000).toFixed(1)}M`
    if (price >= 1000) return `$${(price / 1000).toFixed(0)}K`
    return `$${price}`
  }

  if (isLoading) {
    return (
      <Card className="mb-6 bg-black/40 border-vice-cyan/30">
        <CardContent className="p-6">
          <div className="text-center text-slate-400">Loading market data...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-6 bg-black/40 border-vice-cyan/30">
      <CardHeader className="pb-2">
        <CardTitle className="font-gta text-vice-cyan flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          MARKET INTELLIGENCE - YOUR MARKETS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {marketStats.totalProperties === 0 ? (
          <div className="text-center py-8 text-slate-400">
            <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg mb-2">No market data yet</p>
            <p className="text-sm">Upload a property list to see your market intelligence</p>
          </div>
        ) : (
          <>
            {/* Market Overview */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="p-4 bg-slate-800/50 rounded-lg border border-vice-cyan/20">
                <div className="flex items-center gap-2 text-vice-cyan mb-2">
                  <Home className="w-4 h-4" />
                  <span className="text-sm font-semibold">Total Properties</span>
                </div>
                <div className="text-2xl font-bold">{marketStats.totalProperties}</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-vice-orange/20">
                <div className="flex items-center gap-2 text-vice-orange mb-2">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm font-semibold">Avg Price</span>
                </div>
                <div className="text-2xl font-bold">{formatPrice(marketStats.avgPrice)}</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-vice-yellow/20">
                <div className="flex items-center gap-2 text-vice-yellow mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-semibold">Avg Days on Market</span>
                </div>
                <div className="text-2xl font-bold">{marketStats.avgDaysOnMarket}d</div>
              </div>
              <div className="p-4 bg-slate-800/50 rounded-lg border border-vice-green/20">
                <div className="flex items-center gap-2 text-vice-green mb-2">
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-sm font-semibold">Total Value</span>
                </div>
                <div className="text-2xl font-bold">{formatPrice(marketStats.totalValue)}</div>
              </div>
            </div>

            {/* Cities Breakdown */}
            {marketStats.cities.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-gta text-vice-pink mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4" /> CITIES IN YOUR MARKET
                </h4>
                <div className="grid grid-cols-3 gap-3">
                  {marketStats.cities.slice(0, 6).map((city, i) => (
                    <div key={city.name} className="p-3 bg-slate-800/30 rounded-lg border border-vice-cyan/10">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold text-vice-cyan">{city.name}</span>
                        <Badge variant="outline" className="text-xs">{city.count} props</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-slate-400">Avg Price</span>
                          <div className="text-vice-orange font-semibold">{formatPrice(city.avgPrice)}</div>
                        </div>
                        <div>
                          <span className="text-slate-400">$/SqFt</span>
                          <div className="text-vice-cyan font-semibold">${city.pricePerSqft}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Opportunity Zones */}
            {opportunityZones.length > 0 && (
              <div>
                <h4 className="text-sm font-gta text-vice-green mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4" /> TOP OPPORTUNITIES
                </h4>
                <div className="space-y-2">
                  {opportunityZones.map((zone, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-slate-800/30 rounded-lg border border-vice-green/10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-vice-green/20 flex items-center justify-center text-vice-green font-bold">
                          {i + 1}
                        </div>
                        <div>
                          <div className="font-semibold text-vice-cyan">{zone.name}</div>
                          <div className="text-xs text-slate-400">{formatPrice(zone.price)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-vice-green font-bold text-lg">+{zone.avgROI}%</div>
                        <div className="text-xs text-slate-400">Potential Equity</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
