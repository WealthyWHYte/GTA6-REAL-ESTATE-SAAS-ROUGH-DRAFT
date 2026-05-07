// AI Email Generator Component

import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Send, CheckCircle } from 'lucide-react'

interface PropertyData {
  property_id: string
  address?: string
  city?: string
  state?: string
  listing_price?: number
  estimated_value?: number
  agent_name?: string
  agent_email?: string
  seller_name?: string
  level1_offer_price?: number
  level1_entry_fee?: number
  level1_monthly_payment?: number
  level1_seller_carry_rate?: number
  level2_offer_price?: number
  level2_entry_fee?: number
  level3_offer_price?: number
  level3_entry_fee?: number
  level3_monthly_payment?: number
  level3_seller_carry_rate?: number
  mortgage_rate?: number
  days_on_market?: number
  win_win_score?: number
  reasoning?: string
}

interface AIEmailGeneratorProps {
  selectedProperty: PropertyData | null
  selectedLevel: number
  onPropertyClear: () => void
}

const OBJECTION_TEMPLATES = [
  { type: 'low', label: 'Price Too Low', icon: '💰' },
  { type: 'finance', label: 'Financing Concern', icon: '🏦' },
  { type: 'timing', label: 'Wrong Timing', icon: '⏰' },
  { type: 'multiple', label: 'Multiple Offers', icon: '📋' },
  { type: 'condition', label: 'Property Condition', icon: '🏠' }
]

export default function AIEmailGenerator({ selectedProperty, selectedLevel, onPropertyClear }: AIEmailGeneratorProps) {
  const queryClient = useQueryClient()
  const [emailType, setEmailType] = useState('offer_presentation')
  const [objectionType, setObjectionType] = useState('')
  const [customMessage, setCustomMessage] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailBody, setEmailBody] = useState('')

  const getLevelData = () => {
    if (!selectedProperty) return null
    const listingPrice = selectedProperty.listing_price || selectedProperty.level3_offer_price || 0
    return {
      1: {
        offer_price: selectedProperty.level1_offer_price || listingPrice * 0.7,
        structure: "70% + Terms (Seller Finance)",
        entry_fee: selectedProperty.level1_entry_fee || 0,
        monthly: selectedProperty.level1_monthly_payment || 0
      },
      2: {
        offer_price: selectedProperty.level2_offer_price || listingPrice * 0.7,
        structure: "70% All Cash",
        entry_fee: selectedProperty.level2_entry_fee || 0,
        monthly: 0
      },
      3: {
        offer_price: selectedProperty.level3_offer_price || listingPrice,
        structure: "100% Full Price + Terms",
        entry_fee: selectedProperty.level3_entry_fee || 0,
        monthly: selectedProperty.level3_monthly_payment || 0
      }
    }[selectedLevel as 1 | 2 | 3]
  }

  const generateMutation = useMutation({
    mutationFn: async () => {
      if (!selectedProperty) throw new Error('Select a property first')
      const levelData = getLevelData()

      const emailTypeMap: Record<string, string> = {
        'follow_up_1': 'follow_up',
        'follow_up_2': 'follow_up',
        'follow_up_3': 'follow_up',
        'objection': 'objection_handler',
        'offer_presentation': 'offer_presentation',
        'closing': 'closing',
        'initial_outreach': 'initial_outreach'
      }

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
            property_id: selectedProperty.property_id,
            email_type: emailTypeMap[emailType] || 'offer_presentation',
            email_mode: 'seller',
            seller_name: selectedProperty.agent_name || selectedProperty.seller_name,
            custom_message: customMessage,
            level: selectedLevel,
            offer_price: levelData?.offer_price,
            structure: levelData?.structure,
            entry_fee: levelData?.entry_fee,
            monthly_payment: levelData?.monthly,
            property_data: {
              address: selectedProperty.address,
              city: selectedProperty.city,
              state: selectedProperty.state,
              listing_price: selectedProperty.listing_price,
              estimated_value: selectedProperty.estimated_value,
              agent_name: selectedProperty.agent_name,
              seller_name: selectedProperty.seller_name,
              level1_offer_price: selectedProperty.level1_offer_price,
              level2_offer_price: selectedProperty.level2_offer_price,
              level3_offer_price: selectedProperty.level3_offer_price,
              mortgage_rate: selectedProperty.mortgage_rate,
              days_on_market: selectedProperty.days_on_market,
              win_win_score: selectedProperty.win_win_score,
              ai_analysis: selectedProperty.reasoning
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
    }
  })

  const sendMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession()

      const { data: commData, error: commError } = await supabase
        .from('communications')
        .insert({
          account_id: session?.user?.id,
          property_id: selectedProperty?.property_id,
          direction: 'outbound',
          subject: emailSubject,
          body: emailBody,
          email_type: emailType,
          level: selectedLevel,
          status: 'sent'
        })

      if (commError) throw commError

      const recipientEmail = selectedProperty?.agent_email
      const recipientName = selectedProperty?.agent_name || selectedProperty?.seller_name

      if (!recipientEmail) {
        throw new Error('Recipient email is missing')
      }

      try {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            property_id: selectedProperty?.property_id,
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            subject: emailSubject,
            body: emailBody,
            level: selectedLevel
          }
        })
        if (error) throw error
        return data
      } catch (sendErr: any) {
        throw new Error(sendErr?.message || 'Failed to send')
      }
    },
    onSuccess: async () => {
      if (selectedProperty?.property_id) {
        await supabase
          .from('property_analysis')
          .update({ contacted_at: new Date().toISOString() })
          .eq('property_id', selectedProperty.property_id)
      }

      setSendSuccess(true)
      queryClient.invalidateQueries({ queryKey: ['offers_pending'] })
      queryClient.invalidateQueries({ queryKey: ['communications'] })
      setTimeout(() => {
        setSendSuccess(false)
        setShowPreview(false)
        setEmailSubject('')
        setEmailBody('')
      }, 3000)
    },
    onError: (err: any) => {
      console.error('❌ Send error:', err)
      alert('Failed to send: ' + (err?.message || 'Unknown error'))
    }
  })

  if (!selectedProperty) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            AI Email Generator - {selectedProperty.agent_name || 'Seller/Agent'}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Success Message */}
        {sendSuccess && (
          <div className="p-4 bg-green-50 border border-green-500 rounded-lg flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-bold text-green-700">✅ Email Sent Successfully!</p>
            </div>
          </div>
        )}

        {/* AI Generate Button */}
        <div className="flex gap-2">
          <Button
            onClick={() => generateMutation.mutate()}
            disabled={generateMutation.isPending}
            className="bg-gradient-to-r from-vice-pink to-vice-purple"
          >
            {generateMutation.isPending ? '🤖 Generating...' : '✨ AI Generate Email'}
          </Button>
          {generateMutation.isSuccess && (
            <span className="text-vice-green text-sm flex items-center">✅ AI email ready!</span>
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
          <Button variant="outline" onClick={onPropertyClear}>
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
              onClick={() => generateMutation.mutate()}
              disabled={generateMutation.isPending}
            >
              Generate & Preview
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}