import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  try {
    const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!)
    const authHeader = req.headers.get('Authorization')
    const { data: { user } } = await supabase.auth.getUser(authHeader?.replace('Bearer ', ''))
    if (!user) throw new Error('Not authenticated')

    const formData = await req.formData()
    const file = formData.get('file') as File
    if (!file) throw new Error('No file uploaded')

    const text = await file.text()
    console.log(`File size: ${text.length} chars`)
    
    // Handle both \r\n and \n line endings
    const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n').filter((l: string) => l.trim())
    console.log(`Lines found: ${lines.length}`)
    
    const headers = lines[0].split(',').map((h: string) => h.replace(/"/g, '').trim())
    console.log(`Headers: ${headers.slice(0,5).join(', ')}`)

    const mapHeader = (h: string) => {
      const l = h.toLowerCase()
      if (l === 'address') return 'address'
      if (l.includes('address') && !l.includes('mail') && !l.includes('owner') && !l.includes('auction')) return 'address'
      if (l === 'city') return 'city'
      if (l === 'state') return 'state'
      if (l === 'zip') return 'zip'
      if (l === 'county') return 'county'
      if (l.includes('living') && l.includes('square')) return 'sqft'
      if (l.includes('year') && l.includes('built')) return 'year_built'
      if (l.includes('bedroom')) return 'bedrooms'
      if (l.includes('bathroom')) return 'bathrooms'
      if (l.includes('listing') && l.includes('price')) return 'listing_price'
      if (l.includes('last') && l.includes('sale') && l.includes('amount')) return 'last_sale_amount'
      if (l.includes('last') && l.includes('sale') && l.includes('date')) return 'last_sale_date'
      if (l.includes('estimated') && l.includes('value')) return 'estimated_value'
      if (l.includes('equity') && l.includes('percent')) return 'estimated_equity_percent'
      if (l.includes('equity')) return 'estimated_equity'
      if (l.includes('mortgage') && l.includes('balance')) return 'open_mortgage_balance'
      if (l.includes('days') && l.includes('market')) return 'days_on_market'
      if (l.includes('listing') && l.includes('status')) return 'listing_status'
      if (l.includes('property') && l.includes('type')) return 'property_type'
      if (l.includes('lot') && l.includes('square')) return 'lot_sqft'
      if (l.includes('tax') && l.includes('amount')) return 'tax_amount'
      return null
    }

    const parseNum = (v: string) => {
      const n = parseFloat((v || '').replace(/[^0-9.-]/g, ''))
      return isNaN(n) ? null : n
    }

    const parseCSVLine = (line: string) => {
      const result: string[] = []
      let current = ''
      let inQuotes = false
      for (const char of line) {
        if (char === '"') { inQuotes = !inQuotes; continue }
        if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; continue }
        current += char
      }
      result.push(current.trim())
      return result
    }

    const datasetId = `comps_${Date.now()}`
    const numFields = ['sqft','year_built','bedrooms','bathrooms','listing_price','last_sale_amount','estimated_value','estimated_equity','estimated_equity_percent','open_mortgage_balance','days_on_market','lot_sqft','tax_amount']
    const rows: any[] = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue
      const values = parseCSVLine(lines[i])
      const row: any = { account_id: user.id, dataset_id: datasetId, uploaded_at: new Date().toISOString() }
      headers.forEach((h: string, idx: number) => {
        const field = mapHeader(h)
        if (!field) return
        const val = (values[idx] || '').replace(/"/g, '').trim()
        row[field] = numFields.includes(field) ? parseNum(val) : (val || null)
      })
      if (row.address) rows.push(row)
    }

    console.log(`Rows parsed: ${rows.length}`)
    if (rows.length > 0) console.log(`Sample row: ${JSON.stringify(rows[0])}`)

    await supabase.from('comps').delete().eq('account_id', user.id)

    let inserted = 0
    for (let i = 0; i < rows.length; i += 100) {
      const batch = rows.slice(i, i + 100)
      const { error } = await supabase.from('comps').insert(batch)
      if (error) console.error(`Insert error: ${error.message}`)
      else inserted += batch.length
    }

    console.log(`Inserted: ${inserted}`)
    return new Response(JSON.stringify({ success: true, inserted, dataset_id: datasetId }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  } catch (err: any) {
    console.error(`Error: ${err.message}`)
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
