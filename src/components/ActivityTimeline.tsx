import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Mail,
  Phone,
  MessageSquare,
  FileText,
  Calendar,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building,
  DollarSign,
} from "lucide-react"

interface Activity {
  id: string
  activity_type?: string
  action: string
  details?: Record<string, any>
  created_at: string
  property_id?: string
  agent_name?: string
}

interface ActivityTimelineProps {
  activities: Activity[]
  filter?: string
}

const ACTIVITY_ICONS: Record<string, any> = {
  email: Mail,
  call: Phone,
  text: MessageSquare,
  note: FileText,
  showing: Calendar,
  status_change: TrendingUp,
  offer_sent: Mail,
  offer_accepted: CheckCircle,
  offer_rejected: XCircle,
  follow_up: Clock,
  default: User,
}

const ACTIVITY_COLORS: Record<string, string> = {
  email: "bg-blue-500",
  call: "bg-green-500",
  text: "bg-purple-500",
  note: "bg-gray-500",
  showing: "bg-yellow-500",
  status_change: "bg-orange-500",
  offer_sent: "bg-blue-500",
  offer_accepted: "bg-green-500",
  offer_rejected: "bg-red-500",
  follow_up: "bg-purple-500",
  default: "bg-gray-500",
}

export default function ActivityTimeline({ activities, filter }: ActivityTimelineProps) {
  const filteredActivities = filter
    ? activities.filter((a) => a.activity_type === filter)
    : activities

  // Group activities by date
  const groupedActivities = filteredActivities.reduce((acc, activity) => {
    const date = new Date(activity.created_at).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    if (!acc[date]) {
      acc[date] = []
    }
    acc[date].push(activity)
    return acc
  }, {} as Record<string, Activity[]>)

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  const getIcon = (activity: Activity) => {
    const type = activity.activity_type || "default"
    const Icon = ACTIVITY_ICONS[type] || ACTIVITY_ICONS.default
    return Icon
  }

  const getColor = (activity: Activity) => {
    const type = activity.activity_type || "default"
    return ACTIVITY_COLORS[type] || ACTIVITY_COLORS.default
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No activity recorded yet
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="w-5 h-5" />
          Activity Timeline ({activities.length} events)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[500px] pr-4">
          <div className="space-y-6">
            {Object.entries(groupedActivities).map(([date, dayActivities]) => (
              <div key={date} className="relative">
                {/* Date Header */}
                <div className="sticky top-0 z-10 bg-background py-2 mb-3">
                  <h4 className="text-sm font-medium text-muted-foreground border-b pb-1">
                    {date}
                  </h4>
                </div>

                {/* Activities */}
                <div className="space-y-4">
                  {dayActivities.map((activity, index) => {
                    const Icon = getIcon(activity)
                    const color = getColor(activity)

                    return (
                      <div key={activity.id} className="flex gap-3">
                        {/* Timeline Line */}
                        <div className="relative flex flex-col items-center">
                          <div
                            className={`w-8 h-8 rounded-full ${color} flex items-center justify-center flex-shrink-0`}
                          >
                            <Icon className="w-4 h-4 text-white" />
                          </div>
                          {index < dayActivities.length - 1 && (
                            <div className="w-0.5 flex-1 bg-border mt-1" />
                          )}
                        </div>

                        {/* Activity Content */}
                        <div className="flex-1 pb-4">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium">
                              {activity.action}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(activity.created_at)}
                            </span>
                          </div>

                          {activity.details && (
                            <div className="text-sm text-muted-foreground space-y-1">
                              {activity.details.subject && (
                                <p className="flex items-center gap-1">
                                  <Mail className="w-3 h-3" />
                                  {activity.details.subject}
                                </p>
                              )}
                              {activity.details.status_change && (
                                <p className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3" />
                                  {activity.details.status_change}
                                </p>
                              )}
                              {activity.details.offer_price && (
                                <p className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ${Number(activity.details.offer_price).toLocaleString()}
                                </p>
                              )}
                              {activity.details.property_address && (
                                <p className="flex items-center gap-1">
                                  <Building className="w-3 h-3" />
                                  {activity.details.property_address}
                                </p>
                              )}
                              {activity.details.agent_name && (
                                <p className="flex items-center gap-1">
                                  <User className="w-3 h-3" />
                                  {activity.details.agent_name}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
