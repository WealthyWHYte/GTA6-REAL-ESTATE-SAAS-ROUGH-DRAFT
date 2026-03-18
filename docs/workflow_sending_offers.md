# Workflow: Sending Offers & Handling Responses
## Complete End-to-End Process

---

## Phase 1: Prepare Your Data

### 1. Export Properties from PropWire (or other source)
- Export as CSV with columns: Address, City, State, Zip, Price, Sqft, Beds, Baths
- Or use existing LA dataset: `235 Los Angeles Properties - Sep 1, 2025.csv`

### 2. Upload to System
- Go to `/upload` in your app
- Drop the CSV file
- Click "Start Processing"
- Monitor at `/mission-control`

---

## Phase 2: Underwriting (TIGHTENED FILTERS)

The system applies these filters automatically:

### Tier 1: Fast Screen (Auto Reject)
- Price > ARV × 1.02 → REJECT
- Days on Market > 180 → REJECT
- No rent data → REVIEW

### Tier 2: Debt Advantage Check
- Requires 15%+ payment advantage vs retail
- Retail = 25% down, 8%, 30yr

### Tier 3: Subject-To Criteria (ALL must be true)
- Equity ≥ 15%
- Rate ≤ Market - 1.5%
- DOM ≥ 45 days

### Tier 4: Cash Flow with Reserves
- Effective Rent = Rent × 0.76 (24% reserves)
- Minimum cash flow: $700/month

### Tier 5: Deal Scoring
- Score 0-12 based on payment advantage, equity, DOM
- Must score 6+ to send offer

---

## Phase 3: Generate & Send Offers

### Output Files
- `output/emails_to_send.csv` - Ready for import
- `output/properties_analyzed.json` - Full analysis
- `output/email_sequences.json` - Follow-up sequence

### Email Sequence
| Day | Action |
|-----|--------|
| Day 0 | Initial offer email |
| Day 3 | First follow-up |
| Day 7 | Second follow-up |
| Day 14 | Third follow-up |
| Day 30 | Final check-in |

### Email Best Practices
- Start with 10-15 emails/day (warm-up)
- Scale to 40-50/day over 2-3 weeks
- Always use professional language:
  - "Flexible Financing Available" not "Subject-To"
  - "Assumption-based options" not "Creative Financing"

---

## Phase 4: Handle Responses (COUNTER-INTELLIGENCE)

### When Agent Responds:

1. **Copy the response text** to the counter-intelligence engine
2. **Engine auto-parses:**
   - Extracts counter price
   - Extracts terms (down payment, rate, closing)
   - Recalculates cash flow
   - Checks against criteria

3. **Engine determines action:**

| If Cash Flow | If Payment Advantage | Action |
|--------------|---------------------|--------|
| ≥$700 | ≥15% | Accept or Counter |
| <$700 | Any | Counter with lower price |
| Any | <15% | Pivot to terms |

4. **Engine generates response email** automatically

### Example Counter Flow:
```
Agent: "Seller will accept $460K with 15% down"
         ↓
Engine parses: price=$460K, down=15%
         ↓
Calculates: new cash flow=$650 (below $700 threshold)
         ↓
Response: "Can we meet at $440K to maintain cash flow?"
```

---

## Phase 5: Track & Convert

### CRM Fields to Track:
- Offer sent date
- Response status (No response / Open / Replied / Counter / Accepted)
- Counter amount
- Final deal status
- Days in negotiation

### Conversion Metrics:
| Stage | Expected Rate |
|-------|--------------|
| Offers → Opens | 20-30% |
| Opens → Responses | 5-10% |
| Responses → Negotiations | 30-50% |
| Negotiations → Closings | 10-20% |

### Monthly Targets:
- 100 offers/week
- 5-10 conversations
- 1-3 deals/month

---

## Phase 6: Disposition Decision

For each deal that gets to contract stage:

| Factor | Keep (Hold) | Assign |
|--------|-------------|--------|
| Cash Flow | ≥$700/mo | <$700/mo |
| Payment Advantage | ≥20% | <15% |
| Entry Capital | ≤12% of value | N/A |
| Runway | 6+ months exists | N/A |

---

## Configuration: Gmail Sending

### Option A: Manual Export (Recommended for Safety)
1. Export `emails_to_send.csv`
2. Import into your email client
3. Send manually or with mail merge

### Option B: Direct SMTP (Faster but higher risk)
1. Configure Gmail App Password
2. System sends directly
3. Use warm-up protocol:
   - Week 1: 10 emails/day
   - Week 2: 20 emails/day
   - Week 3: 35 emails/day
   - Week 4+: 50 emails/day

---

## Quick Command Reference

```bash
# Run analysis on CSV
python -m underwriter.analyze_properties data/properties.csv

# Generate email sequences
python -m email_agent.generator output/properties_analyzed.json

# Test counter-intelligence
python -c "
from email_agent.counter_intelligence import CounterIntelligenceEngine, CounterOffer
engine = CounterIntelligenceEngine(500000, 4000, 425000)
counter = CounterOffer(425000, 460000, 10.0, 5.5)
result = engine.analyze_counter(counter, 6000)
print(result.reasoning)
"
```

---

*Last Updated: Feb 2026*
*GTA 6 Real Estate*
