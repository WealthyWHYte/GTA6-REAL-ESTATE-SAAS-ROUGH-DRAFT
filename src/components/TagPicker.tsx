import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, X, Tag as TagIcon } from "lucide-react"
import { usePropertyTags, PropertyTag } from "@/hooks/usePropertyTags"

interface TagPickerProps {
  propertyId: string
  onTagChange?: () => void
}

export default function TagPicker({ propertyId, onTagChange }: TagPickerProps) {
  const { tags, getTagsForProperty, assignTag, removeTag, createTag } = usePropertyTags()
  const [open, setOpen] = useState(false)
  const [newTagName, setNewTagName] = useState("")
  const [newTagColor, setNewTagColor] = useState("#6366f1")
  const [creating, setCreating] = useState(false)

  const currentTags = getTagsForProperty(propertyId)

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    setCreating(true)
    try {
      await createTag(newTagName.trim(), newTagColor)
      setNewTagName("")
    } catch (error) {
      console.error("Failed to create tag:", error)
    } finally {
      setCreating(false)
    }
  }

  const handleToggleTag = async (tag: PropertyTag) => {
    const isAssigned = currentTags.some(t => t.id === tag.id)
    if (isAssigned) {
      await removeTag(propertyId, tag.id)
    } else {
      await assignTag(propertyId, tag.id)
    }
    onTagChange?.()
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <TagIcon className="w-3.5 h-3.5" />
          Tags
          {currentTags.length > 0 && (
            <span className="ml-1 text-xs bg-primary text-primary-foreground rounded-full px-1.5 py-0.5">
              {currentTags.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2 space-y-2">
          {/* Current Tags */}
          {currentTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {currentTags.map(tag => (
                <Badge
                  key={tag.id}
                  variant="outline"
                  className="cursor-pointer hover:opacity-70"
                  style={{
                    backgroundColor: `${tag.color}20`,
                    borderColor: tag.color,
                    color: tag.color
                  }}
                  onClick={() => handleToggleTag(tag)}
                >
                  {tag.tag_name}
                  <X className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Tag List */}
          <div className="max-h-48 overflow-y-auto space-y-1">
            {tags.map(tag => {
              const isAssigned = currentTags.some(t => t.id === tag.id)
              return (
                <DropdownMenuItem
                  key={tag.id}
                  onClick={() => handleToggleTag(tag)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-2 w-full">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: tag.color }}
                    />
                    <span className="flex-1">{tag.tag_name}</span>
                    {isAssigned && (
                      <Badge variant="secondary" className="text-xs">
                        Added
                      </Badge>
                    )}
                  </div>
                </DropdownMenuItem>
              )
            })}
          </div>

          {/* Create New Tag */}
          <DropdownMenuSeparator />
          <div className="p-2 space-y-2">
            <p className="text-xs text-muted-foreground">Create New Tag</p>
            <div className="space-y-2">
              <Input
                placeholder="Tag name..."
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateTag()}
                className="h-8"
              />
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <Label htmlFor="tag-color" className="text-xs">Color:</Label>
                  <input
                    id="tag-color"
                    type="color"
                    value={newTagColor}
                    onChange={(e) => setNewTagColor(e.target.value)}
                    className="w-6 h-6 rounded cursor-pointer"
                  />
                </div>
                <Button
                  size="sm"
                  onClick={handleCreateTag}
                  disabled={!newTagName.trim() || creating}
                  className="flex-1 h-8"
                >
                  <Plus className="w-3.5 h-3.5 mr-1" />
                  Add
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
