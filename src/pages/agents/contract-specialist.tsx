// Contract Specialist Agent Page
// Offer creation + Legal document generation

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  FileSignature, PenTool, DollarSign, Send, Eye,
  FileText, CheckCircle, Clock, ArrowLeft, Download,
  FileCheck, Shield, Gavel, ScrollText
} from 'lucide-react'

const CREATIVE_TERMS = {
  all_cash: { name: 'All Cash', description: 'No financing contingency, quick closing' },
  seller_financing: { name: 'Seller Financing', description: 'Seller acts as lender for portion of price' },
  lease_option: { name: 'Lease Option', description: 'Lease with option to purchase later' },
  subject_to: { name: 'Subject To', description: 'Take over existing mortgage' },
  assignment: { name: 'Assignment', description: 'Assign contract to end buyer for fee' },
  joint_venture: { name: 'Joint Venture', description: 'Partner with seller for profits' }
}

// Legal document templates
const LEGAL_TEMPLATES = [
  {
    id: 'purchase-agreement',
    name: 'Purchase Agreement',
    icon: ScrollText,
    description: 'Standard real estate purchase contract',
    type: 'contract'
  },
  {
    id: 'lease-option',
    name: 'Lease Option Agreement',
    icon: FileText,
    description: 'Contract for lease with purchase option',
    type: 'contract'
  },
  {
    id: 'subject-to',
    name: 'Subject To Agreement',
    icon: FileCheck,
    description: 'Transfer of property subject to existing mortgage',
    type: 'contract'
  },
  {
    id: 'assignment-contract',
    name: 'Assignment Contract',
    icon: Gavel,
    description: 'Assignment rights to end buyer',
    type: 'contract'
  },
  {
    id: 'earnest-money',
    name: 'Earnest Money Receipt',
    icon: Shield,
    description: 'Receipt and acknowledgment of earnest money',
    type: 'document'
  },
  {
    id: 'disclosure',
    name: 'Property Disclosure',
    icon: FileSignature,
    description: 'Seller property disclosure form',
    type: 'disclosure'
  }
]

