import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://mabphntvwnxmhshqbqcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzNTY3OSwiZXhwIjoyMDc0NjExNjc5fQ.7MgoRxv3dcEFLnjtK9WlsljQNX-u0d0zZESrvX2m5tw'
)

const userId = '757a0f4a-49cd-43b3-b6c2-70274f611039'

// Delete child tables first, then parent
const tables = [
  { table: 'property_analysis', col: 'account_id' },
  { table: 'activity_log', col: 'account_id' },
  { table: 'documents', col: 'account_id' },
  { table: 'offers', col: 'account_id' },
  { table: 'communications', col: 'account_id' },
  { table: 'properties', col: 'account_id' },
  { table: 'comps', col: 'account_id' },
  { table: 'datasets', col: 'account_id' },
  { table: 'market_analysis', col: 'account_id' },
]

for (const { table, col } of tables) {
  const { error, count } = await supabase.from(table).delete().eq(col, userId)
  if (error) console.log(`${table}: SKIP (${error.message})`)
  else console.log(`${table}: deleted ✅`)
}

console.log('\n✅ Clean slate done')
