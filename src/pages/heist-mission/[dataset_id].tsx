// src/pages/heist-mission/[dataset_id].tsx
import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import { supabase } from "@/lib/supabase"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { 
  ArrowLeft, BarChart3, MapPin, DollarSign, 
  Home, TrendingUp, CheckCircle, AlertCircle, Loader2,
  ChevronRight
} from "lucide-react"

export default function HeistMissionPage() {
  const { dataset_id } = useParams()
  const navigate = useNavigate()

  const { data: mission, isLoading: missionLoading } = useQuery({
    queryKey: ['mission', dataset_id],
    queryFn: async () => {
      if (!dataset_id) return null
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return null

      const { data } = await supabase
        .from('datasets')
        .select('*')
        .eq('dataset_id', dataset_id)
        .eq('account_id', user.id)
      
      return data?.[0] || null
    },
    enabled: !!dataset_id
  })

  const { data: properties, isLoading: propsLoading } = useQuery({
    queryKey: ['properties', dataset_id],
    queryFn: async () => {
      if (!dataset_id) return []
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data } = await supabase
        .from('properties')
        .select('*')
        .eq('dataset_id', dataset_id)
        .eq('account_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)
      
      return data || []
    },
    enabled: !!dataset_id
  })

  const formatNumber = (num: number | null) => {
    if (num === null || num === undefined) return '0'
    return num.toLocaleString()
  }

  const formatPrice = (price: number | null) => {
    if (!price) return 'N/A'
    return `$${price.toLocaleString()}`
  }

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500',
      scouting: 'bg-blue-500/20 text-blue-500 border-blue-500',
      researching: 'bg-purple-500/20 text-purple-500 border-purple-500',
      underwriting: 'bg-orange-500/20 text-orange-500 border-orange-500',
      offer_generation: 'bg-pink-500/20 text-pink-500 border-pink-500',
      offer_sent: 'bg-cyan-500/20 text-cyan-500 border-cyan-500',
      under_contract: 'bg-green-500/20 text-green-500 border-green-500',
      closed: 'bg-gray-500/20 text-gray-500 border-gray-500'
    }
    return (
      <Badge className={colors[status] || 'bg-gray-500/20'} variant="outline">
        {status?.replace(/_/g, ' ') || 'PENDING'}
      </Badge>
    )
  }

  const progress = (mission?.total_properties || mission?.row_count || 0) 
    ? Math.round(((mission.processed_properties || mission.processed_count || 0) / (mission.total_properties || mission.row_count || 1)) * 100)
    : 0

  if (missionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-16 h-16 animate-spin text-primary" />
      </div>
    )
  }

  if (!mission) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-4xl mx-auto text-center">
          <AlertCircle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold mb-2">Mission Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The mission you're looking for doesn't exist or you don't have access.
          </p>
          <Button onClick={() => navigate('/active-lists')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Lists
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="sm" onClick={() => navigate('/active-lists')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gta-blue">{mission.name || 'Mission'}</h1>
            <p className="text-muted-foreground">
              Uploaded {mission.created_at ? new Date(mission.created_at).toLocaleDateString() : 'N/A'}
            </p>
          </div>
        </div>

        {/* Progress */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              MISSION PROGRESS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {formatNumber(mission.processed_properties || mission.processed_count || 0)} / {formatNumber(mission.total_properties || mission.row_count || 0)} properties analyzed
                </span>
                <span className="font-bold">{progress}%</span>
              </div>
              <div className="h-4 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-vice-cyan to-vice-pink transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Home className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(mission.total_properties || mission.row_count)}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(mission.processed_properties || mission.processed_count)}</p>
                  <p className="text-sm text-muted-foreground">Processed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{formatNumber(mission.error_count || 0)}</p>
                  <p className="text-sm text-muted-foreground">Errors</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-yellow-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {formatPrice(properties?.reduce((sum: number, p: any) => sum + (p.listing_price || p.price || 0), 0))}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Value</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Properties */}
        <Card>
          <CardHeader>
            <CardTitle>RECENT ACTIVITY</CardTitle>
          </CardHeader>
          <CardContent>
            {propsLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              </div>
            ) : properties?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No properties processed yet
              </div>
            ) : (
              <div className="space-y-4">
                {properties?.map((property: any) => (
                  <div 
                    key={property.id} 
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => navigate(`/black-market/${property.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <MapPin className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{property.address || 'N/A'}</p>
                        <p className="text-sm text-muted-foreground">
                          {property.city}, {property.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(property.listing_price || property.price)}</p>
                        {(property.estimated_value || property.arv) && (
                          <p className="text-sm text-green-500">ARV: {formatPrice(property.estimated_value || property.arv)}</p>
                        )}
                      </div>
                      {getStatusBadge(property.pipeline_status || property.status)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* View All Button */}
        {properties && properties.length > 0 && (
          <div className="mt-6 text-center">
            <Button 
              variant="outline" 
              onClick={() => navigate(`/properties?dataset=${dataset_id}`)}
            >
              View All Properties
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
