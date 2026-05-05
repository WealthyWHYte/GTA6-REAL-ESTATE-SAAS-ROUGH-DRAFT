import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Plus, Edit, Trash2, Tag as TagIcon } from "lucide-react"
import { usePropertyTags } from "@/hooks/usePropertyTags"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface TagManagerProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export default function TagManager({ open, onOpenChange }: TagManagerProps) {
  const { tags, createTag, updateTag, deleteTag } = usePropertyTags()
  const [creating, setCreating] = useState(false)
  const [editingTag, setEditingTag] = useState<{ id: string; name: string; color: string } | null>(null)
  const [deletingTag, setDeletingTag] = useState<string | null>(null)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#6366f1")

  const handleCreate = async () => {
    if (!newTagName.trim()) return
    setCreating(true)
    try {
      await createTag(newTagName.trim(), newTagColor)
      setNewTagName("")
      setNewTagColor("#6366f1")
    } catch (error) {
      console.error("Failed to create tag:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleUpdate = async () => {
    if (!editingTag) return
    setCreating(true)
    try {
      await updateTag(editingTag.id, {
        tag_name: editingTag.name,
        color: editingTag.color
      })
      setEditingTag(null)
    } catch (error) {
      console.error("Failed to update tag:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleDelete = async () => {
    if (!deletingTag) return
    try {
      await deleteTag(deletingTag)
      setDeletingTag(null)
    } catch (error) {
      console.error("Failed to delete tag:", error)
    }
  }

  const startEdit = (tag: typeof tags[0]) => {
    setEditingTag({
      id: tag.id,
      name: tag.tag_name,
      color: tag.color
    })
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TagIcon className="w-5 h-5" />
              Manage Tags
            </DialogTitle>
            <DialogDescription>
              Create and manage tags to organize your properties. Tags help you quickly identify hot leads, objections, and more.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Create New Tag */}
            <div className="p-4 border rounded-lg bg-muted/30">
              <h4 className="text-sm font-medium mb-3">Create New Tag</h4>
              <div className="flex gap-3 items-end">
                <div className="flex-1 space-y-1">
                  <Label htmlFor="tag-name">Tag Name</Label>
                  <Input
                    id="tag-name"
                    placeholder="e.g., Hot Lead, Price Objection"
                    value={newTagName}
                    onChange={(e) => setNewTagName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="tag-color">Color</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      id="tag-color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-10 h-10 rounded cursor-pointer border"
                    />
                    <Button onClick={handleCreate} disabled={!newTagName.trim() || creating}>
                      <Plus className="w-4 h-4 mr-1" />
                      Add Tag
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags Table */}
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Color</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Preview</TableHead>
                    <TableHead className="w-24">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No tags yet. Create your first tag above.
                      </TableCell>
                    </TableRow>
                  ) : (
                    tags.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          <div
                            className="w-8 h-8 rounded border"
                            style={{ backgroundColor: tag.color }}
                          />
                        </TableCell>
                        <TableCell className="font-medium">{tag.tag_name}</TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: `${tag.color}20`,
                              borderColor: tag.color,
                              color: tag.color
                            }}
                          >
                            {tag.tag_name}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => startEdit(tag)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingTag(tag.id)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => onOpenChange?.(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editingTag} onOpenChange={(o) => !o && setEditingTag(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tag</DialogTitle>
            <DialogDescription>
              Update the tag name and color.
            </DialogDescription>
          </DialogHeader>
          {editingTag && (
            <div className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="edit-name">Tag Name</Label>
                <Input
                  id="edit-name"
                  value={editingTag.name}
                  onChange={(e) => setEditingTag({ ...editingTag, name: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="edit-color">Color</Label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    id="edit-color"
                    value={editingTag.color}
                    onChange={(e) => setEditingTag({ ...editingTag, color: e.target.value })}
                    className="w-10 h-10 rounded cursor-pointer border"
                  />
                  <span className="text-sm text-muted-foreground">{editingTag.color}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingTag(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={creating}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingTag} onOpenChange={(o) => !o && setDeletingTag(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Tag</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this tag? This will remove it from all properties.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
