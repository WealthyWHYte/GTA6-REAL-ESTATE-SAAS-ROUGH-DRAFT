// knowledge-base.ts
// Comprehensive knowledge base for AI agents
// This is embedded directly into all AI prompts

// ============================================================================
// DYNAMIC FORMULAS
// ============================================================================

/**
 * Calculate counter-offer based on listing price, DOM, equity, and negotiation level
 * @param askingPrice - The property's listing price
 * @param dom - Days on market
 * @param equityPercent - Equity percentage (estimated_value - mortgage) / estimated_value
 * @param level - 1, 2, or 3 (negotiation level)
 * @returns Object with offer price, down payment, monthly payment, rate, reasoning
 */
export function calculateCounter(
  askingPrice: number,
  dom: number,
  equityPercent: number,
  level: number = 1
): {
  offerPrice: number;
  downPayment: number;
  monthlyPayment: number;
  rate: number;
  reasoning: string;
} {
  // Base offer percentages by level
  const levelConfig = {
    1: { offerPct: 0.70, rate: 4, name: '70% + Terms (TARGET)' },
    2: { offerPct: 0.70, rate: 0, name: '70% All Cash' },
    3: { offerPct: 1.00, rate: 3, name: '100% Full Price' }
  }
  
  const config = levelConfig[level as keyof typeof levelConfig] || levelConfig[1]
  
  // DOM urgency adjustment: +1% to offer for every 30 days on market (max +10%)
  const domAdjustment = Math.min(Math.floor(dom / 30) * 0.01, 0.10)
  
  // Equity bonus: if equity > 50%, seller is more flexible - adjust down by 2%
  const equityBonus = equityPercent > 50 ? -0.02 : 0
  
  // Calculate final offer percentage
  const finalOfferPct = Math.max(config.offerPct + domAdjustment + equityBonus, 0.60)
  
  const offerPrice = Math.round(askingPrice * finalOfferPct)
  
  // Down payment: 3% for level 1, 10% for level 3
  const downPaymentPct = level === 3 ? 0.03 : 0.03
  const downPayment = Math.round(offerPrice * downPaymentPct)
  
  // Monthly payment calculation (seller finance portion)
  const sellerFinanceAmount = offerPrice - (askingPrice * 0.40) // Assume 40% existing mortgage
  const monthlyPayment = Math.round(
    (sellerFinanceAmount * (config.rate / 100 / 12)) / 
    (1 - Math.pow(1 + config.rate / 100 / 12, -360))
  )
  
  return {
    offerPrice,
    downPayment,
    monthlyPayment: isNaN(monthlyPayment) ? 0 : monthlyPayment,
    rate: config.rate,
    reasoning: `${config.name}: ${(finalOfferPct * 100).toFixed(0)}% of asking (${(domAdjustment * 100).toFixed(0)}% DOM + ${(equityBonus * 100).toFixed(0)}% equity)`
  }
}

/**
 * Calculate DOM urgency score (0-30 pts)
 * Higher DOM = more motivated seller
 * @param dom - Days on market
 * @returns Score 0-30
 */
export function domUrgencyScore(dom: number): number {
  if (dom < 14) return 0
  if (dom < 30) return 5
  if (dom < 60) return 10
  if (dom < 90) return 15
  if (dom < 180) return 20
  return 30
}

/**
 * Calculate estimated carrying costs per day
 * @param askingPrice - Property listing price
 * @returns Estimated daily carrying cost
 */
export function carryingCostPerDay(askingPrice: number): number {
  // Rough estimate: 1% annually / 365 = ~0.0044% per day
  // Includes: property tax (1.1%), insurance (0.5%), maintenance (0.5%), HOA if applicable
  const annualRate = 0.02 // 2% of value per year
  return Math.round((askingPrice * annualRate) / 365)
}

/**
 * Calculate seller's net benefit over time with creative finance vs traditional sale
 * @param askingPrice - Listing price
 * @param offerPrice - Our offer price
 * @param terms - 'subject-to' | 'seller-finance' | 'hybrid'
 * @param mortgageBalance - Existing mortgage balance (if any)
 * @returns Object with net benefit analysis
 */
