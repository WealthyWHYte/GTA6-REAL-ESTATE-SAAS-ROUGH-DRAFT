import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Mail, ChevronRight, ChevronDown, Reply, Forward, Calendar, User } from "lucide-react"
import { useState } from "react"

interface Communication {
  id: string
  subject?: string
  body: string
  direction: "inbound" | "outbound"
  recipient_email?: string
  recipient_name?: string
  sender?: string
  status?: string
  created_at: string
  sent_at?: string
  opened_at?: string
  replied_at?: string
}

interface EmailThreadViewerProps {
  communications: Communication[]
  onReply?: (comm: Communication) => void
}

export default function EmailThreadViewer({ communications, onReply }: EmailThreadViewerProps) {
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set())

  if (!communications || communications.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Mail className="w-5 h-5" />
            Email Thread
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No emails in this thread yet
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group communications by thread (simple grouping by subject for now)
  // In the future, use gmail_thread_id or thread_id for proper threading
  const sortedComms = [...communications].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )

  const toggleExpand = (id: string) => {
    setExpandedEmails(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "sent": return "bg-blue-500/20 text-blue-500 border-blue-500"
      case "delivered": return "bg-green-500/20 text-green-500 border-green-500"
      case "opened": return "bg-purple-500/20 text-purple-500 border-purple-500"
      case "replied": return "bg-yellow-500/20 text-yellow-500 border-yellow-500"
      default: return "bg-gray-500/20 text-gray-500 border-gray-500"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mail className="w-5 h-5" />
          Email Thread ({communications.length} emails)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-3">
            {sortedComms.map((comm, index) => {
              const isExpanded = expandedEmails.has(comm.id)
              const isInbound = comm.direction === "inbound"

              return (
                <Collapsible
                  key={comm.id}
                  open={isExpanded}
                  onOpenChange={() => toggleExpand(comm.id)}
                >
                  <div className={`rounded-lg border ${isInbound ? "bg-blue-500/5" : "bg-green-500/5"}`}>
                    {/* Email Header - Always Visible */}
                    <div className="flex items-center gap-2 p-3">
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4" />
                          ) : (
                            <ChevronRight className="w-4 h-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>

                      <Badge
                        variant="outline"
                        className={getStatusColor(comm.status)}
                      >
                        {isInbound ? "📥 Inbound" : "📤 Outbound"}
                      </Badge>

                      {comm.status === "opened" && (
                        <Badge variant="outline" className="text-xs bg-purple-500/20 text-purple-500 border-purple-500">
                          👁️ Opened
                        </Badge>
                      )}

                      {comm.status === "replied" && (
                        <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-500 border-yellow-500">
                          💬 Replied
                        </Badge>
                      )}

                      <span className="text-xs text-muted-foreground flex-1">
                        {formatDate(comm.created_at)}
                      </span>

                      {onReply && isInbound && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onReply(comm)}
                          className="h-8 text-xs"
                        >
                          <Reply className="w-3 h-3 mr-1" />
                          Reply
                        </Button>
                      )}
                    </div>

                    {/* Email Content - Expandable */}
                    <CollapsibleContent>
                      <Separator />
                      <div className="p-4 space-y-3">
                        {/* Email Meta */}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <User className="w-4 h-4" />
                            <span>
                              {isInbound
                                ? `From: ${comm.sender || comm.recipient_email || "Unknown"}`
                                : `To: ${comm.recipient_name || comm.recipient_email || "Unknown"}`}
                            </span>
                          </div>
                          {comm.subject && (
                            <div className="flex items-center gap-2 text-muted-foreground">
                              <Mail className="w-4 h-4" />
                              <span className="truncate">Subject: {comm.subject}</span>
                            </div>
                          )}
                        </div>

                        {/* Email Body */}
                        <div className="bg-muted/30 rounded-lg p-4 text-sm whitespace-pre-wrap">
                          {comm.body}
                        </div>

                        {/* Tracking Info */}
                        {(comm.sent_at || comm.opened_at || comm.replied_at) && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            {comm.sent_at && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                Sent: {formatDate(comm.sent_at)}
                              </span>
                            )}
                            {comm.opened_at && (
                              <span className="flex items-center gap-1 text-purple-500">
                                <Mail className="w-3 h-3" />
                                Opened: {formatDate(comm.opened_at)}
                              </span>
                            )}
                            {comm.replied_at && (
                              <span className="flex items-center gap-1 text-yellow-500">
                                <Reply className="w-3 h-3" />
                                Replied: {formatDate(comm.replied_at)}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </CollapsibleContent>
                  </div>
                </Collapsible>
              )
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
