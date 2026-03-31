import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertCircle, CheckCircle2, Clock, Database, FileText, Mail, Search, Send, TrendingUp, Users, Warehouse, ArrowRight, Cpu, Target, Shield, Layers, GitBranch } from 'lucide-react'

interface PropertyFlow {
  id: number
  property_id: string
  address: string
  city: string
  state: string
  listing_price: number
  pipeline_status: string
  created_at: string
  updated_at: string
  dataset_id: string
  mortgage_rate?: number
  days_on_market?: number
  equity_percent?: number
  win_win_score?: number
  offer_price?: number
  agent_email?: string
  communications?: Communication[]
}

interface Communication {
  id: number
  direction: string
  subject?: string
  status?: string
  sent_at?: string
}

interface PipelineStage {
  id: string
  name: string
  icon: any
  color: string
  description: string
  count: number
  properties: PropertyFlow[]
}


// Architecture layers with actual tables and edge functions from this project
const ARCHITECTURE_LAYERS = [
  {
    id: 'input',
    name: 'Input Layer',
    icon: Database,
    color: 'bg-blue-500',
    purpose: 'Property data ingestion from CSV uploads. Raw property records enter the system here.',
    tables: ['properties', 'datasets'],
    edgeFunctions: ['process-csv'],
    outputs: ['Property records with pipeline_status=uploaded', 'Dataset tracking records']
  },
  {
    id: 'enrichment',
    name: 'Enrichment Layer',
    icon: Search,
    color: 'bg-purple-500',
    purpose: 'AI-powered market research and data enrichment. Analyzes market conditions, comps, and ARV.',
    tables: ['market_analysis', 'market_research_results'],
    edgeFunctions: ['market-research', 'market-researcher', 'analyze-market', 'evaluate-market-research', 'process-comps'],
    outputs: ['Median price', 'Days on market', 'Market temperature (Hot/Warm/Cool/Cold)', 'Investment grade', 'Top opportunities', 'Risk factors']
  },
  {
    id: 'decision',
    name: 'Decision Layer',
    icon: Cpu,
    color: 'bg-orange-500',
    purpose: 'Underwriting and deal scoring. Calculates win-win scores, strategies, and offer recommendations.',
    tables: ['property_analysis', 'user_api_config', 'api_usage_log'],
    edgeFunctions: ['underwrite-property', 'underwrite-properties'],
    outputs: ['Win-win score (0-100)', 'Recommended strategy (Subject-To, Seller Financing, etc.)', 'Max offer price', 'Expected ROI', 'Deal strengths & risks']
  },
  {
    id: 'outreach',
    name: 'Outreach Layer',
    icon: Mail,
    color: 'bg-indigo-500',
    purpose: 'Automated email generation and agent communication. Sends offers and handles responses.',
    tables: ['communications', 'offers', 'email_queue', 'email_responses', 'email_settings'],
    edgeFunctions: ['generate-email', 'generate-email-response', 'generate-offer', 'send-email', 'generate-ai-reply', 'process-email-responses', 'check-gmail-replies', 'gmail-webhook'],
    outputs: ['Initial outreach emails', 'Follow-up sequences', 'Offer presentations', 'Agent responses tracked']
  },
  {
    id: 'dispo',
    name: 'Dispo / Exit Layer',
    icon: Warehouse,
    color: 'bg-pink-500',
    purpose: 'Disposition and closing. Matches properties with cash buyers and tracks closings.',
    tables: ['contracts', 'seller_closings'],
    edgeFunctions: ['dispo-match', 'contract-specialist'],
    outputs: ['Cash buyer matches', 'Assignment contracts', 'Closing schedules', 'Wholesale fees']
  },
  {
    id: 'tracking',
    name: 'Operating System / Tracking Layer',
    icon: Layers,
    color: 'bg-emerald-500',
    purpose: 'System-wide tracking, user preferences, and analytics. Monitors API usage and agent performance.',
    tables: ['user_preferences', 'user_api_config', 'api_usage_log', 'communications'],
    edgeFunctions: ['autonomous-orchestrator'],
    outputs: ['API usage metrics', 'Agent performance stats', 'Pipeline conversion rates', 'Cost tracking per property']
  }
]

// System flow stages
const SYSTEM_FLOW = [
  { stage: 'Upload', icon: Database, description: 'CSV import via process-csv' },
  { stage: 'Analyze', icon: Search, description: 'Market research & comps' },
  { stage: 'Underwrite', icon: TrendingUp, description: 'Deal scoring & strategy' },
  { stage: 'Offer', icon: FileText, description: 'Generate offer emails' },
  { stage: 'Negotiate', icon: Mail, description: 'Email exchanges & follow-ups' },
  { stage: 'Dispo', icon: Warehouse, description: 'Find cash buyers' },
  { stage: 'Close', icon: CheckCircle2, description: 'Contract & assignment' }
]

