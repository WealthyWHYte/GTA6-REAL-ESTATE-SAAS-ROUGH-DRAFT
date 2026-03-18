import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  MapPin, DollarSign, Home, TrendingUp, Calendar,
  Edit, Mail, Phone, FileText, User, Building,
  Ruler, Scale, BookOpen, Gavel, Copy, ExternalLink
} from "lucide-react"
import { formatValue, DISPLAY_NAMES, CATEGORIES } from "@/config/csvColumns"

interface PropertyDetailModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  property: Record<string, unknown> | null
}

export default function PropertyDetailModal({
  open,
  onOpenChange,
  property,
}: PropertyDetailModalProps) {
  const [activeTab, setActiveTab] = useState("basic")

  if (!property) return null

  const formatNumber = (num: number | null) => {
    if (!num || num === 0) return "-"
    return num.toLocaleString()
  }

  const formatCurrency = (val: unknown) => formatValue('listing_price', val)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const renderField = (key: string, label?: string) => {
    const value = property[key]
    const displayValue = formatValue(key, value)
    if (displayValue === "-") return null

    return (
      <div className="flex justify-between items-center py-2 border-b border-muted/30 last:border-0">
        <span className="text-sm text-muted-foreground">{label || DISPLAY_NAMES[key as keyof typeof DISPLAY_NAMES] || key}</span>
        <span className="text-sm font-medium text-right">{displayValue}</span>
      </div>
    )
  }

  const renderSection = (title: string, icon: React.ReactNode, keys: string[]) => (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        {keys.map((key) => renderField(key))}
      </CardContent>
    </Card>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            {property.address || "Property Details"}
          </DialogTitle>
          <DialogDescription>
            {property.city}, {property.state} {property.zip} • {property.county} County
          </DialogDescription>
        </DialogHeader>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-6 gap-2 p-4 bg-muted/30 rounded-lg">
          <div className="text-center">
            <p className="text-xs text-muted-foreground">List Price</p>
            <p className="font-bold text-lg">{formatCurrency(property.listing_price)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Est. Value</p>
            <p className="font-bold text-lg text-green-500">{formatCurrency(property.estimated_value)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Est. Equity</p>
            <p className="font-bold text-lg text-blue-500">{formatValue('estimated_equity', property.estimated_equity)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Equity %</p>
            <p className="font-bold text-lg text-blue-500">{formatValue('estimated_equity_percent', property.estimated_equity_percent)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Sqft</p>
            <p className="font-bold text-lg">{formatNumber(property.living_sqft as number)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-muted-foreground">Bed/Bath</p>
            <p className="font-bold text-lg">{property.bedrooms}/{property.bathrooms}</p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="basic" className="text-xs">Basic</TabsTrigger>
            <TabsTrigger value="property" className="text-xs">Property</TabsTrigger>
            <TabsTrigger value="owner" className="text-xs">Owner</TabsTrigger>
            <TabsTrigger value="mortgage" className="text-xs">Mortgage</TabsTrigger>
            <TabsTrigger value="listing" className="text-xs">Listing</TabsTrigger>
            <TabsTrigger value="tax" className="text-xs">Tax</TabsTrigger>
            <TabsTrigger value="auction" className="text-xs">Auction</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderSection("Property Identification", <FileText className="w-4 h-4" />, CATEGORIES.basic.columns)}
              {renderSection("APN & Legal", <BookOpen className="w-4 h-4" />, ['apn', 'legal_description'])}
            </div>
          </TabsContent>

          <TabsContent value="property" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderSection("Physical Details", <Home className="w-4 h-4" />, [
                'property_type', 'property_use', 'land_use', 'year_built',
                'stories', 'bedrooms', 'bathrooms', 'fireplaces'
              ])}
              {renderSection("Size & Lot", <Ruler className="w-4 h-4" />, [
                'living_sqft', 'lot_sqft', 'lot_acres', 'units'
              ])}
              {renderSection("Structure", <Building className="w-4 h-4" />, [
                'garage_type', 'garage_sqft', 'carport', 'carport_sqft',
                'ac_type', 'heating_type'
              ])}
              {renderSection("Location", <MapPin className="w-4 h-4" />, ['subdivision', 'county'])}
            </div>
          </TabsContent>

          <TabsContent value="owner" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderSection("Primary Owner", <User className="w-4 h-4" />, [
                'owner1_first_name', 'owner1_last_name'
              ])}
              {renderSection("Secondary Owner", <User className="w-4 h-4" />, [
                'owner2_first_name', 'owner2_last_name'
              ])}
              {renderSection("Owner Details", <Scale className="w-4 h-4" />, [
                'owner_type', 'owner_occupied', 'vacant', 'ownership_length_months'
              ])}
              {renderSection("Mailing Address", <MapPin className="w-4 h-4" />, [
                'owner_mailing_address', 'owner_mailing_city',
                'owner_mailing_state', 'owner_mailing_zip'
              ])}
            </div>
          </TabsContent>

          <TabsContent value="mortgage" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderSection("Property Value", <DollarSign className="w-4 h-4" />, [
                'estimated_value', 'estimated_equity', 'estimated_equity_percent'
              ])}
              {renderSection("Last Sale", <Calendar className="w-4 h-4" />, [
                'last_sale_date', 'last_sale_amount'
              ])}
              {renderSection("Mortgage Info", <Building className="w-4 h-4" />, [
                'open_mortgage_balance', 'mortgage_interest_rate',
                'mortgage_document_date', 'mortgage_loan_type'
              ])}
              {renderSection("Mortgage Details", <FileText className="w-4 h-4" />, [
                'lender_name', 'deed_type', 'mortgage_position'
              ])}
            </div>
          </TabsContent>

          <TabsContent value="listing" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderSection("Listing Status", <TrendingUp className="w-4 h-4" />, [
                'listing_status', 'listing_price', 'days_on_market', 'mls_type'
              ])}
              {renderSection("Listing Agent", <User className="w-4 h-4" />, [
                'listing_agent_full_name', 'listing_agent_first_name',
                'listing_agent_last_name', 'listing_agent_email',
                'listing_agent_phone'
              ])}
              {renderSection("Brokerage", <Building className="w-4 h-4" />, [
                'listing_brokerage_name', 'listing_brokerage_phone',
                'listing_brokerage_url'
              ])}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Updates
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  {renderField('last_updated', 'Last Updated')}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tax" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderSection("Tax Amount", <DollarSign className="w-4 h-4" />, [
                'tax_amount', 'assessment_year'
              ])}
              {renderSection("Assessed Values", <Scale className="w-4 h-4" />, [
                'assessed_total_value', 'assessed_land_value',
                'assessed_improvement_value', 'assessed_improvement_pct'
              ])}
              {renderSection("Market Values", <TrendingUp className="w-4 h-4" />, [
                'market_value', 'market_land_value',
                'market_improvement_value', 'market_improvement_pct'
              ])}
            </div>
          </TabsContent>

          <TabsContent value="auction" className="mt-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {renderSection("Auction Status", <Gavel className="w-4 h-4" />, ['status'])}
              {renderSection("Auction Amounts", <DollarSign className="w-4 h-4" />, [
                'default_amount', 'opening_bid'
              ])}
              {renderSection("Auction Date", <Calendar className="w-4 h-4" />, [
                'recording_date', 'auction_date', 'auction_time'
              ])}
              {renderSection("Auction Location", <MapPin className="w-4 h-4" />, [
                'auction_courthouse', 'auction_address', 'auction_city_state'
              ])}
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button variant="outline" size="sm">
            <Edit className="w-3 h-3 mr-1" /> Edit
          </Button>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-3 h-3 mr-1" /> Research
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="w-3 h-3 mr-1" /> Copy Address
          </Button>
          <Button size="sm" className="ml-auto bg-green-600 hover:bg-green-700">
            <DollarSign className="w-3 h-3 mr-1" /> Make Offer
          </Button>
          {property.listing_url && (
            <Button variant="outline" size="sm" onClick={() => window.open(property.listing_url as string, '_blank')}>
              <ExternalLink className="w-3 h-3 mr-1" /> View Listing
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
