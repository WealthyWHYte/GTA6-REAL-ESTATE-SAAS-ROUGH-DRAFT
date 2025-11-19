import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Banknote,
  DollarSign,
  TrendingUp,
  Download,
  Calendar
} from "lucide-react";

export default function AcquisitionFeesPage() {
  const navigate = useNavigate();

  const acquisitionStats = {
    totalAcquisitionFees: 287400,
    thisQuarter: 47800,
    avgFeePerProperty: 12496,
    effectiveRate: 0.48
  };

  const feeBreakdown = [
    { strategy: "Subject-To", fees: 124700, percentage: 43.4 },
    { strategy: "Seller Finance", fees: 89300, percentage: 31.1 },
    { strategy: "Hybrid", fees: 73400, percentage: 25.5 }
  ];

  const topAcquisitionFees = [
    { id: "1", address: "789 Ocean Blvd", fee: 17000, percentage: 0.5, closeDate: "2024-12-15" },
    { id: "2", address: "456 Palm Ave", fee: 10500, percentage: 0.5, closeDate: "2024-12-08" },
    { id: "3", address: "123 Beach St", fee: 9000, percentage: 0.5, closeDate: "2024-11-27" }
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
                ACQUISITION FEES TRACKER
              </h1>
              <p className="text-vice-cyan font-body">Monitor acquisition costs and fee performance</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <Banknote className="w-8 h-8 text-vice-green mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-green mb-1">
                {formatCurrency(acquisitionStats.totalAcquisitionFees)}
              </div>
              <div className="text-sm text-muted-foreground">TOTAL ACQUISITION FEES</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-vice-cyan mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-cyan mb-1">
                {formatCurrency(acquisitionStats.thisQuarter)}
              </div>
              <div className="text-sm text-muted-foreground">THIS QUARTER</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-vice-orange mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-orange mb-1">
                {formatCurrency(acquisitionStats.avgFeePerProperty)}
              </div>
              <div className="text-sm text-muted-foreground">AVG FEE PER PROPERTY</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <TrendingUp className="w-8 h-8 text-vice-yellow mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-yellow mb-1">
                {acquisitionStats.effectiveRate}%
              </div>
              <div className="text-sm text-muted-foreground">EFFECTIVE RATE</div>
            </CardContent>
          </Card>
        </div>

        {/* Fee Breakdown by Strategy */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-pink">💵 FEE BREAKDOWN BY STRATEGY</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {feeBreakdown.map((item) => (
                <div key={item.strategy} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div>
                    <div className="font-gta text-vice-cyan">{item.strategy}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-vice-orange">{formatCurrency(item.fees)}</div>
                    <div className="text-sm text-muted-foreground">({item.percentage}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Fee Performance Chart */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-orange">📊 FEE PERFORMANCE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <TrendingUp className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Fees vs. Deal Value Correlation</p>
                <p className="text-sm">Chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Highest Acquisition Fees */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-cyan">🏆 HIGHEST ACQUISITION FEES</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topAcquisitionFees.map((fee, index) => (
                <div key={fee.id} className="flex items-center justify-between p-4 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className="text-2xl font-gta text-vice-yellow">#{index + 1}</div>
                    <div>
                      <div className="font-gta text-vice-cyan">{fee.address}</div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {fee.closeDate}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-semibold text-vice-green">{formatCurrency(fee.fee)}</div>
                    <div className="text-sm text-muted-foreground">({fee.percentage}%)</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button variant="neon-cyan" size="lg" className="px-8">
            <Calendar className="mr-2 w-5 h-5" />
            PAYMENT SCHEDULE
          </Button>
          <Button variant="outline" size="lg" className="px-8 border-vice-orange text-vice-orange">
            <TrendingUp className="mr-2 w-5 h-5" />
            PROFITABILITY ANALYSIS
          </Button>
        </div>
      </div>
    </div>
  );
}
