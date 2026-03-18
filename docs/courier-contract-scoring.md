# GTA6.COURIER Contract Scoring System

## Overview

This system scores every contract opportunity so you can prioritize high-value matches and ignore low-margin work. The AI analyzes contracts and assigns a score (0-100) based on profitability, fit, and reliability.

---

## 📊 Scoring Algorithm

### Score Components

| Component | Weight | Description |
|----------|--------|-------------|
| Rate Score | 30% | Profitability of the rate |
| Vehicle Match | 20% | Fits your carrier network |
| Volume Potential | 20% | Recurring vs one-time |
| Industry Score | 15% | Target industries preferred |
| Location Score | 15% | Geographic coverage |

### Score Thresholds

| Score | Action |
|-------|--------|
| 80-100 | **HOT** - Immediate pursuit |
| 60-79 | **WARM** - Priority pursuit |
| 40-59 | **LUKEWARM** - Consider if slow |
| 0-39 | **COLD** - Pass |

---

## 1️⃣ Rate Score (30 Points Max)

### Per-Mile Analysis

| Rate/Mile | Points | Notes |
|-----------|--------|-------|
| $3.00+ | 30 | Excellent |
| $2.50-2.99 | 25 | Good |
| $2.00-2.49 | 20 | Average |
| $1.50-1.99 | 15 | Below average |
| $1.00-1.49 | 10 | Poor |
| <$1.00 | 0 | Loss leader |

### Flat Fee Analysis

| Daily Rate | Vehicle | Points |
|------------|---------|--------|
| $400+ | Sprinter | 30 |
| $300-399 | Sprinter | 25 |
| $250-299 | Sprinter | 20 |
| $400+ | Box Truck | 30 |
| $300-399 | Box Truck | 25 |
| $250-299 | Box Truck | 20 |

### Per Stop Analysis

| Per Stop | Points |
|----------|--------|
| $8.00+ | 30 |
| $6.00-7.99 | 25 |
| $4.00-5.99 | 20 |
| $2.00-3.99 | 15 |
| <$2.00 | 10 |

---

## 2️⃣ Vehicle Match Score (20 Points Max)

### Your Network Priority

| Vehicle | Available | Points |
|---------|-----------|--------|
| Sprinter | Yes | 20 |
| Sprinter | Limited | 15 |
| Car | Yes | 15 |
| Car | Limited | 10 |
| Box Truck | Yes | 20 |
| Box Truck | Limited | 15 |
| Semi | Yes | 20 |
| Semi | Limited | 10 |

### Matching Logic

```
IF contract.vehicle_required = "sprinter" AND carriers.sprinter.available > 5:
    score = 20
ELIF contract.vehicle_required = "sprinter" AND carriers.sprinter.available > 0:
    score = 15
ELIF contract.vehicle_required = "any":
    score = 15
ELSE:
    score = 5
```

---

## 3️⃣ Volume Potential (20 Points Max)

### Contract Type

| Type | Points | Reasoning |
|------|--------|-----------|
| Daily Route | 20 | Predictable revenue |
| Weekly Recurring | 15 | Regular volume |
| Monthly Contract | 12 | Some consistency |
| One-time | 5 | No guarantee |
| Spot/As-needed | 5 | Low commitment |

### Estimated Volume

| Deliveries/Week | Points |
|----------------|--------|
| 50+ | 20 |
| 21-50 | 15 |
| 11-20 | 10 |
| 1-10 | 5 |

---

## 4️⃣ Industry Score (15 Points Max)

### Target Industries (Priority)

| Industry | Points | Notes |
|----------|--------|-------|
| Medical/Labs | 15 | High value, recurring |
| Legal | 15 | Daily needs |
| IT/Tech | 15 | High margin |
| Banking/Finance | 12 | Reliable |
| Pharmacies | 12 | Daily routes |

### Secondary Industries

| Industry | Points |
|----------|--------|
| Manufacturing | 10 |
| Retail | 8 |
| E-commerce | 8 |
| Government | 10 |

### Low Priority

| Industry | Points |
|----------|--------|
| Food/Beverage | 5 |
| Generic | 5 |

---

## 5️⃣ Location Score (15 Points Max)

### Geographic Factors

| Factor | Points |
|--------|--------|
| In your home city | 15 |
| Within 25 miles | 12 |
| 25-50 miles | 10 |
| 50-100 miles | 8 |
| 100+ miles | 5 |
| Out of region | 0 |

### Route Efficiency

