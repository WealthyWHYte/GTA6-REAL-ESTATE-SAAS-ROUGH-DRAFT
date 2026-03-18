// Properties List Page
import { useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, Search, MapPin, DollarSign, Home, 
  TrendingUp, Calendar, Grid, List
} from 'lucide-react'
import NavigationHeader from '@/components/NavigationHeader'
import PropertyCard from '@/components/PropertyCard'

export default function PropertiesPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const datasetId = searchParams.get('dataset')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  const { data: properties, isLoading } = useQuery({
    queryKey: ['properties', datasetId],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      let query = supabase
        .from('properties')
        .select('*')
        .eq('account_id', user.id)
        .order('created_at', { ascending: false })

      if (datasetId) query = query.eq('dataset_id', datasetId)
      const { data } = await query
      return data || []
    }
  })

  const filteredProperties = properties?.filter(p => 
    p.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    return `$${price.toLocaleString()}`
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
      scouting: 'bg-blue-500/20 text-blue-500 border-blue-500',
      researching: 'bg-purple-500/20 text-purple-500 border-purple-500',
      scouted: 'bg-blue-500/20 text-blue-500 border-blue-500',
      underwriting: 'bg-orange-500/20 text-orange-500 border-orange-500',
      qualified: 'bg-green-500/20 text-green-500 border-green-500',
      offer_generation: 'bg-pink-500/20 text-pink-500 border-pink-500',
      offer_sent: 'bg-cyan-500/20 text-cyan-500 border-cyan-500',
      under_contract: 'bg-green-500/20 text-green-500 border-green-500',
      closed: 'bg-gray-500/20 text-gray-500 border-gray-500'
    }
    return (
      <Badge className={colors[status] || 'bg-gray-500/20'} variant="outline">
        {status?.replace(/_/g, ' ')}
      </Badge>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <NavigationHeader
          title="Properties"
          showBack={true}
          showUpload={false}
        />

        <div className="mb-6 flex items-center justify-between">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search properties..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'} 
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Home className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{properties?.length || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Properties</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold truncate">
                    {formatPrice(properties?.reduce((sum: number, p: any) => sum + (p.listing_price || 0), 0) || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <DollarSign className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold truncate">
                    {formatPrice(properties?.reduce((sum: number, p: any) => sum + (p.estimated_value || 0), 0) || 0)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total ARV</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Calendar className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{filteredProperties.length}</p>
                  <p className="text-sm text-muted-foreground">Showing</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading properties...</p>
          </div>
        ) : filteredProperties.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Home className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No properties found</p>
            </CardContent>
          </Card>
        ) : viewMode === 'grid' ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProperties.map((property: any) => (
              <div 
                key={property.id} 
                className="cursor-pointer"
                onClick={() => navigate(`/black-market/${property.id}`)}
              >
                <PropertyCard property={property} />
              </div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-4">Address</th>
                    <th className="text-left p-4">City</th>
                    <th className="text-right p-4">List Price</th>
                    <th className="text-right p-4">ARV</th>
                    <th className="text-center p-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProperties.map((property: any) => (
                    <tr key={property.id} className="border-t hover:bg-muted/50 cursor-pointer" onClick={() => navigate(`/black-market/${property.id}`)}>
                      <td className="p-4">{property.address}</td>
                      <td className="p-4">{property.city}, {property.state}</td>
                      <td className="p-4 text-right font-medium">{formatPrice(property.listing_price)}</td>
                      <td className="p-4 text-right font-medium text-green-500">{formatPrice(property.estimated_value)}</td>
                      <td className="p-4 text-center">{getStatusBadge(property.pipeline_status || property.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
