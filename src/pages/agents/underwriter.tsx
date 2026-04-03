import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  DollarSign, TrendingUp, ArrowLeft, FileText, Target, Zap,
  Building, Mail, Home, BarChart3, Clock, CheckCircle, AlertTriangle,
  ChevronLeft, ChevronRight, Filter, Search
} from 'lucide-react'

interface Deal {
  property_id: string
  address: string
  city?: string
  state?: string
  zip_code?: string
  bedrooms?: number
  bathrooms?: number
  sqft?: number
  living_square_feet?: number
  win_win_score: number
  max_score: number
  strategy: string
  recommendation: string
  reasoning: string
  offer_price: number
  offer_percent: number
  listing_price?: number
  days_on_market?: number
  equity_percent?: number
  property_type?: string
  year_built?: number
  hoa?: number
  hoa_fee?: number
  price_per_sqft?: number
  agent_name?: string
  agent_email?: string
  agent_phone?: string
  brokerage?: string
  estimated_value?: number
  open_mortgage_balance?: number
  mortgage_rate?: number
  interest_rate?: number
  recorded_mortgage_interest_rate?: number
  level1_offer_price?: number
  level1_entry_fee?: number
  level1_monthly_payment?: number
  level2_offer_price?: number
  level2_entry_fee?: number
  level3_offer_price?: number
  level3_entry_fee?: number
  level3_monthly_payment?: number
  level3_assume_mortgage?: number
  level3_seller_carry_amount?: number
  level3_seller_carry_rate?: number
  level3_seller_carry_term?: number
  level3_cash_to_seller?: number
  recommended_level?: number
  recommended_reason?: string
  estimated_arv?: number
  estimated_equity?: number
  expected_roi?: number
  max_offer_price?: number
  factors?: any
}

