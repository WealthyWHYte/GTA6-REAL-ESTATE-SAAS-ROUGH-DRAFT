import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://mabphntvwnxmhshqbqcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzNTY3OSwiZXhwIjoyMDc0NjExNjc5fQ.7MgoRxv3dcEFLnjtK9WlsljQNX-u0d0zZESrvX2m5tw'
)

const { data, error } = await supabase
  .from('properties')
  .select('listing_price, estimated_equity, mortgage_balance, days_on_market, market_value')
  .limit(10)

if (error) { console.log('Error:', error.message); process.exit(1) }

console.log('Sample rows:')
data.forEach(p => console.log(JSON.stringify(p)))

const { count: nullMortgage } = await supabase
  .from('properties').select('*', { count: 'exact', head: true }).is('mortgage_balance', null)
const { count: nullEquity } = await supabase
  .from('properties').select('*', { count: 'exact', head: true }).is('estimated_equity', null)

console.log('\nNull mortgage_balance:', nullMortgage, '/ 880')
console.log('Null estimated_equity:', nullEquity, '/ 880')
