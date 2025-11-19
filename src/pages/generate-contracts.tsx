import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  FileText,
  Download,
  Star,
  CheckSquare,
  Square,
  Calendar
} from "lucide-react";

interface ContractProperty {
  id: string;
  address: string;
  salePrice: number;
  strategy: string;
  agentName: string;
  agentEmail: string;
  stars: number;
  roi: number;
  offerAcceptedDate: string;
  selected: boolean;
}

export default function GenerateContractsPage() {
  const navigate = useNavigate();
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);

  const [properties] = useState<ContractProperty[]>([
    {
      id: "1",
      address: "456 Palm Ave, Miami Beach",
      salePrice: 2100000,
      strategy: "Subject-To",
      agentName: "John Smith",
      agentEmail: "john@realty.com",
      stars: 5,
      roi: 22,
      offerAcceptedDate: "2025-01-15",
      selected: false
    },
    {
      id: "2",
      address: "789 Ocean Blvd, Fort Lauderdale",
      salePrice: 3400000,
      strategy: "Seller Finance",
      agentName: "Sarah Johnson",
      agentEmail: "sarah@coastal.com",
      stars: 5,
      roi: 19,
      offerAcceptedDate: "2025-01-14",
      selected: false
    },
    {
      id: "3",
      address: "123 Beach St, Boca Raton",
      salePrice: 1800000,
      strategy: "Hybrid",
      agentName: "Mike Davis",
      agentEmail: "mike@bocaraton.com",
      stars: 4.8,
      roi: 18,
      offerAcceptedDate: "2025-01-13",
      selected: false
    }
  ]);

  const handleSelectAll = () => {
    const allIds = properties.map(p => p.id);
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
                GENERATE CONTRACTS
              </h1>
              <p className="text-vice-cyan font-body">Create legal documents for accepted offers</p>
            </div>
          </div>
        </div>

        {/* Status Summary */}
        <Card className="mission-card mb-6">
          <CardContent className="p-6">
            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-gta text-vice-green mb-1">{properties.length}</div>
                <div className="text-sm text-muted-foreground">PROPERTIES READY</div>
              </div>
              <div>
                <div className="text-2xl font-gta text-vice-cyan mb-1">
                  {formatCurrency(properties.reduce((sum, p) => sum + p.salePrice, 0))}
                </div>
                <div className="text-sm text-muted-foreground">TOTAL VALUE</div>
              </div>
              <div>
                <div className="text-2xl font-gta text-vice-orange mb-1">
                  {Math.round(properties.reduce((sum, p) => sum + p.roi, 0) / properties.length)}%
                </div>
                <div className="text-sm text-muted-foreground">AVG ROI</div>
              </div>
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
          {properties.map((property) => (
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
                            Sale Price: {formatCurrency(property.salePrice)}
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
                        <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          Accepted: {property.offerAcceptedDate}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-vice-green text-vice-green">
                        ✅ Offer Accepted - Ready for Contract
                      </Badge>
                      <Button variant="neon-cyan" size="sm" className="ml-auto">
                        <FileText className="mr-2 w-4 h-4" />
                        GENERATE CONTRACT
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bulk Actions */}
        <div className="flex justify-center gap-4">
          <Button
            variant="neon-pink"
            size="lg"
            className="px-8"
            disabled={selectedProperties.length === 0}
          >
            <FileText className="mr-2 w-5 h-5" />
            GENERATE CONTRACTS ({selectedProperties.length})
          </Button>
          <Button variant="outline" size="lg" className="px-8 border-vice-cyan text-vice-cyan">
            <Download className="mr-2 w-5 h-5" />
            DOWNLOAD ALL
          </Button>
        </div>
      </div>
    </div>
  );
}
