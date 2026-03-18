-- ============================================
-- EMAIL TEMPLATES - Creative Finance Optimized
-- Run this in Supabase SQL Editor
-- Uses auth.uid() to get current user
-- ============================================

-- TEMPLATE 1: Initial Offer - Seller Finance
INSERT INTO email_templates (account_id, template_type, name, subject, body, active)
SELECT 
  auth.uid(),
  'initial_offer', 
  'Seller Finance - Initial', 
  'Full Price Offer on {address} - Creative Terms',
  'Hi {agent_name},

I''m reaching out about {address} listed at ${listing_price}. I''d like to present a full-price offer with seller financing terms that could benefit your client significantly.

KEY TERMS:
- Purchase Price: ${listing_price} (full asking price)
- Structure: Seller financing
- Down Payment: {down_payment}% (${down_dollar})
- Monthly payments over {term} years
- Interest rate: {rate}% (above market)
- Balloon payment: {balloon_years} years
- Fast closing: 7-14 days

SELLER BENEFITS:
✓ Full asking price achieved
✓ Monthly income stream for {term} years
✓ Tax advantages (installment sale vs. lump sum)
✓ Higher interest rate than savings/CDs
✓ No realtor commission on my end

I''m a serious buyer with proven funds. I can provide proof of funds and references upon request.

Are you available for a brief call this week to discuss? I can send the formal offer today if your seller is interested in creative terms.

Best regards,
GTA 6 Real Estate
{phone}',
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (account_id, template_type) DO NOTHING;

-- TEMPLATE 2: Initial Offer - Subject-To
INSERT INTO email_templates (account_id, template_type, name, subject, body, active)
SELECT 
  auth.uid(),
  'initial_offer', 
  'Subject-To - Initial',
  'Cash Relief Offer on {address}',
  'Hi {agent_name},

I specialize in helping sellers who need immediate mortgage relief. I''m interested in {address} and can take over payments immediately.

WHAT I'M PROPOSING:
- Take title subject to existing mortgage
- Assume all payments starting next month
- Your client gets full asking price (${listing_price})
- Entry fee: ${entry_fee}
- Seller relieved of monthly obligation immediately
- Fast closing: 7-10 days

WHY THIS WORKS:
✓ Seller avoids foreclosure/late payments
✓ Credit protected (payments stay current)
✓ No need for bank approval
✓ Fast, guaranteed close
✓ Property sold "as-is"

This structure works best for sellers facing:
- Job relocation
- Financial hardship
- Inherited property
- Divorce situations

Is your seller open to creative solutions? I can explain the details on a quick call and provide references from similar transactions.

Best,
GTA 6 Real Estate
{phone}',
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (account_id, template_type) DO NOTHING;

-- TEMPLATE 3: Follow-Up #1 (3 Days)
INSERT INTO email_templates (account_id, template_type, name, subject, body, active)
SELECT 
  auth.uid(),
  'follow_up_1', 
  'Follow-Up #1',
  'Re: {address}',
  'Hi {agent_name},

Following up on my offer for {address}. I know you''re busy, so I''ll keep this brief.

Quick recap:
- Full price: ${listing_price}
- {strategy} structure
- Fast close: {days} days
- {key_benefit}

I''m flexible on:
- Closing date (can accommodate your seller)
- Down payment amount
- Specific terms

Not flexible on:
- Our ability to close quickly
- Treating this as a priority deal

Any chance your seller is open to discussing creative terms? Even a 10-minute call would help me understand their situation better.

Thanks for considering,
GTA 6 Real Estate',
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (account_id, template_type) DO NOTHING;

-- TEMPLATE 4: Follow-Up #2 (7 Days)
INSERT INTO email_templates (account_id, template_type, name, subject, body, active)
SELECT 
  auth.uid(),
  'follow_up_2', 
  'Follow-Up #2',
  'Last Follow-Up - {address}',
  '{agent_name},

I understand you might be fielding multiple offers on {address}. Before I move on to other properties, I wanted to reach out one final time.

What makes our offer unique:
- We close FAST (as quick as 7 days)
- No financing contingencies
- No repair requests
- Flexible to seller''s timeline
- Full asking price on terms

If your seller''s situation has changed or if they''re having trouble with other buyers'' financing, I''m still very interested.

Otherwise, I''ll assume this isn''t the right fit and won''t bother you again. I appreciate your time either way.

Best of luck with the sale,
GTA 6 Real Estate',
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (account_id, template_type) DO NOTHING;

-- TEMPLATE 5: Objection Response - Price Too Low
INSERT INTO email_templates (account_id, template_type, name, subject, body, active)
SELECT 
  auth.uid(),
  'objection_low', 
  'Objection - Price Low',
  'Re: Revised Offer Structure',
  'Hi {agent_name},

I appreciate you sharing your seller''s feedback about the price. Let me clarify our position and present an alternative.

OPTION A (Original):
Down: ${down_payment} / Monthly: ${monthly} / Terms: {term} years
= Total to seller: ${original_total}

OPTION B (Revised - Full Price):
Purchase Price: ${listing_price} (100% of asking)
Structure: Seller financing
Down: ${down_payment_2} / Monthly: ${monthly_2} / Interest: {rate}%
Balloon: {balloon_years} years
= Total to seller: ${full_price_total}

Your seller gets:
✓ FULL asking price
✓ Additional interest income (${interest_total} over term)
✓ Tax benefits (installment sale)
✓ Monthly cash flow for {term} years

The key question: Would your seller prefer full asking price over time with interest, or are they strictly looking for all-cash today?

If cash is required, I understand and we can part as friends. But if they''re open to guaranteed monthly income, Option B puts significantly more money in their pocket.

Happy to discuss,
GTA 6 Real Estate',
  true
WHERE auth.uid() IS NOT NULL
ON CONFLICT (account_id, template_type) DO NOTHING;

-- Verify templates
-- SELECT template_type, name, active FROM email_templates;
