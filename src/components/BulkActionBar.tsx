import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { X, Send, Tag, Archive, CheckCircle, Mail } from "lucide-react"
import { usePropertyTags } from "@/hooks/usePropertyTags"

interface BulkActionBarProps {
  selectedIds: string[]
  onClear: () => void
  onBulkAction: (action: string, payload?: any) => Promise<void>
  entityType?: "properties" | "deals" | "offers"
}

export default function BulkActionBar({
  selectedIds,
  onClear,
  onBulkAction,
  entityType = "properties",
}: BulkActionBarProps) {
  const [actionDialog, setActionDialog] = useState<"status" | "tag" | "archive" | "email" | null>(null)
  const [newStatus, setNewStatus] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)

  const { tags, assignTag } = usePropertyTags()

  const handleBulkAction = async (action: string, payload?: any) => {
    setIsProcessing(true)
    try {
      await onBulkAction(action, payload)
      setActionDialog(null)
      onClear()
    } catch (error) {
      console.error("Bulk action failed:", error)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <>
      {selectedIds.length > 0 && (
        <Card className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 p-4 bg-background border shadow-lg animate-in slide-in-from-bottom-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {selectedIds.length} selected
              </Badge>
              <Button variant="ghost" size="sm" onClick={onClear}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="h-6 w-px bg-border" />

            {/* Status Update */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <CheckCircle className="w-4 h-4 mr-1" />
                  Update Status
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setActionDialog("status")}>
                  Set Pipeline Status
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Tags */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Tag className="w-4 h-4 mr-1" />
                  Add Tags
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {tags.map((tag) => (
                  <DropdownMenuItem
                    key={tag.id}
                    onClick={() =>
                      handleBulkAction("add_tag", { tagId: tag.id, tagName: tag.tag_name })
                    }
                  >
                    <div
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.tag_name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Send Email */}
            <Button variant="outline" size="sm" onClick={() => setActionDialog("email")}>
              <Mail className="w-4 h-4 mr-1" />
              Send Email
            </Button>

            {/* Archive */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleBulkAction("archive")}
            >
              <Archive className="w-4 h-4 mr-1" />
              Archive
            </Button>
          </div>
        </Card>
      )}

      {/* Status Update Dialog */}
      <Dialog open={actionDialog === "status"} onOpenChange={(o) => !o && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Status for {selectedIds.length} Properties</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>New Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PENDING_RESEARCH">Pending Research</SelectItem>
                  <SelectItem value="RESEARCHING">Researching</SelectItem>
                  <SelectItem value="RESEARCH_COMPLETE">Research Complete</SelectItem>
                  <SelectItem value="UNDERWRITING">Underwriting</SelectItem>
                  <SelectItem value="UNDERWRITING_COMPLETE">Underwriting Complete</SelectItem>
                  <SelectItem value="OFFER_GENERATED">Offer Generated</SelectItem>
                  <SelectItem value="OFFER_SENT">Offer Sent</SelectItem>
                  <SelectItem value="UNDER_CONTRACT">Under Contract</SelectItem>
                  <SelectItem value="CLOSED">Closed</SelectItem>
                  <SelectItem value="REJECTED">Rejected</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleBulkAction("update_status", { status: newStatus })}
              disabled={!newStatus || isProcessing}
            >
              {isProcessing ? "Updating..." : "Update Status"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={actionDialog === "email"} onOpenChange={(o) => !o && setActionDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Email to {selectedIds.length} Properties</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">
              This will send follow-up emails to all selected properties.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog(null)}>
              Cancel
            </Button>
            <Button onClick={() => handleBulkAction("send_email")}>
              <Send className="w-4 h-4 mr-1" />
              Send Emails
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
