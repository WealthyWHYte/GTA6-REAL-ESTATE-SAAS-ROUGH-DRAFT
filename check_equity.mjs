import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://mabphntvwnxmhshqbqcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzNTY3OSwiZXhwIjoyMDc0NjExNjc5fQ.7MgoRxv3dcEFLnjtK9WlsljQNX-u0d0zZESrvX2m5tw'
)

const { data } = await supabase
  .from('properties')
  .select('listing_price, estimated_equity, open_mortgage_balance')
  .limit(20)

data.forEach(p => console.log({
  price: p.listing_price,
  equity: p.estimated_equity,
  mortgage: p.open_mortgage_balance,
  equity_pct: p.listing_price ? Math.round((p.estimated_equity||0)/p.listing_price*100)+'%' : 'N/A'
}))
