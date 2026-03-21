import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  'https://mabphntvwnxmhshqbqcn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzNTY3OSwiZXhwIjoyMDc0NjExNjc5fQ.7MgoRxv3dcEFLnjtK9WlsljQNX-u0d0zZESrvX2m5tw'
)
const { count } = await supabase
  .from('property_analysis')
  .select('*', { count: 'exact', head: true })
  .eq('account_id', '757a0f4a-49cd-43b3-b6c2-70274f611039')
console.log('Rows for your account:', count)
