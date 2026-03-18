// PropertyMapVisualization.tsx
// Real-time US map showing user's uploaded properties by location
import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ComposableMap, Geographies, Geography, Marker, ZoomableGroup } from 'react-simple-maps'

// US states GeoJSON (simplified)
const geoUrl = "https://cdn.jsdelivr.net/npm/us-atlas@3/states-10m.json"

// California cities coordinates (main cities from LA area)
const cityCoordinates: Record<string, [number, number]> = {
  'GLENDORA': [-117.8653, 34.1364],
  'LA VERNE': [-117.7678, 34.1009],
  'RANCHO PALOS VERDES': [-118.3870, 33.7445],
  'PALOS VERDES ESTATES': [-118.3870, 33.8014],
  'LOS ANGELES': [-118.2437, 34.0522],
  'LONG BEACH': [-118.1937, 33.7701],
  'PASADENA': [-118.1445, 34.1478],
  'GLENDALE': [-118.2551, 34.1425],
  'BURBANK': [-118.3090, 34.1808],
  'SANTA MONICA': [-118.4912, 34.0195],
  'BEVERLY HILLS': [-118.4065, 34.0736],
  'MANHATTAN BEACH': [-118.4105, 33.8847],
  'HERMOSA BEACH': [-118.3995, 33.8622],
  'REDONDO BEACH': [-118.3881, 33.8492],
  'TORRANCE': [-118.3409, 33.8358],
  'CULVER CITY': [-118.3965, 34.0211],
  'SAN FERNANDO': [-118.4393, 34.2819],
  'MONROVIA': [-118.0017, 34.1481],
  'DUARTE': [-117.9773, 34.1392],
  'AZUSA': [-117.9087, 34.1336],
  'COVINA': [-117.8871, 34.0900],
  'WEST COVINA': [-117.9390, 34.0686],
  'POMONA': [-117.7503, 34.0581],
  'CLAREMONT': [-117.7198, 34.0967],
  'UPLAND': [-117.6484, 34.1069],
  'ONTARIO': [-117.6509, 34.0633],
  'RANCHO CUCAMONGA': [-117.5604, 34.1064],
  'CORONA': [-117.5664, 33.8753],
  'RIVERSIDE': [-117.3962, 33.9533],
  'IRVINE': [-117.8231, 33.6846],
  'NEWPORT BEACH': [-117.9289, 33.6189],
  'HUNTINGTON BEACH': [-118.0002, 33.6595],
  'ANAHEIM': [-117.9149, 33.8366],
  'FULLERTON': [-117.9234, 33.8719],
  'ORANGE': [-117.8531, 33.7879],
  'SANTA ANA': [-117.8677, 33.7495],
  'COSTA MESA': [-117.9187, 33.6411],
  'MISSION VIEJO': [-117.6709, 33.6001],
  'LAGUNA BEACH': [-117.7852, 33.5427],
  'SAN JUAN CAPISTRANO': [-117.4875, 33.5017],
  'OCEANSIDE': [-117.3295, 33.1952],
  'CARLSBAD': [-117.3500, 33.1581],
  'ENCINITAS': [-117.2940, 33.0370],
  'ESCONDIDO': [-117.0857, 33.1192],
  'SAN DIEGO': [-117.1611, 32.7157],
  'CHULA VISTA': [-117.0472, 32.6401],
  'SANTA CLARITA': [-118.5426, 34.3917],
  'THOUSAND OAKS': [-118.8756, 34.1706],
  'VENTURA': [-119.2292, 34.2805],
  'OXNARD': [-119.2005, 34.1975],
  'SIMI VALLEY': [-118.7585, 34.2694],
  'WOODLAND HILLS': [-118.6057, 34.1678],
  'ENCINO': [-118.5270, 34.1644],
  'SHERMAN OAKS': [-118.4490, 34.1544],
  'STUDIO CITY': [-118.3875, 34.1289],
  'NORTH HOLLYWOOD': [-118.3784, 34.1657],
  'VALLEY VILLAGE': [-118.3978, 34.1668],
  'TARZANA': [-118.5534, 34.1572],
  'RESEDA': [-118.5367, 34.1891],
  'VAN NUYS': [-118.4490, 34.1867],
  'PANORAMA CITY': [-118.4590, 34.2125],
  'NORRIDGE': [-118.4754, 34.2019],
  'GRANADA HILLS': [-118.5290, 34.2767],
  'NORTHRIDGE': [-118.5307, 34.2433],
  'CANOGA PARK': [-118.5981, 34.1958],
  'WINNETKA': [-118.5695, 34.2019],
  'WOODLAND PARK': [-118.5858, 34.2164],
  'CHATSWORTH': [-118.6007, 34.2892],
  'PORTER RANCH': [-118.5567, 34.2822],
  'SAN PEDRO': [-118.2923, 33.7361],
  'WILMINGTON': [-118.2634, 33.7805],
  'CARSON': [-118.2720, 33.8314],
  'COMPTON': [-118.2201, 33.8959],
  'GARDENA': [-118.3080, 33.8883],
  'HAWTHORNE': [-118.3526, 33.9194],
  'INGLEWOOD': [-118.3531, 33.9617],
  'LAWNDALE': [-118.3515, 33.8873],
  'EL SEGUNDO': [-118.4165, 33.9192],
  'MARINA DEL REY': [-118.4518, 33.9802],
  'PLAYA DEL REY': [-118.4617, 33.9575],
  'CULVER CITY': [-118.3965, 34.0211],
  'SAN GABRIEL': [-118.0940, 34.0972],
  'ALHAMBRA': [-118.1270, 34.0951],
  'SOUTH PASADENA': [-118.1503, 34.1161],
  'ALTADENA': [-118.1376, 34.1900],
  'LA CAÑADA FLINTRIDGE': [-118.2006, 34.1989],
  'ARCADIA': [-118.0279, 34.1347],
  'SIERRA MADRE': [-118.0520, 34.1697],
  'LA PUENTE': [-117.9494, 34.0307],
  'INDUSTRY': [-117.9356, 34.0033],
  'WALNUT': [-117.8642, 34.0700],
  'DIAMOND BAR': [-117.8103, 34.0733],
  'BREA': [-117.9001, 33.9169],
  'YORBA LINDA': [-117.8137, 33.8885],
  'PLACENTIA': [-117.8703, 33.8723],
  'VILLA PARK': [-117.8109, 33.8117],
  'SILVERADO': [-117.7675, 33.7456],
  'MODJESKA': [-117.6520, 33.7106],
  'TRABUCO CANYON': [-117.5892, 33.6627],
  'LAKE FOREST': [-117.6828, 33.6469],
  'ALISO VIEJO': [-117.7355, 33.5875],
  'LAGUNA HILLS': [-117.7006, 33.5952],
  'LAGUNA NIGUEL': [-117.7076, 33.5225],
  'DANA POINT': [-117.6828, 33.4670],
  'SAN CLEMENTE': [-117.6198, 33.4269],
  // Default fallback
  'DEFAULT': [-118.2437, 34.0522]
}

