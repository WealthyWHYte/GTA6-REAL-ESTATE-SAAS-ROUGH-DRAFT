import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { format } from "date-fns"

const EVENT_TYPES = [
  { value: "showing", label: "Property Showing", color: "bg-blue-500" },
  { value: "inspection", label: "Inspection", color: "bg-yellow-500" },
  { value: "closing", label: "Closing", color: "bg-green-500" },
  { value: "call", label: "Phone Call", color: "bg-purple-500" },
  { value: "meeting", label: "Meeting", color: "bg-orange-500" },
  { value: "follow_up", label: "Follow-up", color: "bg-pink-500" },
  { value: "deadline", label: "Deadline", color: "bg-red-500" },
  { value: "other", label: "Other", color: "bg-gray-500" },
]

interface CalendarEvent {
  id: string
  account_id: string
  event_type: string
  title: string
  description?: string
  location?: string
  start_time: string
  end_time?: string
  all_day: boolean
  property_id?: string
  contact_name?: string
  contact_email?: string
  contact_phone?: string
  status: string
  created_at: string
}

export default function CalendarPage() {
  const queryClient = useQueryClient()
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [newEvent, setNewEvent] = useState({
    event_type: "showing",
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    all_day: false,
    property_id: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
  })

  const { data: events = [] } = useQuery({
    queryKey: ["calendar-events", selectedDate],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const startOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)
      const endOfMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0)

      const { data } = await supabase
        .from("calendar_events")
        .select("*")
        .eq("account_id", user.id)
        .gte("start_time", startOfMonth.toISOString())
        .lte("start_time", endOfMonth.toISOString())
        .order("start_time", { ascending: true })

      return data || []
    },
  })

  const createEventMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("calendar_events")
        .insert({
          account_id: user.id,
          ...newEvent,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] })
      setIsCreating(false)
      setNewEvent({
        event_type: "showing",
        title: "",
        description: "",
        location: "",
        start_time: "",
        end_time: "",
        all_day: false,
        property_id: "",
        contact_name: "",
        contact_email: "",
        contact_phone: "",
      })
    },
  })

  const updateEventStatusMutation = useMutation({
    mutationFn: async ({ eventId, status }: { eventId: string; status: string }) => {
      const { error } = await supabase
        .from("calendar_events")
        .update({ status })
        .eq("id", eventId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] })
      setSelectedEvent(null)
    },
  })

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      const { error } = await supabase
        .from("calendar_events")
        .delete()
        .eq("id", eventId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["calendar-events"] })
      setSelectedEvent(null)
    },
  })

  const handleCreateEvent = () => {
    if (!newEvent.title || !newEvent.start_time) return
    createEventMutation.mutate()
  }

  const eventsForSelectedDate = events.filter(
    (e) => new Date(e.start_time).toDateString() === selectedDate.toDateString()
  )

  const getEventType = (type: string) => {
    return EVENT_TYPES.find((t) => t.value === type) || EVENT_TYPES[EVENT_TYPES.length - 1]
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gta-blue mb-2 flex items-center gap-3">
              <CalendarIcon className="w-8 h-8" />
              Calendar
            </h1>
            <p className="text-muted-foreground">
              Schedule showings, closings, and follow-ups
            </p>
          </div>
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{format(selectedDate, "MMMM yyyy")}</CardTitle>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border"
              />
              <div className="mt-4 space-y-2">
                <h4 className="font-medium text-sm">
                  {eventsForSelectedDate.length} events on{" "}
                  {format(selectedDate, "MMM d, yyyy")}
                </h4>
              </div>
            </CardContent>
          </Card>

          {/* Events List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>
                Events on {format(selectedDate, "MMMM d, yyyy")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {eventsForSelectedDate.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No events scheduled for this day
                </p>
              ) : (
                <div className="space-y-3">
                  {eventsForSelectedDate.map((event) => {
                    const eventType = getEventType(event.event_type)
                    return (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedEvent(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`w-3 h-3 rounded-full mt-1.5 ${eventType.color}`}
                            />
                            <div className="flex-1">
                              <h4 className="font-medium">{event.title}</h4>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                {!event.all_day && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {formatTime(event.start_time)}
                                    {event.end_time && ` - ${formatTime(event.end_time)}`}
                                  </span>
                                )}
                                {event.location && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {event.location}
                                  </span>
                                )}
                              </div>
                              {event.contact_name && (
                                <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3 h-3" />
                                    {event.contact_name}
                                  </span>
                                  {event.contact_phone && (
                                    <span className="flex items-center gap-1">
                                      <Phone className="w-3 h-3" />
                                      {event.contact_phone}
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                          <Badge
                            variant="outline"
                            className={
                              event.status === "completed"
                                ? "bg-green-500/20 text-green-500 border-green-500"
                                : event.status === "cancelled"
                                ? "bg-red-500/20 text-red-500 border-red-500"
                                : "bg-blue-500/20 text-blue-500 border-blue-500"
                            }
                          >
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Create Event Dialog */}
      <Dialog open={isCreating} onOpenChange={(o) => !o && setIsCreating(false)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Create New Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={newEvent.event_type}
                onValueChange={(v) => setNewEvent({ ...newEvent, event_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newEvent.title}
                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                placeholder="e.g., Property Showing - 123 Main St"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newEvent.description}
                onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                placeholder="Additional details..."
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.start_time}
                  onChange={(e) => setNewEvent({ ...newEvent, start_time: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>End Time (optional)</Label>
                <Input
                  type="datetime-local"
                  value={newEvent.end_time}
                  onChange={(e) => setNewEvent({ ...newEvent, end_time: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                value={newEvent.location}
                onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                placeholder="Property address or meeting location"
              />
            </div>
            <div className="space-y-2">
              <Label>Contact Name</Label>
              <Input
                value={newEvent.contact_name}
                onChange={(e) => setNewEvent({ ...newEvent, contact_name: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Contact Email</Label>
                <Input
                  type="email"
                  value={newEvent.contact_email}
                  onChange={(e) => setNewEvent({ ...newEvent, contact_email: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Contact Phone</Label>
                <Input
                  type="tel"
                  value={newEvent.contact_phone}
                  onChange={(e) => setNewEvent({ ...newEvent, contact_phone: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateEvent} disabled={createEventMutation.isPending}>
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View/Edit Event Dialog */}
      <Dialog open={!!selectedEvent} onOpenChange={(o) => !o && setSelectedEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{selectedEvent?.title}</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                {formatTime(selectedEvent.start_time)}
              </div>
              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4" />
                  {selectedEvent.location}
                </div>
              )}
              {selectedEvent.description && (
                <p className="text-sm text-muted-foreground">{selectedEvent.description}</p>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateEventStatusMutation.mutate({
                      eventId: selectedEvent.id,
                      status: "completed",
                    })
                  }
                >
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Mark Complete
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateEventStatusMutation.mutate({
                      eventId: selectedEvent.id,
                      status: "cancelled",
                    })
                  }
                >
                  <XCircle className="w-4 h-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteEventMutation.mutate(selectedEvent.id)}
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
