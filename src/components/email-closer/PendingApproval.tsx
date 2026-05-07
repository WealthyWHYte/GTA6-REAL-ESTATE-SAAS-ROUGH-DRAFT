// Pending Approval Section - Gold bordered AI drafts pending approval

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'

interface Draft {
  id: string
  property_id: string
  to_email: string
  to_name?: string
  subject: string
  body: string
  email_type?: string
  created_at: string
}

interface PendingApprovalProps {
  drafts: Draft[]
}

export default function PendingApproval({ drafts }: PendingApprovalProps) {
  const queryClient = useQueryClient()

  const approveMutation = useMutation({
    mutationFn: async (draft: Draft) => {
      const { data: { session } } = await supabase.auth.getSession()

      const recipientEmail = draft.to_email
      const recipientName = draft.to_name || 'Seller'

      if (!recipientEmail) {
        throw new Error('Recipient email is missing')
      }

      try {
        const { data, error } = await supabase.functions.invoke('send-email', {
          body: {
            property_id: draft.property_id,
            recipient_email: recipientEmail,
            recipient_name: recipientName,
            subject: draft.subject,
            body: draft.body
          }
        })
        if (error) throw error
        return data
      } catch (sendErr: any) {
        console.error('❌ Gmail send failed:', sendErr)
        throw sendErr
      }
    },
    onSuccess: async (_, draft) => {
      await supabase
        .from('communications')
        .update({ status: 'sent' })
        .eq('id', draft.id)

      queryClient.invalidateQueries({ queryKey: ['pending_approvals'] })
      queryClient.invalidateQueries({ queryKey: ['communications'] })
    },
    onError: (err: any) => {
      console.error('❌ Approve error:', err)
      alert('Failed to approve: ' + err?.message)
    }
  })

  const discardMutation = useMutation({
    mutationFn: async (draft: Draft) => {
      await supabase
        .from('communications')
        .delete()
        .eq('id', draft.id)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending_approvals'] })
    }
  })

  if (!drafts || drafts.length === 0) {
    return null
  }

  return (
    <div className="mb-4">
      <div className="text-[12px] font-medium uppercase tracking-wider text-muted-foreground mb-2">AI drafts — pending your approval</div>
      {drafts.map((draft: Draft) => (
        <div key={draft.id} className="border-[1.5px] border-yellow-600 rounded-lg bg-amber-50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="bg-amber-100 text-amber-800 text-[11px] font-medium px-2 py-0.5 rounded-full">AI Draft</span>
              <span className="text-[13px] font-medium">{draft.to_email}</span>
              <span className="bg-red-100 text-red-800 text-[11px] px-2 py-0.5 rounded-full">Review Needed</span>
            </div>
            <span className="text-[12px] text-muted-foreground">
              {draft.created_at ? new Date(draft.created_at).toLocaleDateString() : '5/6/2026'}
            </span>
          </div>
          <div className="text-[12px] font-medium text-amber-800 mb-2">{draft.subject || 'Re: Property — No Pressure'}</div>
          <div className="bg-background border border-border rounded-md p-3 text-[13px] text-muted-foreground leading-relaxed mb-3">
            {draft.body}
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => approveMutation.mutate(draft)}
              disabled={approveMutation.isPending}
              className="bg-green-600 hover:bg-green-700 text-white border-none text-[12px] font-medium px-4"
            >
              {approveMutation.isPending ? 'Sending...' : 'Approve & Send'}
            </Button>
            <Button size="sm" variant="outline" className="text-[12px] px-4">Edit</Button>
            <Button
              size="sm"
              onClick={() => discardMutation.mutate(draft)}
              className="bg-red-100 text-red-800 border-none text-[12px] hover:bg-red-200"
            >
              Discard
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}