import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://mabphntvwnxmhshqbqcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzNTY3OSwiZXhwIjoyMDc0NjExNjc5fQ.7MgoRxv3dcEFLnjtK9WlsljQNX-u0d0zZESrvX2m5tw'
)
const { data } = await supabase
  .from('properties')
  .select('address, listing_price, open_mortgage_balance, interest_rate, days_on_market')
  .gt('open_mortgage_balance', 0)
  .lt('interest_rate', 4.5)
  .order('interest_rate', { ascending: true })
  .limit(10)
console.log('Properties with rates under 4.5%:')
data?.forEach(p => console.log(`  ${p.address}: rate=${p.interest_rate}%, balance=$${p.open_mortgage_balance?.toLocaleString()}, DOM=${p.days_on_market}`))

const { count } = await supabase.from('properties').select('*', { count: 'exact', head: true }).lt('interest_rate', 4.5).gt('open_mortgage_balance', 0)
console.log(`\nTotal with rate < 4.5%: ${count}`)
