// LiveMissionStats.tsx - Real-time stats from user's uploaded properties
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/lib/supabase";
import {
  Clock,
  Target,
  Zap,
  DollarSign,
  TrendingUp,
  Star,
  Eye,
  Package,
  Mail,
  FileText,
  Send
} from "lucide-react";

export default function LiveMissionStats() {
  // Fetch user's properties for real stats
  const { data: properties } = useQuery({
    queryKey: ['mission-stats-properties'],
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

  // Fetch offers
  const { data: offers } = useQuery({
    queryKey: ['mission-stats-offers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('offers')
        .select('*')
        .eq('account_id', user.id)
      return data || []
    }
  })

  // Fetch communications
  const { data: communications } = useQuery({
    queryKey: ['mission-stats-communications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('communications')
        .select('*')
        .eq('account_id', user.id)
      return data || []
    }
  })

  // Calculate real stats from user's data
  const totalProperties = properties?.length || 0
  const totalOffers = offers?.length || 0
  const sentOffers = offers?.filter(o => o.status === 'sent' || o.status === 'accepted').length || 0
  const totalCommunications = communications?.length || 0
  
  // Pipeline stats based on real data
  const pipelineStats = {
    uploaded: properties?.filter(p => !p.pipeline_status || p.pipeline_status === 'uploaded').length || 0,
    marketResearch: properties?.filter(p => p.pipeline_status === 'market_research').length || 0,
    underwriter: properties?.filter(p => p.pipeline_status === 'underwriter').length || 0,
    offerGenerated: properties?.filter(p => p.pipeline_status === 'offer_generation').length || 0,
    offerSent: properties?.filter(p => p.pipeline_status === 'offer_sent').length || 0,
  }

  // Calculate pipeline value (sum of listing prices)
  const pipelineValue = properties?.reduce((sum, p) => sum + (p.listing_price || 0), 0) || 0
  const pipelineValueM = (pipelineValue / 1000000).toFixed(1)

  // Agent breakdown from real data
  const agentBreakdown = [
    { 
      name: "Pipeline Scout", 
      processed: pipelineStats.uploaded + pipelineStats.marketResearch, 
      complete: pipelineStats.marketResearch, 
      successRate: pipelineStats.uploaded > 0 ? Math.round((pipelineStats.marketResearch / pipelineStats.uploaded) * 100) : 0 
    },
    { 
      name: "Market Scout", 
      processed: pipelineStats.marketResearch, 
      complete: pipelineStats.underwriter, 
      successRate: pipelineStats.marketResearch > 0 ? Math.round((pipelineStats.underwriter / pipelineStats.marketResearch) * 100) : 0 
    },
    { 
      name: "Underwriter", 
      processed: pipelineStats.underwriter, 
      complete: pipelineStats.offerGenerated, 
      successRate: pipelineStats.underwriter > 0 ? Math.round((pipelineStats.offerGenerated / pipelineStats.underwriter) * 100) : 0 
    },
    { 
      name: "Contract Specialist", 
      processed: pipelineStats.offerGenerated, 
      complete: pipelineStats.offerSent, 
      successRate: pipelineStats.offerGenerated > 0 ? Math.round((pipelineStats.offerSent / pipelineStats.offerGenerated) * 100) : 0 
    },
    { 
      name: "Email Closer", 
      processed: totalCommunications, 
      complete: communications?.filter(c => c.status === 'replied').length || 0, 
      successRate: totalCommunications > 0 ? Math.round(((communications?.filter(c => c.status === 'replied').length || 0) / totalCommunications) * 100) : 0 
    },
  ]

  // Hot deals from user's properties (top by equity or price)
  const hotDeals = (properties || [])
    .filter(p => p.listing_price && p.estimated_value)
    .sort((a, b) => (b.estimated_value || 0) - (a.listing_price || 0))
    .slice(0, 3)
    .map(p => ({
      id: p.id,
      address: `${p.address}, ${p.city}, ${p.state}`,
      price: (p.listing_price || 0) / 1000000,
      equity: ((p.estimated_value || 0) - (p.listing_price || 0)) / 1000000,
      strategy: p.deal_structure || 'Standard'
    }))

  return (
    <Card className="mb-6 bg-black/40 border-vice-cyan/30">
      <CardHeader className="pb-2">
        <CardTitle className="font-gta text-vice-cyan flex items-center gap-2">
          <Zap className="w-5 h-5" />
          LIVE MISSION STATS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Top Stats Row */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-vice-pink">{totalProperties}</div>
            <div className="text-xs text-slate-400">Properties</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-vice-orange">${pipelineValueM}M</div>
            <div className="text-xs text-slate-400">Pipeline Value</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-vice-green">{sentOffers}</div>
            <div className="text-xs text-slate-400">Offers Sent</div>
          </div>
          <div className="text-center p-3 bg-slate-800/50 rounded-lg">
            <div className="text-2xl font-bold text-vice-cyan">{totalCommunications}</div>
            <div className="text-xs text-slate-400">Emails Sent</div>
          </div>
        </div>

        {/* Agent Breakdown */}
        <div className="grid grid-cols-5 gap-2 mb-6">
          {agentBreakdown.map((agent) => (
            <div key={agent.name} className="text-center p-2 bg-slate-800/30 rounded">
              <div className="text-xs text-slate-400 mb-1">{agent.name}</div>
              <div className="text-lg font-bold text-vice-cyan">{agent.processed}</div>
              <Progress value={agent.successRate} className="h-1 mt-1" />
              <div className="text-xs text-slate-500">{agent.successRate}%</div>
            </div>
          ))}
        </div>

        {/* Hot Deals */}
        {hotDeals.length > 0 && (
          <div>
            <h4 className="text-sm font-gta text-vice-yellow mb-3 flex items-center gap-2">
              <Star className="w-4 h-4" /> HOT DEALS
            </h4>
            <div className="space-y-2">
              {hotDeals.map((deal) => (
                <div key={deal.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg border border-vice-orange/20">
                  <div className="flex-1">
                    <h4 className="text-sm text-vice-cyan font-gta">{deal.address}</h4>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-vice-orange font-semibold">${deal.price.toFixed(1)}M</span>
                      <span className="text-vice-green">Equity: ${deal.equity.toFixed(1)}M</span>
                    </div>
                  </div>
                  <Badge variant="outline" className="border-vice-yellow text-vice-yellow">
                    {deal.strategy}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {hotDeals.length === 0 && totalProperties > 0 && (
          <div className="text-center p-4 text-slate-500">
            <p>Upload more properties to see hot deals</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
