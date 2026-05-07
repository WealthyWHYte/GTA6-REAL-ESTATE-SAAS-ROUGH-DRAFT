// Offers Queue Component - Offers awaiting response with urgency borders

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Mail, CheckCircle } from 'lucide-react'

interface Offer {
  id: string
  property_id: string
  status: string
  offer_price?: number
  sent_at?: string
  properties?: {
    address?: string
    city?: string
    state?: string
  }
}

interface OffersQueueProps {
  offers: Offer[]
  onSelectOffer: (offer: Offer) => void
  selectedPropertyId?: string
}

export default function OffersQueue({ offers, onSelectOffer, selectedPropertyId }: OffersQueueProps) {
  const queryClient = useQueryClient()

  const snoozeMutation = useMutation({
    mutationFn: async (offer: Offer) => {
      const snoozedUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      await supabase
        .from('offers')
        .update({ snoozed_until: snoozedUntil })
        .eq('id', offer.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['offers_pending'] })
    }
  })

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Mail className="w-5 h-5" />
        <h3 className="font-semibold text-lg">📬 Offers Awaiting Response ({offers?.length || 0})</h3>
      </div>
      <div className="space-y-3">
        {offers?.map((offer: Offer) => {
          const sentDate = offer.sent_at ? new Date(offer.sent_at) : null
          const daysSince = sentDate ? Math.floor((Date.now() - sentDate.getTime()) / (1000 * 60 * 60 * 24)) : 0
          const urgency = daysSince >= 14 ? 'red' : daysSince >= 7 ? 'orange' : 'green'
          const urgencyColors: Record<string, string> = {
            red: 'border-l-red-500',
            orange: 'border-l-orange-500',
            green: 'border-l-green-500'
          }
          const daysBg: Record<string, string> = {
            red: 'bg-red-100 text-red-700',
            orange: 'bg-orange-100 text-orange-700',
            green: 'bg-green-100 text-green-700'
          }

          return (
            <div
              key={offer.id}
              className={`p-4 border-l-4 ${urgencyColors[urgency]} rounded-lg cursor-pointer transition-all hover:shadow-md bg-card ${
                selectedPropertyId === offer.property_id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onSelectOffer(offer)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[14px]">{offer.properties?.address || offer.property_id}</span>
                    <span className={`text-[11px] font-medium px-1.5 py-0.5 rounded-full ${daysBg[urgency]}`}>Day {daysSince}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[11px] text-muted-foreground">{[offer.properties?.city, offer.properties?.state].filter(Boolean).join(', ')}</span>
                    <span className="text-[11px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full">{offer.status}</span>
                  </div>
                </div>
                <span className="text-[13px] font-medium">${(offer.offer_price || 0).toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-4 text-sm font-medium">
                  <span className="text-lg">💰 Offer: ${(offer.offer_price || 0).toLocaleString()}</span>
                  <span className="text-muted-foreground">📅 {sentDate ? sentDate.toLocaleDateString() : 'N/A'}</span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => { e.stopPropagation(); snoozeMutation.mutate(offer) }}
                  disabled={snoozeMutation.isPending}
                >
                  {snoozeMutation.isPending ? '⏳' : '⏰'} Snooze
                </Button>
              </div>
            </div>
          )
        })}
        {(!offers || offers.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No pending offers to follow up on</p>
          </div>
        )}
      </div>
    </div>
  )
}