import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Handshake,
  DollarSign,
  Star,
  Download,
  MessageSquare
} from "lucide-react";

interface SellerClosing {
  id: string;
  address: string;
  closeDate: string;
  sellerName: string;
  salePrice: number;
  sellerNet: number;
  wholesaleFee: number;
  strategy: string;
  daysToClose: number;
  testimonial: string;
  rating: number;
}

export default function SellerClosingsPage() {
  const navigate = useNavigate();

  const closingStats = {
    totalDealsClosed: 23,
    totalSellerPayouts: 14200000,
    avgPayoutPerSeller: 617391,
    sellerSatisfaction: 92,
    positiveFeedback: 21
  };

  const recentClosings: SellerClosing[] = [
    {
      id: "1",
      address: "789 Ocean Blvd",
      closeDate: "2024-12-15",
      sellerName: "Maria Gonzalez",
      salePrice: 3400000,
      sellerNet: 3382000,
      wholesaleFee: 18000,
      strategy: "Seller Finance",
      daysToClose: 18,
      testimonial: "Fast, professional, exactly as promised!",
      rating: 5
    },
    {
      id: "2",
      address: "456 Palm Ave",
      closeDate: "2024-12-08",
      sellerName: "Robert Chen",
      salePrice: 2100000,
      sellerNet: 2085000,
      wholesaleFee: 15000,
      strategy: "Subject-To",
      daysToClose: 22,
      testimonial: "Great communication throughout the process.",
      rating: 5
    },
    {
      id: "3",
      address: "123 Beach St",
      closeDate: "2024-11-27",
      sellerName: "Jennifer Davis",
      salePrice: 1800000,
      sellerNet: 1787000,
      wholesaleFee: 13000,
      strategy: "Hybrid",
      daysToClose: 15,
      testimonial: "Exceeded our expectations in every way.",
      rating: 4.8
    }
  ];

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
                SELLER CLOSINGS TRACKER
              </h1>
              <p className="text-vice-cyan font-body">Track successful deals and seller satisfaction</p>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <Handshake className="w-8 h-8 text-vice-green mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-green mb-1">
                {closingStats.totalDealsClosed}
              </div>
              <div className="text-sm text-muted-foreground">TOTAL DEALS CLOSED</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-vice-cyan mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-cyan mb-1">
                {formatCurrency(closingStats.totalSellerPayouts)}
              </div>
              <div className="text-sm text-muted-foreground">TOTAL SELLER PAYOUTS</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <DollarSign className="w-8 h-8 text-vice-orange mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-orange mb-1">
                {formatCurrency(closingStats.avgPayoutPerSeller)}
              </div>
              <div className="text-sm text-muted-foreground">AVG PAYOUT PER SELLER</div>
            </CardContent>
          </Card>

          <Card className="mission-card">
            <CardContent className="p-6 text-center">
              <Star className="w-8 h-8 text-vice-yellow mx-auto mb-2" />
              <div className="text-3xl font-gta text-vice-yellow mb-1">
                {closingStats.sellerSatisfaction}%
              </div>
              <div className="text-sm text-muted-foreground">SELLER SATISFACTION</div>
            </CardContent>
          </Card>
        </div>

        {/* Payout Timeline Chart */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-orange">📊 PAYOUT TIMELINE</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 bg-muted/20 rounded-lg flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <Handshake className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Monthly Closing Activity</p>
                <p className="text-sm">Bar chart visualization coming soon</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Closings */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-pink">💰 RECENT CLOSINGS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentClosings.map((closing) => (
                <Card key={closing.id} className="bg-muted/10 border-vice-cyan/20">
                  <CardContent className="p-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-gta text-vice-cyan text-lg mb-3">{closing.address}</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Seller:</span>
                            <span className="font-medium">{closing.sellerName}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Sale Price:</span>
                            <span className="font-medium text-vice-green">{formatCurrency(closing.salePrice)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Seller Net:</span>
                            <span className="font-medium text-vice-orange">{formatCurrency(closing.sellerNet)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Wholesale Fee:</span>
                            <span className="font-medium">{formatCurrency(closing.wholesaleFee)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Strategy:</span>
                            <Badge variant="outline" className="border-vice-purple text-vice-purple">
                              {closing.strategy}
                            </Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Days to Close:</span>
                            <span className="font-medium">{closing.daysToClose} days</span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">{renderStars(closing.rating)}</div>
                          <span className="text-sm text-muted-foreground">
                            ({closing.rating}/5 stars)
                          </span>
                        </div>
                        <blockquote className="text-sm italic text-muted-foreground bg-muted/20 p-3 rounded-lg">
                          "{closing.testimonial}"
                        </blockquote>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button variant="neon-cyan" size="lg" className="px-8">
            <Download className="mr-2 w-5 h-5" />
            VIEW ALL CLOSINGS
          </Button>
          <Button variant="outline" size="lg" className="px-8 border-vice-orange text-vice-orange">
            <MessageSquare className="mr-2 w-5 h-5" />
            TESTIMONIALS
          </Button>
          <Button variant="outline" size="lg" className="px-8 border-vice-pink text-vice-pink">
            <Download className="mr-2 w-5 h-5" />
            EXPORT REPORT
          </Button>
        </div>
      </div>
    </div>
  );
}
