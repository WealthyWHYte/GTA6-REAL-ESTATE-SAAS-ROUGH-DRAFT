import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Clock } from "lucide-react"

interface SnoozeDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSnooze: (until: Date, reason: string) => Promise<void>
  propertyAddress?: string
}

const PRESET_OPTIONS = [
  { value: "1day", label: "1 Day", hours: 24 },
  { value: "3days", label: "3 Days", hours: 72 },
  { value: "1week", label: "1 Week", hours: 168 },
  { value: "2weeks", label: "2 Weeks", hours: 336 },
  { value: "1month", label: "1 Month", hours: 720 },
]

export default function SnoozeDialog({ open, onOpenChange, onSnooze, propertyAddress }: SnoozeDialogProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("3days")
  const [customDate, setCustomDate] = useState<Date | undefined>(undefined)
  const [reason, setReason] = useState("")
  const [isSnoozing, setIsSnoozing] = useState(false)

  const getSnoozeDate = () => {
    if (customDate) return customDate

    const preset = PRESET_OPTIONS.find((p) => p.value === selectedPreset)
    if (!preset) return new Date(Date.now() + 24 * 60 * 60 * 1000)

    return new Date(Date.now() + preset.hours * 60 * 60 * 1000)
  }

  const handleSnooze = async () => {
    setIsSnoozing(true)
    try {
      await onSnooze(getSnoozeDate(), reason)
      onOpenChange(false)
      setReason("")
      setCustomDate(undefined)
    } catch (error) {
      console.error("Failed to snooze:", error)
    } finally {
      setIsSnoozing(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Snooze Deal
          </DialogTitle>
          <DialogDescription>
            {propertyAddress ? `Temporarily hide "${propertyAddress}" from your active deals.` : "Temporarily hide this deal from your active deals."}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="preset" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="preset">Quick Select</TabsTrigger>
            <TabsTrigger value="custom">Custom Date</TabsTrigger>
          </TabsList>

          <TabsContent value="preset" className="space-y-4 mt-4">
            <RadioGroup value={selectedPreset} onValueChange={setSelectedPreset}>
              {PRESET_OPTIONS.map((option) => (
                <div
                  key={option.value}
                  className="flex items-center space-x-2 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => setSelectedPreset(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </TabsContent>

          <TabsContent value="custom" className="mt-4">
            <div className="flex justify-center">
              <Calendar
                mode="single"
                selected={customDate}
                onSelect={setCustomDate}
                disabled={(date) => date < new Date()}
                className="border rounded-lg"
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="space-y-2 mt-4">
          <Label htmlFor="snooze-reason">Reason (optional)</Label>
          <Textarea
            id="snooze-reason"
            placeholder="Why are you snoozing this deal? (e.g., 'Waiting for buyer financing', 'Seller needs time to decide')"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <div className="p-3 bg-muted/50 rounded-lg text-sm">
          <p className="text-muted-foreground">
            This deal will be hidden until{" "}
            <span className="font-medium text-foreground">
              {getSnoozeDate().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "numeric",
                minute: "2-digit",
              })}
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSnooze} disabled={isSnoozing}>
            {isSnoozing ? "Snoozing..." : "Snooze Deal"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
