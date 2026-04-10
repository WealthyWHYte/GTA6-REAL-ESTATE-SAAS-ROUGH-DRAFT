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
import { AlertTriangle, ArrowLeft, Calculator, CheckCircle, ChevronDown, ChevronRight, Clock, History, Home, Mail, MessageSquare, Phone, Reply, Send, Target, Users, User, Building, DollarSign, TrendingUp, Percent } from 'lucide-react'

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
  const [expandedLevel, setExpandedLevel] = useState<number | null>(1)
  const [showFullPropertyDetails, setShowFullPropertyDetails] = useState(false)
  const [emailMode, setEmailMode] = useState<'seller' | 'buyer'>('seller') // Toggle between seller outreach and buyer dispo

  const queryClient = useQueryClient()

  // Get property/analysis from underwriter navigation
  // NOTE: property_analysis already contains denormalized property data (beds, baths, sqft, agent info, etc.)
  // We don't need to fetch from properties table since the data is already in property_analysis
  useEffect(() => {
    async function loadData() {
      console.log('📧 Email Closer: location.state =', location.state)

      if (location.state?.property) {
        const analysisData = location.state.property
        console.log('📊 Analysis data received:', {
          property_id: analysisData.property_id,
          address: analysisData.address,
          win_win_score: analysisData.win_win_score,
          agent_name: analysisData.agent_name,
          agent_email: analysisData.agent_email
        })

        setSelectedLevel(location.state.selected_level || 1)
        // property_analysis already has all the data we need - just use it directly
        setSelectedOffer(analysisData)
      } else {
        console.warn('⚠️ No location.state.property found - trying fallback fetch')
        // Fallback: fetch property_analysis directly if navigation state was lost
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: fallbackData } = await supabase
            .from('property_analysis')
            .select('*')
            .eq('account_id', user.id)
            .order('win_win_score', { ascending: false })
            .limit(1)

          if (fallbackData && fallbackData[0]) {
            console.log('🔄 Fallback: using most recent property_analysis')
            const analysisData = fallbackData[0]
            setSelectedLevel(1)
            setSelectedOffer(analysisData)
          }
        }
      }
    }
    loadData()
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
        .select('*')
        .eq('status', 'pending')
        .lte('scheduled_for', new Date().toISOString())
        .order('scheduled_for', { ascending: true })
      return data || []
    }
  })

  // Get level data helper
  const getLevelData = () => {
    if (!selectedOffer) return null
    const listingPrice = selectedOffer.listing_price || selectedOffer.level3_offer_price || selectedOffer.offer_price || 0
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

      // Determine email type based on mode
      const aiEmailType = emailMode === 'buyer' ? 'buyer_dispo' : (emailTypeMap[emailType] || 'offer_presentation')

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
            email_mode: emailMode, // 'seller' or 'buyer'
            seller_name: selectedOffer.agent_name || selectedOffer.seller_name,
            custom_message: customMessage,
            level: selectedLevel,
            offer_price: levelData?.offer_price,
            structure: levelData?.structure,
            entry_fee: levelData?.entry_fee,
            monthly_payment: levelData?.monthly,
            property_data: {
              address: selectedOffer.address,
              city: selectedOffer.city,
              state: selectedOffer.state,
              listing_price: selectedOffer.listing_price,
              estimated_value: selectedOffer.estimated_value,
              open_mortgage_balance: selectedOffer.open_mortgage_balance,
              agent_email: selectedOffer.agent_email,
              agent_name: selectedOffer.agent_name,
              seller_name: selectedOffer.seller_name,
              // Property details for buyer emails
              bedrooms: selectedOffer.bedrooms,
              bathrooms: selectedOffer.bathrooms,
              sqft: selectedOffer.sqft,
              year_built: selectedOffer.year_built,
              // Pass offer details for email generation
              level1_offer_price: selectedOffer.level1_offer_price,
              level1_entry_fee: selectedOffer.level1_entry_fee,
              level1_monthly_payment: selectedOffer.level1_monthly_payment,
              level1_seller_carry_rate: selectedOffer.level1_seller_carry_rate,
              level2_offer_price: selectedOffer.level2_offer_price,
              level2_entry_fee: selectedOffer.level2_entry_fee,
              level3_offer_price: selectedOffer.level3_offer_price,
              level3_entry_fee: selectedOffer.level3_entry_fee,
              level3_monthly_payment: selectedOffer.level3_monthly_payment,
              level3_seller_carry_rate: selectedOffer.level3_seller_carry_rate,
              mortgage_rate: selectedOffer.mortgage_rate,
              days_on_market: selectedOffer.days_on_market,
              win_win_score: selectedOffer.win_win_score,
              strategy: selectedOffer.strategy,
              ai_analysis: selectedOffer.reasoning
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
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="w-5 h-5" />
                      {selectedOffer.address || selectedOffer.properties?.address}
                    </CardTitle>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowFullPropertyDetails(!showFullPropertyDetails)}
                    >
                      {showFullPropertyDetails ? 'Hide Details' : 'Show Full Details'}
                      <ChevronDown className={`w-4 h-4 ml-1 transition-transform ${showFullPropertyDetails ? 'rotate-180' : ''}`} />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Quick Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Asking Price</p>
                      <p className="text-lg font-bold">${(selectedOffer.listing_price || selectedOffer.level3_offer_price || selectedOffer.properties?.listing_price || 0).toLocaleString()}</p>
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

                  {/* Agent Information */}
                  <div className="p-4 bg-muted/50 rounded-lg mb-4">
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                      <User className="w-4 h-4" />
                      Listing Agent / Seller Contact
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Name</p>
                        <p className="text-sm font-medium">
                          {selectedOffer.agent_name || selectedOffer.listing_agent_full_name || selectedOffer.seller_name || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Email</p>
                        <p className="text-sm font-medium">
                          {selectedOffer.agent_email || selectedOffer.listing_agent_email || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Phone</p>
                        <p className="text-sm font-medium">
                          {selectedOffer.agent_phone || selectedOffer.listing_agent_phone || selectedOffer.seller_phone || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Brokerage</p>
                        <p className="text-sm font-medium">
                          {selectedOffer.brokerage || selectedOffer.listing_brokerage_name || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Property Details */}
                  {showFullPropertyDetails && (
                    <div className="space-y-4 pt-4 border-t">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <Home className="w-4 h-4" />
                        Property Details
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Bedrooms</p>
                          <p className="text-sm font-medium">{selectedOffer.bedrooms || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Bathrooms</p>
                          <p className="text-sm font-medium">{selectedOffer.bathrooms || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Square Feet</p>
                          <p className="text-sm font-medium">{selectedOffer.living_square_feet || selectedOffer.sqft || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Year Built</p>
                          <p className="text-sm font-medium">{selectedOffer.year_built || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Property Type</p>
                          <p className="text-sm font-medium">{selectedOffer.property_type || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Days on Market</p>
                          <p className="text-sm font-medium">{selectedOffer.days_on_market || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Price/Sqft</p>
                          <p className="text-sm font-medium">{selectedOffer.sqft && selectedOffer.level3_offer_price ? '$' + Math.round(selectedOffer.level3_offer_price / selectedOffer.sqft) + '/sqft' : 'N/A'}</p>
                        </div>

                      </div>

                      {/* Financial Details */}
                      <h4 className="text-sm font-semibold flex items-center gap-2 mt-4">
                        <DollarSign className="w-4 h-4" />
                        Financial Details
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Estimated Value</p>
                          <p className="text-sm font-medium">${(selectedOffer.estimated_value || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Mortgage Balance</p>
                          <p className="text-sm font-medium">${(selectedOffer.open_mortgage_balance || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Equity</p>
                          <p className="text-sm font-medium">{selectedOffer.estimated_value && selectedOffer.open_mortgage_balance ? `${Math.round((1 - Number(selectedOffer.open_mortgage_balance) / Number(selectedOffer.estimated_value)) * 100)}%` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Mortgage Rate</p>
                          <p className="text-sm font-medium">{selectedOffer.mortgage_rate ? `${selectedOffer.mortgage_rate}%` : 'N/A'}</p>
                        </div>
                      </div>

                      {/* Underwriting Details */}
                      <h4 className="text-sm font-semibold flex items-center gap-2 mt-4">
                        <TrendingUp className="w-4 h-4" />
                        Underwriting Analysis
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-xs text-muted-foreground">ARV (After Repair Value)</p>
                          <p className="text-sm font-medium">${(selectedOffer.estimated_arv || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Estimated Equity</p>
                          <p className="text-sm font-medium">${selectedOffer.estimated_value && selectedOffer.open_mortgage_balance ? (Number(selectedOffer.estimated_value) - Number(selectedOffer.open_mortgage_balance)).toLocaleString() : '0'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Expected ROI</p>
                          <p className="text-sm font-medium">{selectedOffer.expected_roi ? `${selectedOffer.expected_roi}%` : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Max Offer Price</p>
                          <p className="text-sm font-medium">${(Number(selectedOffer.level3_offer_price) || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Recommendation</p>
                          <Badge variant={selectedOffer.recommendation?.includes('Elite') ? 'default' : 'secondary'}>
                            {selectedOffer.recommendation || 'N/A'}
                          </Badge>
                        </div>
                      </div>

                      {/* Deal Strengths */}
                      {selectedOffer.factors && (
                        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h5 className="text-sm font-semibold text-green-700 mb-2">Deal Strengths</h5>
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(selectedOffer.factors)
                              .filter(([_, v]: any) => v === true)
                              .map(([k]: any) => (
                                <Badge key={k} variant="outline" className="bg-green-100 text-green-700">
                                  {k.replace(/_/g, ' ')}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}

                      {/* AI Reasoning */}
                      {selectedOffer.reasoning && (
                        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h5 className="text-sm font-semibold text-blue-700 mb-2">AI Analysis</h5>
                          <p className="text-sm text-blue-900">{selectedOffer.reasoning}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Level Selector - Expandable */}
            {selectedOffer && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Select Offer Level
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    {/* Level 1 */}
                    <div className={`border rounded-lg transition-all ${selectedLevel === 1 ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => { setSelectedLevel(1); setEmailType('offer_presentation'); setExpandedLevel(expandedLevel === 1 ? null : 1); }}>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-bold">Level 1: 70% + Terms (Seller Finance)</p>
                            <p className="text-sm text-muted-foreground">Offer: ${(selectedOffer?.level1_offer_price || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedLevel === 1 && <Badge className="bg-vice-green text-black">Selected</Badge>}
                          <ChevronDown className={`w-5 h-5 transition-transform ${expandedLevel === 1 ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {expandedLevel === 1 && (
                        <div className="px-4 pb-4 border-t pt-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Offer Price</p>
                              <p className="text-lg font-bold">${(selectedOffer.level1_offer_price || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee (Down)</p>
                              <p className="text-lg font-bold">${(selectedOffer.level1_entry_fee || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Monthly Payment</p>
                              <p className="text-lg font-bold">${Math.round(selectedOffer.level1_monthly_payment || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Interest Rate</p>
                              <p className="text-lg font-bold">{selectedOffer.level1_seller_carry_rate || selectedOffer.mortgage_rate || 'N/A'}%</p>
                            </div>
                          </div>
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                            <p className="font-semibold text-blue-700">Structure:</p>
                            <p className="text-blue-900">70% of asking price with seller financing. Seller carries a promissory note with monthly payments over agreed term.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Level 2 */}
                    <div className={`border rounded-lg transition-all ${selectedLevel === 2 ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => { setSelectedLevel(2); setEmailType('offer_presentation'); setExpandedLevel(expandedLevel === 2 ? null : 2); }}>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-bold">Level 2: 70% All Cash</p>
                            <p className="text-sm text-muted-foreground">Offer: ${(selectedOffer?.level2_offer_price || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedLevel === 2 && <Badge className="bg-vice-green text-black">Selected</Badge>}
                          <ChevronDown className={`w-5 h-5 transition-transform ${expandedLevel === 2 ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {expandedLevel === 2 && (
                        <div className="px-4 pb-4 border-t pt-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Offer Price</p>
                              <p className="text-lg font-bold">${(selectedOffer.level2_offer_price || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Cash Required</p>
                              <p className="text-lg font-bold">${(selectedOffer.level2_entry_fee || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Monthly Payment</p>
                              <p className="text-lg font-bold">$0 (All Cash)</p>
                            </div>
                          </div>
                          <div className="p-3 bg-green-50 border border-green-200 rounded text-sm">
                            <p className="font-semibold text-green-700">Structure:</p>
                            <p className="text-green-900">70% of asking price, all-cash offer. No monthly payments, fastest closing, lowest seller risk.</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Level 3 */}
                    <div className={`border rounded-lg transition-all ${selectedLevel === 3 ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'}`}>
                      <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => { setSelectedLevel(3); setEmailType('offer_presentation'); setExpandedLevel(expandedLevel === 3 ? null : 3); }}>
                        <div className="flex items-center gap-4">
                          <div>
                            <p className="font-bold">Level 3: 100% Full Price + Terms</p>
                            <p className="text-sm text-muted-foreground">Offer: ${(selectedOffer?.level3_offer_price || 0).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {selectedLevel === 3 && <Badge className="bg-vice-green text-black">Selected</Badge>}
                          <ChevronDown className={`w-5 h-5 transition-transform ${expandedLevel === 3 ? 'rotate-180' : ''}`} />
                        </div>
                      </div>
                      {expandedLevel === 3 && (
                        <div className="px-4 pb-4 border-t pt-4 space-y-3">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                              <p className="text-xs text-muted-foreground">Offer Price</p>
                              <p className="text-lg font-bold">${(selectedOffer.level3_offer_price || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Entry Fee</p>
                              <p className="text-lg font-bold">${(selectedOffer.level3_entry_fee || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Monthly Payment</p>
                              <p className="text-lg font-bold">${Math.round(selectedOffer.level3_monthly_payment || 0).toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-xs text-muted-foreground">Interest Rate</p>
                              <p className="text-lg font-bold">{selectedOffer.level3_seller_carry_rate || selectedOffer.mortgage_rate || 'N/A'}%</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-2 gap-4 mt-3">
                            <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                              <p className="text-xs text-purple-700 font-semibold">Assume Existing Mortgage</p>
                              <p className="text-lg font-bold text-purple-900">${(selectedOffer.level3_assume_mortgage || 0).toLocaleString()}</p>
                            </div>
                            <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                              <p className="text-xs text-orange-700 font-semibold">Seller Carry (2nd Position)</p>
                              <p className="text-lg font-bold text-orange-900">${(selectedOffer.level3_seller_carry_amount || 0).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="p-3 bg-purple-50 border border-purple-200 rounded text-sm">
                            <p className="font-semibold text-purple-700">Structure:</p>
                            <p className="text-purple-900">Full asking price with creative terms. Buyer assumes existing mortgage + seller carries second position. Highest seller acceptance rate.</p>
                          </div>
                        </div>
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
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Send className="w-5 h-5" />
                      AI Email Generator - {emailMode === 'seller' ? (selectedOffer.agent_name || 'Seller/Agent') : 'Buyer/Investor'}
                    </div>
                    {/* Email Mode Toggle */}
                    <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
                      <Button
                        variant={emailMode === 'seller' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setEmailMode('seller')}
                      >
                        📩 To Seller
                      </Button>
                      <Button
                        variant={emailMode === 'buyer' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setEmailMode('buyer')}
                      >
                        🏠 To Buyer
                      </Button>
                    </div>
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
