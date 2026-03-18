// knowledge-base.ts
// Comprehensive knowledge base for AI agents
// This is embedded directly into all AI prompts

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
