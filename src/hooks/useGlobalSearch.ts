import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface SearchResult {
  type: "property" | "email" | "agent" | "deal" | "offer"
  id: string
  title: string
  subtitle?: string
  metadata?: Record<string, any>
}

export function useGlobalSearch() {
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")

  const search = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const searchResults: SearchResult[] = []

      // Search properties by address, city, state
      const { data: properties } = await supabase
        .from("properties")
        .select("property_id, address, city, state, listing_price, listing_agent_email, listing_agent_phone, pipeline_status")
        .eq("account_id", user.id)
        .or(`address.ilike.%${searchQuery}%,city.ilike.%${searchQuery}%,zip.ilike.%${searchQuery}%`)
        .limit(10)

      properties?.forEach((p) => {
        searchResults.push({
          type: "property",
          id: p.property_id,
          title: p.address,
          subtitle: `${p.city}, ${p.state} ${p.zip} • $${Number(p.listing_price).toLocaleString()}`,
          metadata: {
            status: p.pipeline_status,
            email: p.listing_agent_email,
            phone: p.listing_agent_phone,
          },
        })
      })

      // Search communications (emails) by subject or body
      const { data: communications } = await supabase
        .from("communications")
        .select("id, subject, body, recipient_email, recipient_name, property_id, created_at")
        .eq("account_id", user.id)
        .or(`subject.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`)
        .limit(10)

      communications?.forEach((c) => {
        searchResults.push({
          type: "email",
          id: c.id,
          title: c.subject || "(No Subject)",
          subtitle: `${c.recipient_name || c.recipient_email} • ${new Date(c.created_at).toLocaleDateString()}`,
          metadata: {
            property_id: c.property_id,
            body: c.body?.substring(0, 200),
          },
        })
      })

      // Search agents/brokers
      const { data: agents } = await supabase
        .from("properties")
        .select("agent_name, agent_email, agent_phone, brokerage_name")
        .eq("account_id", user.id)
        .not("agent_name", "is", null)
        .or(`agent_name.ilike.%${searchQuery}%,agent_email.ilike.%${searchQuery}%,brokerage_name.ilike.%${searchQuery}%`)
        .limit(10)

      const seenAgents = new Set<string>()
      agents?.forEach((a) => {
        if (a.agent_name && !seenAgents.has(a.agent_name)) {
          seenAgents.add(a.agent_name)
          searchResults.push({
            type: "agent",
            id: a.agent_email || a.agent_name,
            title: a.agent_name,
            subtitle: a.brokerage_name || a.agent_email,
            metadata: {
              email: a.agent_email,
              phone: a.agent_phone,
            },
          })
        }
      })

      // Search offers
      const { data: offers } = await supabase
        .from("offers")
        .select("id, offer_id, property_id, offer_price, status, created_at")
        .eq("account_id", user.id)
        .ilike("offer_id", `%${searchQuery}%`)
        .limit(5)

      offers?.forEach((o) => {
        searchResults.push({
          type: "offer",
          id: o.offer_id,
          title: `Offer ${o.offer_id}`,
          subtitle: `$${Number(o.offer_price).toLocaleString()} • ${o.status}`,
          metadata: {
            property_id: o.property_id,
            status: o.status,
          },
        })
      })

      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  // Debounced search
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (query.trim()) {
        search(query)
      } else {
        setResults([])
      }
    }, 300)

    return () => clearTimeout(timeout)
  }, [query, search])

  return {
    results,
    loading,
    query,
    setQuery,
    search,
  }
}
