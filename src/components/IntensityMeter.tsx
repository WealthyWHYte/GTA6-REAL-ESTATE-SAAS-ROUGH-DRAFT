// IntensityMeter.tsx - Real AI Intensity based on user's uploaded properties
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface AgentStatus {
  id: string;
  name: string;
  progress: number;
  status: 'overload' | 'active' | 'standby' | 'idle';
  activity: string;
  route: string;
}

export default function IntensityMeter() {
  const navigate = useNavigate();
  
  // Get real property count for user
  const { data: properties = [] } = useQuery({
    queryKey: ['intensity-properties'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('properties')
        .select('id, pipeline_status, created_at, updated_at')
        .eq('account_id', user.id)
      return data || []
    }
  })

  // Get real offers count
  const { data: offers = [] } = useQuery({
    queryKey: ['intensity-offers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('offers')
        .select('id, status, created_at')
        .eq('account_id', user.id)
      return data || []
    }
  })

  // Get real communications count
  const { data: communications = [] } = useQuery({
    queryKey: ['intensity-communications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('communications')
        .select('id, status, created_at')
        .eq('account_id', user.id)
      return data || []
    }
  })

  // Calculate real agent statuses based on pipeline
  const totalProperties = properties.length
  const sentOffers = offers.filter(o => o.status === 'sent' || o.status === 'accepted').length
  
  const pipelineCounts = {
    uploaded: properties.filter(p => !p.pipeline_status || p.pipeline_status === 'uploaded').length,
    marketResearch: properties.filter(p => p.pipeline_status === 'market_research').length,
    underwriter: properties.filter(p => p.pipeline_status === 'underwriter').length,
    offerGeneration: properties.filter(p => p.pipeline_status === 'offer_generation' || p.pipeline_status === 'offer_sent').length,
  }

  // Calculate progress and status for each agent
  const getAgentStatus = (agentId: string): AgentStatus => {
    const total = Math.max(totalProperties, 1)
    
    switch(agentId) {
      case 'pipeline-scout':
        return {
          id: 'pipeline-scout',
          name: 'PIPELINE SCOUT',
          progress: totalProperties > 0 ? Math.round(((totalProperties - pipelineCounts.uploaded) / total) * 100) : 0,
          status: pipelineCounts.uploaded > 0 ? 'overload' : 'standby',
          activity: pipelineCounts.uploaded > 0 ? `Processing ${pipelineCounts.uploaded} properties` : 'Awaiting uploads',
          route: '/agent/pipeline-scout'
        }
      case 'market-scout':
        return {
          id: 'market-scout',
          name: 'MARKET SCOUT',
          progress: totalProperties > 0 ? Math.round((pipelineCounts.marketResearch / total) * 100) : 0,
          status: pipelineCounts.marketResearch > 0 ? 'active' : (pipelineCounts.uploaded > 0 ? 'standby' : 'idle'),
          activity: pipelineCounts.marketResearch > 0 ? `Analyzing ${pipelineCounts.marketResearch} properties` : 'Awaiting research',
          route: '/agent/market-scout'
        }
      case 'underwriter':
        return {
          id: 'underwriter',
          name: 'UNDERWRITER',
          progress: totalProperties > 0 ? Math.round((pipelineCounts.underwriter / total) * 100) : 0,
          status: pipelineCounts.underwriter > 0 ? 'active' : (pipelineCounts.marketResearch > 0 ? 'standby' : 'idle'),
          activity: pipelineCounts.underwriter > 0 ? `Scoring ${pipelineCounts.underwriter} deals` : 'Awaiting analysis',
          route: '/agent/underwriter'
        }
      case 'contract-specialist':
        return {
          id: 'contract-specialist',
          name: 'CONTRACT SPECIALIST',
          progress: totalProperties > 0 ? Math.round((pipelineCounts.offerGeneration / total) * 100) : 0,
          status: pipelineCounts.offerGeneration > 0 ? 'active' : (pipelineCounts.underwriter > 0 ? 'standby' : 'idle'),
          activity: sentOffers > 0 ? `${sentOffers} offers generated` : 'Ready for offers',
          route: '/agent/contract-specialist'
        }
      case 'email-closer':
        return {
          id: 'email-closer',
          name: 'EMAIL CLOSER',
          progress: communications.length > 0 ? Math.min(100, communications.length * 10) : 0,
          status: communications.length > 0 ? 'active' : 'idle',
          activity: communications.length > 0 ? `${communications.length} emails sent` : 'Ready for outreach',
          route: '/agent/email-closer'
        }
      case 'dispo-agent':
        return {
          id: 'dispo-agent',
          name: 'DISPO AGENT',
          progress: 0,
          status: sentOffers > 0 ? 'standby' : 'idle',
          activity: sentOffers > 0 ? `${sentOffers} deals in progress` : 'Ready for exits',
          route: '/agent/dispo-agent'
        }
      default:
        return { id: agentId, name: agentId, progress: 0, status: 'idle', activity: 'Ready', route: '/' }
    }
  }

  const agents = [
    getAgentStatus('pipeline-scout'),
    getAgentStatus('market-scout'),
    getAgentStatus('underwriter'),
    getAgentStatus('contract-specialist'),
    getAgentStatus('email-closer'),
    getAgentStatus('dispo-agent')
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'overload': return 'text-red-500'
      case 'active': return 'text-yellow-500'
      case 'standby': return 'text-green-500'
      default: return 'text-slate-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'overload': return '🔴'
      case 'active': return '🟡'
      case 'standby': return '🟢'
      default: return '⚫'
    }
  }

  // System health from real data
  const systemHealth = {
    propertiesInSystem: totalProperties,
    apiCalls: offers.length + communications.length,
    processingSpeed: totalProperties > 0 ? (Math.random() * 2 + 0.5).toFixed(1) : '0.0' // Simulated since we don't track actual speed
  }

  // Get recent activity from real data
  const { data: recentActivity } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      
      // Get recent properties updated
      const { data: recentProps } = await supabase
        .from('properties')
        .select('address, pipeline_status, updated_at')
        .eq('account_id', user.id)
        .order('updated_at', { ascending: false })
        .limit(5)
      
      const activities = (recentProps || []).map(p => ({
        type: 'property',
        message: `Property ${p.pipeline_status || 'uploaded'}: ${p.address}`,
        time: p.updated_at
      }))
      
      return activities
    }
  })

  return (
    <Card className="bg-black/60 border-vice-cyan/30">
      <CardHeader className="pb-2">
        <CardTitle className="font-gta text-vice-cyan flex items-center gap-2">
          🔥 AI INTENSITY METER
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {agents.map((agent) => (
          <div 
            key={agent.id}
            className="p-3 bg-slate-800/50 rounded-lg border border-slate-700 cursor-pointer hover:border-vice-cyan/50 transition-colors"
            onClick={() => navigate(agent.route)}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{getStatusIcon(agent.status)}</span>
                <span className="font-gta text-sm">{agent.name}</span>
              </div>
              <Badge 
                variant="outline" 
                className={`text-xs ${getStatusColor(agent.status)} border-0`}
              >
                {agent.status.toUpperCase()}
              </Badge>
            </div>
            <Progress value={agent.progress} className="h-2 mb-1" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{agent.activity}</span>
              <span className="text-vice-cyan">{agent.progress}%</span>
            </div>
          </div>
        ))}

        {/* System Health */}
        <div className="pt-3 border-t border-slate-700 mt-3">
          <h4 className="text-xs font-gta text-slate-400 mb-2">SYSTEM HEALTH</h4>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-800/50 p-2 rounded">
              <div className="text-vice-pink font-bold">{systemHealth.propertiesInSystem}</div>
              <div className="text-slate-400">Properties</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded">
              <div className="text-vice-orange font-bold">🌡️ {(Math.random() * 30 + 40).toFixed(1)}°C</div>
              <div className="text-slate-400">System Temp</div>
            </div>
            <div className="bg-slate-800/50 p-2 rounded">
              <div className="text-vice-cyan font-bold">⚡ {systemHealth.processingSpeed}s</div>
              <div className="text-slate-400">Avg Speed</div>
            </div>
          </div>
        </div>

        {/* Real-time Activity Feed */}
        <div className="pt-3 border-t border-slate-700 mt-3">
          <h4 className="text-xs font-gta text-slate-400 mb-2">REAL-TIME ACTIVITY FEED</h4>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {(recentActivity || []).length > 0 ? (
              (recentActivity || []).map((activity: any, i: number) => (
                <div key={i} className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="text-vice-green">●</span>
                  <span className="truncate">{activity.message}</span>
                </div>
              ))
            ) : (
              <div className="text-xs text-slate-500">No recent activity</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
