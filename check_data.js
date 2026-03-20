const { createClient } = require('@supabase/supabase-js')
const supabase = createClient(
  'https://mabphntvwnxmhshqbqcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg0MzIyNTcsImV4cCI6MjA1NDAwODI1N30.BSM1tAGHQy_9YPbFMIaFnZtYiAJFOhh5hLBvMoI_oUY'
)

async function check() {
  const { data } = await supabase
    .from('properties')
    .select('listing_price, estimated_equity, mortgage_balance, days_on_market')
    .limit(10)
  
  console.log('Sample rows:')
  data.forEach(p => console.log({
    price: p.listing_price,
    equity: p.estimated_equity,
    mortgage: p.mortgage_balance,
    dom: p.days_on_market
  }))
  
  // Count nulls
  const { count: nullMortgage } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .is('mortgage_balance', null)
  
  const { count: nullEquity } = await supabase
    .from('properties')
    .select('*', { count: 'exact', head: true })
    .is('estimated_equity', null)

  console.log('\nNull mortgage_balance:', nullMortgage, '/ 880')
  console.log('Null estimated_equity:', nullEquity, '/ 880')
}
check()
