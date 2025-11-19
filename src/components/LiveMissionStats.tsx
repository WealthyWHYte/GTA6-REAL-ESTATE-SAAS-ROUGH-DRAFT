import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Clock,
  Target,
  Zap,
  DollarSign,
  TrendingUp,
  Star,
  Eye
} from "lucide-react";

interface AgentStats {
  name: string;
  processed: number;
  complete: number;
  successRate: number;
}

interface HotDeal {
  id: string;
  address: string;
  stars: number;
  price: number;
  roi: number;
  strategy: string;
}

export default function LiveMissionStats() {
  const [timeElapsed, setTimeElapsed] = useState("4h 23m");
  const [dailyGoal, setDailyGoal] = useState(6); // out of 9
  const [processingSpeed, setProcessingSpeed] = useState(847);
  const [pipelineValue, setPipelineValue] = useState(47.3);

  const [agentBreakdown] = useState<AgentStats[]>([
    { name: "Pipeline Scout", processed: 1247, complete: 489, successRate: 96.6 },
    { name: "Market Researcher", processed: 523, complete: 489, successRate: 93.5 },
    { name: "Underwriter", processed: 412, complete: 412, successRate: 100 },
    { name: "Offer Generator", processed: 89, complete: 23, successRate: 25.8 },
    { name: "Contract Specialist", processed: 6, complete: 6, successRate: 100 },
    { name: "Email Closer", processed: 23, complete: 8, successRate: 34.8 }
  ]);

  const [hotDeals, setHotDeals] = useState<HotDeal[]>([
    {
      id: "1",
      address: "456 Palm Ave, Miami Beach",
      stars: 5,
      price: 2.1,
      roi: 22,
      strategy: "Subject-To"
    },
    {
      id: "2",
      address: "789 Ocean Blvd, Fort Lauderdale",
      stars: 5,
      price: 3.4,
      roi: 19,
      strategy: "Seller Finance"
    },
    {
      id: "3",
      address: "123 Beach St, Boca Raton",
      stars: 4.8,
      price: 1.8,
      roi: 18,
      strategy: "Hybrid"
    }
  ]);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      // Update time elapsed
      const [hours, minutes] = timeElapsed.split('h ').map(s => parseInt(s.replace('m', '')));
      const totalMinutes = hours * 60 + minutes + 1;
      const newHours = Math.floor(totalMinutes / 60);
      const newMinutes = totalMinutes % 60;
      setTimeElapsed(`${newHours}h ${newMinutes}m`);

      // Update daily goal occasionally
      if (Math.random() > 0.8) {
        setDailyGoal(prev => Math.min(9, prev + (Math.random() > 0.5 ? 1 : 0)));
      }

      // Update processing speed
      setProcessingSpeed(prev => Math.max(500, prev + (Math.random() - 0.5) * 50));

      // Update pipeline value
      setPipelineValue(prev => Math.max(40, prev + (Math.random() - 0.5) * 2));

      // Occasionally update hot deals
      if (Math.random() > 0.9) {
        setHotDeals(prev => prev.map(deal => ({
          ...deal,
          roi: Math.max(15, deal.roi + (Math.random() - 0.5) * 2)
        })));
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [timeElapsed]);

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-vice-yellow fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toFixed(1)}M`;
  };

  return (
    <div className="space-y-6">
      {/* Today's Progress */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="font-gta text-vice-pink">📊 LIVE MISSION STATS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-vice-cyan" />
                <span className="text-sm font-gta text-vice-cyan">{timeElapsed}</span>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Time Elapsed
              </div>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Target className="w-5 h-5 text-vice-orange" />
                <span className="text-sm font-gta text-vice-orange">{dailyGoal}/9</span>
              </div>
              <Progress value={(dailyGoal / 9) * 100} className="h-2 mb-2" />
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Daily Goal
              </div>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-vice-yellow" />
                <span className="text-sm font-gta text-vice-yellow">{processingSpeed.toLocaleString()}</span>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Props/Hour
              </div>
            </div>

            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-vice-green" />
                <span className="text-sm font-gta text-vice-green">{formatCurrency(pipelineValue)}</span>
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide">
                Pipeline Value
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Agent Breakdown */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="font-gta text-vice-cyan">AGENT BREAKDOWN</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {agentBreakdown.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex-1">
                  <div className="font-gta text-sm text-vice-cyan mb-1">{agent.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {agent.processed} processed, {agent.complete} complete
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-gta text-sm text-vice-green">{agent.successRate}%</div>
                  <div className="text-xs text-muted-foreground">success rate</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Hottest Deals */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="font-gta text-vice-orange">🔥 HOTTEST DEALS RIGHT NOW</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {hotDeals.map((deal, index) => (
              <div key={deal.id} className="p-4 bg-muted/20 rounded-lg border border-vice-cyan/20 hover:border-vice-cyan transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h4 className="font-gta text-vice-cyan text-sm mb-2">{deal.address}</h4>
                    <div className="flex items-center gap-4 mb-2">
                      <div className="flex">{renderStars(deal.stars)}</div>
                      <span className="text-vice-green font-semibold">${deal.price}M</span>
                      <span className="text-vice-orange">{deal.roi}% ROI</span>
                      <Badge variant="outline" className="border-vice-pink text-vice-pink">
                        {deal.strategy}
                      </Badge>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background">
                    <Eye className="w-4 h-4 mr-2" />
                    VIEW DETAILS
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