const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'scouted', name: '📥 Input (Scouted)', icon: Database, color: 'bg-blue-500', description: 'Properties uploaded from CSV', count: 0, properties: [] },
  { id: 'market_research', name: '🔍 Market Scout', icon: Search, color: 'bg-purple-500', description: 'AI analyzing market conditions', count: 0, properties: [] },
  { id: 'researched', name: '✅ Market Complete', icon: CheckCircle2, color: 'bg-green-500', description: 'Market research finished', count: 0, properties: [] },
  { id: 'underwriting', name: '📊 Underwriter', icon: TrendingUp, color: 'bg-orange-500', description: 'Calculating terms & scores', count: 0, properties: [] },
  { id: 'underwritten', name: '✅ Underwrite Complete', icon: CheckCircle2, color: 'bg-green-500', description: 'Analysis ready', count: 0, properties: [] },
  { id: 'offer_generation', name: '📝 Offer Generator', icon: FileText, color: 'bg-yellow-500', description: 'Generating offer emails', count: 0, properties: [] },
  { id: 'offer_sent', name: '📧 Agent Contacted', icon: Mail, color: 'bg-indigo-500', description: 'Email sent to listing agent', count: 0, properties: [] },
  { id: 'accepted', name: '🤝 Accepted', icon: Users, color: 'bg-emerald-500', description: 'Agent/seller accepted offer', count: 0, properties: [] },
  { id: 'disposition', name: '🏠 Disposition', icon: Warehouse, color: 'bg-pink-500', description: 'Finding cash buyers', count: 0, properties: [] },
]

