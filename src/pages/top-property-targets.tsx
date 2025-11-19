import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import {
  ArrowLeft,
  Star,
  TrendingUp,
  Target,
  Search,
  Filter,
  Image as ImageIcon
} from "lucide-react";

interface Property {
  id: string;
  rank: number;
  address: string;
  stars: number;
  roi: number;
  value: number;
  strategy: string;
  market: string;
  score: number;
  // Detailed info for modal
  listPrice: number;
  arv: number;
  agentName: string;
  agentEmail: string;
  mortgageBalance: number;
  monthlyPiti: number;
  rehabEstimate: number;
  capRate: number;
  cashOnCash: number;
  schoolRating: number;
  crimeIndex: string;
  walkability: number;
  comps: Array<{
    address: string;
    price: number;
    soldDate: string;
    type: string;
  }>;
  // Scoring breakdown
  scoringBreakdown: {
    roiPotential: { score: number; max: number };
    cashFlow: { score: number; max: number };
    dealCertainty: { score: number; max: number };
    marketTiming: { score: number; max: number };
    financingViability: { score: number; max: number };
  };
}

export default function TopPropertyTargetsPage() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    market: "all",
    strategy: "all",
    minRoi: 15
  });

  const [properties] = useState<Property[]>([
    {
      id: "1",
      rank: 1,
      address: "789 Ocean Blvd, Fort Lauderdale",
      stars: 5,
      roi: 22,
      value: 3400000,
      strategy: "Seller Finance",
      market: "Fort Lauderdale",
      score: 96,
      listPrice: 3400000,
      arv: 4200000,
      agentName: "Sarah Johnson",
      agentEmail: "sarah@coastal.com",
      mortgageBalance: 2400000,
      monthlyPiti: 12400,
      rehabEstimate: 60000,
      capRate: 6.8,
      cashOnCash: 18.7,
      schoolRating: 7,
      crimeIndex: "Low",
      walkability: 85,
      comps: [
        { address: "785 Ocean Blvd", price: 3600000, soldDate: "2024-12-15", type: "Similar" },
        { address: "795 Ocean Blvd", price: 3200000, soldDate: "2024-11-20", type: "Similar" },
        { address: "781 Ocean Blvd", price: 3800000, soldDate: "2024-10-10", type: "Larger" }
      ],
      scoringBreakdown: {
        roiPotential: { score: 5, max: 5 },
        cashFlow: { score: 4.8, max: 5 },
        dealCertainty: { score: 4.2, max: 5 },
        marketTiming: { score: 5, max: 5 },
        financingViability: { score: 5, max: 5 }
      }
    },
    {
      id: "2",
      rank: 2,
      address: "456 Palm Ave, Miami Beach",
      stars: 5,
      roi: 19,
      value: 2100000,
      strategy: "Subject-To",
      market: "Miami Beach",
      score: 92,
      listPrice: 2100000,
      arv: 2800000,
      agentName: "John Smith",
      agentEmail: "john@realty.com",
      mortgageBalance: 1400000,
      monthlyPiti: 8400,
      rehabEstimate: 80000,
      capRate: 6.2,
      cashOnCash: 14.7,
      schoolRating: 8,
      crimeIndex: "Low",
      walkability: 92,
      comps: [
        { address: "442 Palm Ave", price: 2300000, soldDate: "2024-12-05", type: "Similar" },
        { address: "470 Palm Ave", price: 2700000, soldDate: "2024-11-18", type: "Larger" },
        { address: "438 Palm Ave", price: 2000000, soldDate: "2024-10-22", type: "Similar" }
      ],
      scoringBreakdown: {
        roiPotential: { score: 4.5, max: 5 },
        cashFlow: { score: 4.2, max: 5 },
        dealCertainty: { score: 4.8, max: 5 },
        marketTiming: { score: 4.5, max: 5 },
        financingViability: { score: 4.8, max: 5 }
      }
    },
    {
      id: "3",
      rank: 3,
      address: "123 Beach St, Boca Raton",
      stars: 4.8,
      roi: 18,
      value: 1800000,
      strategy: "Hybrid",
      market: "Boca Raton",
      score: 89,
      listPrice: 1800000,
      arv: 2400000,
      agentName: "Mike Davis",
      agentEmail: "mike@bocaraton.com",
      mortgageBalance: 1200000,
      monthlyPiti: 7200,
      rehabEstimate: 50000,
      capRate: 5.8,
      cashOnCash: 13.2,
      schoolRating: 9,
      crimeIndex: "Very Low",
      walkability: 78,
      comps: [
        { address: "125 Beach St", price: 1950000, soldDate: "2024-12-08", type: "Similar" },
        { address: "121 Beach St", price: 1750000, soldDate: "2024-11-15", type: "Similar" },
        { address: "127 Beach St", price: 2100000, soldDate: "2024-09-30", type: "Larger" }
      ],
      scoringBreakdown: {
        roiPotential: { score: 4.2, max: 5 },
        cashFlow: { score: 4.5, max: 5 },
        dealCertainty: { score: 4.0, max: 5 },
        marketTiming: { score: 4.8, max: 5 },
        financingViability: { score: 4.2, max: 5 }
      }
    },
    {
      id: "4",
      rank: 4,
      address: "234 Collins Ave, Miami Beach",
      stars: 4,
      roi: 17,
      value: 2700000,
      strategy: "Subject-To",
      market: "Miami Beach",
      score: 85,
      listPrice: 2700000,
      arv: 3500000,
      agentName: "Lisa Chen",
      agentEmail: "lisa@miamirealestate.com",
      mortgageBalance: 1800000,
      monthlyPiti: 10800,
      rehabEstimate: 70000,
      capRate: 6.0,
      cashOnCash: 12.8,
      schoolRating: 7,
      crimeIndex: "Medium",
      walkability: 95,
      comps: [
        { address: "236 Collins Ave", price: 2900000, soldDate: "2024-12-12", type: "Similar" },
        { address: "232 Collins Ave", price: 2600000, soldDate: "2024-11-25", type: "Similar" },
        { address: "238 Collins Ave", price: 3100000, soldDate: "2024-10-05", type: "Larger" }
      ],
      scoringBreakdown: {
        roiPotential: { score: 4.0, max: 5 },
        cashFlow: { score: 3.8, max: 5 },
        dealCertainty: { score: 4.5, max: 5 },
        marketTiming: { score: 4.2, max: 5 },
        financingViability: { score: 4.0, max: 5 }
      }
    },
    {
      id: "5",
      rank: 5,
      address: "567 Washington Ave, Miami Beach",
      stars: 4,
      roi: 16,
      value: 1900000,
      strategy: "Seller Finance",
      market: "Miami Beach",
      score: 82,
      listPrice: 1900000,
      arv: 2500000,
      agentName: "Tom Wilson",
      agentEmail: "tom@wilsonproperties.com",
      mortgageBalance: 1300000,
      monthlyPiti: 7800,
      rehabEstimate: 40000,
      capRate: 5.5,
      cashOnCash: 11.9,
      schoolRating: 6,
      crimeIndex: "Medium",
      walkability: 88,
      comps: [
        { address: "565 Washington Ave", price: 2050000, soldDate: "2024-12-18", type: "Similar" },
        { address: "569 Washington Ave", price: 1850000, soldDate: "2024-11-30", type: "Similar" },
        { address: "563 Washington Ave", price: 2200000, soldDate: "2024-09-15", type: "Larger" }
      ],
      scoringBreakdown: {
        roiPotential: { score: 3.8, max: 5 },
        cashFlow: { score: 4.0, max: 5 },
        dealCertainty: { score: 3.5, max: 5 },
        marketTiming: { score: 4.5, max: 5 },
        financingViability: { score: 4.2, max: 5 }
      }
    }
  ]);

  const filteredProperties = properties.filter(property => {
    if (filters.market !== "all" && property.market !== filters.market) return false;
    if (filters.strategy !== "all" && property.strategy !== filters.strategy) return false;
    if (property.roi < filters.minRoi) return false;
    return true;
  });

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.floor(rating) ? 'text-vice-yellow fill-current' : 'text-muted-foreground'}`}
      />
    ));
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString()}`;
  };

  const PropertyDetailModal = ({ property }: { property: Property }) => {
    const totalScore = Object.values(property.scoringBreakdown).reduce((sum, category) =>
      sum + (category.score / category.max * 20), 0
    );

    return (
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-gta text-vice-cyan">
            {property.address}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Property Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-vice-cyan flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Property Images
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt="Property exterior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt="Property interior"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-video bg-muted rounded-lg overflow-hidden">
                  <img
                    src="/placeholder.svg"
                    alt="Property backyard"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Property Overview */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-vice-pink">Financial Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>List Price:</span>
                  <span className="font-semibold">{formatCurrency(property.listPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span>ARV:</span>
                  <span className="font-semibold text-vice-green">{formatCurrency(property.arv)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Mortgage:</span>
                  <span className="font-semibold">{formatCurrency(property.mortgageBalance)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Monthly PITI:</span>
                  <span className="font-semibold">{formatCurrency(property.monthlyPiti)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Est. Rehab:</span>
                  <span className="font-semibold">{formatCurrency(property.rehabEstimate)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cap Rate:</span>
                  <span className="font-semibold text-vice-orange">{property.capRate}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Cash-on-Cash:</span>
                  <span className="font-semibold text-vice-yellow">{property.cashOnCash}%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-vice-cyan">Location Intelligence</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>School Rating:</span>
                  <span className="font-semibold">{property.schoolRating}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Crime Index:</span>
                  <span className="font-semibold">{property.crimeIndex}</span>
                </div>
                <div className="flex justify-between">
                  <span>Walkability:</span>
                  <span className="font-semibold">{property.walkability}/100</span>
                </div>
                <div className="flex justify-between">
                  <span>Agent:</span>
                  <span className="font-semibold">{property.agentName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span className="font-semibold text-xs">{property.agentEmail}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Comps */}
          <Card>
            <CardHeader>
              <CardTitle className="text-vice-orange">Comparable Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {property.comps.map((comp, index) => (
                  <div key={index} className="flex justify-between items-center p-2 bg-muted/20 rounded">
                    <div>
                      <div className="font-medium">{comp.address}</div>
                      <div className="text-sm text-muted-foreground">{comp.type} • Sold {comp.soldDate}</div>
                    </div>
                    <div className="font-semibold">{formatCurrency(comp.price)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Police Star Rating */}
          <Card>
            <CardHeader>
              <CardTitle className="text-vice-yellow flex items-center gap-2">
                <Star className="w-5 h-5 fill-current" />
                POLICE STAR RATING: {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="w-4 h-4 inline fill-current" />
                ))}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(property.scoringBreakdown).map(([category, scores]) => {
                  const percentage = (scores.score / scores.max) * 100;
                  const categoryName = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{categoryName}:</span>
                        <span>{scores.score}/{scores.max} ({percentage.toFixed(0)}%)</span>
                      </div>
                      <Progress value={percentage} className="h-3" />
                    </div>
                  );
                })}

                <div className="pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-gta text-vice-pink">OVERALL SCORE: {totalScore.toFixed(0)}/100</div>
                    <div className="text-lg font-semibold text-vice-green">
                      {totalScore >= 90 ? 'TOP TIER DEAL 🔥' :
                       totalScore >= 80 ? 'STRONG DEAL ⭐' :
                       totalScore >= 70 ? 'GOOD DEAL 👍' : 'MODERATE DEAL 🤔'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    );
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
              onClick={() => navigate("/command-center")}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              BACK TO COMMAND CENTER
            </Button>
            <div>
              <h1 className="text-4xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text">
                TOP 100 PROPERTY TARGETS
              </h1>
              <p className="text-vice-cyan font-body">Ranked by deal score and ROI potential</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-orange flex items-center gap-2">
              <Filter className="w-5 h-5" />
              FILTERS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Market:</span>
                <Select
                  value={filters.market}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, market: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Markets</SelectItem>
                    <SelectItem value="Miami Beach">Miami Beach</SelectItem>
                    <SelectItem value="Fort Lauderdale">Fort Lauderdale</SelectItem>
                    <SelectItem value="Boca Raton">Boca Raton</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Strategy:</span>
                <Select
                  value={filters.strategy}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, strategy: value }))}
                >
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Strategies</SelectItem>
                    <SelectItem value="Subject-To">Subject-To</SelectItem>
                    <SelectItem value="Seller Finance">Seller Finance</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                    <SelectItem value="Cash">Cash</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Min ROI:</span>
                <Select
                  value={filters.minRoi.toString()}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, minRoi: parseInt(value) }))}
                >
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10%</SelectItem>
                    <SelectItem value="15">15%</SelectItem>
                    <SelectItem value="20">20%</SelectItem>
                    <SelectItem value="25">25%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-vice-cyan">
            Showing {filteredProperties.length} of {properties.length} properties
          </p>
        </div>

        {/* Properties Table */}
        <Card className="mission-card">
          <CardHeader>
            <CardTitle className="font-gta text-vice-pink">RANKED TARGETS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-vice-cyan/20">
                    <th className="text-left p-3 font-gta text-vice-cyan">RANK</th>
                    <th className="text-left p-3 font-gta text-vice-cyan">PROPERTY</th>
                    <th className="text-center p-3 font-gta text-vice-cyan">STARS</th>
                    <th className="text-center p-3 font-gta text-vice-cyan">ROI</th>
                    <th className="text-center p-3 font-gta text-vice-cyan">VALUE</th>
                    <th className="text-center p-3 font-gta text-vice-cyan">STRATEGY</th>
                    <th className="text-center p-3 font-gta text-vice-cyan">SCORE</th>
                    <th className="text-center p-3 font-gta text-vice-cyan">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property) => (
                    <tr key={property.id} className="border-b border-muted/20 hover:bg-muted/10">
                      <td className="p-3">
                        <div className="text-2xl font-gta text-vice-pink">#{property.rank}</div>
                      </td>
                      <td className="p-3">
                        <div className="font-gta text-vice-cyan">{property.address}</div>
                        <div className="text-sm text-muted-foreground">{property.market}</div>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex justify-center">
                          {renderStars(property.stars)}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="border-vice-green text-vice-green">
                          {property.roi}%
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="font-semibold text-vice-orange">
                          {formatCurrency(property.value)}
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Badge variant="outline" className="border-vice-purple text-vice-purple">
                          {property.strategy}
                        </Badge>
                      </td>
                      <td className="p-3 text-center">
                        <div className="text-lg font-gta text-vice-yellow">
                          {property.score}%
                        </div>
                      </td>
                      <td className="p-3 text-center">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="neon-cyan" size="sm">
                              <Target className="mr-2 w-4 h-4" />
                              VIEW DETAILS
                            </Button>
                          </DialogTrigger>
                          <PropertyDetailModal property={property} />
                        </Dialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
