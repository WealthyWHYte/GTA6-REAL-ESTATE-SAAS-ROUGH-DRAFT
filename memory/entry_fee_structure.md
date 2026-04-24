---
name: entry fee breakdown structure
description: Entry fee allocation rules - seller/agent get % of offer, rest splits remainder
type: feedback
---

**Entry Fee Breakdown Structure:**

1. **Cash to Seller**: 3% of offer price
2. **Listing Agent Commission**: 3% of offer (2% for deals ≥$5M)
3. **Remainder** = Entry Fee - (Seller + Agent portions)
4. **Remainder splits**:
   - Arrears / Liens: 40% of remainder
   - Cost of Acquisition: 25% of remainder
   - Close Escrow: 15% of remainder
   - Renovation / Maintenance / Marketing: 20% of remainder

**Target**: Total entry fee ≤10% of offer (20-30% acceptable for complex deals)

**Why:** Previous implementation calculated everything as % of entry fee, which didn't align with the actual business rule that seller cash and agent commission should be fixed percentages of the offer price. The remainder after paying seller+agent is what gets split among operational costs.

**How to apply:** When modifying entry fee logic in `supabase/functions/generate-email/index.ts`, always calculate seller/agent first as % of offer price, then split what's left. Never calculate seller/agent as % of entry fee.
