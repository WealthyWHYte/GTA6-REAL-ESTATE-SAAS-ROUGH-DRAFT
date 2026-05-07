// Level Selector Component - Level 1/2/3 offer cards

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Calculator, ChevronDown } from 'lucide-react'

interface PropertyData {
  listing_price?: number
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
  level3_assume_mortgage?: number
  level3_seller_carry_amount?: number
}

interface LevelSelectorProps {
  property: PropertyData
  selectedLevel: number
  onSelectLevel: (level: 1 | 2 | 3) => void
}

export default function LevelSelector({ property, selectedLevel, onSelectLevel }: LevelSelectorProps) {
  const [expandedLevel, setExpandedLevel] = useState<number | null>(selectedLevel)
  
  const listingPrice = property.listing_price || property.level3_offer_price || 0

  const levels = [
    {
      level: 1,
      label: 'Level 1: 70% + Terms (Seller Finance)',
      offerPrice: property.level1_offer_price || listingPrice * 0.7,
      entryFee: property.level1_entry_fee || 0,
      monthly: property.level1_monthly_payment || 0,
      rate: property.level1_seller_carry_rate || 7,
      structure: '70% of asking price with seller financing. Seller carries a promissory note with monthly payments over agreed term.'
    },
    {
      level: 2,
      label: 'Level 2: 70% All Cash',
      offerPrice: property.level2_offer_price || listingPrice * 0.7,
      entryFee: property.level2_entry_fee || 0,
      monthly: 0,
      rate: 0,
      structure: '70% of asking price, all-cash offer. No monthly payments, fastest closing, lowest seller risk.'
    },
    {
      level: 3,
      label: 'Level 3: 100% Full Price + Terms',
      offerPrice: property.level3_offer_price || listingPrice,
      entryFee: property.level3_entry_fee || 0,
      monthly: property.level3_monthly_payment || 0,
      rate: property.level3_seller_carry_rate || 7,
      assumeMortgage: property.level3_assume_mortgage || 0,
      sellerCarry: property.level3_seller_carry_amount || 0,
      structure: 'Full asking price with creative terms. Buyer assumes existing mortgage + seller carries second position. Highest seller acceptance rate.'
    }
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Select Offer Level
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {levels.map((lvl) => (
          <div
            key={lvl.level}
            className={`border rounded-lg transition-all ${
              selectedLevel === lvl.level ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
            }`}
          >
            <div
              className="p-4 flex items-center justify-between cursor-pointer"
              onClick={() => {
                onSelectLevel(lvl.level as 1 | 2 | 3)
                setExpandedLevel(expandedLevel === lvl.level ? null : lvl.level)
              }}
            >
              <div>
                <p className="font-bold">{lvl.label}</p>
                <p className="text-sm text-muted-foreground">Offer: ${lvl.offerPrice.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                {selectedLevel === lvl.level && (
                  <Badge className="bg-vice-green text-black">Selected</Badge>
                )}
                <ChevronDown
                  className={`w-5 h-5 transition-transform ${
                    expandedLevel === lvl.level ? 'rotate-180' : ''
                  }`}
                />
              </div>
            </div>

            {expandedLevel === lvl.level && (
              <div className="px-4 pb-4 border-t pt-4 space-y-3">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Offer Price</p>
                    <p className="text-lg font-bold">${lvl.offerPrice.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Entry Fee</p>
                    <p className="text-lg font-bold">${lvl.entryFee.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly</p>
                    <p className="text-lg font-bold">
                      {lvl.monthly > 0 ? `$${lvl.monthly.toLocaleString()}` : '$0'}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Rate</p>
                    <p className="text-lg font-bold">{lvl.rate}%</p>
                  </div>
                </div>

                {lvl.level === 3 && (lvl.assumeMortgage || lvl.sellerCarry) && (
                  <div className="grid grid-cols-2 gap-4 mt-3">
                    {lvl.assumeMortgage > 0 && (
                      <div className="p-3 bg-purple-50 border border-purple-200 rounded">
                        <p className="text-xs text-purple-700 font-semibold">Assume Mortgage</p>
                        <p className="text-lg font-bold text-purple-900">
                          ${lvl.assumeMortgage.toLocaleString()}
                        </p>
                      </div>
                    )}
                    {lvl.sellerCarry > 0 && (
                      <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                        <p className="text-xs text-orange-700 font-semibold">Seller Carry</p>
                        <p className="text-lg font-bold text-orange-900">
                          ${lvl.sellerCarry.toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                <div className="p-3 bg-blue-50 border border-blue-200 rounded text-sm">
                  <p className="font-semibold text-blue-700">Structure:</p>
                  <p className="text-blue-900">{lvl.structure}</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}