| Stops/Day | Points |
|-----------|--------|
| 15+ | 15 |
| 10-14 | 12 |
| 5-9 | 8 |
| 1-4 | 5 |

---

## 🔥 Score Calculation Example

### Sample Contract

```
Contract Details:
- Source: Indeed
- Type: 1099 Courier
- Rate: $2.50/mile
- Vehicle: Sprinter
- Location: Miami, FL
- Industry: Medical Lab
- Volume: Daily route
- Est. stops: 12/day
```

### Scoring Breakdown

| Component | Calculation | Score |
|-----------|-------------|-------|
| Rate Score | $2.50 = "Good" | 25 |
| Vehicle Match | Sprinter available | 20 |
| Volume | Daily route | 20 |
| Industry | Medical lab | 15 |
| Location | In-city | 15 |
| **TOTAL** | | **95/100** |

**Result: HOT** 🔥 - Immediate pursuit

---

## 📋 Contract Scoring Worksheet

### For Each Contract, Fill This Out

```
CONTRACT: [Name/Source]
Rate: $______ /mile or $______ flat
Vehicle Required: [ ]
Location: [City, State]
Distance: _______ miles
Industry: [ ]
Volume: [Daily/Weekly/Monthly/One-time]
Est. stops: _______ /day

SCORING:
Rate Score: _______ /30
Vehicle Match: _______ /20
Volume Score: _______ /20
Industry Score: _______ /15
Location Score: _______ /15
TOTAL: _______ /100

ACTION: [ ] HOT [ ] WARM [ ] LUKEWARM [ ] COLD
```

---

## 🤖 AI Auto-Scoring Logic

### How the System Works

```
function scoreContract(contract):
    rateScore = calculateRateScore(contract.rate, contract.type)
    vehicleScore = calculateVehicleMatch(contract.vehicle, network)
    volumeScore = calculateVolumeScore(contract.volume)
    industryScore = calculateIndustryScore(contract.industry)
    locationScore = calculateLocationScore(contract.location)
    
    totalScore = (
        rateScore * 0.30 +
        vehicleScore * 0.20 +
        volumeScore * 0.20 +
        industryScore * 0.15 +
        locationScore * 0.15
    )
    
    if totalScore >= 80: return "HOT"
    elif totalScore >= 60: return "WARM"
    elif totalScore >= 40: return "LUKEWARM"
    else: return "COLD"
```

---

## 📈 Dashboard Integration

### Contract Feed Display

The dashboard shows contracts with color coding:

| Badge | Color | Score |
|-------|-------|-------|
| 🔥 HOT | Red | 80-100 |
| ⚡ WARM | Yellow | 60-79 |
| ❄️ LUKEWARM | Blue | 40-59 |
| ⏳ COLD | Gray | 0-39 |

### Filtering Options

- Show only: [ ] HOT [ ] WARM [ ] LUKEWARM
- By vehicle: [ ] Car [ ] Sprinter [ ] Box Truck [ ] Semi
- By industry: [ ] Medical [ ] Legal [ ] IT [ ] All

---

## 🎯 Prioritization Rules

### Daily Priority List

1. **Score 90+**: Contact within 2 hours
2. **Score 80-89**: Contact same day
3. **Score 70-79**: Contact within 24 hours
4. **Score 60-69**: Contact within 48 hours
5. **Score <60**: Log, but don't prioritize

### Resource Allocation

| Score Tier | Effort | Expected Win Rate |
|------------|--------|------------------|
| 90+ | High effort | 40% |
| 80-89 | High effort | 30% |
| 70-79 | Medium effort | 20% |
| <70 | Low effort | 10% |

---

## 🔄 Continuous Improvement

### Track Your Win Rate

| Score Range | Pursued | Won | Win Rate |
|-------------|----------|-----|----------|
| 90-100 | ___ | ___ | ___% |
| 80-89 | ___ | ___ | ___% |
| 70-79 | ___ | ___ | ___% |
| <70 | ___ | ___ | ___% |

### Adjust Scoring

If you're winning low-score contracts:
- Your rates might be too high
- Lower your threshold

If you're losing high-score contracts:
- Improve outreach speed
- Check your carrier availability

---

## 📝 Quick Reference

### Score Cheat Sheet

| Quick Check | Score |
|-------------|-------|
| Is rate good? (>$2/mile) | +25 |
| Do you have the vehicle? | +20 |
| Is it daily/repeating? | +20 |
| Medical/Legal/IT industry? | +15 |
| Is it in your city? | +15 |

**If <3 "yes" → Probably COLD**

---

*Part of the GTA6.COURIER Dispatch System*
