//src/page/deploy-offer.tsx

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft,
  Eye,
  FileText,
  Send,
  Download,
  Star,
  CheckSquare,
  Square
} from "lucide-react";

interface Property {
  id: string;
  address: string;
  listPrice: number;
  arv: number;
  strategy: string;
  agentName: string;
  agentEmail: string;
  stars: number;
  roi: number;
  selected: boolean;
}

export default function DeployOffersPage() {
  const navigate = useNavigate();
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    starsOnly: false,
    minRoi: 15,
    maxPrice: 3000000
  });

  const [properties] = useState<Property[]>([
    {
      id: "1",
      address: "456 Palm Ave, Miami Beach",
      listPrice: 2100000,
      arv: 2800000,
      strategy: "Subject-To",
      agentName: "John Smith",
      agentEmail: "john@realty.com",
      stars: 5,
      roi: 22,
      selected: false
    },
    {
      id: "2",
      address: "789 Ocean Blvd, Fort Lauderdale",
      listPrice: 3400000,
      arv: 4200000,
      strategy: "Seller Finance",
      agentName: "Sarah Johnson",
      agentEmail: "sarah@coastal.com",
      stars: 5,
      roi: 19,
      selected: false
    },
    {
      id: "3",
      address: "123 Beach St, Boca Raton",
      listPrice: 1800000,
      arv: 2400000,
      strategy: "Hybrid",
      agentName: "Mike Davis",
      agentEmail: "mike@bocaraton.com",
      stars: 4.8,
      roi: 18,
      selected: false
    },
    {
      id: "4",
      address: "234 Collins Ave, Miami Beach",
      listPrice: 2700000,
      arv: 3500000,
      strategy: "Subject-To",
      agentName: "Lisa Chen",
      agentEmail: "lisa@miamirealestate.com",
      stars: 4,
      roi: 17,
      selected: false
    },
    {
      id: "5",
      address: "567 Washington Ave, Miami Beach",
      listPrice: 1900000,
      arv: 2500000,
      strategy: "Seller Finance",
      agentName: "Tom Wilson",
      agentEmail: "tom@wilsonproperties.com",
      stars: 4,
      roi: 16,
      selected: false
    }
  ]);

  const filteredProperties = properties.filter(property => {
    if (filters.starsOnly && property.stars < 5) return false;
    if (property.roi < filters.minRoi) return false;
    if (property.listPrice > filters.maxPrice) return false;
    return true;
  });

  const handleSelectAll = () => {
    const allIds = filteredProperties.map(p => p.id);
    setSelectedProperties(allIds);
  };

  const handleDeselectAll = () => {
    setSelectedProperties([]);
  };

  const handlePropertySelect = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

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
              onClick={() => navigate("/command-center")}
              className="border-vice-cyan text-vice-cyan hover:bg-vice-cyan hover:text-background"
            >
              <ArrowLeft className="mr-2 w-4 h-4" />
              BACK TO COMMAND CENTER
            </Button>
            <div>
              <h1 className="text-4xl font-gta font-black text-transparent bg-gradient-neon bg-clip-text">
                DEPLOY OFFERS
              </h1>
              <p className="text-vice-cyan font-body">Send personalized offers to listing agents</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <Card className="mission-card mb-6">
          <CardHeader>
            <CardTitle className="font-gta text-vice-pink">FILTERS</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="stars-only"
                  checked={filters.starsOnly}
                  onCheckedChange={(checked) => setFilters(prev => ({ ...prev, starsOnly: checked as boolean }))}
                />
                <label htmlFor="stars-only" className="text-sm font-medium">5⭐ Only</label>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm">ROI &gt;</span>
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

              <div className="flex items-center gap-2">
                <span className="text-sm">Price &lt;</span>
                <Select
                    value={filters.maxPrice.toString()}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, maxPrice: parseInt(value) }))}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2000000">$2M</SelectItem>
                    <SelectItem value="3000000">$3M</SelectItem>
                    <SelectItem value="5000000">$5M</SelectItem>
                    <SelectItem value="10000000">$10M</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setFilters({ starsOnly: false, minRoi: 15, maxPrice: 3000000 })}
              >
                Clear
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Selection Summary */}
        <div className="flex items-center justify-between mb-6">
          <div className="text-vice-cyan font-medium">
            SELECTED: {selectedProperties.length} properties
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              <CheckSquare className="mr-2 w-4 h-4" />
              SELECT ALL
            </Button>
            <Button variant="outline" size="sm" onClick={handleDeselectAll}>
              <Square className="mr-2 w-4 h-4" />
              DESELECT ALL
            </Button>
          </div>
        </div>

        {/* Properties List */}
        <div className="space-y-4 mb-8">
          {filteredProperties.map((property) => (
            <Card key={property.id} className="mission-card">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Checkbox
                    checked={selectedProperties.includes(property.id)}
                    onCheckedChange={() => handlePropertySelect(property.id)}
                    className="mt-1"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-gta text-vice-cyan text-lg mb-2">{property.address}</h3>
                        <div className="flex items-center gap-4 mb-2">
                          <span className="text-vice-green font-semibold">
                            List: {formatCurrency(property.listPrice)}
                          </span>
                          <span className="text-vice-orange">
                            ARV: {formatCurrency(property.arv)}
                          </span>
                          <Badge variant="outline" className="border-vice-pink text-vice-pink">
                            {property.strategy}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex">{renderStars(property.stars)}</div>
                          <span className="text-vice-yellow">{property.roi}% ROI</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-muted-foreground mb-1">Agent:</div>
                        <div className="font-medium text-vice-cyan">{property.agentName}</div>
                        <div className="text-xs text-muted-foreground">{property.agentEmail}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-vice-green text-vice-green">
                        ✅ Offer Ready
                      </Badge>
                      <Button variant="outline" size="sm" className="border-vice-cyan text-vice-cyan">
                        <Eye className="mr-2 w-4 h-4" />
                        VIEW DETAILS
                      </Button>
                      <Button variant="outline" size="sm" className="border-vice-orange text-vice-orange">
                        <FileText className="mr-2 w-4 h-4" />
                        PREVIEW OFFER
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-4">
          <Button
            variant="neon-pink"
            size="lg"
            className="px-8"
            disabled={selectedProperties.length === 0}
          >
            <Send className="mr-2 w-5 h-5" />
            DEPLOY SELECTED OFFERS ({selectedProperties.length})
          </Button>
          <Button variant="outline" size="lg" className="px-8 border-vice-cyan text-vice-cyan">
            <Download className="mr-2 w-5 h-5" />
            EXPORT TO PDF
          </Button>
        </div>
      </div>
    </div>
  );
}