export function sellerNetBenefit(
  askingPrice: number,
  offerPrice: number,
  terms: string,
  mortgageBalance: number = 0
): {
  upfrontCash: number;
  monthlyIncome: number;
  total5YearBenefit: number;
  traditionalSaleNet: number;
  advantage: number;
  summary: string;
} {
  // Traditional sale: 6% commission, closing costs ~2%, net = asking * 0.92 - mortgage
  const traditionalNet = Math.max(askingPrice * 0.92 - mortgageBalance, 0)
  
  // Creative sale net
  const upfrontCash = offerPrice - mortgageBalance
  const monthlyIncome = terms === 'seller-finance' || terms === 'hybrid'
    ? offerPrice * 0.04 / 12 // 4% seller financing
    : 0
  
  const fiveYearBenefit = upfrontCash + (monthlyIncome * 60) // 5 years of payments
  
  return {
    upfrontCash: Math.round(upfrontCash),
    monthlyIncome: Math.round(monthlyIncome),
    total5YearBenefit: Math.round(fiveYearBenefit),
    traditionalSaleNet: Math.round(traditionalNet),
    advantage: Math.round(fiveYearBenefit - traditionalNet),
    summary: `Creative finance gives seller ${Math.round(monthlyIncome) > 0 ? `${Math.round(monthlyIncome).toLocaleString()}/mo income` : 'faster close'} vs traditional`
  }
}

// ============================================================================
// EXPANDED OBJECTION HANDLERS
// ============================================================================

export const OBJECTION_HANDLERS: Record<string, {
  keywords: string[];
  response: string;
  structure: string;
  formula: string;
  tone: string;
}> = {
  price_too_low: {
    keywords: ['too low', 'low ball', 'insulting', 'offensive', 'not serious', 'not fair', 'more money', 'can you go higher', 'increase your offer'],
    response: 'I understand the price matters. Let me show you the math on our offer and what you actually net...',
    structure: 'Counter with DOM urgency + equity math + monthly payment comparison to renting',
    formula: 'calculateCounter(askingPrice, dom, equityPercent, 1) + carryingCostPerDay() comparison',
    tone: 'confident, numeric, empathetic'
  },
  already_have_offers: {
    keywords: ['other offer', 'multiple offers', 'have an offer', 'another buyer', 'competing offer', 'others interested'],
    response: 'Multiple offers is great — it shows the market is active. Here is what makes our offer different...',
    structure: 'Reframe with speed, certainty, no contingencies, we close faster',
    formula: 'domUrgencyScore(dom) + sellerNetBenefit() showing faster close value',
    tone: 'respectful, differentiating, confident'
  },
  need_to_think: {
    keywords: ['need to think', 'need to discuss', 'talk to my', 'let me think', 'consider', 'not ready', 'need time', 'family'],
    response: 'I get it — this is a big decision. Let me share some numbers that might help...',
    structure: 'Create urgency with market data, carrying costs per day, opportunity cost',
    formula: 'carryingCostPerDay() * days waiting = money lost',
    tone: 'supportive, informative, patient'
  },
  working_with_another: {
    keywords: ['working with', 'already working', 'with another', 'agent', 'realtor', 'broker'],
    response: 'I appreciate you letting me know. If your current deal falls through, I want to be your backup plan...',
    structure: 'Ask what is missing from their offer, position creative terms as superior',
    formula: 'sellerNetBenefit() showing flexible terms advantage',
    tone: 'professional, understanding, leave door open'
  },
  want_full_price: {
    keywords: ['full price', 'asking price', 'not negotiating', 'won\'t budge', 'price is firm', 'firm price'],
    response: 'You want maximum value — I want a win-win. Let me show you what 100% looks like with our terms...',
    structure: 'Offer full price with seller finance terms (Level 3), show net benefit over time',
    formula: 'calculateCounter(askingPrice, dom, equityPercent, 3) + sellerNetBenefit()',
    tone: 'accommodating, numeric, long-term focused'
  },
  financing_concern: {
    keywords: ['financing', 'can you qualify', 'how will you pay', 'loan', 'mortgage', 'credit'],
    response: 'Great question about financing. Let me explain exactly how our process works...',
    structure: 'Explain subject-to protects their credit, we take over payments, no new loan needed',
    formula: 'Explain: we assume existing loan + pay difference = no new credit check',
    tone: 'educational, reassuring, transparent'
  },
  wrong_timing: {
    keywords: ['timing', 'not the right time', 'too early', 'too late', 'waiting', 'future', 'later'],
    response: 'Timing is personal. I understand — let me keep you in the loop on market changes...',
    structure: 'Open-ended follow up, set a future date, keep door open',
    formula: 'Schedule follow-up in 30/60/90 days',
    tone: 'respectful, understanding, long-term relationship'
  },
  property_condition: {
    keywords: ['condition', 'repairs', 'fix', 'renovate', 'needs work', 'as-is', 'nothing wrong with'],
    response: 'I see the property as-is. Let me adjust our numbers to account for that...',
    structure: 'Adjust offer, offer as-is close, account for repairs in numbers',
    formula: 'Offer = (ARV - repairs) with same terms',
    tone: 'practical, straightforward, solutions-focused'
  },
  multiple_offers_situation: {
    keywords: ['best offer', 'escalate', 'best and final', 'highest offer'],
    response: 'I understand you have choices. Here is what I can do to make this easy...',
    structure: 'Escalation clause, proof of funds, fastest close, no contingencies',
    formula: 'Show proof of funds + 7-day close option',
    tone: 'competitive, confident, decisive'
  },
  ghosting_no_response: {
    keywords: ['haven\'t heard', 'no response', 'ghost', 'disappeared', 'can\'t reach'],
    response: 'I noticed we have not connected — I wanted to reach out one more time...',
    structure: 'Pattern interrupt subject line, short curiosity email, low-pressure ask',
    formula: 'Short email (<100 words) with new angle or question',
    tone: 'curious, brief, not desperate'
  }
}

