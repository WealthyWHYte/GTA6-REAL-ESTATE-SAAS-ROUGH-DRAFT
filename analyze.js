import fetch from 'node-fetch';

const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1hYnBobnR2d254bWhzaHFicWNuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTAzNTY3OSwiZXhwIjoyMDc0NjExNjc5fQ.7MgoRxv3dcEFLnjtK9WlsljQNX-u0d0zZESrvX2m5tw';
const FUNCTION_URL = 'https://mabphntvwnxmhshqbqcn.supabase.co/functions/v1/analyze-market';

const data = {
  property_ids: ["fdc1e05b-31aa-4eed-825c-0fbc3cc79bbe"], // replace with your property IDs
  city: "MIRAMAR",
  state: "FL"
};

async function run() {
  const res = await fetch(FUNCTION_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  });

  const result = await res.json();
  console.log(result);
}

run();
