// Dispo Agent Page
// Property disposition & buyer matching

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Target, Users, FileSignature, Handshake, ArrowLeft,
  DollarSign, Search, CheckCircle, Clock, Building,
  Mail, Megaphone, Eye, Download, Instagram, Facebook
} from 'lucide-react'

// Mock marketing templates
const MARKETING_TEMPLATES = [
  {
    id: 'instagram',
    name: 'Instagram Post',
    icon: Instagram,
    description: 'Visual property post for Instagram',
    platform: 'instagram'
  },
  {
    id: 'facebook',
    name: 'Facebook Post',
    icon: Facebook,
    description: 'Property listing for Facebook',
    platform: 'facebook'
  },
  {
    id: 'email-blast',
    name: 'Email Blast',
    icon: Mail,
    description: 'Email campaign to buyer list',
    platform: 'email'
  },
  {
    id: 'direct-mail',
    name: 'Direct Mail',
    icon: Megaphone,
    description: 'Postcard or flyer design',
    platform: 'mail'
  }
]

export default function DispoAgentPage() {
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [buyerSearch, setBuyerSearch] = useState('')
  const [activeTab, setActiveTab] = useState('ready')
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  // Get properties ready for disposition - with analysis and communications
  const { data: dispoProperties } = useQuery({
    queryKey: ['properties_disposition'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()

      // Get property_analysis for this user
      const { data: analysisData } = await supabase
        .from('property_analysis')
        .select('*')
        .eq('account_id', user?.id)

      const analysisMap: Record<string, any> = {}
      analysisData?.forEach((a: any) => {
        analysisMap[a.property_id] = a
      })

      // Get properties with analysis and communications
      const { data } = await supabase
        .from('properties')
        .select(`
          *,
          communications (
            id,
            direction,
            status,
            subject,
            sent_at,
            replied_at
          )
        `)
        .eq('account_id', user?.id)
        .in('pipeline_status', ['scouted', 'market_research', 'researched', 'underwriting', 'underwritten', 'offer_generation', 'offer_sent', 'accepted', 'disposition'])
        .order('created_at', { ascending: false })

      // Merge analysis data into properties
      return (data || []).map((p: any) => ({
        ...p,
        win_win_score: analysisMap[p.id]?.win_win_score,
        strategy: analysisMap[p.id]?.strategy,
        recommendation: analysisMap[p.id]?.recommendation,
        level1_offer_price: analysisMap[p.id]?.level1_offer_price,
        level1_entry_fee: analysisMap[p.id]?.level1_entry_fee,
        level1_monthly_payment: analysisMap[p.id]?.level1_monthly_payment,
        level2_offer_price: analysisMap[p.id]?.level2_offer_price,
        level2_entry_fee: analysisMap[p.id]?.level2_entry_fee,
        level3_offer_price: analysisMap[p.id]?.level3_offer_price,
        level3_entry_fee: analysisMap[p.id]?.level3_entry_fee,
        level3_monthly_payment: analysisMap[p.id]?.level3_monthly_payment,
        level3_assume_mortgage: analysisMap[p.id]?.level3_assume_mortgage,
        level3_seller_carry_amount: analysisMap[p.id]?.level3_seller_carry_amount,
        communications_count: p.communications?.length || 0,
        has_replies: p.communications?.some((c: any) => c.direction === 'inbound'),
      }))
    }
  })

  // Get recent assignments
  const { data: assignments } = useQuery({
    queryKey: ['assignments'],
    queryFn: async () => {
      const { data } = await supabase
        .from('assignments')
        .select('*, properties(*), buyers(*)')
        .order('created_at', { ascending: false })
        .limit(20)
      return data || []
    }
  })

  // Create assignment mutation
  const assignMutation = useMutation({
    mutationFn: async ({ propertyId, buyerId }: { propertyId: string; buyerId: string }) => {
      const { error } = await supabase
        .from('assignments')
        .insert({
          property_id: propertyId,
          buyer_id: buyerId,
          status: 'assigned',
          assigned_at: new Date().toISOString()
        })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['properties_disposition'] })
      queryClient.invalidateQueries({ queryKey: ['assignments'] })
      setSelectedProperty(null)
    }
  })

  // Mock buyers for demo
  const mockBuyers = [
    { id: '1', name: 'John Smith', email: 'john@email.com', budget: 400000, criteria: 'Single Family', status: 'active' },
    { id: '2', name: 'Sarah Johnson', email: 'sarah@email.com', budget: 350000, criteria: '2-3 BDRM', status: 'active' },
    { id: '3', name: 'Mike Wilson', email: 'mike@email.com', budget: 500000, criteria: 'Investment', status: 'active' },
    { id: '4', name: 'Emily Davis', email: 'emily@email.com', budget: 300000, criteria: 'Any', status: 'active' },
  ]

  const stats = {
    ready: dispoProperties?.length || 0,
    assigned: assignments?.filter((a: any) => a.status === 'assigned').length || 0,
    pending: assignments?.filter((a: any) => a.status === 'pending_approval').length || 0,
    closed: assignments?.filter((a: any) => a.status === 'closed').length || 0
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
            <Target className="w-8 h-8 text-cyan-500" />
            Dispo Agent
          </h1>
          <p className="text-muted-foreground">
            Match properties with end buyers and coordinate assignments
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-cyan-500/10 rounded-lg">
                  <Target className="w-6 h-6 text-cyan-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.ready}</p>
                  <p className="text-sm text-muted-foreground">Ready for Dispo</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.assigned}</p>
                  <p className="text-sm text-muted-foreground">Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-sm text-muted-foreground">Pending Approval</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Handshake className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.closed}</p>
                  <p className="text-sm text-muted-foreground">Closed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="ready">Ready ({stats.ready})</TabsTrigger>
            <TabsTrigger value="buyers">Buyers ({mockBuyers.length})</TabsTrigger>
            <TabsTrigger value="marketing">Marketing</TabsTrigger>
            <TabsTrigger value="assignments">Assignments ({assignments?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="ready" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="w-5 h-5" />
                    Properties Ready for Disposition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {dispoProperties?.map((property: any) => (
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
                          <span className="font-medium">
                            ${property.offer_price?.toLocaleString() || property.price?.toLocaleString()}
                          </span>
                          <span className="text-muted-foreground">
                            ARV: ${property.arv?.toLocaleString() || 'TBD'}
                          </span>
                        </div>
                        {property.assignment_fee && (
                          <div className="mt-2 text-sm text-green-500">
                            💰 Assignment Fee: ${property.assignment_fee.toLocaleString()}
                          </div>
                        )}
                      </div>
                    ))}
                    {(!dispoProperties || dispoProperties.length === 0) && (
                      <div className="text-center py-12 text-muted-foreground">
                        <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No properties ready for disposition</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Buyer Matching */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Match with Buyers
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedProperty ? (
                    <div className="space-y-4">
                      <div className="p-4 bg-primary/10 border border-primary rounded-lg">
                        <p className="text-sm text-muted-foreground mb-1">Selected Property</p>
                        <p className="font-medium">{selectedProperty.address}</p>
                        <p className="text-lg font-bold mt-1">
                          ${selectedProperty.offer_price?.toLocaleString()}
                        </p>
                      </div>

                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                          placeholder="Search buyers..."
                          value={buyerSearch}
                          onChange={(e) => setBuyerSearch(e.target.value)}
                          className="pl-9"
                        />
                      </div>

                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {mockBuyers
                          .filter(b => 
                            b.name.toLowerCase().includes(buyerSearch.toLowerCase()) ||
                            b.criteria.toLowerCase().includes(buyerSearch.toLowerCase())
                          )
                          .map((buyer) => (
                            <div
                              key={buyer.id}
                              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                                    <span className="font-medium text-blue-500">
                                      {buyer.name.split(' ').map(n => n[0]).join('')}
                                    </span>
                                  </div>
                                  <div>
                                    <p className="font-medium">{buyer.name}</p>
                                    <p className="text-sm text-muted-foreground">{buyer.email}</p>
                                  </div>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              </div>
                              <div className="flex items-center gap-4 text-sm">
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-4 h-4" />
                                  Budget: ${buyer.budget.toLocaleString()}
                                </span>
                                <span className="flex items-center gap-1">
                                  <Target className="w-4 h-4" />
                                  {buyer.criteria}
                                </span>
                              </div>
                              <Button
                                size="sm"
                                className="w-full mt-3"
                                onClick={() => assignMutation.mutate({
                                  propertyId: selectedProperty.id,
                                  buyerId: buyer.id
                                })}
                                disabled={assignMutation.isPending}
                              >
                                <Handshake className="w-4 h-4 mr-2" />
                                {assignMutation.isPending ? 'Assigning...' : 'Assign to Buyer'}
                              </Button>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Select a property to match with buyers</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="buyers" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Buyer Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockBuyers.map((buyer) => (
                    <div key={buyer.id} className="p-4 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
                            <span className="font-medium text-blue-500 text-lg">
                              {buyer.name.split(' ').map(n => n[0]).join('')}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-medium">{buyer.name}</h3>
                            <p className="text-sm text-muted-foreground">{buyer.email}</p>
                            <div className="flex items-center gap-4 mt-1 text-sm">
                              <span className="flex items-center gap-1">
                                <DollarSign className="w-3 h-3" />
                                ${buyer.budget.toLocaleString()} budget
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                {buyer.criteria}
                              </span>
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{buyer.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Marketing Tab */}
          <TabsContent value="marketing" className="mt-4">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Marketing Templates */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Megaphone className="w-5 h-5" />
                    Marketing Templates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {MARKETING_TEMPLATES.map((template) => {
                      const Icon = template.icon
                      return (
                        <div
                          key={template.id}
                          className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-all hover:scale-[1.02]"
                        >
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-cyan-500/10">
                              <Icon className="w-5 h-5 text-cyan-500" />
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-sm">{template.name}</p>
                              <p className="text-xs text-muted-foreground">{template.description}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Property Selection & Preview */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building className="w-5 h-5" />
                      Select Property to Market
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedProperty ? (
                      <div className="p-4 bg-primary/10 border border-primary rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{selectedProperty.address}</p>
                            <p className="text-sm text-muted-foreground">
                              {selectedProperty.city}, {selectedProperty.state}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-lg">
                              ${selectedProperty.offer_price?.toLocaleString() || selectedProperty.price?.toLocaleString()}
                            </p>
                            <Badge variant="outline">
                              {selectedProperty.strategy_recommended?.replace(/_/g, ' ') || 'Standard'}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-center text-muted-foreground py-8">
                        Select a property from the "Ready" tab to create marketing materials
                      </p>
                    )}
                  </CardContent>
                </Card>

                {selectedProperty && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Social Media Preview
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Instagram Preview */}
                      <div className="border rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                            G
                          </div>
                          <div>
                            <p className="font-medium text-sm">GTA Real Estate</p>
                            <p className="text-xs text-muted-foreground">Sponsored</p>
                          </div>
                        </div>
                        <div className="bg-muted rounded-lg h-48 mb-3 flex items-center justify-center">
                          <Building className="w-16 h-16 text-muted-foreground" />
                        </div>
                        <div className="flex gap-4 mb-2">
                          <span>❤️</span><span>💬</span><span>🚀</span>
                        </div>
                        <p className="text-sm">
                          <span className="font-medium">gta_realestate</span> Just closed on this beauty! 🎉
                          {selectedProperty.address} - ${selectedProperty.offer_price?.toLocaleString() || selectedProperty.price?.toLocaleString()}
                          #RealEstate #Investment #GTA6
                        </p>
                      </div>

                      <div className="flex items-center justify-end gap-3">
                        <Button variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          Preview All Platforms
                        </Button>
                        <Button>
                          <Download className="w-4 h-4 mr-2" />
                          Download Assets
                        </Button>
                        <Button variant="default">
                          <Instagram className="w-4 h-4 mr-2" />
                          Post to Instagram
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="assignments" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSignature className="w-5 h-5" />
                  Recent Assignments
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {assignments?.map((assignment: any) => (
                    <div key={assignment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-medium">
                            {assignment.properties?.address || 'Unknown Property'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            → {assignment.buyers?.name || 'Unknown Buyer'}
                          </p>
                        </div>
                        <Badge
                          variant={
                            assignment.status === 'closed' ? 'default' :
                            assignment.status === 'assigned' ? 'secondary' :
                            'outline'
                          }
                        >
                          {assignment.status}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <span>
                          {assignment.assigned_at 
                            ? new Date(assignment.assigned_at).toLocaleDateString()
                            : 'Pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!assignments || assignments.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <FileSignature className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No assignments yet</p>
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
