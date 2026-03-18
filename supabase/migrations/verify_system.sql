-- ============================================
-- SYSTEM VERIFICATION QUERIES
-- Run these in Supabase SQL Editor
-- ============================================

-- 1. Check properties table
SELECT 
    COUNT(*) as total_properties,
    COUNT(CASE WHEN listing_price > 0 THEN 1 END) as with_price,
    COUNT(CASE WHEN deal_status = 'email_sent' THEN 1 END) as emailed,
    COUNT(CASE WHEN deal_status = 'negotiating' THEN 1 END) as negotiating,
    COUNT(CASE WHEN deal_status = 'terms_agreed' THEN 1 END) as terms_agreed,
    COUNT(CASE WHEN deal_status = 'closed' THEN 1 END) as closed
FROM properties;

-- 2. Check properties columns
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'properties'
  AND column_name IN ('deal_status', 'agreed_price', 'deal_structure', 'closing_date', 'agent_email', 'listing_price', 'address');

-- 3. Check user_api_config columns (for Gmail OAuth)
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'user_api_config';

-- 4. Check email_templates
SELECT template_type, name, active
FROM email_templates
LIMIT 10;

-- 5. Check if contracts table exists (run if not)
SELECT EXISTS (
   SELECT FROM information_schema.tables 
   WHERE table_schema = 'public'
   AND table_name = 'contracts'
) as contracts_table_exists;

-- 6. Check accounts table
SELECT COUNT(*) as total_accounts FROM accounts;

-- 7. Check auth.users
SELECT COUNT(*) as total_users FROM auth.users;

-- 8. Sample property with agent info
SELECT 
    address, 
    listing_price, 
    listing_agent_full_name, 
    listing_agent_email,
    deal_status,
    agent_email
FROM properties
WHERE listing_price > 0
LIMIT 5;
