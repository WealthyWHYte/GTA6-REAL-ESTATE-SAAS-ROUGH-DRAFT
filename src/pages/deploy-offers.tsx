// src/pages/deploy-offers.tsx
// Real property data from uploaded CSVs

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ArrowLeft,
  Eye,
  FileText,
  Send,
  Download,
  Star,
  CheckSquare,
  Square,
  Loader2,
  Mail,
  Building,
  DollarSign,
  Target
} from "lucide-react";

export default function DeployOffersPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<any[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [filters, setFilters] = useState({
    starsOnly: false,
    minRoi: 0,
    maxPrice: 100000000
  });

  // Fetch real properties from database
  useEffect(() => {
    loadProperties();
  }, []);

  async function loadProperties() {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get properties with offers - from real uploaded data
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          offers (*)
        `)
        .eq('account_id', user?.id)
        .in('pipeline_status', ['scouted', 'market_research', 'researched', 'underwriting', 'underwritten', 'offer_generation', 'offer_sent'])
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      
      // Transform data to match expected format
      const transformed = (data || []).map((p: any) => {
        const offer = p.offers?.[0] || {};
        return {
          id: p.property_id || p.id,
          address: p.address,
          city: p.city,
          state: p.state,
          zip: p.zip,
          listPrice: p.listing_price || p.price || 0,
          arv: p.estimated_value || p.arv || 0,
          strategy: offer.strategy || p.recommended_strategy || 'TBD',
          agentName: p.listing_agent_full_name || 'TBD',
          agentEmail: p.listing_agent_email || '',
          agentPhone: p.listing_agent_phone || '',
          stars: p.score || p.stars || 0,
          roi: offer.roi || p.roi || 0,
          offerPrice: offer.offer_price || 0,
          mao: offer.max_allowable_offer || 0,
          selected: false,
          pipelineStatus: p.pipeline_status,
          marketResearch: p.market_research,
          underwriting: p.underwriting
        };
      });
      
      setProperties(transformed);
    } catch (err) {
      console.error('Error loading properties:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter properties
  const filteredProperties = properties.filter(p => {
    if (filters.starsOnly && p.stars < 3) return false;
    if (p.roi < filters.minRoi) return false;
    if (p.listPrice > filters.maxPrice) return false;
    return true;
  });

  function handlePropertySelect(id: string) {
    setSelectedProperties(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  }

  function handleSelectAll() {
    setSelectedProperties(filteredProperties.map(p => p.id));
  }

  function handleDeselectAll() {
    setSelectedProperties([]);
  }

  function formatCurrency(value: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(value);
  }

  function getStatusColor(status: string) {
    const colors: Record<string, string> = {
      scouted: 'bg-blue-500',
      market_research: 'bg-yellow-500',
      researched: 'bg-orange-500',
      underwriting: 'bg-purple-500',
      underwritten: 'bg-green-500',
      offer_generation: 'bg-pink-500',
      offer_sent: 'bg-cyan-500',
      accepted: 'bg-emerald-500',
      rejected: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-muted-foreground">Loading properties from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-gta-blue flex items-center gap-3">
              <Send className="w-8 h-8 text-blue-500" />
              Deploy Offers
            </h1>
            <p className="text-muted-foreground">
              {filteredProperties.length} properties ready for offer deployment
            </p>
          </div>
          <Badge variant="outline" className="text-sm">
            {selectedProperties.length} selected
          </Badge>
        </div>

        {/* Filters */}
        <div className="bg-card border rounded-lg p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Checkbox 
                id="starsOnly" 
                checked={filters.starsOnly}
                onCheckedChange={(checked) => setFilters(f => ({...f, starsOnly: !!checked}))}
              />
              <label htmlFor="starsOnly" className="text-sm">3+ Stars Only</label>
            </div>
            
            <div className="flex items-center gap-2">
              <label className="text-sm">Min ROI:</label>
              <input 
                type="number" 
                value={filters.minRoi}
                onChange={(e) => setFilters(f => ({...f, minRoi: Number(e.target.value)}))}
                className="w-20 bg-background border rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm">Max Price:</label>
              <input 
                type="number" 
                value={filters.maxPrice}
                onChange={(e) => setFilters(f => ({...f, maxPrice: Number(e.target.value)}))}
                className="w-32 bg-background border rounded px-2 py-1 text-sm"
              />
            </div>

            <div className="flex-1" />

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
        {filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Building className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Properties Found</h3>
              <p className="text-muted-foreground mb-4">
                Upload properties using Pipeline Scout to see them here.
              </p>
              <Button onClick={() => navigate('/agent/pipeline-scout')}>
                Go to Pipeline Scout
              </Button>
            </CardContent>
          </Card>
        ) : (
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
                          <h3 className="font-gta text-vice-cyan text-lg mb-2">
                            {property.address}
                          </h3>
                          <div className="flex items-center gap-4 mb-2">
                            <span className="text-vice-green font-semibold">
                              List: {formatCurrency(property.listPrice)}
                            </span>
                            <span className="text-vice-orange">
                              ARV: {formatCurrency(property.arv)}
                            </span>
                            {property.offerPrice > 0 && (
                              <span className="text-blue-400 font-semibold">
                                Offer: {formatCurrency(property.offerPrice)}
                              </span>
                            )}
                            <Badge variant="outline" className="border-vice-pink text-vice-pink">
                              {property.strategy}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              {[...Array(5)].map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.floor(property.stars) ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} 
                                />
                              ))}
                              <span className="ml-1 text-sm">{property.stars.toFixed(1)}</span>
                            </div>
                            <span className="text-vice-yellow">{property.roi}% ROI</span>
                            <Badge className={`${getStatusColor(property.pipelineStatus)} text-white`}>
                              {property.pipelineStatus}
                            </Badge>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-muted-foreground mb-1">Agent:</div>
                          <div className="font-medium text-vice-cyan">{property.agentName}</div>
                          <div className="text-xs text-muted-foreground">{property.agentEmail}</div>
                          {property.agentPhone && (
                            <div className="text-xs text-muted-foreground">{property.agentPhone}</div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {property.offerPrice > 0 ? (
                          <Badge variant="outline" className="border-vice-green text-vice-green">
                            ✅ Offer Ready
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="border-yellow-500 text-yellow-500">
                            ⏳ Needs Offer
                          </Badge>
                        )}
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
        )}

        {/* Action Buttons */}
        {filteredProperties.length > 0 && (
          <div className="flex justify-center gap-4">
            <Button
              variant="neon-pink"
              size="lg"
              className="px-8"
              disabled={selectedProperties.length === 0}
              onClick={() => navigate('/send-offers')}
            >
              <Send className="mr-2 w-5 h-5" />
              SEND OFFERS VIA EMAIL ({selectedProperties.length})
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="px-8 border-vice-cyan text-vice-cyan"
              onClick={() => navigate('/send-offers')}
            >
              <Mail className="mr-2 w-5 h-5" />
              EMAIL SENDER
            </Button>
            <Button variant="outline" size="lg" className="px-8 border-vice-cyan text-vice-cyan">
              <Download className="mr-2 w-5 h-5" />
              EXPORT TO PDF
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
