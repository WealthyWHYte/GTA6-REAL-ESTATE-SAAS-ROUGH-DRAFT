// src/components/CommandCenter.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import MarketIntelligenceHub from "./MarketIntelligenceHub";
import LiveMissionStats from "./LiveMissionStats";
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
  
  const agents = [
    { id: "scout", name: "PIPELINE SCOUT", status: "ACTIVE", progress: 85, color: "vice-pink", route: "/agent/pipeline-scout" },
    { id: "underwriter", name: "UNDERWRITER", status: "STANDBY", progress: 0, color: "vice-cyan", route: "/agent/underwriter" },
    { id: "offers", name: "OFFER GENERATOR", status: "STANDBY", progress: 0, color: "vice-orange", route: "/agent/offer-generator" },
    { id: "contracts", name: "CONTRACT SPECIALIST", status: "STANDBY", progress: 0, color: "vice-purple", route: "/agent/contract-specialist" },
    { id: "closer", name: "EMAIL CLOSER", status: "STANDBY", progress: 0, color: "vice-yellow", route: "/agent/email-closer" }
  ];

  const mockProperties = [
    { id: 1, address: "1234 Ocean Drive, Miami", price: "$2.3M", tier: 5, roi: "22%", status: "TARGET ACQUIRED" },
    { id: 2, address: "5678 Collins Ave, Miami Beach", price: "$1.8M", tier: 4, roi: "18%", status: "ANALYZING" },
    { id: 3, address: "9012 Biscayne Blvd, Miami", price: "$3.1M", tier: 5, roi: "25%", status: "TARGET ACQUIRED" },
    { id: 4, address: "3456 Lincoln Rd, Miami Beach", price: "$1.2M", tier: 3, roi: "15%", status: "UNDER REVIEW" },
    { id: 5, address: "7890 Washington Ave, Miami Beach", price: "$2.7M", tier: 4, roi: "20%", status: "TARGET ACQUIRED" }
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
        <div className="grid grid-cols-5 gap-4 mb-8">
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
              {mockProperties.slice(0, 3).map((property) => (
                <div key={property.id} className="flex items-center justify-between p-4 bg-muted rounded-lg border border-vice-cyan/20">
                  <div className="flex-1">
                    <h4 className="font-gta text-sm text-vice-cyan">{property.address}</h4>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-vice-orange font-semibold">{property.price}</span>
                      <div className="flex">{renderStars(property.tier)}</div>
                      <span className="text-vice-green">ROI: {property.roi}</span>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={`${
                      property.status === 'TARGET ACQUIRED'
                        ? 'border-vice-green text-vice-green'
                        : property.status === 'ANALYZING'
                        ? 'border-vice-orange text-vice-orange'
                        : 'border-vice-yellow text-vice-yellow'
                    }`}
                  >
                    {property.status}
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