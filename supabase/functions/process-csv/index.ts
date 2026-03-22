// process-csv Edge Function - PRODUCTION READY
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS'
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') { inQuotes = !inQuotes }
    else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else { current += char }
  }
  result.push(current)
  return result
}

function parseNumber(value: string): number | null {
  if (!value || value.trim() === '') return null
  const cleaned = value.replace(/[$,\s]/g, '')
  const num = parseFloat(cleaned)
  return isNaN(num) || !isFinite(num) ? null : num
}

function detectColumnType(header: string, sampleValues: string[]): string | null {
  const h = header.toLowerCase().replace(/[^a-z0-9]/g, '')
  const numericValues = sampleValues.filter(v => parseNumber(v) !== null)
  const avgValue = numericValues.length > 0 
    ? numericValues.reduce((sum, v) => sum + (parseNumber(v) || 0), 0) / numericValues.length 
    : 0
  
  // Address — MUST exclude owner/mailing/auction fields
  if ((h === 'address' || h.includes('street')) && !h.includes('owner') && !h.includes('mailing') && !h.includes('auction')) return 'address'
  if (h === 'city' && !h.includes('owner') && !h.includes('mailing') && !h.includes('auction')) return 'city'
  if (h === 'state' && !h.includes('owner') && !h.includes('mailing')) return 'state'
  if ((h === 'zip' || h === 'postal') && !h.includes('owner') && !h.includes('mailing')) return 'zip'
  if (h === 'county') return 'county'
  
  // SQFT - Handle "Living Square Feet" ONLY - this is the primary sqft field
  if (h.includes('living') && (h.includes('square') || h.includes('sq'))) return 'sqft'
  
  // Garage Square Feet - Separate field, NOT sqft - MUST come BEFORE generic sqft check
  if (h.includes('garage') && (h.includes('square') || h.includes('sq'))) return 'garage_square_feet'
  
  // Lot SQFT - Handle "Lot (Square Feet)", "Lot Sq Ft", etc.
  const lotHeaders = ['lotsqft', 'lotsquare', 'lot', 'lotsize']
  if (lotHeaders.some(x => h.includes(x)) && (h.includes('sq') || h.includes('ft'))) return 'lot_sqft'
  
  // Year Built - Handle "Year Built", "Built Year", etc.
  const yearValues = sampleValues.filter(v => {
    const n = parseNumber(v)
    return n !== null && n >= 1800 && n <= 2026
  })
  if (h.includes('year') && h.includes('built')) return 'year_built'
  if (h === 'built' && yearValues.length > 0) return 'year_built'
  
  // Bedrooms
  const bedHeaders = ['bed', 'bedroom', 'beds']
  const bedValues = sampleValues.filter(v => {
    const n = parseNumber(v)
    return n !== null && n >= 0 && n <= 20
  })
  if (bedHeaders.some(x => h.includes(x))) return 'bedrooms'
  
  // Bathrooms
  const bathHeaders = ['bath', 'bathroom', 'baths']
  const bathValues = sampleValues.filter(v => {
    const n = parseNumber(v)
    return n !== null && n >= 0 && n <= 15
  })
  if (bathHeaders.some(x => h.includes(x))) return 'bathrooms'
  
  // Listing Price - Handle "Last Sale Amount", "Sale Price", etc.
  if (h.includes('sale') && h.includes('amount')) return 'last_sale_amount'
  if (h.includes('sale') && h.includes('price')) return 'listing_price'
  if (h.includes('list') && h.includes('price')) return 'listing_price'
  
  // Estimated Value - Handle "Estimated Value", "Est Value", etc.
  if (h.includes('estimated') && h.includes('value')) return 'estimated_value'
  if (h.includes('estvalue')) return 'estimated_value'
  
  // ARV
  if (h.includes('arv')) return 'estimated_value'
  
  // Days on Market
  if (h.includes('days') && h.includes('market')) return 'days_on_market'
  
  // Property Type
  if (h.includes('property') && h.includes('type')) return 'property_type'
  if (h.includes('landuse') || h.includes('land use')) return 'property_type'
  
  // Property Use
  if (h.includes('property') && h.includes('use')) return 'property_use'
  
  // Tax Amount
  if (h.includes('tax') && h.includes('amount')) return 'tax_amount'
  
  // Owner fields - These come BEFORE the address check to prevent owner address from overwriting property address
  if (h.includes('owner') && h.includes('mailing') && h.includes('address')) return 'owner_mailing_address'
  if (h.includes('owner') && h.includes('mailing') && h.includes('city')) return 'owner_mailing_city'
  if (h.includes('owner') && h.includes('mailing') && h.includes('state')) return 'owner_mailing_state'
  if (h.includes('owner') && h.includes('mailing') && h.includes('zip')) return 'owner_mailing_zip'
  
  // Address - Check for property address AFTER owner fields
  if (h === 'address' || (h.includes('address') && !h.includes('owner') && !h.includes('mailing'))) return 'address'
  
  // City
  if (h === 'city') return 'city'
  
  // State
  if (h === 'state') return 'state'
  
  // Zip
  if (h === 'zip' || h === 'postal') return 'zip'
  
  // County
  if (h === 'county') return 'county'
  
  // Owner 1 First/Last Name
  if (h.includes('owner') && h.includes('1') && h.includes('first')) return 'owner_1_first_name'
  if (h.includes('owner') && h.includes('1') && h.includes('last')) return 'owner_1_last_name'
  
  // Owner 2 First/Last Name
  if (h.includes('owner') && h.includes('2') && h.includes('first')) return 'owner_2_first_name'
  if (h.includes('owner') && h.includes('2') && h.includes('last')) return 'owner_2_last_name'
  
  // APN
  if (h.includes('apn')) return 'apn'
  
  // Subdivision
  if (h.includes('subdivision')) return 'subdivision'
  
  // Units Count
  if (h.includes('unit') && h.includes('count')) return 'units'
  
  // Stories
  if (h.includes('story') || h.includes('stories')) return 'stories'
  
  // Garage
  if (h.includes('garage') && h.includes('type')) return 'garage_type'
  if (h.includes('garage') && h.includes('square')) return 'garage_square_feet'
  
  // Carport
  if (h.includes('carport') && h.includes('area')) return 'carport_area'
  
  // Heating/Cooling
  if (h.includes('air') && h.includes('conditioning')) return 'air_conditioning_type'
  if (h.includes('heating') && h.includes('type')) return 'heating_type'
  
  // Fireplaces
  if (h.includes('fireplace')) return 'fireplaces'
  
  // Assessment values
  if (h.includes('assessed') && h.includes('total')) return 'assessed_total_value'
  if (h.includes('assessed') && h.includes('land')) return 'assessed_land_value'
  if (h.includes('assessed') && h.includes('improvement')) return 'assessed_improvement_value'
  
  // Market values
  if (h.includes('market') && h.includes('value')) return 'market_value'
  if (h.includes('market') && h.includes('land')) return 'market_land_value'
  if (h.includes('market') && h.includes('improvement')) return 'market_improvement_value'
  
  // Equity
  if (h.includes('equity') && h.includes('percent')) return 'estimated_equity_percent'
  if (h.includes('equity')) return 'estimated_equity'
  
  // Mortgage
  if (h.includes('mortgage') && h.includes('balance')) return 'open_mortgage_balance'
  if (h.includes('mortgage') && h.includes('interest')) return 'interest_rate'
  if (h.includes('mortgage') && h.includes('document')) return 'mortgage_document_date'
  if (h.includes('lender')) return 'lender_name'
  
  // Listing Agent
  if (h.includes('listing') && h.includes('agent') && h.includes('full') && h.includes('name')) return 'listing_agent_full_name'
  if (h.includes('listing') && h.includes('agent') && h.includes('first')) return 'listing_agent_first_name'
  if (h.includes('listing') && h.includes('agent') && h.includes('last')) return 'listing_agent_last_name'
  if (h.includes('listing') && h.includes('agent') && h.includes('email')) return 'listing_agent_email'
  if (h.includes('listing') && h.includes('agent') && h.includes('phone')) return 'listing_agent_phone'
  
  // Brokerage
  if (h.includes('brokerage') && h.includes('name')) return 'listing_brokerage_name'
  if (h.includes('brokerage') && h.includes('phone')) return 'listing_brokerage_phone'
  
  // MLS Type
  if (h.includes('mls') && h.includes('type')) return 'mls_type'
  
  // Status
  if (h === 'status' || h.includes('listingstatus')) return 'listing_status'
  
  // Vacant
  if (h.includes('vacant')) return 'vacant'
  
  // Owner Occupied
  if (h.includes('owner') && h.includes('occupied')) return 'owner_occupied'
  
  // Owner Type
  if (h.includes('owner') && h.includes('type')) return 'owner_type'
  
  // Legal Description
  if (h.includes('legal') && h.includes('description')) return 'legal_description'
  
  return null
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { csv_data, account_id } = await req.json()
    if (!csv_data || !account_id) throw new Error('Missing csv_data or account_id')
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const lines = csv_data.trim().split('\n')
    if (lines.length < 2) throw new Error('CSV must have headers and data')
    
    const headers = parseCSVLine(lines[0]).map(h => h.trim().replace(/^["']|["']$/g, ''))
    const dataLines = lines.slice(1).filter(l => l.trim())
    
    const sampleValuesByColumn: string[][] = headers.map(() => [])
    for (let i = 0; i < Math.min(10, dataLines.length); i++) {
      const values = parseCSVLine(dataLines[i])
      values.forEach((v, idx) => {
        if (sampleValuesByColumn[idx]) sampleValuesByColumn[idx].push(v)
      })
    }
    
    console.log('📊 CSV Analysis:')
    console.log('  - Columns:', headers.length)
    console.log('  - Data rows:', dataLines.length)
    
    const columnMap: Record<number, string> = {}
    headers.forEach((header, idx) => {
      const samples = sampleValuesByColumn[idx] || []
      const dbCol = detectColumnType(header, samples)
      if (dbCol) {
        columnMap[idx] = dbCol
        console.log(`  ✓ [${idx}] "${header}" → ${dbCol}`)
      }
    })
    
    console.log('  - Mapped columns:', Object.keys(columnMap).length)

    const properties: any[] = []
    for (const line of dataLines) {
      const values = parseCSVLine(line)
      if (values.length < headers.length * 0.5) continue
      
      const row: any = {}
      Object.entries(columnMap).forEach(([idx, colName]) => {
        const valueIndex = parseInt(idx)
        if (values[valueIndex]) {
          row[colName] = values[valueIndex].trim()
        }
      })
      
      if (row.address && row.address.length > 0) {
        properties.push(row)
      }
    }
    
    console.log('✅ Properties parsed:', properties.length)

    const datasetId = 'ds_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
    
    const { error: datasetError } = await supabase
      .from('datasets')
      .insert({
        dataset_id: datasetId,
        account_id,
        name: 'Import ' + new Date().toLocaleDateString(),
        file_name: 'upload.csv',
        total_properties: properties.length,
        processed_properties: properties.length,
        status: 'processed',
        pipeline_status: 'pending',
        raw_csv_data: csv_data
      })

    if (datasetError) throw datasetError
    console.log('✅ Dataset created:', datasetId)

    // SMALL BATCH SYNCHRONOUS INSERTS - Prevents timeout
    console.log('🚀 Starting property inserts...')

    let totalInserted = 0
    let totalErrors = 0
    const BATCH_SIZE = 20  // Small batches for speed
    const DELAY_MS = 50    // Small delay between batches

    for (let i = 0; i < properties.length; i += BATCH_SIZE) {
      const batch = properties.slice(i, i + BATCH_SIZE)

      const insertData = batch.map((row) => {
        const property_id = 'prop_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)

        return {
          property_id,
          dataset_id: datasetId,
          account_id,
          address: row.address || '',
          city: row.city || '',
          state: row.state || '',
          zip: row.zip || '',
          county: row.county || '',
          sqft: parseNumber(row.sqft || '') || null,
          bedrooms: parseNumber(row.bedrooms || '') || null,
          bathrooms: parseNumber(row.bathrooms || '') || null,
          listing_price: parseNumber(row.listing_price || '') || null,
          listing_status: row.listing_status || 'active',
          listing_agent_full_name: row.listing_agent_full_name || '',
          listing_agent_email: row.listing_agent_email || '',
          listing_agent_phone: row.listing_agent_phone || '',
          estimated_value: parseNumber(row.estimated_value || '') || null,
          estimated_equity: parseNumber(row.estimated_equity || '') || null,
          last_sale_date: row.last_sale_date || null,
          last_sale_amount: parseNumber(row.last_sale_amount || '') || null,
          open_mortgage_balance: parseNumber(row.open_mortgage_balance || '') || null,
          interest_rate: parseNumber(row.interest_rate || '') || null,
          days_on_market: parseNumber(row.days_on_market || '') || null,
          tax_amount: parseNumber(row.tax_amount || '') || null,
          year_built: parseNumber(row.year_built || '') || null,
          lot_sqft: parseNumber(row.lot_sqft || '') || null,
          property_type: row.property_type || '',
          property_use: row.property_use || '',
          units: parseNumber(row.units || '') || null,
          stories: parseNumber(row.stories || '') || null,
          status: 'pending',
          pipeline_status: 'scouted',
          market_research: { status: 'pending' }
        }
      })

      const { error } = await supabase.from('properties').insert(insertData)

      if (error) {
        console.error(`❌ Batch ${i}-${i+BATCH_SIZE} error:`, JSON.stringify(error))
        totalErrors += batch.length
      } else {
        totalInserted += batch.length
        console.log(`  ✓ Inserted ${i+1}-${Math.min(i+batch.length, properties.length)}`)
      }

      // Small delay to prevent timeout
      await new Promise(resolve => setTimeout(resolve, DELAY_MS))
    }

    console.log(`✅ COMPLETE: ${totalInserted} inserted, ${totalErrors} errors`)

    // Trigger Market Research Agent to analyze the uploaded properties
    try {
      console.log('🔄 Triggering Market Research Agent...')
      const analyzeResponse = await fetch(
        `${Deno.env.get('SUPABASE_URL')}/functions/v1/analyze-market`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ dataset_id: datasetId }),
        }
      )
      const analyzeResult = await analyzeResponse.json()
      console.log('📊 Market Analysis:', JSON.stringify(analyzeResult))
    } catch (analyzeError) {
      console.error('⚠️ Market analysis trigger failed:', analyzeError)
    }

    return new Response(JSON.stringify({
      success: true,
      dataset_id: datasetId,
      properties_total: properties.length,
      properties_inserted: totalInserted,
      properties_errors: totalErrors,
      message: `${totalInserted} properties imported successfully`
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error) {
    console.error('💥 Fatal error:', error)
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})