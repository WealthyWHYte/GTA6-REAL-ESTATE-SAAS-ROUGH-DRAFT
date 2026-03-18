#!/bin/bash
# deploy-all.sh - Deploy all AI agents and fixes

echo "🚀 Deploying all AI agents..."

cd "$(dirname "$0")"

# Deploy Edge Functions
echo "📦 Deploying Edge Functions..."

echo "  → AI Router..."
cp supabase/functions/_shared/ai-router.ts supabase/functions/_shared/ai-router.ts.bak 2>/dev/null

echo "  → Market Scout..."
supabase functions deploy analyze-market --no-verify-jwt

echo "  → Underwriter..."
supabase functions deploy underwrite-properties --no-verify-jwt

echo "  → Email Generator..."
supabase functions deploy generate-email --no-verify-jwt

echo "  → Dispo Match..."
supabase functions deploy dispo-match --no-verify-jwt

echo "  → Gmail Replies..."
supabase functions deploy check-gmail-replies --no-verify-jwt

echo ""
echo "✅ All Edge Functions deployed!"
echo ""
echo "📋 NEXT STEPS:"
echo ""
echo "1. Run the SQL migration for disposition tables:"
echo "   psql -f supabase/migrations/020_disposition_system.sql"
echo ""
echo "2. Build the frontend:"
echo "   npm run build"
echo ""
echo "3. Test the pipeline:"
echo "   - Upload CSV properties"
echo "   - Click 'Re-Analyze Market' in Market Scout"
echo "   - Click 'Score Properties' in Underwriter"
echo "   - Click 'Generate Email' for a property"
echo ""
echo "🎉 Done!"