const fmt = (n: number | null | undefined) => {
  if (!n && n !== 0) return '-'
  if (n >= 1000000) return '$' + (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return '$' + Math.round(n / 1000) + 'K'
  return '$' + Math.round(n).toLocaleString()
}

const scoreColor = (score: number) => {
  if (score >= 80) return 'text-yellow-400'
  if (score >= 65) return 'text-green-400'
  if (score >= 50) return 'text-blue-400'
  if (score >= 35) return 'text-orange-400'
  return 'text-slate-400'
}

const scoreBg = (score: number) => {
  if (score >= 80) return 'bg-yellow-500/20 border-yellow-500'
  if (score >= 65) return 'bg-green-500/20 border-green-500'
  if (score >= 50) return 'bg-blue-500/20 border-blue-500'
  if (score >= 35) return 'bg-orange-500/20 border-orange-500'
  return 'bg-slate-500/20 border-slate-500'
}

const strategyBadgeColor = (strategy: string) => {
  if (strategy?.includes('Seller Finance')) return 'bg-purple-600'
  if (strategy?.includes('Subject-To') || strategy?.includes('Hybrid')) return 'bg-blue-600'
  if (strategy?.includes('Cash')) return 'bg-orange-600'
  if (strategy?.includes('Lease')) return 'bg-teal-600'
  return 'bg-slate-600'
}

const ITEMS_PER_PAGE = 20

export default function UnderwriterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [selectedLevel, setSelectedLevel] = useState<1|2|3>(3)

  // Filters
  const [filterStrategy, setFilterStrategy] = useState<string>('all')
  const [filterScore, setFilterScore] = useState<number>(0)
  const [filterCity, setFilterCity] = useState<string>('')
  const [filterMinPrice, setFilterMinPrice] = useState<string>('')
  const [filterMaxPrice, setFilterMaxPrice] = useState<string>('')
  const [filterBeds, setFilterBeds] = useState<string>('')
  const [filterBaths, setFilterBaths] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState<string>('')

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['property-analysis'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      // Get property analysis with property details joined
      const { data: analysisData } = await supabase
        .from('property_analysis')
        .select(`
          *,
          properties:property_id (
            id,
            address,
            city,
            state,
            zip,
            bedrooms,
            bathrooms,
            living_square_feet,
            sqft,
            listing_price,
            days_on_market,
            open_mortgage_balance,
            last_sale_amount,
            estimated_value,
            property_type,
            year_built,
            listing_agent_full_name,
            listing_agent_email,
            listing_agent_phone,
            interest_rate
          )
        `)
        .eq('account_id', user?.id)
        .order('win_win_score', { ascending: false })

      if (!analysisData?.length) return []

      // Merge property data into analysis for easy access
      return analysisData.map((a: any) => ({
        ...a,
        // Property fields at top level for easy access
        address: a.properties?.address || a.address,
        city: a.properties?.city || a.city,
        state: a.properties?.state || a.state,
        zip: a.properties?.zip,
        bedrooms: a.properties?.bedrooms,
        bathrooms: a.properties?.bathrooms,
        living_square_feet: a.properties?.living_square_feet,
        sqft: a.properties?.sqft || a.properties?.living_square_feet,
        listing_price: a.properties?.listing_price,
        days_on_market: a.properties?.days_on_market,
        property_type: a.properties?.property_type,
        year_built: a.properties?.year_built,
        hoa: a.properties?.hoa_fee,
        price_per_sqft: a.properties?.price_per_sqft,
        agent_name: a.properties?.listing_agent_full_name || a.properties?.agent_name,
        agent_email: a.properties?.listing_agent_email || a.properties?.agent_email,
        agent_phone: a.properties?.listing_agent_phone || a.properties?.agent_phone,
        brokerage: a.properties?.listing_brokerage_name || a.properties?.brokerage,
        estimated_value: a.properties?.estimated_value,
        open_mortgage_balance: a.properties?.open_mortgage_balance,
        mortgage_rate: a.properties?.interest_rate || a.properties?.recorded_mortgage_interest_rate || a.mortgage_rate,
      })) as Deal[]
    }
  })

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/underwrite-properties`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session?.access_token}` },
        body: JSON.stringify({ property_ids: [] })
      })
      const result = await response.json()
      if (result.success) {
        queryClient.invalidateQueries({ queryKey: ['property-analysis'] })
        alert(`✅ ${result.message}`)
      } else {
        alert(`❌ ${result.error}`)
      }
    } catch (e) {
      alert('Analysis failed')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Apply all filters
  const filtered = (analysis || []).filter(d => {
    if (filterStrategy !== 'all') {
      if (filterStrategy === 'Subject-To') {
        if (d.strategy !== 'Subject-To') return false
      } else if (filterStrategy === 'Seller Finance') {
        if (d.strategy !== 'Seller Finance') return false
      } else if (filterStrategy === 'Hybrid') {
        if (!d.strategy?.includes('Hybrid')) return false
      } else {
        if (!d.strategy?.includes(filterStrategy)) return false
      }
    }
    if (d.win_win_score < filterScore) return false
    if (filterCity && !d.city?.toLowerCase().includes(filterCity.toLowerCase())) return false
    if (filterMinPrice && d.offer_price && d.offer_price < Number(filterMinPrice)) return false
    if (filterMaxPrice && d.offer_price && d.offer_price > Number(filterMaxPrice)) return false
    if (filterBeds && d.bedrooms && d.bedrooms < Number(filterBeds)) return false
    if (filterBaths && d.bathrooms && d.bathrooms < Number(filterBaths)) return false
    if (searchTerm && !d.address?.toLowerCase().includes(searchTerm.toLowerCase())) return false
    return true
  })

  // Get unique cities for filter dropdown
  const cities = [...new Set((analysis || []).map(d => d.city).filter(Boolean))]

  // Pagination
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  const stats = {
    total: analysis?.length || 0,
    elite: analysis?.filter(d => d.win_win_score >= 80).length || 0,
    strong: analysis?.filter(d => d.win_win_score >= 65).length || 0,
    viable: analysis?.filter(d => d.win_win_score >= 50).length || 0,
    avgScore: analysis?.length ? Math.round(analysis.reduce((s, d) => s + d.win_win_score, 0) / analysis.length) : 0,
    subTo: analysis?.filter(d => d.strategy?.toLowerCase().includes('subject')).length || 0,
    sellerFin: analysis?.filter(d => d.strategy === 'Seller Finance').length || 0,
    pipeline: analysis?.filter(d => d.win_win_score >= 50).reduce((s, d) => s + (Number(d.offer_price) || 0), 0) || 0,
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-[1600px] mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/command-center')}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-gta text-vice-pink">UNDERWRITER</h1>
              <p className="text-muted-foreground text-sm">Creative Finance Deal Vetting — Creative Finance Framework</p>
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}
            className="bg-vice-pink hover:bg-vice-pink/80 text-white font-gta px-8">
            <Zap className={`mr-2 w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 mb-4">
          {[
            { label: 'DEALS', value: stats.total, icon: FileText, color: 'text-vice-cyan' },
            { label: 'ELITE (80+)', value: stats.elite, icon: Target, color: 'text-yellow-400' },
            { label: 'STRONG (65+)', value: stats.strong, icon: TrendingUp, color: 'text-green-400' },
            { label: 'VIABLE (50+)', value: stats.viable, icon: CheckCircle, color: 'text-blue-400' },
            { label: 'SUBJECT-TO', value: stats.subTo, icon: Home, color: 'text-blue-400' },
            { label: 'SELLER FIN', value: stats.sellerFin, icon: DollarSign, color: 'text-purple-400' },
            { label: 'AVG SCORE', value: `${stats.avgScore}/100`, icon: BarChart3, color: scoreColor(stats.avgScore) },
            { label: 'PIPELINE', value: fmt(stats.pipeline), icon: TrendingUp, color: 'text-green-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="mission-card">
              <CardContent className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-muted-foreground font-gta">{label}</div>
                    <div className={`text-xl font-gta ${color}`}>{value}</div>
                  </div>
                  <Icon className={`w-6 h-6 ${color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filters Bar */}
        <Card className="mission-card mb-4">
          <CardContent className="p-3">
            <div className="flex flex-wrap gap-2 items-center">
              <div className="flex items-center gap-1 text-vice-cyan text-sm font-gta">
                <Filter className="w-4 h-4" /> FILTERS:
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3 h-3 absolute left-2 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Search address..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-40 h-8 pl-7 text-xs" />
              </div>

              {/* City */}
              <select value={filterCity} onChange={(e) => setFilterCity(e.target.value)}
                className="h-8 px-2 text-xs bg-slate-900 border border-slate-700 rounded">
                <option value="">All Cities</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
              </select>

              {/* Price Range */}
              <Input type="number" placeholder="Min $" value={filterMinPrice} onChange={(e) => setFilterMinPrice(e.target.value)}
                className="w-20 h-8 text-xs" />
              <Input type="number" placeholder="Max $" value={filterMaxPrice} onChange={(e) => setFilterMaxPrice(e.target.value)}
                className="w-20 h-8 text-xs" />

              {/* Beds */}
              <select value={filterBeds} onChange={(e) => setFilterBeds(e.target.value)}
                className="h-8 px-2 text-xs bg-slate-900 border border-slate-700 rounded">
                <option value="">Any Beds</option>
                <option value="2">2+ Beds</option>
                <option value="3">3+ Beds</option>
                <option value="4">4+ Beds</option>
              </select>

              {/* Baths */}
              <select value={filterBaths} onChange={(e) => setFilterBaths(e.target.value)}
                className="h-8 px-2 text-xs bg-slate-900 border border-slate-700 rounded">
                <option value="">Any Baths</option>
                <option value="2">2+ Baths</option>
                <option value="3">3+ Baths</option>
              </select>

              {/* Strategy */}
              <Button size="sm" variant={filterStrategy === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStrategy('all')} className="h-8 text-xs">All</Button>
              <Button size="sm" variant={filterStrategy === 'Subject-To' ? 'default' : 'outline'}
                onClick={() => setFilterStrategy('Subject-To')} className="h-8 text-xs">Subject-To</Button>
              <Button size="sm" variant={filterStrategy === 'Seller Finance' ? 'default' : 'outline'}
                onClick={() => setFilterStrategy('Seller Finance')} className="h-8 text-xs">Seller Finance</Button>
              <Button size="sm" variant={filterStrategy === 'Hybrid' ? 'default' : 'outline'}
                onClick={() => setFilterStrategy('Hybrid')} className="h-8 text-xs">Hybrid</Button>

              {/* Score */}
              <Button size="sm" variant={filterScore === 65 ? 'default' : 'outline'}
                onClick={() => setFilterScore(filterScore === 65 ? 0 : 65)} className="h-8 text-xs">65+</Button>
              <Button size="sm" variant={filterScore === 80 ? 'default' : 'outline'}
                onClick={() => setFilterScore(filterScore === 80 ? 0 : 80)} className="h-8 text-xs">80+</Button>

              {/* Clear Filters */}
              <Button size="sm" variant="outline" onClick={() => {
                setFilterCity('')
                setFilterMinPrice('')
                setFilterMaxPrice('')
                setFilterBeds('')
                setFilterBaths('')
                setFilterStrategy('all')
                setFilterScore(0)
                setSearchTerm('')
              }} className="h-8 text-xs text-slate-400">Clear</Button>

              <span className="text-xs text-slate-500 ml-2">
                {filtered.length} deals{filtered.length !== paginated.length ? ` (showing ${paginated.length})` : ''}
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Deal Queue */}
          <div className="lg:col-span-2">
            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="font-gta text-vice-pink">DEAL QUEUE — DEFAULT EXIT: WHOLESALE</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12"><Zap className="w-12 h-12 text-vice-cyan animate-spin mx-auto mb-4" /></div>
                ) : paginated.length > 0 ? (
                  <>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                      {paginated.map((deal) => (
                        <div key={deal.property_id}
                          className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-vice-cyan ${scoreBg(deal.win_win_score)}`}
                          onClick={() => setSelectedDeal(deal)}>
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="mb-1">
                                <span className="font-bold text-white text-sm block truncate">{deal.address || 'Address loading...'}</span>
                                <div className="flex items-center gap-2 flex-wrap mt-1">
                                  <Badge className={`text-xs ${strategyBadgeColor(deal.strategy)}`}>
                                    {deal.strategy?.split(' + ')[0] || deal.strategy}
                                  </Badge>
                                  {deal.win_win_score >= 80 && <Badge className="bg-yellow-500 text-black text-xs">ELITE</Badge>}
                                  {deal.win_win_score >= 65 && deal.win_win_score < 80 && <Badge className="bg-green-600 text-xs">STRONG</Badge>}
                                </div>
                              </div>
                              <div className="text-xs text-slate-400 flex gap-3 flex-wrap">
                                <span><Building className="w-3 h-3 inline mr-1" />{deal.city}, {deal.state}</span>
                                <span><DollarSign className="w-3 h-3 inline" />{fmt(Number(deal.offer_price))}</span>
                                {deal.bedrooms && <span>{deal.bedrooms}bd</span>}
                                {deal.bathrooms && <span>{deal.bathrooms}ba</span>}
                                {deal.sqft && <span>{Math.round(deal.sqft).toLocaleString()}sqft</span>}
                                {deal.days_on_market && deal.days_on_market > 0 && <span className="text-orange-400">{deal.days_on_market}d DOM</span>}
                              </div>
                            </div>
                            <div className={`text-2xl font-gta ${scoreColor(deal.win_win_score)} text-right shrink-0`}>
                              {deal.win_win_score}
                              <div className="text-xs text-slate-500">/100</div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-800">
                        <div className="text-xs text-slate-500">
                          Page {currentPage} of {totalPages} ({filtered.length} total)
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1} className="h-8">
                            <ChevronLeft className="w-4 h-4" /> Prev
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages} className="h-8">
                            Next <ChevronRight className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-gta text-muted-foreground mb-2">NO ANALYSIS YET</h3>
                    <p className="text-muted-foreground mb-6">Click RUN ANALYSIS to score properties using the Creative Finance Framework</p>
                    <Button onClick={handleAnalyze} disabled={isAnalyzing} className="bg-vice-cyan text-background font-gta">
                      <Zap className="mr-2 w-5 h-5" /> SCORE PROPERTIES
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card className="mission-card">
              <CardHeader><CardTitle className="font-gta text-vice-cyan text-sm">SCORING FRAMEWORK</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2 text-slate-400">
                <div className="font-bold text-yellow-400 mb-2">Deal Scoring Breakdown</div>
                {[
                  ['Motivation (DOM)', '0-30 pts', '90d+ = 20pts, 60d = 15pts'],
                  ['Equity Position', '0-25 pts', 'Free&Clear=25, >50%=22'],
                  ['Mortgage Rate', '0-20 pts', '<3.5%=20, <4.5%=15'],
                  ['Cash Flow / DSCR', '0-15 pts', 'DSCR >1.4 = 15pts'],
                  ['Market Tier', '0-10 pts', 'Tier 1 Miami = 10pts'],
                ].map(([f, p, n]) => (
                  <div key={f} className="flex justify-between gap-1">
                    <span className="text-slate-300">{f}</span>
                    <span className="text-vice-cyan shrink-0">{p}</span>
                  </div>
                ))}
                <div className="border-t border-slate-700 pt-2 mt-2 space-y-1">
                  <div className="text-yellow-400">⭐ Elite: 80-100</div>
                  <div className="text-green-400">✅ Strong: 65-79</div>
                  <div className="text-blue-400">🔵 Viable: 50-64</div>
                  <div className="text-orange-400">⚠️ Marginal: 35-49</div>
                  <div className="text-slate-400">❌ Pass: 0-34</div>
                </div>
              </CardContent>
            </Card>

            <Card className="mission-card">
              <CardHeader><CardTitle className="font-gta text-vice-cyan text-sm">EQUITY DECISION TREE</CardTitle></CardHeader>
              <CardContent className="text-xs space-y-2 text-slate-400">
                <div className="p-2 bg-purple-900/30 rounded border border-purple-700">
                  <div className="text-purple-300 font-bold">FREE & CLEAR</div>
                  <div>→ Seller Finance</div>
                  <div>0-10% down, 40yr, 0-5% rate</div>
                </div>
                <div className="p-2 bg-blue-900/30 rounded border border-blue-700">
                  <div className="text-blue-300 font-bold">HIGH EQUITY (35%+)</div>
                  <div>→ SubTo + Hybrid</div>
                  <div>Assume mortgage + carry gap</div>
                </div>
                <div className="p-2 bg-orange-900/30 rounded border border-orange-700">
                  <div className="text-orange-300 font-bold">LOW EQUITY (&lt;35%)</div>
                  <div>→ Subject-To</div>
                  <div>Small cash + take over mortgage</div>
                </div>
                <div className="p-2 bg-green-900/30 rounded border border-green-700 mt-2">
                  <div className="text-green-300 font-bold">DEFAULT EXIT = WHOLESALE</div>
                  <div>Get under contract → assign to buyer</div>
                </div>
              </CardContent>
            </Card>

            <Card className="mission-card">
              <CardHeader><CardTitle className="font-gta text-vice-cyan text-sm">NEXT AGENT</CardTitle></CardHeader>
              <CardContent>
                <Button onClick={() => navigate('/agent/email-closer')}
                  className="w-full bg-green-600 hover:bg-green-700 font-gta">
                  <Mail className="mr-2 w-4 h-4" /> EMAIL CLOSER →
                </Button>
                <p className="text-xs text-slate-500 mt-2 text-center">Send 9 offers today</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Deal Detail Modal */}
      {selectedDeal && (
        <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
          <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-gta text-vice-pink">{selectedDeal.address}</DialogTitle>
              <div className="flex gap-2 flex-wrap mt-2">
                <Badge className={strategyBadgeColor(selectedDeal.strategy)}>{selectedDeal.strategy}</Badge>
                <Badge className={scoreBg(selectedDeal.win_win_score).replace('bg-', 'border-')}>
                  Score: {selectedDeal.win_win_score}/100 — {selectedDeal.recommendation}
                </Badge>
                <Badge className="bg-green-700">EXIT: WHOLESALE</Badge>
                {selectedDeal.bedrooms && <Badge variant="outline">{selectedDeal.bedrooms}bd</Badge>}
                {selectedDeal.bathrooms && <Badge variant="outline">{selectedDeal.bathrooms}ba</Badge>}
                {selectedDeal.sqft && <Badge variant="outline">{Math.round(selectedDeal.sqft)}sqft</Badge>}
                {selectedDeal.days_on_market && <Badge variant="outline">{selectedDeal.days_on_market} DOM</Badge>}
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Strategy Reasoning */}
              <div className="p-3 bg-yellow-950/40 border border-yellow-700 rounded">
                <div className="text-xs font-bold text-yellow-400 mb-1">🧠 STRATEGY REASONING</div>
                <div className="text-sm text-yellow-100">{selectedDeal.recommended_reason}</div>
              </div>

              {/* Expandable Offer Levels - select which to send */}
              <div className="space-y-2">
                {([
                  { level: 1 as const, label: 'LEVEL 1 — Negotiation Anchor', tag: '70% + Terms', colorClass: 'border-red-700 text-red-400',
                    price: selectedDeal.level1_offer_price, entry: selectedDeal.level1_entry_fee, monthly: selectedDeal.level1_monthly_payment,
                    desc: 'Low ball for positioning. Expect counter. Seller carries note at favorable terms.',
                    rows: [
                      ['Offer Price', fmt(selectedDeal.level1_offer_price) + ' (70% of list)'],
                      ['Cash to Seller (3% of gap)', fmt(selectedDeal.level1_cash_to_seller)],
                      ['Agent Commission (3%)', fmt(Math.round((selectedDeal.level1_offer_price||0)*0.03))],
                      ['Acquisition Fee (3%)', fmt(Math.round((selectedDeal.level1_offer_price||0)*0.03))],
                      ['Closing + Reno + Other', '$17K'],
                      ['TOTAL ENTRY FEE', fmt(selectedDeal.level1_entry_fee)],
                      ...(selectedDeal.level3_assume_mortgage && selectedDeal.level3_assume_mortgage > 0 ? [
                        ['── EXISTING MORTGAGE ──', '(You assume as-is)'],
                        ['Mortgage Balance', fmt((selectedDeal as any).mortgage_balance || selectedDeal.level3_assume_mortgage)],
                        ['Existing Rate', ((selectedDeal as any).mortgage_rate ?? (selectedDeal as any).interest_rate ?? '?') + '% (LOCKED — you keep this rate)'],
                        ['Mortgage Monthly', fmt((selectedDeal as any).level1_mortgage_monthly) + '/mo (fixed)'],
                        ['── SELLER CARRY (Gap) ──', '(Negotiated terms)'],
                        ['Equity Gap to Finance', fmt(selectedDeal.level1_seller_carry_amount)],
                        ['Negotiated Rate', (selectedDeal.level1_seller_carry_rate||4) + '% (vs bank 7-9%)'],
                        ['Term', (selectedDeal.level1_seller_carry_term||40) + 'yr'],
                        ['Carry Monthly', fmt((selectedDeal as any).level1_carry_monthly) + '/mo'],
                      ] as [string,string][] : [
                        ['Seller Carry (Full)', fmt(selectedDeal.level1_seller_carry_amount)],
                        ['Rate', (selectedDeal.level1_seller_carry_rate||5) + '% vs bank 7-9%'],
                        ['Term', (selectedDeal.level1_seller_carry_term||40) + 'yr vs bank 30yr'],
                      ] as [string,string][]),
                      ['TOTAL MONTHLY', fmt(selectedDeal.level1_monthly_payment) + '/mo'],
                    ]
                  },
                  { level: 2 as const, label: 'LEVEL 2 — Cash Leverage', tag: '70% All Cash', colorClass: 'border-orange-700 text-orange-400',
                    price: selectedDeal.level2_offer_price, entry: selectedDeal.level2_entry_fee, monthly: 0,
                    desc: 'ALL CASH — fast close 7 days. Entry IS the cash needed. No terms, no seller carry.',
                    rows: [
                      ['Offer Price', fmt(selectedDeal.level2_offer_price) + ' (70% of list)'],
                      ['Agent Commission (3%)', fmt(Math.round((selectedDeal.level2_offer_price||0)*0.03))],
                      ['Closing Costs (2%)', fmt(Math.round((selectedDeal.level2_offer_price||0)*0.02))],
                      ['Renovation Reserve', '$10K'],
                      ['TOTAL CASH NEEDED', fmt(selectedDeal.level2_entry_fee)],
                      ['Monthly Payment', 'NONE — you own it outright'],
                      ['Close Timeline', '7 days (vs 30-45 bank)'],
                      ['Seller Carry', 'NONE'],
                    ]
                  },
                  { level: 3 as const, label: 'LEVEL 3 — Win-Win Creative ⭐', tag: '100% + Terms', colorClass: 'border-green-700 text-green-400',
                    price: selectedDeal.level3_offer_price, entry: selectedDeal.level3_entry_fee, monthly: selectedDeal.level3_monthly_payment,
                    desc: 'Full asking price. Seller gets their number. You get terms that beat any bank.',
                    rows: [
                      ['Offer Price', fmt(selectedDeal.level3_offer_price) + ' (100% of list)'],
                      ['Cash to Seller (3%)', fmt(selectedDeal.level3_cash_to_seller)],
                      ['Agent Commission (6%)', fmt(Math.round((selectedDeal.level3_offer_price||0)*0.06))],
                      ['Acquisition Fee (3%)', fmt(Math.round((selectedDeal.level3_offer_price||0)*0.03))],
                      ['Closing + Reno + Other', '$15K'],
                      ['TOTAL ENTRY FEE', fmt(selectedDeal.level3_entry_fee)],
                      ...(selectedDeal.level3_assume_mortgage && selectedDeal.level3_assume_mortgage > 0 ? [
                        ['── EXISTING MORTGAGE ──', '(You assume as-is)'],
                        ['Mortgage Balance', fmt(selectedDeal.level3_assume_mortgage)],
                        ['Existing Rate', ((selectedDeal as any).mortgage_rate ?? (selectedDeal as any).interest_rate ?? '?') + '% (LOCKED — you keep this rate)'],
                        ['Mortgage Monthly', fmt((selectedDeal as any).level3_mortgage_monthly) + '/mo (fixed)'],
                        ['── SELLER CARRY (Gap) ──', '(Negotiated terms)'],
                        ['Equity Gap to Finance', fmt(selectedDeal.level3_seller_carry_amount)],
                        ['Negotiated Rate', (selectedDeal.level3_seller_carry_rate||4) + '% (vs bank 7-9%)'],
                        ['Term', (selectedDeal.level3_seller_carry_term||40) + 'yr'],
                        ['Carry Monthly', fmt((selectedDeal as any).level3_carry_monthly) + '/mo'],
                      ] as [string,string][] : [
                        ['── SELLER CARRY (Full) ──', '(Free & Clear)'],
                        ['Seller Carry Amount', fmt(selectedDeal.level3_seller_carry_amount)],
                        ['Rate', (selectedDeal.level3_seller_carry_rate||5) + '% vs bank 7-9%'],
                        ['Term', (selectedDeal.level3_seller_carry_term||40) + 'yr vs bank 30yr'],
                      ] as [string,string][]),
                      ['TOTAL MONTHLY', fmt(selectedDeal.level3_monthly_payment) + '/mo'],
                    ]
                  },
                ] as const).map(({ level, label, tag, colorClass, price, entry, monthly, desc, rows }) => {
                  const active = selectedLevel === level
                  return (
                    <div key={level} className={`border rounded-lg ${colorClass.split(' ')[0]} ${active ? 'ring-1 ring-white/20' : ''}`}>
                      <div className="flex items-center justify-between p-3 cursor-pointer"
                        onClick={() => setSelectedLevel(level)}>
                        <div className="flex items-center gap-2">
                          <input type="radio" checked={active} onChange={() => setSelectedLevel(level)}
                            onClick={e => e.stopPropagation()} />
                          <span className={`font-bold text-xs ${colorClass.split(' ')[1]}`}>{label}</span>
                          <span className="text-xs bg-slate-700 px-2 py-0.5 rounded">{tag}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className={`font-gta ${colorClass.split(' ')[1]}`}>{fmt(price)}</div>
                            <div className="text-xs text-slate-400">Entry: {fmt(entry)}</div>
                          </div>
                          <span className="text-slate-500">{active ? '▲' : '▼'}</span>
                        </div>
                      </div>
                      {active && (
                        <div className="px-3 pb-3 border-t border-slate-800">
                          <p className="text-xs text-slate-400 my-2">{desc}</p>
                          <div className="space-y-1">
                            {rows.map(([k, v]) => (
                              <div key={String(k)} className={`flex justify-between text-xs ${String(k).startsWith('TOTAL') ? 'font-bold border-t border-slate-700 pt-1 mt-1' : ''}`}>
                                <span className="text-slate-400">{k}</span>
                                <span className={String(k).startsWith('TOTAL') ? colorClass.split(' ')[1] : 'text-slate-200'}>{v}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 font-gta"
                  onClick={() => { setSelectedDeal(null); navigate('/agent/email-closer', { state: { property: selectedDeal, analysis: selectedDeal, selected_level: selectedLevel } }) }}>
                  <Mail className="mr-2 w-4 h-4" /> SEND LEVEL {selectedLevel} OFFER EMAIL
                </Button>
                <Button variant="outline" onClick={() => setSelectedDeal(null)}>Close</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
