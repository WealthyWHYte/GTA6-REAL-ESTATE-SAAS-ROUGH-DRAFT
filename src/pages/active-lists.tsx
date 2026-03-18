import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
  ArrowLeft, Upload, Search, BarChart3,
  Settings, ChevronRight, FileText, CheckCircle, Home
} from "lucide-react"
import NavigationHeader from "@/components/NavigationHeader"

export default function ActiveListsPage() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState("")

  // Fetch real datasets from Supabase
  const { data: datasets, isLoading } = useQuery({
    queryKey: ['datasets'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []
      
      const { data } = await supabase
        .from('datasets')
        .select('*')
        .eq('account_id', user.id)
        .order('created_at', { ascending: false })
      return data || []
    }
  })

  const filteredLists = datasets?.filter((list: any) =>
    list.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    list.file_name?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const formatDate = (date: string) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString()
  }

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '0'
    return num.toLocaleString()
  }

  const getStatusBadge = (status: string) => {
    const config: Record<string, { color: string; icon: string }> = {
      processing: { color: 'border-vice-orange text-vice-orange', icon: '⚙️' },
      processed: { color: 'border-vice-green text-vice-green', icon: '✅' },
      complete: { color: 'border-vice-green text-vice-green', icon: '✅' },
      failed: { color: 'border-vice-pink text-vice-pink', icon: '❌' },
      uploading: { color: 'border-vice-cyan text-vice-cyan', icon: '📤' }
    }
    const c = config[status?.toLowerCase()] || config.processing
    return (
      <Badge variant="outline" className={c.color}>
        {c.icon} {status?.toUpperCase() || 'PROCESSING'}
      </Badge>
    )
  }

  const getProgress = (list: any) => {
    const total = list.total_properties || list.row_count || 0
    const processed = list.processed_properties || list.processed_count || 0
    if (total === 0) return 0
    return Math.round((processed / total) * 100)
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <NavigationHeader
          title="ACTIVE PROPERTY LISTS"
          showBack={false}
          showUpload={true}
          showLists={false}
        />

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search lists..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">{formatNumber(datasets?.length)}</p>
              <p className="text-sm text-muted-foreground">Total Lists</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold">
                {formatNumber(datasets?.reduce((sum: number, d: any) => sum + (d.total_properties || d.row_count || 0), 0))}
              </p>
              <p className="text-sm text-muted-foreground">Total Properties</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-green-500">
                {formatNumber(datasets?.filter((d: any) => d.status === 'processed' || d.status === 'complete').length)}
              </p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-2xl font-bold text-yellow-500">
                {formatNumber(datasets?.filter((d: any) => d.status === 'processing').length)}
              </p>
              <p className="text-sm text-muted-foreground">Processing</p>
            </CardContent>
          </Card>
        </div>

        {/* Lists */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading lists...</p>
          </div>
        ) : filteredLists.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No property lists yet</p>
              <Button className="mt-4" onClick={() => navigate('/upload')}>
                Upload your first list
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredLists.map((list: any) => {
              const progress = getProgress(list)
              return (
                <Card key={list.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold">{list.name || list.file_name}</h3>
                          {getStatusBadge(list.status)}
                        </div>
                        <p className="text-muted-foreground mb-4">
                          Uploaded {formatDate(list.created_at)}
                        </p>
                        
                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="flex justify-between text-sm mb-1">
                            <span>Properties</span>
                            <span>{formatNumber(list.processed_properties || 0)} / {formatNumber(list.total_properties || list.row_count || 0)}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{progress}% complete</p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 ml-6">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/properties?dataset=${list.dataset_id}`)}
                        >
                          View Properties
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/heist-mission/${list.dataset_id}`)}
                        >
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
