// Property Details Card - Shows property info when selected from Underwriter

import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Target, User, Home, DollarSign, TrendingUp } from 'lucide-react'

interface PropertyDetails {
  property_id: string
  address?: string
  city?: string
  state?: string
  listing_price?: number
  estimated_value?: number
  win_win_score?: number
  strategy?: string
  agent_name?: string
  agent_email?: string
  agent_phone?: string
  brokerage?: string
  bedrooms?: number
  bathrooms?: number
  sqft?: number
  year_built?: number
  property_type?: string
  days_on_market?: number
  open_mortgage_balance?: number
  reasoning?: string
  // Level data
  level1_offer_price?: number
  level1_entry_fee?: number
  level1_monthly_payment?: number
  level1_seller_carry_rate?: number
  level2_offer_price?: number
  level2_entry_fee?: number
  level3_offer_price?: number
  level3_entry_fee?: number
  level3_monthly_payment?: number
  level3_seller_carry_rate?: number
}

interface PropertyDetailsCardProps {
  property: PropertyDetails
}

export default function PropertyDetailsCard({ property }: PropertyDetailsCardProps) {
  const listingPrice = property.listing_price || property.level3_offer_price || 0
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          {property.address || 'Selected Property'}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Asking Price</p>
            <p className="text-lg font-bold">${listingPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Win-Win Score</p>
            <p className="text-lg font-bold">{property.win_win_score || 0}/100</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Strategy</p>
            <Badge>{property.strategy || 'Creative Finance'}</Badge>
          </div>
        </div>

        {/* Agent Info */}
        <div className="p-4 bg-muted/50 rounded-lg">
          <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <User className="w-4 h-4" />
            Listing Agent / Seller Contact
          </h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-muted-foreground">Name</p>
              <p className="font-medium">{property.agent_name || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="font-medium">{property.agent_email || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="font-medium">{property.agent_phone || 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Brokerage</p>
              <p className="font-medium">{property.brokerage || 'N/A'}</p>
            </div>
          </div>
        </div>

        {/* Property Details */}
        {(property.bedrooms || property.bathrooms || property.sqft) && (
          <div className="mt-4 pt-4 border-t">
            <h4 className="text-sm font-semibold flex items-center gap-2 mb-3">
              <Home className="w-4 h-4" />
              Property Details
            </h4>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-muted-foreground">Beds</p>
                <p className="font-medium">{property.bedrooms || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Baths</p>
                <p className="font-medium">{property.bathrooms || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Sqft</p>
                <p className="font-medium">{property.sqft?.toLocaleString() || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Year Built</p>
                <p className="font-medium">{property.year_built || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}