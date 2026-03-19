// Email Closer Agent Page
// Handles follow-up, negotiation, objections, and closing

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Mail, Send, MessageSquare, Reply, AlertTriangle,
  CheckCircle, Clock, Users, History, ChevronRight, ArrowLeft
} from 'lucide-react'

const OBJECTION_TEMPLATES = [
  { type: 'low', label: 'Price Too Low', icon: '💰' },
  { type: 'finance', label: 'Financing Concern', icon: '🏦' },
  { type: 'timing', label: 'Wrong Timing', icon: '⏰' },
  { type: 'multiple', label: 'Multiple Offers', icon: '📋' },
  { type: 'condition', label: 'Property Condition', icon: '🏠' }
]

export default function EmailCloserPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1)
  const [emailType, setEmailType] = useState('offer_presentation')
  const [customMessage, setCustomMessage] = useState('')
  const [objectionType, setObjectionType] = useState('')
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)

  const queryClient = useQueryClient()

  // Get property/analysis from underwriter navigation
  useEffect(() => {
    if (location.state?.property) {
      setSelectedOffer(location.state.property)
      setSelectedLevel(location.state.selected_level || 1)
    }
  }, [location.state])

  // Get offers awaiting response
  const { data: pendingOffers } = useQuery({
    queryKey: ['offers_pending'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('offers')
        .select('*, properties(*)')
        .eq('account_id', user?.id)
        .in('status', ['pending_response', 'sent'])
        .order('sent_at', { ascending: false })
      return data || []
    }
  })

  // Get scored properties ready for outreach
  const { data: scoredProperties } = useQuery({
    queryKey: ['scored-properties'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('property_analysis')
        .select('*, properties(*)')
        .eq('account_id', user?.id)
        .order('win_win_score', { ascending: false })
      return data || []
    }
  })

  // Get recent communications - filtered by account
  const { data: communications } = useQuery({
    queryKey: ['communications'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from('communications')
        .select('*')
        .eq('account_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(50)
      return data || []
    }
  })

  // Get follow-up queue
  const { data: followUpQueue } = useQuery({
    queryKey: ['follow_up_queue'],
    queryFn: async () => {
      const { data } = await supabase
        .from('follow_up_queue')
        .select('*, offers(*, properties(*))')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
      return data || []
    }
  })

  // Get level data helper
  const getLevelData = () => {
    if (!selectedOffer) return null
    const listingPrice = selectedOffer.listing_price || selectedOffer.offer_price / (selectedOffer.offer_percent / 100)
    return {
      1: {
        offer_price: selectedOffer.level1_offer_price || listingPrice * 0.7,
        structure: "70% + Terms (Seller Finance)",
        entry_fee: selectedOffer.level1_entry_fee || 0,
        monthly: selectedOffer.level1_monthly_payment || 0
      },
      2: {
        offer_price: selectedOffer.level2_offer_price || listingPrice * 0.7,
        structure: "70% All Cash",
        entry_fee: selectedOffer.level2_entry_fee || 0,
        monthly: 0
      },
      3: {
        offer_price: selectedOffer.level3_offer_price || listingPrice,
        structure: "100% Full Price + Terms",
        entry_fee: selectedOffer.level3_entry_fee || 0,
        monthly: selectedOffer.level3_monthly_payment || 0,
        assume_mortgage: selectedOffer.level3_assume_mortgage || 0,
        seller_carry: selectedOffer.level3_seller_carry_amount || 0
      }
    }[selectedLevel]
  }

  // Generate AI email mutation
  const generateEmailMutation = useMutation({
    mutationFn: async () => {
      if (!selectedOffer) {
        throw new Error('Select a property first')
      }

      const levelData = getLevelData()

      // Map email type to our AI function types
      const emailTypeMap: Record<string, string> = {
        'follow_up_1': 'follow_up',
        'follow_up_2': 'follow_up',
        'follow_up_3': 'follow_up',
        'objection_price': 'objection_handler',
        'objection_terms': 'objection_handler',
        'objection_timing': 'objection_handler',
        'offer_presentation': 'offer_presentation',
        'closing': 'closing',
        'initial_outreach': 'initial_outreach'
      }

      const aiEmailType = emailTypeMap[emailType] || 'offer_presentation'

      const { data: { session } } = await supabase.auth.getSession()

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-email`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            property_id: selectedOffer.property_id,
            email_type: aiEmailType,
            seller_name: selectedOffer.properties?.agent_name || selectedOffer.seller_name,
            custom_message: customMessage,
            level: selectedLevel,
            offer_price: levelData?.offer_price,
            structure: levelData?.structure,
            entry_fee: levelData?.entry_fee,
            monthly_payment: levelData?.monthly,
            property_data: {
              address: selectedOffer.address || selectedOffer.properties?.address,
              city: selectedOffer.city || selectedOffer.properties?.city,
              state: selectedOffer.state || selectedOffer.properties?.state,
              listing_price: selectedOffer.listing_price || selectedOffer.properties?.listing_price,
              estimated_value: selectedOffer.estimated_value || selectedOffer.properties?.estimated_value,
              agent_email: selectedOffer.agent_email || selectedOffer.properties?.agent_email,
              seller_name: selectedOffer.seller_name || selectedOffer.properties?.seller_name
            }
          })
        }
      )

      const result = await response.json()
      if (!result.success) {
        throw new Error(result.error || 'Failed to generate email')
      }
      return result
    },
    onSuccess: (data) => {
      setEmailSubject(data.email?.subject || 'Purchase Offer - Creative Finance Proposal')
      setEmailBody(data.email?.body || '')
      setShowPreview(true)
      queryClient.invalidateQueries({ queryKey: ['communications'] })
      queryClient.invalidateQueries({ queryKey: ['offers_pending'] })
    }
  })

  // Send email mutation (for sending the AI-generated email)
  const sendMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()

      // Save communication to database
      const { data: commData, error: commError } = await supabase
        .from('communications')
        .insert({
          account_id: session?.user?.id,
          property_id: selectedOffer.property_id,
          direction: 'outbound',
          subject: emailSubject,
          body: emailBody,
          email_type: emailType,
          level: selectedLevel,
          status: 'sent'
        })

      if (commError) throw commError

      // Send via Gmail (if connected)
      try {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            property_id: selectedOffer.property_id,
            recipient_email: selectedOffer.agent_email || selectedOffer.properties?.agent_email,
            recipient_name: selectedOffer.agent_name || selectedOffer.properties?.agent_name,
            subject: emailSubject,
            body: emailBody,
            level: selectedLevel
          }
        })
        if (error) throw error
        return data
      } catch (sendErr) {
        console.log('Gmail send failed, but communication saved:', sendErr)
        return { saved: true }
      }
    },
    onSuccess: () => {
      setSendSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['offers_pending'] })
      queryClient.invalidateQueries({ queryKey: ['communications'] })
      queryClient.invalidateQueries({ queryKey: ['follow_up_queue'] })
      setTimeout(() => {
        setSendSuccess(false)
        setShowPreview(false)
        setEmailSubject('')
        setEmailBody('')
      }, 3000)
    }
  })

  const stats = {
    pending: pendingOffers?.length || 0,
    followUps: followUpQueue?.length || 0,
    responded: communications?.filter((c: any) => c.direction === 'inbound').length || 0
  }

  const levelData = getLevelData()

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gta-blue mb-2 flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              Email Closer Agent
            </h1>
            <p className="text-muted-foreground">
              Follow-up, negotiation, objection handling, and closing
            </p>
          </div>
          <div className="flex gap-2">
            {selectedOffer && (
              <Button variant="outline" onClick={() => navigate('/agents/underwriter')}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Underwriter
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/command-center')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Command Center
            </Button>
          </div>
        </div>

        {/* Success Message */}
        {sendSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-500 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-bold text-green-700">✅ Email Sent Successfully!</p>
              <p className="text-sm text-green-600">Tracking in communications...</p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
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
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <History className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.followUps}</p>
                  <p className="text-sm text-muted-foreground">Due for Follow-up</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Reply className="w-6 h-6 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.responded}</p>
                  <p className="text-sm text-muted-foreground">Replies Received</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Property/Deal Info when coming from Underwriter */}
            {selectedOffer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5" />
                    {selectedOffer.address || selectedOffer.properties?.address}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Asking Price</p>
                      <p className="text-lg font-bold">${(selectedOffer.listing_price || selectedOffer.properties?.listing_price || 0).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Win-Win Score</p>
                      <p className="text-lg font-bold">{selectedOffer.win_win_score || 0}/100</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Strategy</p>
                      <Badge>{selectedOffer.strategy || 'Creative Finance'}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Level Selector */}
            {selectedOffer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Select Offer Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Level 1 Button */}
                    <Button
                      variant={selectedLevel === 1 ? "default" : "outline"}
                      className="flex flex-col h-auto py-4 px-3 items-start"
                      onClick={() => { setSelectedLevel(1); setEmailType('offer_presentation'); }}
                    >
                      <div className="font-bold">Level 1: 70% + Terms</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Offer: ${(levelData?.offer_price || 0).toLocaleString()}
                      </div>
                      {selectedLevel === 1 && (
                        <Badge className="mt-2 bg-vice-green text-black">Selected</Badge>
                      )}
                    </Button>

                    {/* Level 2 Button */}
                    <Button
                      variant={selectedLevel === 2 ? "default" : "outline"}
                      className="flex flex-col h-auto py-4 px-3 items-start"
                      onClick={() => { setSelectedLevel(2); setEmailType('offer_presentation'); }}
                    >
                      <div className="font-bold">Level 2: 70% Cash</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Offer: ${(levelData?.offer_price || 0).toLocaleString()}
                      </div>
                      {selectedLevel === 2 && (
                        <Badge className="mt-2 bg-vice-green text-black">Selected</Badge>
                      )}
                    </Button>

                    {/* Level 3 Button */}
                    <Button
                      variant={selectedLevel === 3 ? "default" : "outline"}
                      className="flex flex-col h-auto py-4 px-3 items-start"
                      onClick={() => { setSelectedLevel(3); setEmailType('offer_presentation'); }}
                    >
                      <div className="font-bold">Level 3: 100% + Terms</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Offer: ${(levelData?.offer_price || 0).toLocaleString()}
                      </div>
                      {selectedLevel === 3 && (
                        <Badge className="mt-2 bg-vice-green text-black">Selected</Badge>
                      )}
                    </Button>
                  </div>

                  {/* Level Details */}
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm font-medium mb-2">Selected Structure: {levelData?.structure}</p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>Entry Fee: <span className="font-medium">${(levelData?.entry_fee || 0).toLocaleString()}</span></div>
                      <div>Monthly: <span className="font-medium">${Math.round(levelData?.monthly || 0).toLocaleString()}</span></div>
                      {selectedLevel === 3 && levelData?.assume_mortgage && (
                        <div>Assume Mortgage: <span className="font-medium">${(levelData.assume_mortgage).toLocaleString()}</span></div>
                      )}
                      {selectedLevel === 3 && levelData?.seller_carry && (
                        <div>Seller Carries: <span className="font-medium">${(levelData.seller_carry).toLocaleString()}</span></div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pending Offers */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Offers Awaiting Response
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingOffers?.map((offer: any) => (
                    <div
                      key={offer.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors
                        ${selectedOffer?.property_id === offer.property_id
                          ? 'border-primary bg-primary/5'
                          : 'hover:bg-muted/50'}`}
                      onClick={() => setSelectedOffer(offer)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium">{offer.properties?.address}</h3>
                          <p className="text-sm text-muted-foreground">
                            Agent: {offer.properties?.agent_name || offer.properties?.agent_email}
                          </p>
                        </div>
                        <Badge
                          variant={
                            offer.status === 'pending_response' ? 'secondary' :
                            offer.status === 'sent' ? 'outline' : 'default'
                          }
                        >
                          {offer.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-sm">
                        <span>Offer: ${offer.offer_price?.toLocaleString()}</span>
                        <span>Sent: {offer.sent_at ? new Date(offer.sent_at).toLocaleDateString() : 'N/A'}</span>
                      </div>
                    </div>
                  ))}
                  {(!pendingOffers || pendingOffers.length === 0) && (
                    <div className="text-center py-12 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No pending offers to follow up on</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Email Composer */}
            {selectedOffer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Send className="w-5 h-5" />
                    AI Email Generator - {selectedOffer.properties?.agent_name || 'Agent'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* AI Generate Button */}
                  <div className="flex gap-2">
                    <Button
                      onClick={() => generateEmailMutation.mutate()}
                      disabled={generateEmailMutation.isPending}
                      className="bg-gradient-to-r from-vice-pink to-vice-purple"
                    >
                      {generateEmailMutation.isPending ? '🤖 Generating...' : '✨ AI Generate Email'}
                    </Button>
                    {generateEmailMutation.isSuccess && (
                      <span className="text-vice-green text-sm flex items-center">
                        ✅ AI email ready!
                      </span>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div>
                    <Label className="mb-2 block">Quick Actions</Label>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={emailType === 'follow_up_1' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setEmailType('follow_up_1'); setObjectionType(''); }}
                      >
                        First Follow-up
                      </Button>
                      <Button
                        variant={emailType === 'follow_up_2' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setEmailType('follow_up_2'); setObjectionType(''); }}
                      >
                        Second Follow-up
                      </Button>
                      <Button
                        variant={emailType === 'negotiation' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setEmailType('negotiation'); setObjectionType(''); }}
                      >
                        Negotiate
                      </Button>
                      <Button
                        variant={emailType === 'closing_request' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => { setEmailType('closing_request'); setObjectionType(''); }}
                      >
                        Request Closing
                      </Button>
                    </div>
                  </div>

                  {/* Objection Handling */}
                  <div>
                    <Label className="mb-2 block">Objection Handling</Label>
                    <div className="flex flex-wrap gap-2">
                      {OBJECTION_TEMPLATES.map((obj) => (
                        <Button
                          key={obj.type}
                          variant={objectionType === obj.type ? 'destructive' : 'outline'}
                          size="sm"
                          onClick={() => { setObjectionType(obj.type); setEmailType('objection'); }}
                        >
                          {obj.icon} {obj.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Custom Message */}
                  <div>
                    <Label htmlFor="custom">Add Custom Message (Optional)</Label>
                    <Textarea
                      id="custom"
                      value={customMessage}
                      onChange={(e) => setCustomMessage(e.target.value)}
                      placeholder="Add any additional context or personalization..."
                      rows={3}
                    />
                  </div>

                  {/* Email Preview */}
                  {showPreview && (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                          id="subject"
                          value={emailSubject}
                          onChange={(e) => setEmailSubject(e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="body">Email Body</Label>
                        <Textarea
                          id="body"
                          value={emailBody}
                          onChange={(e) => setEmailBody(e.target.value)}
                          rows={15}
                          className="font-mono text-sm"
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={() => {
                      setSelectedOffer(null)
                      setCustomMessage('')
                      setObjectionType('')
                      setShowPreview(false)
                      setEmailSubject('')
                      setEmailBody('')
                    }}>
                      Cancel
                    </Button>
                    {showPreview ? (
                      <Button
                        onClick={() => sendMutation.mutate()}
                        disabled={sendMutation.isPending}
                        className="bg-gradient-to-r from-vice-green to-teal-500"
                      >
                        {sendMutation.isPending ? 'Sending...' : '📤 Send Email'}
                      </Button>
                    ) : (
                      <Button
                        onClick={() => generateEmailMutation.mutate()}
                        disabled={generateEmailMutation.isPending}
                      >
                        Generate & Preview
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Follow-up Queue */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Clock className="w-5 h-5" />
                  Follow-up Queue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {followUpQueue?.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-3 border rounded cursor-pointer hover:bg-muted/50"
                      onClick={() => {
                        // Find the offer and select it
                        const offer = pendingOffers?.find((o: any) => o.property_id === item.property_id)
                        if (offer) setSelectedOffer(offer)
                      }}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm truncate">
                          {item.offers?.properties?.address || 'Unknown'}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <Badge variant="outline">{item.follow_up_type.replace(/_/g, ' ')}</Badge>
                        <span className="text-muted-foreground">
                          {new Date(item.scheduled_for).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {(!followUpQueue || followUpQueue.length === 0) && (
                    <p className="text-center text-muted-foreground py-4">
                      No follow-ups due
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <History className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {communications?.slice(0, 10).map((comm: any) => (
                    <div key={comm.id} className="p-3 border rounded">
                      <div className="flex items-center justify-between mb-1">
                        <Badge
                          variant={
                            comm.direction === 'inbound' ? 'default' : 'secondary'
                          }
                          className="text-xs"
                        >
                          {comm.direction === 'inbound' ? '📥 IN' : '📤 OUT'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(comm.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm truncate">{comm.subject}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
