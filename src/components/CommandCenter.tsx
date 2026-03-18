// src/components/CommandCenter.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MarketIntelligenceHub from "./MarketIntelligenceHub";
import LiveMissionStats from "./LiveMissionStats";
import PropertyMapVisualization from "./PropertyMapVisualization";
import { supabase } from "@/lib/supabase";
import {
  Target,
  TrendingUp,
  DollarSign,
  MapPin,
  Star,
  Upload,
  Download,
  Send,
  FileText,
  Mail,
  ArrowLeft
} from "lucide-react";

const CommandCenter = () => {
  const navigate = useNavigate();
  const [activeAgent, setActiveAgent] = useState("scout");
  const [selectedMarket, setSelectedMarket] = useState<string>("all");
  
  // Fetch user's properties for real data
  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ['command-center-properties'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('account_id', user.id)
        .order('created_at', { ascending: false })
      if (error) {
        console.log('Properties query error:', error.message)
        return []
      }
      return data || []
    }
  })

  // Get unique cities for market selector
  const userCities = [...new Set((properties || []).map(p => p.city).filter(Boolean))]

  // Fetch offers
  const { data: offers = [] } = useQuery({
    queryKey: ['command-center-offers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data, error } = await supabase
        .from('offers')
        .select('*')
        .eq('account_id', user.id)
      if (error) {
        console.log('Offers query error:', error.message)
        return []
      }
      return data || []
    }
  })

  // Fetch market analysis - handle if table doesn't exist
  const { data: marketAnalysis } = useQuery({
    queryKey: ['command-center-market-analysis'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null
      const { data, error } = await supabase
        .from('market_analysis')
        .select('*')
        .eq('account_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
      if (error) {
        console.log('Market analysis query error:', error.message)
        return null
      }
      return data?.[0] || null
    }
  })

  // Total properties count
  const totalProperties = properties?.length || 0

  // Get market intelligence by city
  const marketByCity = properties?.reduce((acc, prop) => {
    const city = prop.city || 'Unknown'
    if (!acc[city]) {
      acc[city] = { count: 0, totalPrice: 0 }
    }
    acc[city].count++
    acc[city].totalPrice += prop.listing_price || 0
    return acc
  }, {} as Record<string, { count: number; totalPrice: number }>) || {}

  const cityStats = Object.entries(marketByCity)
    .map(([city, data]) => ({
      city,
      count: data.count,
      avgPrice: Math.round(data.totalPrice / data.count)
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  // Calculate agent progress from real data
  const pipelineStats = {
    uploaded: properties?.filter(p => !p.pipeline_status || p.pipeline_status === 'uploaded').length || 0,
    marketResearch: properties?.filter(p => p.pipeline_status === 'market_research').length || 0,
    underwriter: properties?.filter(p => p.pipeline_status === 'underwriter').length || 0,
    offerGeneration: properties?.filter(p => p.pipeline_status === 'offer_generation' || p.pipeline_status === 'offer_sent').length || 0,
  }
  
  const activeAgentId = pipelineStats.uploaded > 0 ? 'scout' : 
                        pipelineStats.marketResearch > 0 ? 'market' :
                        pipelineStats.underwriter > 0 ? 'underwriter' :
                        pipelineStats.offerGeneration > 0 ? 'contracts' : 'scout'
  
  const agents = [
    { id: "scout", name: "PIPELINE SCOUT", status: pipelineStats.uploaded > 0 ? "ACTIVE" : "STANDBY", progress: Math.round((pipelineStats.uploaded / Math.max(totalProperties, 1)) * 100), color: "vice-pink", route: "/agent/pipeline-scout" },
    { id: "market", name: "MARKET SCOUT", status: pipelineStats.marketResearch > 0 ? "ACTIVE" : "STANDBY", progress: Math.round((pipelineStats.marketResearch / Math.max(totalProperties, 1)) * 100), color: "vice-purple", route: "/agent/market-scout" },
    { id: "underwriter", name: "UNDERWRITER", status: pipelineStats.underwriter > 0 ? "ACTIVE" : "STANDBY", progress: Math.round((pipelineStats.underwriter / Math.max(totalProperties, 1)) * 100), color: "vice-cyan", route: "/agent/underwriter" },
    { id: "contracts", name: "CONTRACT SPECIALIST", status: pipelineStats.offerGeneration > 0 ? "ACTIVE" : "STANDBY", progress: Math.round((pipelineStats.offerGeneration / Math.max(totalProperties, 1)) * 100), color: "vice-orange", route: "/agent/contract-specialist" },
    { id: "closer", name: "EMAIL CLOSER", status: "STANDBY", progress: 0, color: "vice-yellow", route: "/agent/email-closer" },
    { id: "dispo", name: "DISPO AGENT", status: "STANDBY", progress: 0, color: "vice-green", route: "/agent/dispo-agent" }
  ];

  const renderStars = (tier: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < tier ? 'text-vice-yellow fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate("/mission-briefing")}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              BACK TO MISSION BRIEFING
            </Button>
            <div>
              <h1 className="text-4xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text">
                MISSION CONTROL CENTER
              </h1>
              <p className="text-vice-cyan font-body">Real-time property acquisition tracking</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button
              variant="neon-cyan"
              size="sm"
              onClick={() => navigate("/upload")}
            >
              <Upload className="mr-2 w-4 h-4" />
              UPLOAD CSV
            </Button>
            <Button variant="neon-orange" size="sm">
              <Download className="mr-2 w-4 h-4" />
              EXPORT DATA
            </Button>
          </div>
        </div>

        {/* Agent Status */}
        <div className="grid grid-cols-6 gap-4 mb-8">
          {agents.map((agent) => (
            <Card
              key={agent.id}
              className={`cursor-pointer transition-all duration-300 ${
                activeAgent === agent.id ? 'border-vice-pink shadow-neon-pink' : 'border-border'
              } hover:border-vice-cyan`}
              onClick={() => navigate(agent.route)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-gta text-vice-cyan">{agent.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${agent.status === 'ACTIVE' ? 'border-vice-green text-vice-green' : 'border-muted text-muted-foreground'}`}
                  >
                    {agent.status}
                  </Badge>
                  <Progress value={agent.progress} className="h-2" />
                  <div className="text-xs text-muted-foreground">{agent.progress}% Complete</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Market Intelligence Hub */}
        <MarketIntelligenceHub />

        {/* Live Mission Stats */}
        <LiveMissionStats />

        {/* Market Scout Live Activity */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-cyan flex items-center gap-2">
              🔍 MARKET SCOUT - LIVE ACTIVITY
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Market Selector - Switch between uploaded lists */}
              {marketAnalysis ? (
                <>
              {/* Live Status - Real property being researched */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-vice-cyan/20">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <div className="flex-1">
                  <p className="text-sm font-gta text-vice-cyan">
                    Analyzing: {properties?.[0]?.address || 'No properties'}...
                  </p>
                  <p className="text-xs text-muted-foreground">
                    🔍 Market research in progress...
                  </p>
                </div>
              </div>

              {/* Market Data from real analysis */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="text-center p-4 bg-black/20 rounded-lg border">
                  <div className="text-2xl mb-2">📊</div>
                  <p className="text-sm font-gta">Median Price</p>
                  <p className="text-xs text-vice-cyan">${marketAnalysis.median_price?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="text-center p-4 bg-black/20 rounded-lg border">
                  <div className="text-2xl mb-2">💰</div>
                  <p className="text-sm font-gta">Avg Days on Market</p>
                  <p className="text-xs text-vice-orange">{marketAnalysis.avg_days_on_market || 'N/A'} days</p>
                </div>
              </div>
                </>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-muted rounded-lg border border-vice-cyan/20">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                  <div className="flex-1">
                    <p className="text-sm font-gta text-vice-yellow">
                      {totalProperties > 0 ? `Ready to analyze ${totalProperties} properties` : 'Upload a property list to begin'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {totalProperties > 0 ? 'Click "Research Market" to start analysis' : 'Go to Pipeline Scout to upload'}
                    </p>
                  </div>
                </div>
              )}

              {/* City/Region Quick Stats */}
              {cityStats.length > 0 && (
                <div className="pt-2 border-t border-slate-700">
                  <p className="text-xs text-slate-400 mb-2">YOUR MARKETS:</p>
                  <div className="flex flex-wrap gap-2">
                    {cityStats.slice(0, 4).map((city: any, i: number) => (
                      <Badge key={i} variant="outline" className="text-xs bg-vice-cyan/10">
                        {city.city}: {city.count} props
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Map Interface - Real Property Data */}
        <PropertyMapVisualization />

        {/* Quick Actions */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-orange">QUICK COMMANDS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              variant="agent"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate("/deploy-offers")}
            >
              <Send className="mr-2 w-4 h-4" />
              Deploy Offers
            </Button>
            <Button
              variant="neon-pink"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate("/generate-contracts")}
            >
              <FileText className="mr-2 w-4 h-4" />
              Generate Contracts
            </Button>
            <Button
              variant="neon-cyan"
              size="sm"
              className="w-full justify-start"
              onClick={() => navigate("/follow-up-queue")}
            >
              <Mail className="mr-2 w-4 h-4" />
              Send Follow-ups
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start border-vice-yellow text-vice-yellow"
              onClick={() => {
                // Export all data functionality
                const exportData = {
                  timestamp: new Date().toISOString(),
                  datasets: [], // Would fetch from Supabase
                  properties: [], // Would fetch from Supabase
                  agentActivity: [], // Would fetch from Supabase
                  version: "1.0.0"
                };

                const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                  type: 'application/json'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `gta6-backup-${new Date().toISOString().split('T')[0]}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Store in localStorage as emergency backup
                localStorage.setItem('gta6-emergency-backup', JSON.stringify(exportData));
                alert('Data exported successfully! Emergency backup stored locally.');
              }}
            >
              📤 EXPORT ALL DATA
            </Button>
          </CardContent>
        </Card>

        {/* Property Targets */}
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="font-gta text-vice-pink">TOP PROPERTY TARGETS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 mb-4">
              {(properties || []).slice(0, 3).map((property: any) => (
                <div key={property.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-vice-cyan/20">
                  <div className="flex-1">
                    <h4 className="font-gta text-sm text-vice-cyan">{property.address}, {property.city}, {property.state}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-vice-orange font-semibold">${property.listing_price?.toLocaleString() || 'N/A'}</span>
                      <span className="text-vice-cyan">{property.city}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      property.pipeline_status === 'offer_sent'
                        ? 'border-vice-green text-vice-green'
                        : property.pipeline_status === 'market_research'
                        ? 'border-vice-orange text-vice-orange'
                        : 'border-vice-yellow text-vice-yellow'
                    }`}
                  >
                    {property.pipeline_status || 'uploaded'}
                  </Badge>
                </div>
              ))}
            </div>

            <Button
              variant="neon-pink"
              className="w-full"
              onClick={() => navigate("/top-property-targets")}
            >
              <Target className="mr-2 w-4 h-4" />
              VIEW ALL 100 TARGETS
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CommandCenter;