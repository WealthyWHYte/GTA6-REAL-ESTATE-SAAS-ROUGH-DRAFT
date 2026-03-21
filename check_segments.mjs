import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://mabphntvwnxmhshqbqcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzNTY3OSwiZXhwIjoyMDc0NjExNjc5fQ.7MgoRxv3dcEFLnjtK9WlsljQNX-u0d0zZESrvX2m5tw'
)

const { data: props } = await supabase
  .from('properties')
  .select('listing_price, estimated_value, open_mortgage_balance, days_on_market')

console.log('Total:', props.length)

const highEquity = props.filter(p => {
  const val = p.estimated_value || 0
  const mortgage = p.open_mortgage_balance || 0
  const price = p.listing_price || 1
  const realEquity = val > 0 ? val - mortgage : 0
  return realEquity > price * 0.3
}).length

const motivated = props.filter(p => (p.days_on_market || 0) >= 90).length
const freeClear = props.filter(p => !p.open_mortgage_balance || p.open_mortgage_balance === 0).length
const subjectTo = props.filter(p => {
  const mortgage = p.open_mortgage_balance || 0
  const val = p.estimated_value || 0
  return mortgage > 0 && val > mortgage
}).length

console.log('High Equity 30%+:', highEquity)
console.log('Motivated 90+ DOM:', motivated)
console.log('Free & Clear:', freeClear)
console.log('Subject-To:', subjectTo)
