// Activity Feed Component - Recent activity deduplicated by date and subject

import { History } from 'lucide-react'

export interface Communication {
  id: string
  property_id?: string
  to_email?: string
  direction: string
  status: string
  subject: string
  body?: string
  email_type?: string
  created_at: string
}

export interface ActivityFeedProps {
  communications: Communication[]
}

export default function ActivityFeed({ communications }: ActivityFeedProps) {
  // Deduplicate by date and subject
  const deduplicated = communications?.slice(0, 10).reduce((unique: Communication[], comm: Communication) => {
    const dateKey = new Date(comm.created_at).toLocaleDateString()
    const isDup = unique.find(u => u.subject === comm.subject && new Date(u.created_at).toLocaleDateString() === dateKey)
    if (!isDup) unique.push(comm)
    return unique
  }, []) || []

  return (
    <div className="bg-card border rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <History className="w-5 h-5" />
        <h3 className="font-semibold text-lg">📊 Recent Activity</h3>
      </div>
      <div className="space-y-2">
        {deduplicated.map((comm: Communication) => (
          <div key={comm.id} className="flex items-start gap-3 py-2 border-b border-border">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium flex-shrink-0 ${
              comm.email_type === 'ai_draft' ? 'bg-amber-100 text-amber-800' :
              comm.direction === 'inbound' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {comm.email_type === 'ai_draft' ? 'AI' : comm.direction === 'inbound' ? 'IN' : 'OUT'}
            </div>
            <div>
              <p className="text-[13px] font-medium truncate">{comm.subject}</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {comm.email_type === 'ai_draft' ? `AI draft · ${comm.to_email || ''}` : comm.direction === 'inbound' ? 'received' : 'sent'} · {new Date(comm.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        ))}
        {deduplicated.length === 0 && (
          <p className="text-center text-muted-foreground py-4">No recent activity</p>
        )}
      </div>
    </div>
  )
}