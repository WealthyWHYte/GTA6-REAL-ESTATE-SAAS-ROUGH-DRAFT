// Offer Generator Agent Page
// Generates LOI/Offers with creative finance terms

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  FileText, Send, DollarSign, Calendar, PenTool,
  Eye, Download
} from 'lucide-react'

const CREATIVE_TERMS = {
  all_cash: { name: 'All Cash', description: 'No financing contingency, quick closing' },
  seller_financing: { name: 'Seller Financing', description: 'Seller acts as lender for portion of price' },
  lease_option: { name: 'Lease Option', description: 'Lease with option to purchase later' },
  subject_to: { name: 'Subject To', description: 'Take over existing mortgage' },
  assignment: { name: 'Assignment', description: 'Assign contract to end buyer for fee' },
  joint_venture: { name: 'Joint Venture', description: 'Partner with seller for profits' }
}

export default function OfferGeneratorPage() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [terms, setTerms] = useState({
    offer_price: '',
    earnest_money: '',
    closing_days: '14',
    financing_type: 'conventional',
    down_payment: '20',
    interest_rate: '6',
    loan_term: '30',
    option_fee: '',
    monthly_credit: '',
    lease_term: '24',
    purchase_price_pct: '90',
    cash_to_seller: '',
    inspection_days: '10'
  })
  const queryClient = useQueryClient()

  // Get properties ready for offers - show ALL uploaded properties
  const { data: properties } = useQuery({
    queryKey: ['properties_offer_generation'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('account_id', user?.id)
        .in('pipeline_status', ['scouted', 'market_research', 'researched', 'underwriting', 'underwritten', 'offer_generation', 'offer_sent'])
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  // Get recent offers
  const { data: offers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('offers')
        .select('*, properties(*)')
        .eq('account_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20)
      return data || []
    }
  })

  // Generate offer mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase.functions.invoke('generate-offer', {
        body: {
          property_id: selectedProperty.property_id,
          account_id: user.id,
          strategy: selectedProperty.strategy_recommended
        }
      })

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers'] })
      queryClient.invalidateQueries({ queryKey: ['properties_offer_generation'] })
      setSelectedProperty(null)
      setShowPreview(false)
    }
  })

  const handleTermChange = (key: string, value: string) => {
    setTerms(prev => ({ ...prev, [key]: value }))
  }

  const calculateClosingDate = (daysFromNow: number) => {
    const date = new Date()
    date.setDate(date.getDate() + daysFromNow)
    return date.toISOString().split('T')[0]
  }

  const handlePriceChange = (value: string) => {
    handleTermChange('offer_price', value)
    if (value && !terms.earnest_money) {
      handleTermChange('earnest_money', (parseFloat(value) * 0.01).toString())
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gta-blue mb-2 flex items-center gap-3">
            <PenTool className="w-8 h-8" />
            Offer Generator Agent
          </h1>
          <p className="text-muted-foreground">
            Create LOI/Offers with creative finance terms
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Properties Ready for Offers
                  <Badge variant="secondary" className="ml-auto">
                    {properties?.length || 0} ready
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {properties?.map((property: any) => (
                    <div
                      key={property.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors
                        ${selectedProperty?.id === property.id 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedProperty(property)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{property.address}</h3>
                          <p className="text-sm text-muted-foreground">
                            {property.city}, {property.state}
                          </p>
                        </div>
                        <Badge variant="outline">
                          {property.strategy_recommended?.replace(/_/g, ' ') || 'Standard'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span>List: ${property.price?.toLocaleString()}</span>
                        <span>ARV: ${property.arv?.toLocaleString()}</span>
                        <span>Offer: ${property.offer_price?.toLocaleString() || 'TBD'}</span>
                      </div>
                    </div>
                  ))}
                  {(!properties || properties.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No properties ready for offers</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {selectedProperty && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Generate Offer - {selectedProperty.address}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {!showPreview ? (
                    <div className="space-y-6">
                      <div className="p-4 bg-primary/10 border border-primary rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Recommended Strategy</p>
                        <p className="font-medium text-lg">
                          {selectedProperty.strategy_recommended?.replace(/_/g, ' ').toUpperCase() || 'STANDARD PURCHASE'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Offer Price ($)</Label>
                          <Input
                            type="number"
                            value={terms.offer_price}
                            onChange={(e) => handlePriceChange(e.target.value)}
                            placeholder={selectedProperty.offer_price?.toString() || "Enter amount"}
                          />
                        </div>
                        <div>
                          <Label>Earnest Money ($)</Label>
                          <Input
                            type="number"
                            value={terms.earnest_money}
                            onChange={(e) => handleTermChange('earnest_money', e.target.value)}
                            placeholder="1% of offer"
                          />
                        </div>
                        <div>
                          <Label>Closing Timeline (days)</Label>
                          <Input
                            type="number"
                            value={terms.closing_days}
                            onChange={(e) => handleTermChange('closing_days', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Inspection Period (days)</Label>
                          <Input
                            type="number"
                            value={terms.inspection_days}
                            onChange={(e) => handleTermChange('inspection_days', e.target.value)}
                          />
                        </div>
                      </div>

                      <div>
                        <Label className="mb-2 block">Financing Type</Label>
                        <div className="grid grid-cols-3 gap-2">
                          {Object.entries(CREATIVE_TERMS).map(([key, term]) => (
                            <Button
                              key={key}
                              variant={terms.financing_type === key ? 'default' : 'outline'}
                              size="sm"
                              onClick={() => handleTermChange('financing_type', key)}
                            >
                              {term.name}
                            </Button>
                          ))}
                        </div>
                      </div>

                      {terms.financing_type === 'conventional' && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                          <div>
                            <Label>Down Payment (%)</Label>
                            <Input
                              type="number"
                              value={terms.down_payment}
                              onChange={(e) => handleTermChange('down_payment', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Interest Rate (%)</Label>
                            <Input
                              type="number"
                              step="0.125"
                              value={terms.interest_rate}
                              onChange={(e) => handleTermChange('interest_rate', e.target.value)}
                            />
                          </div>
                          <div>
                            <Label>Loan Term (years)</Label>
                            <Input
                              type="number"
                              value={terms.loan_term}
                              onChange={(e) => handleTermChange('loan_term', e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {terms.financing_type === 'lease_option' && (
                        <div className="grid grid-cols-3 gap-4 p-4 bg-muted rounded-lg">
                          <div>
                            <Label>Option Fee ($)</Label>
                            <Input
                              type="number"
                              value={terms.option_fee}
                              onChange={(e) => handleTermChange('option_fee', e.target.value)}
                              placeholder="5000"
                            />
                          </div>
                          <div>
                            <Label>Monthly Credit ($)</Label>
                            <Input
                              type="number"
                              value={terms.monthly_credit}
                              onChange={(e) => handleTermChange('monthly_credit', e.target.value)}
                              placeholder="100"
                            />
                          </div>
                          <div>
                            <Label>Lease Term (months)</Label>
                            <Input
                              type="number"
                              value={terms.lease_term}
                              onChange={(e) => handleTermChange('lease_term', e.target.value)}
                            />
                          </div>
                        </div>
                      )}

                      {terms.financing_type === 'subject_to' && (
                        <div className="p-4 bg-muted rounded-lg">
                          <div>
                            <Label>Cash to Seller at Closing ($)</Label>
                            <Input
                              type="number"
                              value={terms.cash_to_seller}
                              onChange={(e) => handleTermChange('cash_to_seller', e.target.value)}
                              placeholder="5000"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowPreview(true)}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                        <Button 
                          onClick={() => generateMutation.mutate()}
                          disabled={!terms.offer_price || generateMutation.isPending}
                        >
                          {generateMutation.isPending ? (
                            <>Generating...</>
                          ) : (
                            <>
                              <Send className="w-4 h-4 mr-2" />
                              Generate & Send Offer
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-muted rounded-lg">
                        <h3 className="font-medium mb-4">Offer Preview</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>Property:</span>
                            <span>{selectedProperty.address}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Offer Price:</span>
                            <span className="font-medium">${parseFloat(terms.offer_price || '0').toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Earnest Money:</span>
                            <span>${parseFloat(terms.earnest_money || '0').toLocaleString()}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Financing:</span>
                            <span>{CREATIVE_TERMS[terms.financing_type as keyof typeof CREATIVE_TERMS]?.name}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <Button variant="outline" onClick={() => setShowPreview(false)}>
                          Back to Edit
                        </Button>
                        <Button 
                          onClick={() => generateMutation.mutate()}
                          disabled={generateMutation.isPending}
                        >
                          <Send className="w-4 h-4 mr-2" />
                          Send Offer
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Recent Offers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {offers?.map((offer: any) => (
                  <div key={offer.id} className="p-3 border rounded">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm truncate max-w-[120px]">
                        {offer.properties?.address || 'Unknown'}
                      </span>
                      <Badge
                        variant={
                          offer.status === 'accepted' ? 'default' :
                          offer.status === 'pending_response' ? 'secondary' :
                          offer.status === 'declined' ? 'destructive' :
                          'outline'
                        }
                      >
                        {offer.status}
                      </Badge>
                    </div>
                    <p className="text-sm">${offer.offer_price?.toLocaleString()}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                      {offer.file_url && (
                        <a href={offer.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                ))}
                {(!offers || offers.length === 0) && (
                  <p className="text-center text-muted-foreground py-8">
                    No offers generated yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
