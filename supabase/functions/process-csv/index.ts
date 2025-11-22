import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { csv_data, account_id } = await req.json()

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Generate dataset ID
    const dataset_id = `DS-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`

    // Parse CSV (simple implementation)
    const lines = csv_data.split('\n')
    const headers = lines[0].split(',').map((h: string) => h.trim())
    const properties = []

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue

      const values = lines[i].split(',')
      const property: any = {
        property_id: `PROP-${Date.now()}-${i}`,
        dataset_id,
        account_id,
        status: 'PENDING_RESEARCH',
        created_at: new Date().toISOString()
      }

      // Map CSV columns to database columns
      headers.forEach((header: string, index: number) => {
        const value = values[index]?.trim()

        // Clean and map common PropWire columns
        switch(header.toLowerCase()) {
          case 'address':
          case 'property address':
            property.address = value
            break
          case 'city':
            property.city = value
            break
          case 'state':
            property.state = value?.toUpperCase()
            break
          case 'zip':
          case 'zipcode':
            property.zip = value
            break
          case 'price':
          case 'list price':
            property.list_price = parseFloat(value?.replace(/[$,]/g, ''))
            break
          case 'beds':
          case 'bedrooms':
            property.bedrooms = parseInt(value)
            break
          case 'baths':
          case 'bathrooms':
            property.bathrooms = parseFloat(value)
            break
          case 'sqft':
          case 'square feet':
            property.sqft = parseInt(value?.replace(/,/g, ''))
            break
          case 'agent email':
            property.agent_email = value
            break
          case 'agent name':
            property.agent_name = value
            break
        }
      })

      properties.push(property)
    }

    // Create dataset record
    const { error: datasetError } = await supabase
      .from('datasets')
      .insert({
        dataset_id,
        account_id,
        name: `Upload ${new Date().toISOString()}`,
        status: 'PROCESSING',
        row_count: properties.length,
        source: 'PropWire'
      })

    if (datasetError) throw datasetError

    // Insert properties
    const { error: propertiesError } = await supabase
      .from('properties')
      .insert(properties)

    if (propertiesError) throw propertiesError

    // Trigger MCP server for each property (async, don't wait)
    const mcpUrl = Deno.env.get('MCP_SERVER_URL') || 'http://localhost:3000'

    properties.forEach(async (prop) => {
      try {
        await fetch(`${mcpUrl}/api/process-property`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            property_id: prop.property_id,
            account_id
          })
        })
      } catch (err) {
        console.error('MCP trigger failed:', err)
      }
    })

    return new Response(
      JSON.stringify({
        success: true,
        dataset_id,
        properties_count: properties.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400
      }
    )
  }
})
