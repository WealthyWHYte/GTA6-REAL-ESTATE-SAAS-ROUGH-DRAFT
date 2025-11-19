import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Home,
  Briefcase
} from "lucide-react";

export default function PortfolioOverviewPage() {
  const navigate = useNavigate();

  const portfolioStats = {
    totalValue: 428700000,
    totalLists: 347,
    totalMortgageBalances: 287300000,
    totalEquityAvailable: 141400000,
    avgMonthlyPiti: 8247,
    totalMonthlyObligations: 2860000
  };

  const strategyBreakdown = [
    { strategy: "Subject-To", deals: 147, value: 189400000, percentage: 42.4 },
    { strategy: "Seller Finance", deals: 89, value: 127800000, percentage: 25.6 },
    { strategy: "Hybrid", deals: 67, value: 78200000, percentage: 19.3 },
    { strategy: "Cash", deals: 44, value: 33300000, percentage: 12.7 }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `$${(amount / 1000).toFixed(1)}K`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(-1)}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              BACK
            </Button>
            <div>
              <h1 className="text-4xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text">
                PORTFOLIO OVERVIEW
              </h1>
              <p className="text-vice-cyan font-body">Real-time portfolio performance and analytics</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-vice-green mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-green mb-1">
                {formatCurrency(portfolioStats.totalValue)}
              </div>
              <div className="text-sm text-muted-foreground">TOTAL LIST PRICE VALUE</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <Home className="w-8 h-8 text-vice-cyan mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-cyan mb-1">
                {portfolioStats.totalLists}
              </div>
              <div className="text-sm text-muted-foreground">PROPERTIES IN PIPELINE</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-vice-orange mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-orange mb-1">
                {formatCurrency(portfolioStats.totalEquityAvailable)}
              </div>
              <div className="text-sm text-muted-foreground">TOTAL EQUITY AVAILABLE</div>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Breakdown */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-pink">STRATEGY BREAKDOWN</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {strategyBreakdown.map((item) => (
                <div key={item.strategy} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Badge variant="outline" className="border-vice-purple text-vice-purple">
                        {item.strategy}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.deals} deals
                      </span>
                    </div>
                    <div className="text-lg font-semibold text-vice-cyan">
                      {formatCurrency(item.value)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-gta text-vice-yellow">
                      {item.percentage}%
                    </div>
                    <div className="text-xs text-muted-foreground">of portfolio</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Charts Placeholder */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="font-gta text-vice-orange">PORTFOLIO GROWTH CHART</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Portfolio Value Over Time</p>
                  <p className="text-sm">Chart visualization coming soon</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardHeader>
              <CardTitle className="font-gta text-vice-cyan">MONTHLY OBLIGATIONS</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Average Monthly PITI:</span>
                  <span className="font-semibold">{formatCurrency(portfolioStats.avgMonthlyPiti)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Total Monthly Obligations:</span>
                  <span className="font-semibold text-vice-orange">{formatCurrency(portfolioStats.totalMonthlyObligations)}</span>
                </div>
                <div className="h-32 bg-muted/20 rounded-lg flex items-center justify-center mt-4">
                  <div className="text-center text-muted-foreground">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Obligations Breakdown</p>
                    <p className="text-sm">Chart visualization coming soon</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
