// Stats Bar Component - 4 colored stat cards with left border accents

import { Mail, MessageSquare, Clock, CheckCircle } from 'lucide-react'

export interface StatsBarProps {
  pending: number
  followUps: number
  replied: number
  pendingApproval: number
}

export default function StatsBar({ pending, followUps, replied, pendingApproval }: StatsBarProps) {
  return (
    <div className="grid grid-cols-4 gap-[10px] mb-4">
      {/* Pending Response - Orange */}
      <div className="rounded-md p-3 px-4 border-l-[3px] border-orange-600 bg-orange-50">
        <div className="text-[11px] font-medium uppercase tracking-wider text-amber-800 mb-1">Pending Response</div>
        <div className="text-[22px] font-medium text-amber-900">{pending}</div>
      </div>
      {/* Due Follow-up - Yellow */}
      <div className="rounded-md p-3 px-4 border-l-[3px] border-yellow-600 bg-amber-50">
        <div className="text-[11px] font-medium uppercase tracking-wider text-yellow-800 mb-1">Due Follow-up</div>
        <div className="text-[22px] font-medium text-yellow-900">{followUps}</div>
      </div>
      {/* Replies Received - Green */}
      <div className="rounded-md p-3 px-4 border-l-[3px] border-green-600 bg-green-50">
        <div className="text-[11px] font-medium uppercase tracking-wider text-green-900 mb-1">Replies Received</div>
        <div className="text-[22px] font-medium text-green-800">{replied}</div>
      </div>
      {/* Pending Approval - Blue */}
      <div className="rounded-md p-3 px-4 border-l-[3px] border-blue-600 bg-blue-50">
        <div className="text-[11px] font-medium uppercase tracking-wider text-blue-900 mb-1">Pending Approval</div>
        <div className="text-[22px] font-medium text-blue-800">{pendingApproval}</div>
      </div>
    </div>
  )
}