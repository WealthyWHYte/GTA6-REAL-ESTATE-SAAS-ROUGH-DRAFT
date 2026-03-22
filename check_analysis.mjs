import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://mabphntvwnxmhshqbqcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzNTY3OSwiZXhwIjoyMDc0NjExNjc5fQ.7MgoRxv3dcEFLnjtK9WlsljQNX-u0d0zZESrvX2m5tw'
)
// Check if property_ids in analysis match ids in properties
const { data: analysis } = await supabase.from('property_analysis').select('property_id').limit(5)
const ids = analysis.map(a => a.property_id).filter(Boolean)
console.log('Analysis property_ids:', ids)

const { data: props } = await supabase.from('properties').select('id, address').in('id', ids)
console.log('Matching properties:', props?.length, props)

// Also check total properties count
const { count } = await supabase.from('properties').select('*', { count: 'exact', head: true })
console.log('Total properties in DB:', count)