/**
 * Detect objection type from email text
 * @param emailBody - The inbound email body text
 * @returns The detected objection type key or 'unknown'
 */
export function detectObjectionType(emailBody: string): string {
  const lowerBody = emailBody.toLowerCase()
  
  for (const [type, handler] of Object.entries(OBJECTION_HANDLERS)) {
    for (const keyword of handler.keywords) {
      if (lowerBody.includes(keyword)) {
        return type
      }
    }
  }
  
  return 'general_inquiry'
}

export const KNOWLEDGE_BASE = {
  // YOUR COMPETITIVE ADVANTAGE - vs Traditional Banks
  yourTerms: {
    description: 'We offer MUCH BETTER terms than traditional banks',
    yourOffer: {
      downPayment: '0-10% (GOAL: 0-3%)',
      interestRate: '0-5% (GOAL: 0-3%)',
      term: '40-50 years',
      balloon: '7-10 years',
      closingTime: '14-30 days'
    },
    bankComparison: {
      banks: {
        downPayment: '20-30%',
        interestRate: '7-9%',
        term: '30 years',
        balloon: '7 years or less',
        closingTime: '30-45 days'
      },
      advantage: 'You beat banks on EVERY metric - lower down, lower rate, longer term, more time'
    }
  },
  // Your 3-Level Negotiation Strategy (PRIORITY ORDER)
  // LEVEL 1 = 70% + TERMS = YOUR WIN (steal!)
  negotiationLevels: {
    level1: {
      name: '70% + Terms (BEST - TARGET)',
      priority: 1,
      trigger: 'Opening offer - THIS IS YOUR GOAL',
      offer: '70% of listing price',
      terms: 'Seller Finance 70% at 5%, 40yr, 10yr balloon OR Subject-To existing loan',
      whyItWins: 'You get 30% discount plus control property with minimal cash',
      pitch: 'Creative financing solution - you keep your money working'
    },
    level2: {
      name: '70% All Cash (Fallback)',
      priority: 2,
      trigger: 'If Level 1 rejected',
      offer: '70% of listing price - ALL CASH',
      close: '7 days, no contingencies',
      pitch: 'Speed and certainty - close in one week'
    },
    level3: {
      name: '100% Full Price (Last Resort)',
      priority: 3,
      trigger: 'If they refuse 70%',
      offer: '100% of listing price',
      terms: '0-3% down, 0-3% rate, 40-50yr term',
      pitch: 'Full price - you get monthly income plus tax benefits'
    }
  },

  // Bank Comparison (USE IN ALL EMAILS)
  bankComparison: {
    traditionalBanks: {
      downPayment: '20-30%',
      interestRate: '7-9%',
      term: '30 years',
      balloon: '7 years or less',
      closingTime: '30-45 days',
      requirements: 'Excellent credit, income verification, appraisal'
    },
    yourTerms: {
      downPayment: '0-10% (goal: 0-3%)',
      interestRate: '0-5% (goal: 0-3%)',
      term: '40-50 years',
      balloon: '7-10 years',
      closingTime: '14-30 days',
      requirements: 'Flexible - work with any situation'
    },
    savings: {
      downPayment: 'Save 20-27% upfront',
      monthly: 'Lower payments due to longer term',
      rate: 'Beat bank rates by 4-6%',
      total: 'Save $100K+ over loan life'
    }
  },

  // Debt Structure Analysis
  debtAnalysis: {
    freeAndClear: {
      definition: 'No mortgage - owner owns 100%',
      strategy: 'Seller Finance (you pay them monthly)',
      terms: '0-10% down, 0-5% rate, 40-50 years, 10yr balloon'
    },
    subjectTo: {
      definition: 'Has existing mortgage you take over',
      strategy: 'Assume existing loan + pay difference',
      keepExisting: 'Interest rate, payment, remaining term',
      newMoney: 'Difference between offer and mortgage balance',
      sellerCarry: 'Additional amount seller finances'
    },
    hybrid: {
      definition: 'Existing mortgage + additional seller financing',
      strategy: 'Sub-To first + Seller Finance second',
      structure: 'First: Assume existing | Second: Seller carries remainder'
    }
  },

  // Deal Structures - from your KB_3_Deal_Calculator
  dealStructures: {
    subjectTo: {
      name: 'Subject-To',
      description: 'Take over existing mortgage',
      bestFor: 'Properties with existing mortgage + 30-50% equity',
      pros: ['No financing needed', 'Close fast', 'Low down payment'],
      cons: ['Due-on-sale clause risk', 'Credit risk', 'Limited control'],
      terms: {
        downPayment: '0-10%',
        interestRate: 'Keep existing rate',
        term: 'Remaining term of existing loan',
        closingCost: 'Seller pays usual costs'
      }
    },
    sellerFinance: {
      name: 'Seller Finance',
      description: 'Seller carries note',
      bestFor: 'Free and clear properties or high equity',
      pros: ['Flexible terms', 'Interest income for seller', 'Close fast'],
      cons: ['Seller must qualify', 'Tax implications'],
      terms: {
        downPayment: '5-30%',
        interestRate: 'Market rate + 1-2%',
        term: '5-30 years',
        amortization: 'Balloon at 5-7 years common'
      }
    },
    leaseOption: {
      name: 'Lease Option',
      description: 'Rent with option to buy',
      bestFor: 'Buyers who need time or bad credit',
      pros: ['Lower upfront', 'Test living there', 'Price locked'],
      cons: ['Complex', 'Non-refundable option fee'],
      terms: {
        optionFee: '1-5% of purchase price',
        rentCredit: '25-50% of rent applied to purchase',
        term: '1-5 years'
      }
    },
    wholesale: {
      name: 'Wholesale/Assignment',
      description: 'Assign contract to end buyer',
      bestFor: 'Listed properties below market',
      pros: ['No money needed', 'Quick turnover', 'Volume based'],
      cons: ['Small margins', 'Reputation risk'],
      terms: {
        assignmentFee: '$5,000-$25,000 typical',
        doubleClose: 'Use transactional lender'
      }
    },
    hybrid: {
      name: 'Hybrid Sub-To + Seller Finance',
      description: 'Combine strategies',
      bestFor: 'Properties with mortgage + high equity',
      pros: ['Maximize terms', 'Lower payments', 'Build equity'],
      cons: ['Complex documentation'],
      terms: {
        firstMortgage: 'Subject-To existing',
        secondMortgage: 'Seller carry second'
      }
    }
  },

  // Underwriting Criteria - from your KB
  underwritingCriteria: {
    equityThresholds: {
      skip: { equityPercent: '< 20%', reason: 'Not enough equity' },
      possible: { equityPercent: '20-40%', strategy: 'Subject-To only' },
      good: { equityPercent: '40-70%', strategy: 'Subject-To or Hybrid' },
      excellent: { equityPercent: '70-100%', strategy: 'Seller Finance primary' },
      perfect: { equityPercent: '100%+', strategy: 'Free and Clear - best deals' }
    },
    priorityScoring: {
      topPriority: { equity: '>$2M', reason: 'Top priority regardless of DOM' },
      highPriority: { equity: '>$1M', dom: '>60 days', reason: 'High priority' },
      worthPursuing: { equity: '>$500K', dom: '>30 days', reason: 'Worth pursuing' }
    }
  },

  // Deal Score Calculation
  dealScoreWeights: {
    equityPercent: 30,      // 30% - Higher is better
    daysOnMarket: 15,       // 15% - Longer DOM = more motivated
    priceToARV: 25,         // 25% - Lower is better (discount)
    cashFlow: 20,           // 20% - Positive cash flow
    dealStructure: 10        // 10% - Viability of structure
  },

  // Seller Personalities - for email generation
  sellerPersonalities: {
    motivated: {
      name: 'Motivated Seller',
      triggers: ['foreclosure', 'divorce', 'inheritance', 'job_loss', 'relocating'],
      tone: 'Empathetic, urgent, solution-focused',
      keyAngles: ['Quick close', 'No repairs needed', 'Cash offer', 'Take as-is']
    },
    upsideDown: {
      name: 'Upside Down Owner',
      triggers: ['underwater', 'owes_more', 'cannot_sell'],
      tone: 'Understanding, creative',
      keyAngles: ['Write off debt', 'No short sale', 'Escape payments', 'Fresh start']
    },
    inherited: {
      name: 'Inherited Property',
      triggers: ['probate', 'death', 'estate'],
      tone: 'Respectful, straightforward',
      keyAngles: ['No probate hassles', 'Quick cash', 'As-is', 'No showings']
    },
    landlord: {
      name: 'Frustrated Landlord',
      triggers: ['tenant_issues', 'no_cash_flow', 'burned_out'],
      tone: 'Relatable, solution-focused',
      keyAngles: ['Escape headaches', 'One-time payment', 'No more tenants', 'Move on']
    },
    retiree: {
      name: 'Retiree/Empty Nester',
      triggers: ['downsizing', 'retirement', 'health'],
      tone: 'Respectful, gentle',
      keyAngles: ['Simplify', 'One-time lump sum', 'Leave legacy', 'No maintenance']
    },
    developer: {
      name: 'Developer/Builder',
      triggers: ['bankruptcy', 'overbuilt', 'construction_loan'],
      tone: 'Business, direct',
      keyAngles: ['Quick close', 'All-cash', 'Assume permits', 'Work with existing plans']
    }
  },

  // Objection Handling
  objectionHandlers: {
    price: {
      response: 'I understand price is important. Let me explain how our offer works...',
      structure: 'Present value, not just price'
    },
    waiting: {
      response: 'Timing is important. Let me show you the benefits...',
      structure: 'Show opportunity cost of waiting'
    },
    multipleOffers: {
      response: 'Multiple offers is great - it shows the market is active...',
      structure: 'Differentiate with terms, not just price'
    },
    wantMore: {
      response: 'You want maximum value, and I want a win-win...',
      structure: 'Find creative ways to add value'
    }
  },

  // Negotiation Tactics
  negotiationTactics: [
    'Anchor high, then concede slowly',
    'Give to get - offer concessions for concessions',
    'Use silence to create pressure',
    'Find hidden motivations beyond price',
    'Create urgency without being pushy',
    'Always leave room to move up'
  ]
}