interface PropertyMarker {
  city: string
  state: string
  count: number
  avgPrice: number
  coordinates: [number, number]
}

export default function PropertyMapVisualization() {
  const [markers, setMarkers] = useState<PropertyMarker[]>([])

  // Fetch user's properties grouped by city
  const { data: propertyGroups, isLoading } = useQuery({
    queryKey: ['property-map-data'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data } = await supabase
        .from('properties')
        .select('city, state, listing_price')
        .eq('account_id', user.id)

      if (!data || data.length === 0) return []

      // Group by city
      const grouped = data.reduce((acc, prop) => {
        const cityKey = prop.city?.toUpperCase() || 'UNKNOWN'
        const key = `${cityKey},${prop.state || 'CA'}`
        if (!acc[cityKey]) {
          acc[cityKey] = {
            city: prop.city || 'Unknown',
            state: prop.state || 'CA',
            count: 0,
            totalPrice: 0
          }
        }
        acc[cityKey].count++
        acc[cityKey].totalPrice += prop.listing_price || 0
        return acc
      }, {} as Record<string, { city: string; state: string; count: number; totalPrice: number }>)

      // Convert to array with coordinates
      const result = Object.values(grouped).map((group) => {
        const coords = cityCoordinates[group.city.toUpperCase()] || cityCoordinates['DEFAULT']
        return {
          city: group.city,
          state: group.state,
          count: group.count,
          avgPrice: Math.round(group.totalPrice / group.count),
          coordinates: coords as [number, number]
        }
      })

      return result.sort((a, b) => b.count - a.count) // Sort by count descending
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  useEffect(() => {
    if (propertyGroups) {
      setMarkers(propertyGroups)
    }
  }, [propertyGroups])

  // Calculate center based on user's properties (average of all coordinates)
  const center: [number, number] = markers.length > 0 
    ? [
        markers.reduce((sum, m) => sum + m.coordinates[0], 0) / markers.length,
        markers.reduce((sum, m) => sum + m.coordinates[1], 0) / markers.length
      ]
    : [-98.5795, 39.8283] // Default US center

  const zoom = markers.length > 0 
    ? (markers.length < 5 ? 4 : markers.length < 20 ? 5 : 6) // Zoom in more for fewer properties
    : 3

  return (
    <Card className="bg-slate-900 border-slate-700">
      <CardHeader>
        <CardTitle className="text-vice-cyan flex items-center gap-2">
          <span>🗺️</span> PROPERTY MAP - YOUR MARKET
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[400px] flex items-center justify-center text-slate-400">
            Loading map data...
          </div>
        ) : markers.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center text-slate-400">
            <div className="text-center">
              <p className="text-lg mb-2">No properties found</p>
              <p className="text-sm">Upload a property list to see your market map</p>
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="w-full h-[400px] bg-slate-800 rounded-lg overflow-hidden">
              <ComposableMap projection="geoAlbersUsa" projectionConfig={{ scale: 1500 }}>
                <ZoomableGroup center={center} zoom={zoom}>
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          fill="#374151"
                          stroke="#1f2937"
                          strokeWidth={0.5}
                          style={{
                            default: { outline: 'none' },
                            hover: { fill: '#4b5563', outline: 'none' },
                            pressed: { outline: 'none' }
                          }}
                        />
                      ))
                    }
                  </Geographies>
                  
                  {/* Property markers */}
                  {markers.map((marker, i) => (
                    <Marker key={i} coordinates={marker.coordinates}>
                      <g className="cursor-pointer">
                        {/* Outer glow */}
                        <circle 
                          r={Math.min(marker.count * 2 + 8, 25)} 
                          fill="#ef4444" 
                          opacity={0.3} 
                        />
                        {/* Inner circle */}
                        <circle 
                          r={Math.min(marker.count * 1.5 + 5, 18)} 
                          fill="#ef4444" 
                          opacity={0.6} 
                        />
                        {/* Core */}
                        <circle 
                          r={Math.min(marker.count + 3, 12)} 
                          fill="#dc2626" 
                        />
                        {/* Pulse animation effect - CSS animation */}
                        <circle 
                          r={Math.min(marker.count * 1.5 + 8, 20)} 
                          fill="none" 
                          stroke="#ef4444" 
                          strokeWidth={2} 
                          opacity={0.8}
                          className="animate-pulse"
                        />
                      </g>
                    </Marker>
                  ))}
                </ZoomableGroup>
              </ComposableMap>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 bg-slate-900/90 p-3 rounded-lg border border-slate-700">
              <h4 className="text-white text-xs font-bold mb-2 uppercase tracking-wide">
                Property Density
              </h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {markers.slice(0, 8).map((marker, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500 flex-shrink-0" />
                    <span className="text-slate-300 truncate">{marker.city}</span>
                    <span className="text-slate-500 ml-auto">({marker.count})</span>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-slate-700 text-xs text-slate-400">
                Total: {markers.reduce((sum, m) => sum + m.count, 0)} properties
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
