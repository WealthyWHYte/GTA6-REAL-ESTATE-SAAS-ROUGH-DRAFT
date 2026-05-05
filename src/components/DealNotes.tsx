import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { FileText, Plus, Trash2, Edit } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DealNotesProps {
  propertyId: string
}

interface Note {
  id: string
  account_id: string
  property_id: string
  content: string
  note_type: "general" | "showing" | "negotiation" | "inspection" | "repair" | "other"
  created_at: string
  updated_at: string
}

const NOTE_TYPES = [
  { value: "general", label: "General" },
  { value: "showing", label: "Showing" },
  { value: "negotiation", label: "Negotiation" },
  { value: "inspection", label: "Inspection" },
  { value: "repair", label: "Repair" },
  { value: "other", label: "Other" },
]

export default function DealNotes({ propertyId }: DealNotesProps) {
  const queryClient = useQueryClient()
  const [newNote, setNewNote] = useState("")
  const [noteType, setNoteType] = useState<"general" | "showing" | "negotiation" | "inspection" | "repair" | "other">("general")
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const [editContent, setEditContent] = useState("")

  const { data: notes = [] } = useQuery({
    queryKey: ["property-notes", propertyId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      const { data } = await supabase
        .from("property_notes")
        .select("*")
        .eq("property_id", propertyId)
        .eq("account_id", user.id)
        .order("created_at", { ascending: false })
      return data || []
    },
  })

  const addNoteMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || !newNote.trim()) throw new Error("No note content")

      const { data, error } = await supabase
        .from("property_notes")
        .insert({
          account_id: user.id,
          property_id: propertyId,
          content: newNote.trim(),
          note_type: noteType,
        })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-notes", propertyId] })
      setNewNote("")
      setNoteType("general")
    },
  })

  const updateNoteMutation = useMutation({
    mutationFn: async ({ id, content, note_type }: { id: string; content: string; note_type: string }) => {
      const { data, error } = await supabase
        .from("property_notes")
        .update({ content, note_type })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-notes", propertyId] })
      setEditingNote(null)
      setEditContent("")
    },
  })

  const deleteNoteMutation = useMutation({
    mutationFn: async (noteId: string) => {
      const { error } = await supabase
        .from("property_notes")
        .delete()
        .eq("id", noteId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-notes", propertyId] })
    },
  })

  const handleAddNote = () => {
    if (!newNote.trim()) return
    addNoteMutation.mutate()
  }

  const handleStartEdit = (note: Note) => {
    setEditingNote(note)
    setEditContent(note.content)
  }

  const handleSaveEdit = () => {
    if (!editingNote || !editContent.trim()) return
    updateNoteMutation.mutate({
      id: editingNote.id,
      content: editContent.trim(),
      note_type: editingNote.note_type,
    })
  }

  const getNoteTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      general: "bg-gray-500/20 text-gray-500 border-gray-500",
      showing: "bg-blue-500/20 text-blue-500 border-blue-500",
      negotiation: "bg-purple-500/20 text-purple-500 border-purple-500",
      inspection: "bg-yellow-500/20 text-yellow-500 border-yellow-500",
      repair: "bg-orange-500/20 text-orange-500 border-orange-500",
      other: "bg-slate-500/20 text-slate-500 border-slate-500",
    }
    return colors[type] || colors.general
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="w-5 h-5" />
            Notes ({notes.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Note Form */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Select value={noteType} onValueChange={(v: any) => setNoteType(v)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                onClick={handleAddNote}
                disabled={!newNote.trim() || addNoteMutation.isPending}
                size="sm"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Note
              </Button>
            </div>
            <Textarea
              placeholder="Add a note about this property..."
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Notes List */}
          <ScrollArea className="h-[400px]">
            <div className="space-y-3">
              {notes.length === 0 ? (
                <p className="text-muted-foreground text-center py-8 text-sm">
                  No notes yet. Add your first note above.
                </p>
              ) : (
                notes.map((note) => (
                  <div
                    key={note.id}
                    className="p-3 border rounded-lg bg-muted/30 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getNoteTypeColor(note.note_type)}>
                          {note.note_type}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(note.created_at)}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleStartEdit(note)}
                          className="h-8 w-8 p-0"
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteNoteMutation.mutate(note.id)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{note.content}</p>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingNote} onOpenChange={(o) => !o && setEditingNote(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Note</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Note Type</Label>
              <Select
                value={editingNote?.note_type}
                onValueChange={(v: any) =>
                  setEditingNote(editingNote ? { ...editingNote, note_type: v } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {NOTE_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Content</Label>
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingNote(null)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={updateNoteMutation.isPending}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
