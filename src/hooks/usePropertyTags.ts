import { useState, useEffect, useCallback } from "react"
import { createClient } from "@/lib/supabase"

export interface PropertyTag {
  id: string
  account_id: string
  tag_name: string
  color: string
  created_at: string
}

export interface PropertyTagAssignment {
  id: string
  property_id: string
  tag_id: string
  account_id: string
  created_at: string
  tag?: PropertyTag
}

export function usePropertyTags() {
  const [tags, setTags] = useState<PropertyTag[]>([])
  const [assignments, setAssignments] = useState<PropertyTagAssignment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Fetch all tags and assignments for current account
  const fetchTags = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return

      // Fetch tags
      const { data: tagsData, error: tagsError } = await supabase
        .from("property_tags")
        .select("*")
        .order("tag_name")

      if (tagsError) throw tagsError
      setTags(tagsData || [])

      // Fetch assignments with tag data
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from("property_tag_assignments")
        .select(`
          *,
          tag:tag_id (
            id,
            tag_name,
            color
          )
        `)

      if (assignmentsError) throw assignmentsError
      setAssignments(assignmentsData || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tags")
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  // Create a new tag
  const createTag = async (tagName: string, color: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      const { data, error } = await supabase
        .from("property_tags")
        .insert({
          account_id: session.user.id,
          tag_name: tagName,
          color: color
        })
        .select()
        .single()

      if (error) throw error
      setTags(prev => [...prev, data])
      return data
    } catch (err) {
      throw err
    }
  }

  // Update a tag
  const updateTag = async (tagId: string, updates: { tag_name?: string; color?: string }) => {
    try {
      const { data, error } = await supabase
        .from("property_tags")
        .update(updates)
        .eq("id", tagId)
        .select()
        .single()

      if (error) throw error
      setTags(prev => prev.map(t => t.id === tagId ? data : t))
      return data
    } catch (err) {
      throw err
    }
  }

  // Delete a tag
  const deleteTag = async (tagId: string) => {
    try {
      const { error } = await supabase
        .from("property_tags")
        .delete()
        .eq("id", tagId)

      if (error) throw error
      setTags(prev => prev.filter(t => t.id !== tagId))
      setAssignments(prev => prev.filter(a => a.tag_id !== tagId))
    } catch (err) {
      throw err
    }
  }

  // Assign a tag to a property
  const assignTag = async (propertyId: string, tagId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error("Not authenticated")

      // Check if already assigned
      const existing = assignments.find(
        a => a.property_id === propertyId && a.tag_id === tagId
      )
      if (existing) return existing

      const { data, error } = await supabase
        .from("property_tag_assignments")
        .insert({
          property_id: propertyId,
          tag_id: tagId,
          account_id: session.user.id
        })
        .select(`
          *,
          tag:tag_id (
            id,
            tag_name,
            color
          )
        `)
        .single()

      if (error) throw error
      setAssignments(prev => [...prev, data])
      return data
    } catch (err) {
      throw err
    }
  }

  // Remove a tag from a property
  const removeTag = async (propertyId: string, tagId: string) => {
    try {
      const { error } = await supabase
        .from("property_tag_assignments")
        .delete()
        .eq("property_id", propertyId)
        .eq("tag_id", tagId)

      if (error) throw error
      setAssignments(prev => prev.filter(
        a => !(a.property_id === propertyId && a.tag_id === tagId)
      ))
    } catch (err) {
      throw err
    }
  }

  // Get tags for a specific property
  const getTagsForProperty = (propertyId: string): PropertyTag[] => {
    return assignments
      .filter(a => a.property_id === propertyId)
      .map(a => a.tag)
      .filter((t): t is PropertyTag => t !== undefined)
  }

  // Get properties for a specific tag
  const getPropertyIdsForTag = (tagId: string): string[] => {
    return assignments
      .filter(a => a.tag_id === tagId)
      .map(a => a.property_id)
  }

  return {
    tags,
    assignments,
    loading,
    error,
    createTag,
    updateTag,
    deleteTag,
    assignTag,
    removeTag,
    getTagsForProperty,
    getPropertyIdsForTag,
    refreshTags: fetchTags
  }
}
