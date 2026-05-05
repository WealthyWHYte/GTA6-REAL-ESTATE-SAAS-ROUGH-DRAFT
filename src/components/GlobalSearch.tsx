import { useState, useEffect } from "react"
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command"
import { supabase } from "@/lib/supabase"
import {
  Building,
  Mail,
  User,
  FileText,
  MapPin,
  DollarSign,
  Phone,
} from "lucide-react"
import { useNavigate } from "react-router-dom"

interface SearchResult {
  type: "property" | "email" | "agent" | "deal"
  id: string
  title: string
  subtitle?: string
  address?: string
  email?: string
  phone?: string
}

interface GlobalSearchProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate()
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const searchTimeout = setTimeout(() => {
      performSearch(query)
    }, 300)

    return () => clearTimeout(searchTimeout)
  }, [query])

  const performSearch = async (searchQuery: string) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const searchResults: SearchResult[] = []

      // Search properties
      const { data: properties } = await supabase
        .from("properties")
        .select("property_id, address, city, state, listing_price, listing_agent_email, listing_agent_phone")
        .ilike("address", `%${searchQuery}%`)
        .limit(5)

      properties?.forEach((p) => {
        searchResults.push({
          type: "property",
          id: p.property_id,
          title: p.address,
          subtitle: `${p.city}, ${p.state}`,
          address: p.address,
          email: p.listing_agent_email || undefined,
          phone: p.listing_agent_phone || undefined,
        })
      })

      // Search communications (emails)
      const { data: communications } = await supabase
        .from("communications")
        .select("id, subject, body, recipient_email, recipient_name, property_id")
        .eq("account_id", user.id)
        .or(`subject.ilike.%${searchQuery}%,body.ilike.%${searchQuery}%`)
        .limit(5)

      communications?.forEach((c) => {
        searchResults.push({
          type: "email",
          id: c.id,
          title: c.subject || "No Subject",
          subtitle: c.recipient_name || c.recipient_email,
        })
      })

      // Search agents (from properties)
      const { data: agents } = await supabase
        .from("properties")
        .select("agent_name, agent_email, agent_phone")
        .not("agent_name", "is", null)
        .or(`agent_name.ilike.%${searchQuery}%,agent_email.ilike.%${searchQuery}%`)
        .limit(5)

      const seenAgents = new Set<string>()
      agents?.forEach((a) => {
        if (a.agent_name && !seenAgents.has(a.agent_name)) {
          seenAgents.add(a.agent_name)
          searchResults.push({
            type: "agent",
            id: a.agent_email || a.agent_name,
            title: a.agent_name,
            email: a.agent_email || undefined,
            phone: a.agent_phone || undefined,
          })
        }
      })

      setResults(searchResults)
    } catch (error) {
      console.error("Search error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (result: SearchResult) => {
    onOpenChange(false)

    switch (result.type) {
      case "property":
        navigate(`/heist-mission/${result.id}`)
        break
      case "email":
        // Navigate to email thread or property
        console.log("Navigate to email:", result.id)
        break
      case "agent":
        navigate("/agent/email-closer")
        break
      case "deal":
        navigate(`/deals/${result.id}`)
        break
    }
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "property":
        return <Building className="w-4 h-4" />
      case "email":
        return <Mail className="w-4 h-4" />
      case "agent":
        return <User className="w-4 h-4" />
      case "deal":
        return <FileText className="w-4 h-4" />
      default:
        return <Building className="w-4 h-4" />
    }
  }

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search properties, emails, agents..."
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        <CommandEmpty>
          {loading ? "Searching..." : "No results found."}
        </CommandEmpty>

        {results.filter((r) => r.type === "property").length > 0 && (
          <>
            <CommandGroup heading="Properties">
              {results
                .filter((r) => r.type === "property")
                .map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                  >
                    <Building className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {results.filter((r) => r.type === "email").length > 0 && (
          <>
            <CommandGroup heading="Emails">
              {results
                .filter((r) => r.type === "email")
                .map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                  >
                    <Mail className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.subtitle && (
                        <div className="text-xs text-muted-foreground">
                          {result.subtitle}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
            <CommandSeparator />
          </>
        )}

        {results.filter((r) => r.type === "agent").length > 0 && (
          <>
            <CommandGroup heading="Agents">
              {results
                .filter((r) => r.type === "agent")
                .map((result) => (
                  <CommandItem
                    key={result.id}
                    value={result.title}
                    onSelect={() => handleSelect(result)}
                  >
                    <User className="w-4 h-4 mr-2 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="font-medium">{result.title}</div>
                      {result.email && (
                        <div className="text-xs text-muted-foreground">
                          {result.email}
                        </div>
                      )}
                    </div>
                  </CommandItem>
                ))}
            </CommandGroup>
          </>
        )}
      </CommandList>
    </CommandDialog>
  )
}
