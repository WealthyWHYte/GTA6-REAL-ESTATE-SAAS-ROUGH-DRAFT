import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  TrendingUp,
  DollarSign,
  Target,
  Calendar,
  Home,
  Clock,
  Plus
} from "lucide-react";

interface MarketData {
  name: string;
  medianPrice: number;
  daysOnMarket: number;
  inventory: number;
  pricePerSqFt: number;
  appreciation: number;
  absorptionRate: number;
  cashBuyers: number;
  foreignBuyers: number;
}

interface OpportunityZone {
  name: string;
  dealCount: number;
  avgROI: number;
  stars: number;
}

export default function MarketIntelligenceHub() {
  const [selectedMarket, setSelectedMarket] = useState("miami-beach");

  const markets: MarketData[] = {
    "miami-beach": {
      name: "Miami Beach",
      medianPrice: 2300000,
      daysOnMarket: 67,
      inventory: 342,
      pricePerSqFt: 847,
      appreciation: 12.4,
      absorptionRate: 3.2,
      cashBuyers: 43,
      foreignBuyers: 28
    },
    "fort-lauderdale": {
      name: "Fort Lauderdale",
      medianPrice: 1850000,
      daysOnMarket: 45,
      inventory: 289,
      pricePerSqFt: 623,
      appreciation: 8.7,
      absorptionRate: 4.1,
      cashBuyers: 38,
      foreignBuyers: 22
    },
    "boca-raton": {
      name: "Boca Raton",
      medianPrice: 3200000,
      daysOnMarket: 89,
      inventory: 198,
      pricePerSqFt: 945,
      appreciation: 15.2,
      absorptionRate: 2.8,
      cashBuyers: 52,
      foreignBuyers: 35
    }
  };

  const opportunityZones: OpportunityZone[] = [
    { name: "South Beach", dealCount: 47, avgROI: 18.2, stars: 4 },
    { name: "Mid-Beach", dealCount: 23, avgROI: 14.7, stars: 3 },
    { name: "North Beach", dealCount: 89, avgROI: 21.3, stars: 5 }
  ];

  const currentMarket = markets[selectedMarket];

  // Mock heat map data - in real implementation, this would be actual coordinates
  const heatMapData = [
    { zone: "South Beach", density: 85, avgPrice: 2800000, color: "bg-red-500" },
    { zone: "Mid-Beach", density: 62, avgPrice: 2300000, color: "bg-orange-500" },
    { zone: "North Beach", density: 43, avgPrice: 1900000, color: "bg-yellow-500" },
    { zone: "Art Deco District", density: 78, avgPrice: 2500000, color: "bg-red-400" },
    { zone: "Fisher Island", density: 15, avgPrice: 4500000, color: "bg-purple-500" }
  ];

  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `$${amount / 1000000}M`;
    }
    return `$${amount.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header with Market Selector */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-gta text-vice-cyan mb-2">🌎 MARKET INTELLIGENCE</h2>
          <p className="text-muted-foreground">Real-time market analysis and opportunity identification</p>
        </div>
        <div className="flex gap-3">
          <Select value={selectedMarket} onValueChange={setSelectedMarket}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select Market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="miami-beach">Miami Beach</SelectItem>
              <SelectItem value="fort-lauderdale">Fort Lauderdale</SelectItem>
              <SelectItem value="boca-raton">Boca Raton</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" className="border-vice-cyan text-vice-cyan">
            <Plus className="w-4 h-4 mr-2" />
            Add Market
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="font-gta text-vice-pink">
            {currentMarket.name.toUpperCase()} OVERVIEW
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-gta text-vice-cyan mb-1">
                {formatCurrency(currentMarket.medianPrice)}
              </div>
              <div className="text-xs text-muted-foreground">MEDIAN PRICE</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-gta text-vice-orange mb-1">
                {currentMarket.daysOnMarket}
              </div>
              <div className="text-xs text-muted-foreground">DAYS ON MARKET</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-gta text-vice-yellow mb-1">
                {currentMarket.inventory}
              </div>
              <div className="text-xs text-muted-foreground">LISTINGS</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-gta text-vice-green mb-1">
                ${currentMarket.pricePerSqFt}
              </div>
              <div className="text-xs text-muted-foreground">PRICE/SQFT</div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-lg font-gta text-vice-pink mb-1">
                +{currentMarket.appreciation}%
              </div>
              <div className="text-xs text-muted-foreground">YoY APPRECIATION</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-lg font-gta text-vice-cyan mb-1">
                {currentMarket.absorptionRate} months
              </div>
              <div className="text-xs text-muted-foreground">ABSORPTION RATE</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-lg font-gta text-vice-orange mb-1">
                {currentMarket.cashBuyers}%
              </div>
              <div className="text-xs text-muted-foreground">CASH BUYERS</div>
            </div>
            <div className="text-center p-3 bg-muted/20 rounded-lg">
              <div className="text-lg font-gta text-vice-yellow mb-1">
                {currentMarket.foreignBuyers}%
              </div>
              <div className="text-xs text-muted-foreground">FOREIGN BUYERS</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Heat Map */}
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="font-gta text-vice-orange">🗺️ HEAT MAP</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {heatMapData.map((zone, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${zone.color}`} />
                    <span className="font-medium text-sm">{zone.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-gta text-vice-cyan">
                      {formatCurrency(zone.avgPrice)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {zone.density}% density
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center">
              <MapPin className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Interactive map integration coming soon
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Will show real-time property density and pricing zones
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Market Trends */}
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="font-gta text-vice-green">📈 MARKET TRENDS (12 months)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Mock trend data */}
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-5 h-5 text-vice-green" />
                  <span className="text-sm font-medium">Average Price</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-gta text-vice-green">+15.2%</div>
                  <div className="text-xs text-muted-foreground">vs last year</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Home className="w-5 h-5 text-vice-cyan" />
                  <span className="text-sm font-medium">Inventory</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-gta text-vice-cyan">-8.4%</div>
                  <div className="text-xs text-muted-foreground">vs last year</div>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-vice-orange" />
                  <span className="text-sm font-medium">Days on Market</span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-gta text-vice-orange">-12.1%</div>
                  <div className="text-xs text-muted-foreground">vs last year</div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-4 bg-muted/30 rounded-lg text-center">
              <TrendingUp className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                Interactive chart coming soon
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Line graph showing price, inventory, and DOM trends
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Opportunity Zones */}
      <Card className="mission-card">
        <CardHeader>
          <CardTitle className="font-gta text-vice-pink">🎯 YOUR OPPORTUNITY ZONES</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {opportunityZones.map((zone, index) => (
              <div key={index} className="p-4 bg-muted/20 rounded-lg border border-vice-cyan/20">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-gta text-vice-cyan">{zone.name}</h4>
                  <div className="flex">
                    {Array.from({ length: 5 }, (_, i) => (
                      <span
                        key={i}
                        className={`text-sm ${i < zone.stars ? 'text-vice-yellow' : 'text-muted'}`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Deals Possible:</span>
                    <span className="font-gta text-vice-green">{zone.dealCount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Avg ROI:</span>
                    <span className="font-gta text-vice-orange">{zone.avgROI}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
