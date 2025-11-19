import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Download,
  Mail
} from "lucide-react";

interface WholesaleDeal {
  id: string;
  address: string;
  fee: number;
  closeDate: string;
  market: string;
}

export default function WholesaleFeesPage() {
  const navigate = useNavigate();

  const wholesaleStats = {
    totalEarned: 847200,
    thisMonth: 47300,
    thisWeek: 12400,
    avgPerDeal: 8200
  };

  const topDeals: WholesaleDeal[] = [
    { id: "1", address: "789 Ocean Blvd", fee: 18500, closeDate: "2024-12-15", market: "Fort Lauderdale" },
    { id: "2", address: "456 Palm Ave", fee: 14200, closeDate: "2024-12-08", market: "Miami Beach" },
    { id: "3", address: "123 Beach St", fee: 12800, closeDate: "2024-11-27", market: "Boca Raton" }
  ];

  const marketBreakdown = [
    { market: "Miami Beach", earnings: 342100, percentage: 40.4 },
    { market: "Fort Lauderdale", earnings: 287300, percentage: 33.9 },
    { market: "Boca Raton", earnings: 217800, percentage: 25.7 }
  ];

  const formatCurrency = (amount: number) => {
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
                WHOLESALE FEES TRACKER
              </h1>
              <p className="text-vice-cyan font-body">Monitor your wholesale fee earnings and performance</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-vice-green mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-green mb-1">
                {formatCurrency(wholesaleStats.totalEarned)}
              </div>
              <div className="text-sm text-muted-foreground">TOTAL EARNED (ALL TIME)</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-vice-cyan mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-cyan mb-1">
                {formatCurrency(wholesaleStats.thisMonth)}
              </div>
              <div className="text-sm text-muted-foreground">THIS MONTH</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-vice-orange mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-orange mb-1">
                {formatCurrency(wholesaleStats.thisWeek)}
              </div>
              <div className="text-sm text-muted-foreground">THIS WEEK</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-vice-yellow mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-yellow mb-1">
                {formatCurrency(wholesaleStats.avgPerDeal)}
              </div>
              <div className="text-sm text-muted-foreground">AVG PER DEAL</div>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Over Time Chart */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-orange">EARNINGS OVER TIME</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Monthly Earnings Trend</p>
                <p className="text-sm">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Deals */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-pink">🏆 TOP DEALS BY FEE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDeals.map((deal, index) => (
                <div key={deal.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-gta text-vice-yellow">#{index + 1}</div>
                    <div>
                      <div className="font-gta text-vice-cyan">{deal.address}</div>
                      <div className="text-sm text-muted-foreground">{deal.market} • {deal.closeDate}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-gta text-vice-green">{formatCurrency(deal.fee)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Market Breakdown */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-cyan">BREAKDOWN BY MARKET</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {marketBreakdown.map((market) => (
                <div key={market.market} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-gta text-vice-cyan">{market.market}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-vice-orange">{formatCurrency(market.earnings)}</div>
                    <div className="text-sm text-muted-foreground">({market.percentage}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button variant="neon-cyan" size="lg" className="px-8">
            <Download className="mr-2 w-5 h-5" />
            EXPORT TO PDF
          </Button>
          <Button variant="outline" size="lg" className="px-8 border-vice-orange text-vice-orange">
            <Mail className="mr-2 w-5 h-5" />
            EMAIL REPORT
          </Button>
        </div>
      </div>
    </div>
  );
}