// Function to generate underwriting prompt
export function generateUnderwritingPrompt(property: any): string {
  return `
You are an expert real estate underwriter. Analyze this property deal using our knowledge base.

PROPERTY DETAILS:
- Address: ${property.address}, ${property.city}, ${property.state}
- Listing Price: $${property.listing_price?.toLocaleString() || 'N/A'}
- Estimated Value: $${property.estimated_value?.toLocaleString() || 'N/A'}
- Bedrooms: ${property.bedrooms} | Bathrooms: ${property.bathrooms}
- Square Feet: ${property.sqft}
- Days on Market: ${property.days_on_market || 'N/A'}
- Mortgage Balance: ${property.mortgage_balance || 'Unknown'}

YOUR KNOWLEDGE BASE:
${JSON.stringify(KNOWLEDGE_BASE.dealStructures, null, 2)}

Calculate:
1. EQUITY = Estimated Value - Mortgage Balance
2. EQUITY PERCENT = (Equity / Estimated Value) x 100
3. PRICE TO ARV RATIO = (Listing Price / Estimated Value) x 100
4. RECOMMENDED STRATEGY based on:
   - Free and Clear + Equity > $500K → Seller Finance
   - Has Mortgage + Equity > 50% → Subject-To
   - Has Mortgage + Equity 30-50% → Lease Option
   - Listed Below Market → Wholesale

Return JSON:
{
  "deal_score": 0-100,
  "estimated_arv": number,
  "estimated_equity": number,
  "equity_percent": number,
  "recommended_strategy": "Subject-To|Seller Finance|Lease Option|Wholesale|Hybrid",
  "max_offer_price": number,
  "expected_roi": number,
  "strengths": ["string"],
  "risks": ["string"],
  "reasoning": "string"
}
`
}

