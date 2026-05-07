// Email Closer Agent Page - Thin orchestrator
// Handles follow-up, negotiation, objections, and closing

import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, ArrowLeft } from 'lucide-react'
import { StatsBar, PendingApproval, OffersQueue, ActivityFeed, AIEmailGenerator } from '@/components/email-closer'

// Hardcoded account_id
const ACCOUNT_ID = '757a0f4a-49cd-43b3-b6c2-70274f611039'

export default function EmailCloserPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const [selectedOffer, setSelectedOffer] = useState<any>(null)
  const [selectedLevel, setSelectedLevel] = useState<1 | 2 | 3>(1)

  // Load property from navigation
  useEffect(() => {
    if (location.state?.property) {
      setSelectedOffer(location.state.property)
      setSelectedLevel(location.state.selected_level || 1)
    }
  }, [location.state])

  // Query: offers pending response
  const { data: pendingOffers } = useQuery({
    queryKey: ['offers_pending'],
    queryFn: async () => {
      const { data } = await supabase
        .from('offers')
        .select('*, properties(*)')
        .eq('account_id', ACCOUNT_ID)
        .in('status', ['pending_response', 'sent'])
        .order('sent_at', { ascending: false })
      return data || []
    }
  })

  // Query: AI drafts pending approval
  const { data: pendingApprovals } = useQuery({
    queryKey: ['pending_approvals'],
    queryFn: async () => {
      const { data } = await supabase
        .from('communications')
        .select('*')
        .eq('account_id', ACCOUNT_ID)
        .eq('status', 'pending_approval')
      return data || []
    }
  })

  // Query: recent communications
  const { data: communications } = useQuery({
    queryKey: ['communications'],
    queryFn: async () => {
      const { data } = await supabase
        .from('communications')
        .select('*')
        .eq('account_id', ACCOUNT_ID)
        .order('created_at', { ascending: false })
        .limit(50)
      return data || []
    }
  })

  // Query: follow-up queue
  const { data: followUpQueue } = useQuery({
    queryKey: ['follow_up_queue'],
    queryFn: async () => {
      const { data } = await supabase
        .from('follow_up_queue')
        .select('*')
        .eq('status', 'pending')
        .eq('account_id', ACCOUNT_ID)
      if (!data) return []
      return data
        .filter(i => new Date(i.scheduled_for) <= new Date())
        .sort((a, b) => new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime())
    }
  })

  // Stats
  const responded = (communications?.filter((c: any) => c.direction === 'inbound').length || 0) + (pendingApprovals?.length || 0)

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gta-blue mb-2 flex items-center gap-3">
              <MessageSquare className="w-8 h-8" />
              Email Closer Agent
            </h1>
            <p className="text-muted-foreground">Follow-up, negotiation, objection handling, and closing</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate('/agent/underwriter')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Underwriter
            </Button>
            <Button variant="outline" onClick={() => navigate('/command-center')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Command Center
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <StatsBar
          pending={pendingOffers?.length || 0}
          followUps={followUpQueue?.length || 0}
          replied={responded}
          pendingApproval={pendingApprovals?.length || 0}
        />

        {/* Pending Approval - Gold bordered */}
        <PendingApproval drafts={pendingApprovals || []} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Selected Property Card */}
            {selectedOffer && (
              <Card>
                <CardHeader>
                  <CardTitle>{selectedOffer.address || 'Selected Property'}</CardTitle>
                </CardHeader>
              </Card>
            )}

            {/* Offers Awaiting Response with urgency borders */}
            <OffersQueue
              offers={pendingOffers || []}
              onSelectOffer={setSelectedOffer}
              selectedPropertyId={selectedOffer?.property_id}
            />

            {/* AI Email Generator */}
            <AIEmailGenerator
              selectedProperty={selectedOffer}
              selectedLevel={selectedLevel}
              onPropertyClear={() => setSelectedOffer(null)}
            />
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity - Deduplicated */}
            <ActivityFeed communications={communications || []} />
          </div>
        </div>
      </div>
    </div>
  )
}