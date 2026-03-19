import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  Calculator,
  Star,
  DollarSign,
  TrendingUp,
  ArrowLeft,
  FileText,
  Target,
  Zap,
  Building,
  Clock,
  CheckCircle,
  AlertTriangle,
  Send,
  Mail
} from 'lucide-react'

interface ScoredProperty {
  property_id: string
  address: string
  city?: string
  state?: string
  win_win_score: number
  max_score: number
  strategy: string
  offer_price: number
  offer_percent: number
  estimated_value?: number
  reasoning: string
  recommendation: string
  factors?: string // JSON string with level1, level2, level3, pain_points, etc.
  // New 3-level columns from property_analysis
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
  recommended_level?: number
  recommended_reason?: string
  comps_count?: number
  comps_avg_price?: number
  comps_data?: any
}

export default function UnderwriterPage() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedDeal, setSelectedDeal] = useState<ScoredProperty | null>(null)

  // Navigate to email closer with selected level
  const selectLevel = (level: 1 | 2 | 3) => {
    navigate('/agents/email-closer', {
      state: {
        property: selectedDeal,
        analysis: selectedDeal,
        selected_level: level
      }
    })
  }

  // Fetch property analysis - filtered by account
  const { data: analysis, isLoading: loadingAnalysis } = useQuery({
    queryKey: ['property-analysis'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('property_analysis')
        .select(`
          *,
          level1_offer_price,
          level1_entry_fee,
          level1_monthly_payment,
          level2_offer_price,
          level2_entry_fee,
          level3_offer_price,
          level3_entry_fee,
          level3_monthly_payment,
          level3_assume_mortgage,
          level3_seller_carry_amount,
          recommended_level,
          recommended_reason
        `)
        .eq('account_id', user?.id)
        .order('win_win_score', { ascending: false })
      return data as ScoredProperty[] || []
    }
  })

  // Fetch offers - filtered by account
  const { data: offers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('account_id', user?.id)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  // Trigger underwriting analysis
  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/underwrite-properties`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          property_ids: []
        })
      })

      const result = await response.json()
      console.log('Underwriting result:', result)
      
      if (result.success) {
        alert(`✅ Underwriting complete! Analyzed ${result.total_analyzed} properties.`)
      } else {
        alert(`❌ Underwriting failed: ${result.error}`)
      }
      
      queryClient.invalidateQueries({ queryKey: ['property-analysis'] })
      queryClient.invalidateQueries({ queryKey: ['properties'] })
    } catch (error) {
      console.error('Analysis failed:', error)
      alert('Failed to analyze properties')
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Get stats
  const stats = {
    total: analysis?.length || 0,
    avgScore: analysis?.length 
      ? (analysis.reduce((sum, p) => sum + p.win_win_score, 0) / analysis.length).toFixed(1)
      : '0',
    strongDeals: analysis?.filter(p => p.win_win_score >= 70).length || 0,
    pipelineValue: analysis
      ?.filter(p => p.win_win_score >= 50 && p.offer_price)
      .reduce((sum, p) => sum + (parseFloat(String(p.offer_price)) || 0), 0) || 0
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/command-center')}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              BACK TO COMMAND CENTER
            </Button>
            <div>
              <h1 className="text-4xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text">
                UNDERWRITER
              </h1>
              <p className="text-vice-cyan font-body">Deal vetting & creative finance analysis</p>
            </div>
          </div>
          <Button
            variant="neon-cyan"
            size="lg"
            onClick={handleAnalyze}
            disabled={isAnalyzing}
          >
            <Zap className={`mr-2 w-5 h-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            {isAnalyzing ? 'ANALYZING...' : 'RUN ANALYSIS'}
          </Button>
        </div>

        {/* Stats Dashboard */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-pink flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                DEALS ANALYZED
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-pink">{stats.total}</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-cyan flex items-center gap-2">
                <Star className="w-4 h-4" />
                AVERAGE SCORE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-cyan">{stats.avgScore}/100</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-orange flex items-center gap-2">
                <Star className="w-4 h-4" />
                STRONG DEALS (70+)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-orange">{stats.strongDeals}</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-gta text-vice-green flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                PIPELINE VALUE
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-gta text-vice-green">
                ${(stats.pipelineValue / 1000000).toFixed(1)}M
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Deal Queue */}
          <div className="lg:col-span-2">
            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="font-gta text-vice-pink">DEAL ANALYSIS QUEUE</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingAnalysis ? (
                  <div className="text-center py-12">
                    <Zap className="w-12 h-12 text-vice-cyan animate-spin mx-auto mb-4" />
                    <p className="text-vice-cyan">Loading analysis...</p>
                  </div>
                ) : analysis && analysis.length > 0 ? (
                  <div className="space-y-3">
                    {analysis.slice(0, 15).map((property) => (
                      <div 
                        key={property.property_id}
                        className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border hover:border-vice-cyan transition-colors cursor-pointer"
                        onClick={() => setSelectedDeal(property)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-gta text-white">{property.address}</span>
                            <Badge 
                              className={
                                property.recommendation === 'STRONG DEAL' 
                                  ? 'bg-vice-green text-black'
                                  : property.recommendation === 'GOOD DEAL'
                                  ? 'bg-vice-orange text-black'
                                  : 'bg-muted text-muted-foreground'
                              }
                            >
                              {property.recommendation}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Building className="w-3 h-3" />
                              {property.city}, {property.state}
                            </span>
                            <span className="flex items-center gap-1">
                              <Target className="w-3 h-3" />
                              {property.strategy}
                            </span>
                            <span className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${property.offer_price?.toLocaleString()} ({property.offer_percent}% of list)
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-gta text-vice-cyan">{property.win_win_score}</div>
                          <div className="text-xs text-muted-foreground">/100</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-xl font-gta text-muted-foreground mb-2">NO ANALYSIS YET</h3>
                    <p className="text-muted-foreground mb-6">
                      Click "RUN ANALYSIS" to score your properties
                    </p>
                    <Button
                      variant="neon-cyan"
                      size="lg"
                      onClick={handleAnalyze}
                      className="px-8"
                    >
                      <Zap className="mr-2 w-5 h-5" />
                      SCORE PROPERTIES
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Configuration */}
          <div>
            <Card className="mission-card mb-6">
              <CardHeader>
                <CardTitle className="font-gta text-vice-cyan">ANALYSIS CRITERIA</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground mb-2">Scoring Factors:</p>
                  <ul className="space-y-1 text-xs text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-vice-pink" />
                      Equity Position (0-4 pts)
                    </li>
                    <li className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-vice-pink" />
                      Days on Market (0-3 pts)
                    </li>
                    <li className="flex items-center gap-2">
                      <Building className="w-3 h-3 text-vice-pink" />
                      Financing Type (0-2 pts)
                    </li>
                    <li className="flex items-center gap-2">
                      <DollarSign className="w-3 h-3 text-vice-pink" />
                      Price Discount (0-2 pts)
                    </li>
                  </ul>
                </div>

                <div className="pt-4 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">Next Agent:</p>
                  <Button
                    variant="outline"
                    className="w-full border-vice-orange text-vice-orange hover:bg-vice-orange hover:text-black"
                    onClick={() => navigate('/agent/email-closer')}
                  >
                    <Send className="mr-2 w-4 h-4" />
                    EMAIL CLOSER
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mission-card">
              <CardHeader>
                <CardTitle className="font-gta text-vice-green">TOP STRATEGIES</CardTitle>
              </CardHeader>
              <CardContent>
                {analysis && analysis.length > 0 ? (
                  <div className="space-y-2">
                    {Object.entries(
                      analysis.reduce((acc, p) => {
                        acc[p.strategy] = (acc[p.strategy] || 0) + 1
                        return acc
                      }, {} as Record<string, number>)
                    )
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 4)
                      .map(([strategy, count]) => (
                        <div key={strategy} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">{strategy}</span>
                          <span className="font-gta text-vice-cyan">{count}</span>
                        </div>
                      ))
                    }
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">Run analysis to see strategies</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Deal Details Modal */}
        <Dialog open={!!selectedDeal} onOpenChange={() => setSelectedDeal(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-gta text-vice-cyan text-xl">
                {selectedDeal?.address}
              </DialogTitle>
            </DialogHeader>
            
            {selectedDeal && (() => {
              // Use actual database values for 3 levels
              const listingPrice = selectedDeal.offer_price / (selectedDeal.offer_percent / 100)

              const level1 = {
                offer_price: selectedDeal.level1_offer_price || listingPrice * 0.7,
                entry_fee: selectedDeal.level1_entry_fee || 0,
                monthly_payment: selectedDeal.level1_monthly_payment || 0,
                score: selectedDeal.win_win_score - 10
              }
              const level2 = {
                offer_price: selectedDeal.level2_offer_price || listingPrice * 0.7,
                entry_fee: selectedDeal.level2_entry_fee || 0,
                score: selectedDeal.win_win_score - 15
              }
              const level3 = {
                offer_price: selectedDeal.level3_offer_price || listingPrice,
                entry_fee: selectedDeal.level3_entry_fee || 0,
                monthly_payment: selectedDeal.level3_monthly_payment || 0,
                assume_mortgage: selectedDeal.level3_assume_mortgage || 0,
                seller_carry: selectedDeal.level3_seller_carry_amount || 0,
                score: selectedDeal.win_win_score + 10
              }

              const recommendedLevel = selectedDeal.recommended_level || 3

              return (
                <div className="space-y-6">
                  {/* Score */}
                  <div className="text-center p-4 bg-slate-800 rounded-lg">
                    <div className="text-4xl font-gta text-vice-cyan">{selectedDeal.win_win_score}</div>
                    <div className="text-sm text-muted-foreground">Win-Win Score / 100</div>
                    <Badge className="mt-2 bg-vice-green text-black">{selectedDeal.strategy}</Badge>
                    {selectedDeal.recommended_reason && (
                      <p className="text-xs text-muted-foreground mt-2">{selectedDeal.recommended_reason}</p>
                    )}
                  </div>

                  {/* 3 Levels Tabs */}
                  <div className="space-y-4">
                    <h3 className="font-gta text-vice-pink">NEGOTIATION LEVELS</h3>

                    {/* Level 1 */}
                    <div className="p-4 border border-vice-orange rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-vice-orange">LEVEL 1: 70% + Terms</span>
                        <Badge>{level1?.score || 'N/A'}/100</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Offer: <span className="text-vice-cyan">${(level1?.offer_price || 0).toLocaleString()}</span></div>
                        <div>Entry Fee: <span className="text-vice-cyan">${(level1?.entry_fee || 0).toLocaleString()}</span></div>
                        <div>Monthly: <span className="text-vice-cyan">${Math.round(level1?.monthly_payment || 0).toLocaleString()}</span></div>
                        <div>Structure: <span className="text-vice-cyan">Seller Finance</span></div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => selectLevel(1)}
                      >
                        Generate Email - Level 1
                      </Button>
                    </div>

                    {/* Level 2 */}
                    <div className="p-4 border border-blue-500 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-blue-400">LEVEL 2: 70% Cash</span>
                        <Badge variant="outline">{level2?.score || 'N/A'}/100</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Offer: <span className="text-vice-cyan">${(level2?.offer_price || 0).toLocaleString()}</span></div>
                        <div>Entry Fee: <span className="text-vice-cyan">${(level2?.entry_fee || 0).toLocaleString()}</span></div>
                        <div>Monthly: <span className="text-vice-cyan">$0 (Cash)</span></div>
                        <div>Structure: <span className="text-vice-cyan">All Cash</span></div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => selectLevel(2)}
                      >
                        Generate Email - Level 2
                      </Button>
                    </div>

                    {/* Level 3 - Recommended */}
                    <div className="p-4 border border-vice-green rounded-lg bg-vice-green/10">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-vice-green">LEVEL 3: 100% Full Price + Terms {selectedDeal.recommended_level === 3 ? '⭐' : ''}</span>
                        <Badge className="bg-vice-green text-black">{level3?.score || 'N/A'}/100</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Offer: <span className="text-vice-cyan">${(level3?.offer_price || 0).toLocaleString()}</span></div>
                        <div>Entry Fee: <span className="text-vice-cyan">${(level3?.entry_fee || 0).toLocaleString()}</span></div>
                        <div>Monthly: <span className="text-vice-cyan">${Math.round(level3?.monthly_payment || 0).toLocaleString()}</span></div>
                        <div>Assume Mortgage: <span className="text-vice-cyan">${(level3?.assume_mortgage || 0).toLocaleString()}</span></div>
                        <div>Seller Carries: <span className="text-vice-cyan">${(level3?.seller_carry || 0).toLocaleString()}</span></div>
                        <div>Structure: <span className="text-vice-cyan">Subject-To + Seller Finance</span></div>
                      </div>
                      <Button
                        size="sm"
                        className="w-full mt-3"
                        onClick={() => selectLevel(3)}
                      >
                        Generate Email - Level 3
                      </Button>
                    </div>
                  </div>

                  {/* Reasoning */}
                  <div>
                    <h4 className="font-gta text-vice-cyan mb-2">📋 RECOMMENDATION</h4>
                    <p className="text-sm">{selectedDeal.reasoning}</p>
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
