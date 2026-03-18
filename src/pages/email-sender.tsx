// email-sender-page.tsx - Send offers directly from the app
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// Email templates
const TEMPLATES: Record<string, { subject: string; body: string }> = {
  initial_offer: {
    subject: 'Cash Offer - {address}',
    body: `Dear {agent_name},

I hope this message finds you well. I'm reaching out regarding {address}.

Our team has reviewed the property and we're prepared to move forward with the following offer:

OFFER DETAILS:
Purchase Price: {offer_price}
Estimated Value: {estimated_value}
Down Payment: {down_payment}%
Closing Timeline: {closing_days} days
Financing: {financing_type}

TERMS:
- Property to be conveyed As-Is
- All inspections for informational purposes only
- Commission protected at standard rate
- Multiple financing pathways available

We're a direct buyer with established lending relationships and can close quickly. Our goal is a smooth, efficient transaction that works for all parties.

Please let me know if you'd like to discuss the terms or schedule a call to answer any questions.

Best regards,
GTA 6 Real Estate
(954) 555-0123

---
This offer is valid for 72 hours.`
  },
  follow_up_1: {
    subject: 'Following Up - {address}',
    body: `Hi {agent_name},

I wanted to follow up on our offer for {address}.

Our offer remains open and we're genuinely interested in acquiring this property. I understand you're busy - just wanted to keep this on your radar.

Please let me know if you have any questions or if the seller would like to discuss. We're flexible on terms and want to find a way to make this work.

Best,
GTA 6 Real Estate`
  },
  follow_up_2: {
    subject: '{address} - Any Updates?',
    body: `Dear {agent_name},

Checking in again on our offer for {address}, {city}.

I understand the market is active and there may be multiple interested parties. Our offer stands as presented and we're prepared to move quickly.

Key points:
- Pre-approval in place
- Flexible closing timeline (21-45 days)
- As-Is condition - no repairs requested
- Quick decision timeline

If there's additional information we can provide, or if the seller has questions, we're available for a quick call.

Otherwise, we'll plan to follow up again in a few days.

Best regards,
GTA 6 Real Estate`
  }
}

export default function EmailSenderPage() {
  const [properties, setProperties] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedProperty, setSelectedProperty] = useState<any>(null)
  const [emailPreview, setEmailPreview] = useState<{ to: string; subject: string; body: string } | null>(null)

  useEffect(() => {
    loadPropertiesWithOffers()
  }, [])

  async function loadPropertiesWithOffers() {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      // Get ALL properties - show everything from uploads
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          offers (*)
        `)
        .eq('account_id', user?.id)
        .in('pipeline_status', ['scouted', 'market_research', 'researched', 'underwriting', 'underwritten', 'offer_generation', 'offer_sent', 'accepted', 'rejected'])
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      setProperties(data || [])
    } catch (err) {
      console.error('Error loading:', err)
    } finally {
      setLoading(false)
    }
  }

  function generateEmail(property: any, templateType: string = 'initial_offer') {
    const template = TEMPLATES[templateType] || TEMPLATES.initial_offer
    const offer = property.offers?.[0] || {}
    
    const data = {
      address: property.address || '',
      city: property.city || '',
      agent_name: property.listing_agent_full_name || 'Agent',
      offer_price: `$${((offer.offer_price || property.listing_price || 0)).toLocaleString()}`,
      estimated_value: `$${((property.estimated_value || 0)).toLocaleString()}`,
      down_payment: offer.down_payment_percent || '10',
      closing_days: offer.closing_days || '21',
      financing_type: offer.financing_type || 'Flexible Financing Available',
      counter_price: `$${((offer.counter_price || 0)).toLocaleString()}`,
      response_price: `$${((offer.response_price || 0)).toLocaleString()}`,
      agreed_price: `$${((offer.agreed_price || offer.offer_price || 0)).toLocaleString()}`,
      closing_date: offer.closing_date || '21 days'
    }

    let subject = template.subject
    let body = template.body
    
    for (const [key, value] of Object.entries(data)) {
      subject = subject.replace(new RegExp(`{${key}}`, 'g'), value)
      body = body.replace(new RegExp(`{${key}}`, 'g'), value)
    }

    const to = property.listing_agent_email || ''
    
    setEmailPreview({ to, subject, body })
    setSelectedProperty(property)
  }

  function sendEmail() {
    if (!emailPreview) return
    
    // Open default email client with pre-filled email
    const mailto = `mailto:${emailPreview.to}?subject=${encodeURIComponent(emailPreview.subject)}&body=${encodeURIComponent(emailPreview.body)}`
    window.open(mailto, '_blank')
  }

  async function logEmailSent() {
    if (!selectedProperty) return
    
    try {
      // Log to communications table
      await supabase.from('communications').insert({
        property_id: selectedProperty.property_id,
        comm_type: 'email',
        direction: 'outbound',
        to_email: emailPreview?.to,
        to_name: selectedProperty.listing_agent_full_name,
        subject: emailPreview?.subject,
        message: emailPreview?.body,
        category: 'initial_offer',
        status: 'sent_via_mailto'
      })
      
      // Update offer status
      if (selectedProperty.offers?.[0]) {
        await supabase.from('offers').update({
          status: 'pending_response',
          sent_at: new Date().toISOString()
        }).eq('offer_id', selectedProperty.offers[0].offer_id)
      }
      
      alert('Email opened! Check your default email client.')
    } catch (err) {
      console.error('Error logging:', err)
    }
  }

  if (loading) return <div className="p-8">Loading properties...</div>

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">📧 Email Sender</h1>
        <p className="text-gray-400 mb-8">Send offers to listing agents</p>

        {/* Properties List */}
        <div className="grid gap-4 mb-8">
          {properties.length === 0 ? (
            <div className="bg-gray-800 p-8 rounded-lg text-center">
              <p className="text-gray-400">No properties ready for offers.</p>
              <p className="text-sm text-gray-500 mt-2">Upload and process properties first.</p>
            </div>
          ) : (
            properties.map((property) => (
              <div key={property.property_id} className="bg-gray-800 p-4 rounded-lg flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">{property.address}</h3>
                  <p className="text-sm text-gray-400">{property.city}, {property.state} {property.zip}</p>
                  <p className="text-sm text-blue-400">
                    Agent: {property.listing_agent_full_name || 'N/A'} | {property.listing_agent_email || 'No email'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => generateEmail(property, 'initial_offer')}
                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded text-sm"
                  >
                    Send Offer
                  </button>
                  <button
                    onClick={() => generateEmail(property, 'follow_up_1')}
                    className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
                  >
                    Follow Up
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Email Preview Modal */}
        {emailPreview && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-auto">
              <div className="p-6">
                <h2 className="text-xl font-bold mb-4">📧 Email Preview</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">To:</label>
                    <input
                      type="text"
                      value={emailPreview.to}
                      readOnly
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Subject:</label>
                    <input
                      type="text"
                      value={emailPreview.subject}
                      readOnly
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Body:</label>
                    <textarea
                      value={emailPreview.body}
                      readOnly
                      rows={15}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 font-mono text-sm"
                    />
                  </div>
                </div>

                <div className="flex gap-4 mt-6">
                  <button
                    onClick={() => {
                      sendEmail()
                      logEmailSent()
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700 py-3 rounded-lg font-semibold"
                  >
                    🚀 Open Email Client & Send
                  </button>
                  <button
                    onClick={() => setEmailPreview(null)}
                    className="bg-gray-600 hover:bg-gray-700 px-6 py-3 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