// Function to generate email prompt
export function generateEmailPrompt(
  property: any, 
  emailType: string, 
  sellerPersonality?: string
): string {
  const personality = sellerPersonality ? 
    KNOWLEDGE_BASE.sellerPersonalities[sellerPersonality] : 
    null

  return `
You are an expert real estate sales professional. Write a personalized email to a seller.

PROPERTY:
- Address: ${property.address}, ${property.city}, ${property.state}
- Price: $${property.listing_price?.toLocaleString() || 'N/A'}
- Value: $${property.estimated_value?.toLocaleString() || 'N/A'}
- Equity: $${property.estimated_equity?.toLocaleString() || 'N/A'}
- Bed/Bath: ${property.bedrooms}bd/${property.bathrooms}ba
- SqFt: ${property.sqft}

EMAIL TYPE: ${emailType}
${personality ? `
SELLER PERSONALITY: ${personality.name}
TRIGGERS: ${personality.triggers.join(', ')}
TONE: ${personality.keyAngles}
KEY ANGLES TO USE: ${personality.keyAngles.join(', ')}
` : ''}

OBJECTION HANDLERS: ${JSON.stringify(KNOWLEDGE_BASE.objectionHandlers)}
NEGOTIATION TACTICS: ${KNOWLEDGE_BASE.negotiationTactics.join(', ')}

Write a compelling ${emailType} email that:
1. Hooks them in the first sentence
2. Shows you understand THEIR situation
3. Highlights benefits to THEM (not features)
4. CREATES URGENCY by comparing to bank terms:
   - "Banks want 20-30% down, 7-9% rate, 30-year term"
   - "We offer 0-10% down, 0-5% rate, 40-50 year terms"
   - "You save HUGE compared to traditional financing"
5. Has clear next steps
6. Signs off professionally

Subject line should be catchy but not spammy.
Body should be 100-200 words.
`
}
