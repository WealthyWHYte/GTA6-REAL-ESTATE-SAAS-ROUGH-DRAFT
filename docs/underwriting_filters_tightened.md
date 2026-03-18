# Underwriting Filters - Tightened Math Discipline
## Strict Criteria for Deal Viability

---

## Overview

This document defines the tightened underwriting filters that replace the previous loose criteria. The goal is **fewer but stronger targets** rather than inflated viability rates.

---

## Key Changes from Previous Version

| Metric | Old (Loose) | New (Tight) |
|--------|-------------|-------------|
| Cash Flow Viable | 61.9% | ~25-35% |
| Subject-To Candidates | 126 | ~30-40 |
| High Score Deals | 105 | ~20-30 |

**Why?** Soft filters create wasted negotiation cycles. Tight filters create surgical opportunities.

---

## Tier 1: Fast Screen (Auto Pass/Fail)

Reject immediately if ANY of these trigger:

### Price Rejection
- Listing Price > ARV × 1.02
- Days on Market > 180 (stale inventory)

### Rent Rejection
- No rent data AND estimated rent < 1% of value
- Price-to-Rent ratio > 20

### Size Rejection
- Living sqft < 500
- Living sqft > 10,000 (commercial risk)
- Bedrooms < 1 or > 20

### Financial Rejection
- Tax amount > 3% of value annually
- Open mortgage balance > 95% of value

---

## Tier 2: Debt Advantage Check

### Retail Payment Baseline

Calculate retail payment as:
```
Retail = 25% down + 8% interest + 30-year amort
```

### Creative Payment Calculation

For each deal, calculate both:
```
Option A: Subject-To (if rate advantage exists)
Option B: Seller Financing (5-7%, 40-year amort, 10% down)
Option C: Conventional (10% down, current market rate)
```

### Payment Advantage Threshold

**MINIMUM 15% payment advantage required.**

Formula:
```
Advantage % = (Retail Payment - Creative Payment) / Retail Payment × 100
```

If advantage < 15% → Do NOT send creative offer.

---

## Tier 3: Subject-To Tightened Criteria

Subject-To is NOT automatic just because rate is below market.

**ALL of these must be true:**

| Criterion | Threshold |
|----------|-----------|
| Existing Rate | ≤ Current Market - 1.5% |
| Equity Position | ≥ 15% |
| Days on Market | ≥ 45 |
| Projected Cash Flow | ≥ $500/month |
| Owner Type | Not corporate (avoid LLCs) |
| Mortgage Type | Conventional (no government loans) |

**Result:** This will reduce Subject-To candidates from ~126 to ~30-40.

---

## Tier 4: Cash Flow with Reserves

### Previous (Inflated):
```
Cash Flow = Rent Proxy - Payment
```

### New (Realistic):
```
Effective Rent = Rent Proxy × 0.80 (reserve adjustment)
Vacancy Factor = 8%
Maintenance Reserve = 8%
PM Reserve = 8% (even if self-managing, reserve for future)
Total Reserve = 24%

Net Operating Rent = Gross Rent × 0.76
Cash Flow = Net Operating Rent - Total Payment
```

### Minimum Cash Flow: $700/month

---

## Tier 5: Deal Scoring (Revised)

### Scoring Formula

Score based on **Payment Advantage %**, not just equity/rate.

| Factor | Points |
|--------|--------|
| Payment Advantage >25% | +5 |
| Payment Advantage 20-25% | +4 |
| Payment Advantage 15-20% | +3 |
| Equity >40% | +2 |
| Equity 30-40% | +1 |
| DOM >60 | +1 |
| DOM >90 | +2 |
| Owner Occupied | +1 |
| Owned >5 years | +1 |

**Maximum Score: 12 points**

### Score Thresholds:

| Score | Classification | Action |
|-------|---------------|--------|
| 9-12 | **Elite** | Priority negotiation |
| 6-8 | **Viable** | Standard offer |
| 3-5 | **Marginal** | Low-ball only |
| 0-2 | **Pass** | Skip |

---

## Tier 6: Offer Banding

Instead of custom pricing per property, use structured bands:

### Band A - Strong Cash Flow (Score 9-12)
- Offer: 92-97% of Listing Price
- Strategy: Full price, excellent terms
- Financing: Subject-To or Seller Financing

### Band B - Moderate (Score 6-8)
- Offer: 85-92% of Listing Price
- Strategy: Standard creative terms
- Financing: Seller Financing or Conventional

### Band C - Weak/Marginal (Score 3-5)
- Offer: 75-85% of Listing Price
- Strategy: Aggressive discount
- Financing: Cash or assumption only

### Band D - Skip (Score 0-2)
- Do NOT send offer
- Save for market research only

---

## Capital Requirements

### Maximum Entry Capital Rule

```
TECR (Total Entry Capital Required) = Down Payment + Closing Costs + Rehab Reserve

MAX TECR = 15% of Property Value
```

If TECR > 15% → Flag for manual review or reject.

### Rehab Reserve Calculation
- Minor cosmetic: 3-5% of value
- Moderate: 7-10% of value
- Major: 15-20% of value

---

## Decision Matrix: Keep or Assign?

| Metric | Keep (Hold) | Assign |
|--------|-------------|--------|
| Cash Flow | ≥$700/mo | <$700/mo |
| Payment Advantage | ≥20% | <15% |
| Entry Capital | ≤12% | N/A |
| Score | ≥9 | <6 |

---

## Summary: The Tight Filter Pipeline

```
Properties → Tier 1 (Fast Screen) → Tier 2 (Debt Advantage) → Tier 3 (Sub-To) → Tier 4 (Cash Flow w/ Reserves) → Tier 5 (Scoring) → Tier 6 (Banding)
```

Expected output from 226 properties:
- Auto-reject: ~100 (Tier 1)
- Creative viable: ~40-50 (Tier 2-3)
- Cash flow viable: ~30-40 (Tier 4)
- Elite deals: ~20-30 (Tier 5)

---

## Configuration Constants

```python
# Tightened Parameters
MIN_CASH_FLOW = 700  # Increased from $500
MIN_PAYMENT_ADVANTAGE = 15  # Percentage
SUBTO_MIN_EQUITY = 15  # Percentage
SUBTO_MIN_DOM = 45  # Days
MAX_TECR_PERCENT = 15  # Percentage of value
RESERVE_ADJUSTMENT = 0.76  # Applied to rent (24% reserves)
MIN_SCORE_FOR_OFFER = 6  # Minimum score to send
```

---

*Last Updated: Feb 2026*
*GTA 6 Real Estate*
