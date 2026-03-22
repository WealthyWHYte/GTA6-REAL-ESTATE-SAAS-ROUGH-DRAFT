import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://mabphntvwnxmhshqbqcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzNTY3OSwiZXhwIjoyMDc0NjExNjc5fQ.7MgoRxv3dcEFLnjtK9WlsljQNX-u0d0zZESrvX2m5tw'
)
const { data } = await supabase.from('property_analysis').select('property_id, win_win_score').limit(3)
console.log('Analysis sample:', JSON.stringify(data))
const ids = data.map(d => d.property_id)
const { data: props } = await supabase.from('properties').select('id, address').in('id', ids)
console.log('Properties match:', JSON.stringify(props))