export default function ContractSpecialistPage() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [activeTab, setActiveTab] = useState('offers')
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)
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
    cash_to_seller: '',
    inspection_days: '10'
  })
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Get properties ready for offers
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

  // Get all offers
  const { data: offers } = useQuery({
    queryKey: ['offers'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('offers')
        .select('*, properties(*)')
        .eq('account_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)
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

  const handlePriceChange = (value: string) => {
    handleTermChange('offer_price', value)
    if (value && !terms.earnest_money) {
      handleTermChange('earnest_money', (parseFloat(value) * 0.01).toString())
    }
  }

  // Stats
  const stats = {
    pending: offers?.filter((o: any) => ['pending_response', 'sent'].includes(o.status)).length || 0,
    accepted: offers?.filter((o: any) => o.status === 'accepted').length || 0,
    total: offers?.length || 0
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            className="mb-4 pl-0"
            onClick={() => navigate('/agent/pipeline-scout')}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Pipeline Scout
          </Button>
          <h1 className="text-3xl font-bold text-gta-blue mb-2 flex items-center gap-3">
            <FileSignature className="w-8 h-8 text-emerald-500" />
            Contract Specialist Agent
          </h1>
          <p className="text-muted-foreground">
            Create offers and generate bulletproof agreements
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Response</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.accepted}</p>
                  <p className="text-sm text-muted-foreground">Accepted</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-sm text-muted-foreground">Total Offers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-emerald-500/10 rounded-lg">
                  <DollarSign className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    ${offers?.reduce((sum: number, o: any) => sum + (o.offer_price || 0), 0).toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="offers">Create Offers</TabsTrigger>
            <TabsTrigger value="documents">Legal Documents</TabsTrigger>
            <TabsTrigger value="all">All Offers</TabsTrigger>
          </TabsList>

          <TabsContent value="offers" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Property Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Properties Ready for Offers
                    <Badge variant="secondary" className="ml-auto">
                      {properties?.length || 0}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {properties?.map((property: any) => (
                      <div
                        key={property.id}
                        className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:border-primary/50
                          ${selectedProperty?.id === property.id 
                            ? 'border-primary bg-primary/5 shadow-md' 
                            : 'hover:bg-muted/50'}`}
                        onClick={() => {
                          console.log('Property clicked:', property.address)
                          setSelectedProperty(property)
                        }}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium flex items-center gap-2">
                              <span className="text-primary">📍</span>
                              {property.address || property.listing_address || 'Unknown Address'}
                            </h3>
                            <p className="text-sm text-muted-foreground ml-6">
                              {property.city || property.listing_city || ''}, {property.state || property.listing_state || ''} {property.zip || property.listing_zip || ''}
                            </p>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {(property.recommended_strategy || property.strategy_recommended || 'standard').replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm ml-6">
                          <span className="font-semibold text-green-600">List: ${(property.listing_price || property.price || 0).toLocaleString()}</span>
                          <span className="text-muted-foreground">|</span>
                          <span>ARV: ${(property.estimated_value || property.arv || 0).toLocaleString()}</span>
                          <span className="text-muted-foreground">|</span>
                          <span>Sqft: {(property.sqft || property.lot_sqft || 0).toLocaleString()}</span>
                        </div>
                        {property.owner_occupied !== undefined && (
                          <div className="mt-2 ml-6">
                            <Badge variant={property.owner_occupied ? "default" : "secondary"} className="text-xs">
                              {property.owner_occupied ? '🏠 Owner Occupied' : '🏁 Vacant'}
                            </Badge>
                          </div>
                        )}
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

              {/* Offer Builder */}
              <div className="lg:col-span-2">
                {selectedProperty ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <PenTool className="w-5 h-5" />
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
                              <div className="flex justify-between">
                                <span>Closing:</span>
                                <span>In {terms.closing_days} days</span>
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
                              {generateMutation.isPending ? 'Sending...' : 'Send Offer'}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a property to generate an offer</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Legal Documents Tab */}
          <TabsContent value="documents" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Document Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileSignature className="w-5 h-5" />
                    Legal Document Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {LEGAL_TEMPLATES.map((template) => {
                      const Icon = template.icon
                      return (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`p-4 border rounded-lg cursor-pointer transition-all hover:scale-[1.02]
                            ${selectedTemplate === template.id 
                              ? 'border-primary bg-primary/5' 
                              : 'hover:bg-muted/50'}`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10">
                              <Icon className="w-5 h-5 text-emerald-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {template.type}
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Document Preview/Generator */}
              <div className="lg:col-span-2">
                {selectedTemplate ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileCheck className="w-5 h-5" />
                        Generate {LEGAL_TEMPLATES.find(t => t.id === selectedTemplate)?.name}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <p className="text-sm">
                          💡 This document will be customized with property details and terms from the offer.
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Property Address</Label>
                          <Input 
                            placeholder="123 Main St" 
                            value={selectedProperty?.address || ''}
                            onChange={() => {}}
                          />
                        </div>
                        <div>
                          <Label>Purchase Price</Label>
                          <Input 
                            type="number"
                            placeholder="350000"
                            value={terms.offer_price}
                            onChange={(e) => handleTermChange('offer_price', e.target.value)}
                          />
                        </div>
                        <div>
                          <Label>Buyer Name</Label>
                          <Input placeholder="John Buyer" />
                        </div>
                        <div>
                          <Label>Seller Name</Label>
                          <Input placeholder="Jane Seller" />
                        </div>
                        <div>
                          <Label>Closing Date</Label>
                          <Input 
                            type="date"
                            value={new Date(Date.now() + parseInt(terms.closing_days) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                          />
                        </div>
                        <div>
                          <Label>Earnest Money Amount</Label>
                          <Input 
                            type="number"
                            placeholder="3500"
                            value={terms.earnest_money}
                            onChange={(e) => handleTermChange('earnest_money', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Template Preview */}
                      <div className="p-4 bg-muted rounded-lg">
                        <h4 className="font-medium mb-2">Document Preview</h4>
                        <div className="text-sm space-y-2">
                          <p><strong>{LEGAL_TEMPLATES.find(t => t.id === selectedTemplate)?.name}</strong></p>
                          <p>This Agreement is made on <span className="font-medium">{new Date().toLocaleDateString()}</span></p>
                          <p>Between: <span className="font-medium">[Buyer Name]</span> and <span className="font-medium">[Seller Name]</span></p>
                          <p>Property: <span className="font-medium">{selectedProperty?.address || '[Address]'}</span></p>
                          <p>Purchase Price: <span className="font-medium">${parseFloat(terms.offer_price || '0').toLocaleString() || '[Price]'}</span></p>
                          <p>Earnest Money: <span className="font-medium">${parseFloat(terms.earnest_money || '0').toLocaleString() || '[Amount]'}</span></p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <Button variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview Full Document
                        </Button>
                        <Button>
                          <Download className="w-4 h-4 mr-2" />
                          Generate & Download PDF
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="py-12 text-center text-muted-foreground">
                      <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a document template to generate</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="all" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  All Offers
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {offers?.map((offer: any) => (
                    <div key={offer.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">{offer.properties?.address || 'Unknown'}</h3>
                          <p className="text-sm text-muted-foreground">
                            {offer.properties?.city}, {offer.properties?.state}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${offer.offer_price?.toLocaleString()}</p>
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
                      </div>
                      <div className="flex items-center justify-between mt-3 text-sm text-muted-foreground">
                        <span>{new Date(offer.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {(!offers || offers.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No offers generated yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
