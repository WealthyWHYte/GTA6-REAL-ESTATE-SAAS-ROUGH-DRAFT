import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DollarSign, TrendingUp, ArrowLeft, FileText, Target, Zap,
  Building, Mail, Home, BarChart3, Clock, CheckCircle, AlertTriangle
} from 'lucide-react'

interface Deal {
  property_id: string
  address: string
  city?: string
  state?: string
  win_win_score: number
  max_score: number
  strategy: string
  recommendation: string
  reasoning: string
  offer_price: number
  offer_percent: number
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
}

const fmt = (n: number | null | undefined) => {
  if (!n || n === 0) return '-'
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

export default function UnderwriterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<Deal | null>(null)
  const [filterStrategy, setFilterStrategy] = useState<string>('all')
  const [filterScore, setFilterScore] = useState<number>(0)

  const { data: analysis, isLoading } = useQuery({
    queryKey: ['property-analysis'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('property_analysis')
        .select('*')
        .eq('account_id', user?.id)
        .order('win_win_score', { ascending: false })
      return data as Deal[] || []
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

  const filtered = (analysis || []).filter(d => {
    if (filterStrategy !== 'all' && !d.strategy?.includes(filterStrategy)) return false
    if (d.win_win_score < filterScore) return false
    return true
  })

  const stats = {
    total: analysis?.length || 0,
    elite: analysis?.filter(d => d.win_win_score >= 80).length || 0,
    strong: analysis?.filter(d => d.win_win_score >= 65).length || 0,
    viable: analysis?.filter(d => d.win_win_score >= 50).length || 0,
    avgScore: analysis?.length ? Math.round(analysis.reduce((s, d) => s + d.win_win_score, 0) / analysis.length) : 0,
    subTo: analysis?.filter(d => d.strategy?.includes('Subject-To')).length || 0,
    sellerFin: analysis?.filter(d => d.strategy?.includes('Seller Finance')).length || 0,
    pipeline: analysis?.filter(d => d.win_win_score >= 50).reduce((s, d) => s + (Number(d.offer_price) || 0), 0) || 0,
  }

  const strategies = [...new Set((analysis || []).map(d => d.strategy).filter(Boolean))]

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={() => navigate('/command-center')}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <div>
              <h1 className="text-3xl font-gta text-vice-pink">UNDERWRITER</h1>
              <p className="text-muted-foreground text-sm">Creative Finance Deal Vetting — Jerry Norton Framework</p>
            </div>
          </div>
          <Button onClick={handleAnalyze} disabled={isAnalyzing}
            className="bg-vice-pink hover:bg-vice-pink/80 text-white font-gta px-8">
            <Zap className={`mr-2 w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'DEALS ANALYZED', value: stats.total, icon: FileText, color: 'text-vice-cyan' },
            { label: 'ELITE (80+)', value: stats.elite, icon: Target, color: 'text-yellow-400' },
            { label: 'STRONG (65+)', value: stats.strong, icon: TrendingUp, color: 'text-green-400' },
            { label: 'VIABLE (50+)', value: stats.viable, icon: CheckCircle, color: 'text-blue-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="mission-card">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-muted-foreground font-gta">{label}</div>
                    <div className={`text-3xl font-gta ${color}`}>{value}</div>
                  </div>
                  <Icon className={`w-8 h-8 ${color} opacity-50`} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Strategy Overview */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Subject-To', value: stats.subTo, color: 'text-blue-400', note: 'Assume existing mortgage' },
            { label: 'Seller Finance', value: stats.sellerFin, color: 'text-purple-400', note: 'Free & clear deals' },
            { label: 'Avg Score', value: stats.avgScore + '/100', color: scoreColor(stats.avgScore), note: 'Portfolio average' },
            { label: 'Pipeline Value', value: fmt(stats.pipeline), color: 'text-green-400', note: 'Viable deals total' },
          ].map(({ label, value, color, note }) => (
            <Card key={label} className="mission-card">
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className={`text-2xl font-gta ${color}`}>{value}</div>
                <div className="text-xs text-slate-500 mt-1">{note}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Deal Queue */}
          <div className="lg:col-span-2">

            {/* Filters */}
            <div className="flex gap-2 mb-4 flex-wrap">
              <Button size="sm" variant={filterStrategy === 'all' ? 'default' : 'outline'}
                onClick={() => setFilterStrategy('all')} className="text-xs">All</Button>
              <Button size="sm" variant={filterStrategy === 'Subject-To' ? 'default' : 'outline'}
                onClick={() => setFilterStrategy('Subject-To')} className="text-xs">Subject-To</Button>
              <Button size="sm" variant={filterStrategy === 'Seller Finance' ? 'default' : 'outline'}
                onClick={() => setFilterStrategy('Seller Finance')} className="text-xs">Seller Finance</Button>
              <Button size="sm" variant={filterScore === 65 ? 'default' : 'outline'}
                onClick={() => setFilterScore(filterScore === 65 ? 0 : 65)} className="text-xs">Strong Only (65+)</Button>
              <Button size="sm" variant={filterScore === 80 ? 'default' : 'outline'}
                onClick={() => setFilterScore(filterScore === 80 ? 0 : 80)} className="text-xs">Elite Only (80+)</Button>
              <span className="text-xs text-slate-500 self-center ml-2">{filtered.length} deals</span>
            </div>

            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="font-gta text-vice-pink">DEAL QUEUE — DEFAULT EXIT: WHOLESALE</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center py-12"><Zap className="w-12 h-12 text-vice-cyan animate-spin mx-auto mb-4" /></div>
                ) : filtered.length > 0 ? (
                  <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
                    {filtered.slice(0, 50).map((deal) => (
                      <div key={deal.property_id}
                        className={`p-4 rounded-lg border cursor-pointer transition-all hover:border-vice-cyan ${scoreBg(deal.win_win_score)}`}
                        onClick={() => setSelectedDeal(deal)}>
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="font-bold text-white text-sm truncate">{deal.address}</span>
                              <Badge className={`text-xs ${strategyBadgeColor(deal.strategy)}`}>
                                {deal.strategy?.split(' + ')[0] || deal.strategy}
                              </Badge>
                              {deal.win_win_score >= 80 && <Badge className="bg-yellow-500 text-black text-xs">⭐ ELITE</Badge>}
                              {deal.win_win_score >= 65 && deal.win_win_score < 80 && <Badge className="bg-green-600 text-xs">STRONG</Badge>}
                            </div>
                            <div className="text-xs text-slate-400 flex gap-3 flex-wrap">
                              <span><Building className="w-3 h-3 inline mr-1" />{deal.city}, {deal.state}</span>
                              <span><DollarSign className="w-3 h-3 inline" />{fmt(Number(deal.offer_price))}</span>
                              <span className="text-slate-500">{deal.recommended_reason?.substring(0, 60)}...</span>
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
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-gta text-muted-foreground mb-2">NO ANALYSIS YET</h3>
                    <p className="text-muted-foreground mb-6">Click RUN ANALYSIS to score properties using the Jerry Norton Creative Finance Framework</p>
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
                <div className="font-bold text-yellow-400 mb-2">Jerry Norton Deal Structure</div>
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
              <div className="flex gap-2 flex-wrap">
                <Badge className={strategyBadgeColor(selectedDeal.strategy)}>{selectedDeal.strategy}</Badge>
                <Badge className={scoreBg(selectedDeal.win_win_score).replace('bg-', 'border-')}>
                  Score: {selectedDeal.win_win_score}/100 — {selectedDeal.recommendation}
                </Badge>
                <Badge className="bg-green-700">EXIT: WHOLESALE</Badge>
              </div>
            </DialogHeader>

            <div className="space-y-4 mt-4">
              {/* Strategy Reasoning */}
              <div className="p-3 bg-yellow-950/40 border border-yellow-700 rounded">
                <div className="text-xs font-bold text-yellow-400 mb-1">🧠 STRATEGY REASONING</div>
                <div className="text-sm text-yellow-100">{selectedDeal.recommended_reason}</div>
              </div>

              {/* 3 Offer Levels */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-red-950/40 border border-red-700 rounded">
                  <div className="text-xs font-bold text-red-400 mb-1">LEVEL 1</div>
                  <div className="text-xs text-slate-400">Negotiation Anchor</div>
                  <div className="text-lg font-gta text-red-300">{fmt(selectedDeal.level1_offer_price)}</div>
                  <div className="text-xs text-slate-500">70% of list + terms</div>
                  <div className="text-xs mt-1">Entry: {fmt(selectedDeal.level1_entry_fee)}</div>
                  <div className="text-xs">Monthly: {fmt(selectedDeal.level1_monthly_payment)}/mo</div>
                </div>
                <div className="p-3 bg-orange-950/40 border border-orange-700 rounded">
                  <div className="text-xs font-bold text-orange-400 mb-1">LEVEL 2</div>
                  <div className="text-xs text-slate-400">Cash Leverage</div>
                  <div className="text-lg font-gta text-orange-300">{fmt(selectedDeal.level2_offer_price)}</div>
                  <div className="text-xs text-slate-500">70% all cash</div>
                  <div className="text-xs mt-1">Entry: {fmt(selectedDeal.level2_entry_fee)}</div>
                  <div className="text-xs">Fast close 7 days</div>
                </div>
                <div className="p-3 bg-green-950/40 border border-green-700 rounded">
                  <div className="text-xs font-bold text-green-400 mb-1">LEVEL 3 ⭐</div>
                  <div className="text-xs text-slate-400">Win-Win Creative</div>
                  <div className="text-lg font-gta text-green-300">{fmt(selectedDeal.level3_offer_price)}</div>
                  <div className="text-xs text-slate-500">100% + terms</div>
                  <div className="text-xs mt-1">Entry: {fmt(selectedDeal.level3_entry_fee)}</div>
                  <div className="text-xs">Monthly: {fmt(selectedDeal.level3_monthly_payment)}/mo</div>
                </div>
              </div>

              {/* Level 3 Detail */}
              {selectedDeal.level3_seller_carry_amount && (
                <div className="p-3 bg-slate-800 rounded space-y-2 text-sm">
                  <div className="font-bold text-green-400">Level 3 Structure Detail</div>
                  {selectedDeal.level3_assume_mortgage && selectedDeal.level3_assume_mortgage > 0 && (
                    <div className="flex justify-between"><span className="text-slate-400">Assume Mortgage</span><span>{fmt(selectedDeal.level3_assume_mortgage)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-slate-400">Seller Carry Amount</span><span>{fmt(selectedDeal.level3_seller_carry_amount)}</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Rate</span><span>{selectedDeal.level3_seller_carry_rate}% (vs bank 7-9%)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Term</span><span>{selectedDeal.level3_seller_carry_term}yr (vs bank 30yr)</span></div>
                  <div className="flex justify-between"><span className="text-slate-400">Cash to Seller</span><span>{fmt(selectedDeal.level3_cash_to_seller)}</span></div>
                </div>
              )}

              <div className="flex gap-2">
                <Button className="flex-1 bg-green-600 hover:bg-green-700 font-gta"
                  onClick={() => { setSelectedDeal(null); navigate('/agent/email-closer', { state: { property: selectedDeal, analysis: selectedDeal, selected_level: 3 } }) }}>
                  <Mail className="mr-2 w-4 h-4" /> SEND OFFER EMAIL (LEVEL 3)
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