export default function DataFlowPage() {
  const [properties, setProperties] = useState<PropertyFlow[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStage, setSelectedStage] = useState<string>('all')
  const [flowMetrics, setFlowMetrics] = useState<any>({})

  useEffect(() => {
    loadProperties()
  }, [])

  async function loadProperties() {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          property_analysis (
            win_win_score,
            mortgage_rate,
            equity_percent
          ),
          communications (
            id,
            direction,
            subject,
            status,
            sent_at
          )
        `)
        .order('created_at', { ascending: false })
        .limit(500)

      if (error) throw error

      const enriched = data?.map((p: any) => ({
        ...p,
        win_win_score: p.property_analysis?.[0]?.win_win_score,
        mortgage_rate: p.property_analysis?.[0]?.mortgage_rate,
        equity_percent: p.property_analysis?.[0]?.equity_percent,
        communications: p.communications || [],
      })) || []

      setProperties(enriched)

      // Calculate metrics
      const metrics: any = {}
      PIPELINE_STAGES.forEach(stage => {
        metrics[stage.id] = enriched.filter(p =>
          p.pipeline_status === stage.id ||
          (stage.id === 'scouted' && (!p.pipeline_status || p.pipeline_status === 'uploaded'))
        ).length
      })
      metrics.total = enriched.length
      metrics.elite = enriched.filter(p => (p.win_win_score || 0) >= 80).length
      metrics.strong = enriched.filter(p => (p.win_win_score || 0) >= 65).length
      metrics.missingRate = enriched.filter(p =>
        p.pipeline_status === 'underwritten' &&
        !p.property_analysis?.[0]?.mortgage_rate
      ).length

      setFlowMetrics(metrics)
      setLoading(false)
    } catch (error) {
      console.error('Error loading properties:', error)
      setLoading(false)
    }
  }

  function getStageColor(status: string): string {
    const stage = PIPELINE_STAGES.find(s => s.id === status)
    return stage?.color || 'bg-gray-400'
  }

  function getStatusIcon(status: string): any {
    const stage = PIPELINE_STAGES.find(s => s.id === status)
    return stage?.icon || Clock
  }

  function formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  function getFilteredProperties() {
    if (selectedStage === 'all') return properties
    if (selectedStage === 'scouted') {
      return properties.filter(p =>
        p.pipeline_status === 'scouted' ||
        !p.pipeline_status ||
        p.pipeline_status === 'uploaded'
      )
    }
    return properties.filter(p => p.pipeline_status === selectedStage)
  }

  function getBottlenecks() {
    const bottlenecks = []

    // Check for underwriting bottleneck
    const underwritingCount = flowMetrics.underwriting || 0
    const underwrittenCount = flowMetrics.underwritten || 0
    const missingRateCount = flowMetrics.missingRate || 0

    if (underwritingCount + underwrittenCount > 10) {
      bottlenecks.push({
        stage: 'Underwriter',
        issue: `${underwritingCount + underwrittenCount} properties stuck`,
        severity: underwritingCount > 20 ? 'high' : 'medium',
        detail: missingRateCount > 0
          ? `${missingRateCount} properties missing interest rate data`
          : 'Processing delay'
      })
    }

    // Check for offer generation bottleneck
    const offerGenCount = flowMetrics.offer_generation || 0
    if (offerGenCount > 5) {
      bottlenecks.push({
        stage: 'Offer Generator',
        issue: `${offerGenCount} offers pending`,
        severity: offerGenCount > 15 ? 'high' : 'medium',
        detail: 'Offers generated but not sent'
      })
    }

    // Check for market research bottleneck
    const marketCount = flowMetrics.market_research || 0
    if (marketCount > 10) {
      bottlenecks.push({
        stage: 'Market Scout',
        issue: `${marketCount} properties analyzing`,
        severity: marketCount > 20 ? 'high' : 'medium',
        detail: 'AI market analysis in progress'
      })
    }

    return bottlenecks
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Clock className="w-12 h-12 animate-spin mx-auto mb-4 text-blue-500" />
          <h2 className="text-xl font-semibold">Loading data flow...</h2>
        </div>
      </div>
    )
  }

  const bottlenecks = getBottlenecks()
  const filteredProperties = getFilteredProperties()

  return (
    <div className="p-6 max-w-[1800px] mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Data Flow Pipeline</h1>
          <p className="text-muted-foreground">
            Track properties from upload → agent contact → closing
          </p>
        </div>
        <Badge variant="outline" className="text-lg px-4 py-2">
          {flowMetrics.total || 0} Total Properties
        </Badge>
      </div>

      {/* System Flow - Horizontal */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitBranch className="w-5 h-5" />
            System Flow
          </CardTitle>
          <CardDescription>End-to-end pipeline from input to monetization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            {SYSTEM_FLOW.map((step, idx) => {
              const Icon = step.icon
              return (
                <div key={step.stage} className="flex items-center flex-shrink-0">
                  <div className="text-center">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-2">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="text-sm font-semibold">{step.stage}</div>
                    <div className="text-xs text-muted-foreground max-w-[120px]">{step.description}</div>
                  </div>
                  {idx < SYSTEM_FLOW.length - 1 && (
                    <ArrowRight className="w-6 h-6 text-muted-foreground flex-shrink-0 mx-2" />
                  )}
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Layers - 6 Sections */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield className="w-6 h-6" />
          System Architecture
        </h2>
        <div className="grid gap-6">
          {ARCHITECTURE_LAYERS.map((layer) => {
            const Icon = layer.icon
            return (
              <Card key={layer.id}>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${layer.color} flex items-center justify-center`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle>{layer.name}</CardTitle>
                      <CardDescription>{layer.purpose}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Database className="w-4 h-4" />
                        Supabase Tables
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {layer.tables.map(table => (
                          <Badge key={table} variant="secondary" className="text-xs">
                            {table}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Cpu className="w-4 h-4" />
                        Edge Functions
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {layer.edgeFunctions.map(fn => (
                          <Badge key={fn} variant="outline" className="text-xs">
                            {fn}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                        <Target className="w-4 h-4" />
                        Outputs Produced
                      </h4>
                      <ul className="text-xs space-y-1 text-muted-foreground">
                        {layer.outputs.map((output, i) => (
                          <li key={i} className="flex items-start gap-1">
                            <span className="text-green-500 mt-0.5">•</span>
                            {output}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Bottleneck Alerts */}
      {bottlenecks.length > 0 && (
        <div className="space-y-2">
          {bottlenecks.map((bn, idx) => (
            <Alert key={idx} variant={bn.severity === 'high' ? 'destructive' : 'default'}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>{bn.stage}:</strong> {bn.issue} - {bn.detail}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      {/* Pipeline Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Pipeline Overview</CardTitle>
          <CardDescription>Properties flowing through each stage</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 overflow-x-auto pb-4">
            {PIPELINE_STAGES.map((stage, idx) => {
              const count = flowMetrics[stage.id] || 0
              const Icon = stage.icon
              const isBottleneck = bottlenecks.some(b => b.stage.includes(stage.name.split(' ')[0]))

              return (
                <div key={stage.id} className="flex items-center flex-shrink-0">
                  <Card
                    className={`w-40 cursor-pointer transition-all hover:scale-105 ${
                      selectedStage === stage.id ? 'ring-2 ring-blue-500' : ''
                    } ${isBottleneck ? 'border-red-500 border-2' : ''}`}
                    onClick={() => setSelectedStage(selectedStage === stage.id ? 'all' : stage.id)}
                  >
                    <CardHeader className="pb-2">
                      <div className={`w-8 h-8 rounded-full ${stage.color} flex items-center justify-center mb-2`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-sm">{stage.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-xs text-muted-foreground">properties</div>
                    </CardContent>
                  </Card>

                  {idx < PIPELINE_STAGES.length - 1 && (
                    <div className="w-8 h-0.5 bg-gray-300 flex-shrink-0" />
                  )}
                </div>
              )
            })}
          </div>

          {/* Flow Rate Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Elite Deals (80+)</div>
                <div className="text-2xl font-bold text-green-600">{flowMetrics.elite || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Strong Deals (65+)</div>
                <div className="text-2xl font-bold text-blue-600">{flowMetrics.strong || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Missing Rate Data</div>
                <div className="text-2xl font-bold text-red-600">{flowMetrics.missingRate || 0}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm text-muted-foreground">Conversion Rate</div>
                <div className="text-2xl font-bold">
                  {flowMetrics.total > 0
                    ? Math.round(((flowMetrics.offer_sent || 0) / flowMetrics.total) * 100)
                    : 0}%
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Stage Details */}
      <Tabs defaultValue="properties" className="space-y-4">
        <TabsList>
          <TabsTrigger value="properties">Properties ({filteredProperties.length})</TabsTrigger>
          <TabsTrigger value="details">Stage Details</TabsTrigger>
        </TabsList>

        <TabsContent value="properties">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedStage === 'all' ? 'All Properties' : PIPELINE_STAGES.find(s => s.id === selectedStage)?.name}
              </CardTitle>
              <CardDescription>
                {selectedStage === 'all'
                  ? 'Showing all properties in pipeline'
                  : PIPELINE_STAGES.find(s => s.id === selectedStage)?.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Address</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>DOM</TableHead>
                      <TableHead>Equity</TableHead>
                      <TableHead>Rate</TableHead>
                      <TableHead>Score</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      <TableHead>Comms</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredProperties.slice(0, 100).map((property) => (
                      <TableRow key={property.id}>
                        <TableCell className="font-medium max-w-[300px]">
                          {property.address}, {property.city}
                        </TableCell>
                        <TableCell>${(property.listing_price || 0).toLocaleString()}</TableCell>
                        <TableCell>{property.days_on_market || '-'}</TableCell>
                        <TableCell>{property.equity_percent ? `${Math.round(property.equity_percent)}%` : '-'}</TableCell>
                        <TableCell>
                          {property.mortgage_rate ? (
                            <Badge variant="secondary">{property.mortgage_rate}%</Badge>
                          ) : (
                            <Badge variant="destructive">Missing</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          {property.win_win_score ? (
                            <Badge
                              variant={property.win_win_score >= 80 ? 'default' : property.win_win_score >= 65 ? 'secondary' : 'outline'}
                            >
                              {property.win_win_score}
                            </Badge>
                          ) : '-'}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStageColor(property.pipeline_status || 'scouted')}>
                            {property.pipeline_status || 'scouted'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {formatDate(property.updated_at)}
                        </TableCell>
                        <TableCell>
                          {property.communications && property.communications.length > 0 ? (
                            <Badge variant="outline">
                              {property.communications.length} email(s)
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {filteredProperties.length > 100 && (
                <p className="text-sm text-muted-foreground mt-4">
                  Showing 100 of {filteredProperties.length} properties
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {PIPELINE_STAGES.map((stage) => {
              const count = flowMetrics[stage.id] || 0
              const percentage = flowMetrics.total > 0 ? (count / flowMetrics.total) * 100 : 0
              const Icon = stage.icon

              return (
                <Card key={stage.id}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className={`w-8 h-8 rounded-full ${stage.color} flex items-center justify-center`}>
                        <Icon className="w-4 h-4 text-white" />
                      </div>
                      <CardTitle className="text-lg">{stage.name}</CardTitle>
                    </div>
                    <CardDescription>{stage.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold">{count}</span>
                        <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>
      </Tabs>

      {/* Underwriter Issue Highlight */}
      {flowMetrics.missingRate > 0 && (
        <Card className="border-red-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Underwriter Issue: Missing Interest Rates
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              {flowMetrics.missingRate} properties have completed underwriting but are missing mortgage rate data.
              This prevents accurate payment calculations and deal analysis.
            </p>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Address</TableHead>
                    <TableHead>Balance</TableHead>
                    <TableHead>Calculated Payment</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {properties
                    .filter(p =>
                      p.pipeline_status === 'underwritten' &&
                      !p.mortgage_rate
                    )
                    .slice(0, 20)
                    .map(property => (
                      <TableRow key={property.id}>
                        <TableCell>{property.address}</TableCell>
                        <TableCell>${(property.open_mortgage_balance || 0).toLocaleString()}</TableCell>
                        <TableCell className="text-red-600">Unknown (rate missing)</TableCell>
                        <TableCell><Badge variant="destructive">Incomplete</Badge></TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
