// Knowledge Base Index
// All strategy documents and guides

export const KNOWLEDGE_BASE = {
  // Creative Finance Strategies (9 strategies)
  strategies: [
    {
      id: 'all_cash',
      name: 'All Cash Purchase',
      icon: '💵',
      description: 'Full cash purchase, no financing contingency',
      fullDescription: 'All-cash purchases are the strongest offers in real estate. Sellers love them because there\'s no financing risk - the deal closes fast (7-14 days typically).',
      keyPoints: [
        'No mortgage contingency - strongest offer',
        'Close in 7-14 days',
        'Seller may accept 5-15% below asking',
        'Requires available cash reserves',
        'Best for distressed sellers or hot markets'
      ],
      file: '/kb/strategies/all-cash.md',
      docFile: 'KB_1_Seller_Conversation_Scripts.docx'
    },
    {
      id: 'seller_financing',
      name: 'Seller Financing',
      icon: '🏦',
      description: 'Seller acts as lender for portion of purchase price',
      fullDescription: 'The seller finances part of the purchase price directly. You make payments to them instead of a bank. Great when traditional financing is difficult.',
      keyPoints: [
        'Avoid bank financing altogether',
        'Negotiate flexible terms directly',
        'Typically 5-10% interest rate',
        'Down payment goes to seller',
        'Builds equity as you pay down'
      ],
      file: '/kb/strategies/seller-financing.md',
      docFile: 'KB_2_Email_Templates_Library.docx'
    },
    {
      id: 'lease_option',
      name: 'Lease Option',
      icon: '📝',
      description: 'Lease property with option to purchase later',
      fullDescription: 'Rent the property now with the right to buy it later. Part of your rent can go toward the purchase price. Perfect when you need time to get financing or improve credit.',
      keyPoints: [
        'Lock in purchase price now',
        'Rent credits toward down payment',
        'Option fee is negotiable',
        'Typically 1-3 year option period',
        'Move in immediately, buy later'
      ],
      file: '/kb/strategies/lease-option.md',
      docFile: 'KB_3_Deal_Calculator_Underwriting.docx'
    },
    {
      id: 'subject_to',
      name: 'Subject To',
      icon: '📜',
      description: 'Take over existing mortgage payments',
      fullDescription: 'Take over the seller\'s existing mortgage. You make their payments but don\'t assume the loan. The deed transfers to you while the original loan stays in seller\'s name.',
      keyPoints: [
        'No new financing needed',
        'Take over existing low interest rate',
        'Seller gets relieved of payments',
        'Due on sale clause risk (enforcement rare)',
        'Close in 30-45 days'
      ],
      file: '/kb/strategies/subject-to.md',
      docFile: 'KB_4_Agent_Psychology_Guide.docx'
    },
    {
      id: 'assignment',
      name: 'Assignment/Wholesale',
      icon: '📋',
      description: 'Assign contract to end buyer for assignment fee',
      fullDescription: 'Find a great deal, put it under contract, then assign that contract to a cash buyer for a fee. You never actually buy the property - you just sell the contract.',
      keyPoints: [
        'Make money without owning property',
        'Typical fee: $5,000-$25,000',
        'Need buyers list ready',
        'Contract must allow assignment',
        'Minimal risk, quick profits'
      ],
      file: '/kb/strategies/assignment.md',
      docFile: 'KB_5_Legal_Due_Diligence_Checklist.docx'
    },
    {
      id: 'hard_money',
      name: 'Hard Money Loan',
      icon: '🔴',
      description: 'Short-term financing from private lender',
      fullDescription: 'Private lenders (hard money) fund deals quickly based on the property value, not your credit. Typically 12-18 month terms with points.',
      keyPoints: [
        'Funding in 3-7 days',
        'Based on ARV, not credit',
        'Typical: 12-15% interest',
        '2-4 points upfront',
        'Good for flips and quick moves'
      ],
      file: '/kb/strategies/hard-money.md',
      docFile: 'KB_6_AI_System_Prompts_Master.docx'
    },
    {
      id: 'private_money',
      name: 'Private Money',
      icon: '🤝',
      description: 'Financing from private investors',
      fullDescription: 'Borrow from private individuals (not banks). Often friends, family, or investors looking for returns. More flexible terms than hard money.',
      keyPoints: [
        'Flexible terms to negotiate',
        'Interest rates 8-12% typical',
        'No credit check often needed',
        'May want equity stake',
        'Build relationships for funding'
      ],
      file: '/kb/strategies/private-money.md',
      docFile: 'KB_7_Hawaii_Market_Deep_Dive.docx'
    },
    {
      id: 'wrap_around',
      name: 'Wrap Around Mortgage',
      icon: '🔄',
      description: 'Wrap existing mortgage into new loan',
      fullDescription: 'You create a new loan that wraps around the existing mortgage. Buyer pays you, you pay the bank, and you keep the difference.',
      keyPoints: [
        'Seller financing on steroids',
        'Keep the spread between rates',
        'Existing loan stays in place',
        'Due on sale clause risk',
        'Very powerful if done right'
      ],
      file: '/kb/strategies/wrap-around.md',
      docFile: 'KB_8_Objection_Handling_Master_Guide.docx'
    },
    {
      id: 'joint_venture',
      name: 'Joint Venture',
      icon: '🤲',
      description: 'Partner with investor for equity split',
      fullDescription: 'Partner with someone who has money but no deals. You find the deal and manage the project, they provide capital. Split profits according to agreement.',
      keyPoints: [
        'No need for own capital',
        'Split profits 50/50 typical',
        'Passive investor role',
        'You bring the deal expertise',
        'Clear JV agreement essential'
      ],
      file: '/kb/strategies/joint-venture.md',
      docFile: 'KB_9_Negotiation_Conversation_Flows.docx'
    }
  ],

  // Knowledge Base Documents
  documents: [
    {
      id: 'seller_scripts',
      name: 'Seller Conversation Scripts',
      description: 'Scripts for talking to listing agents and sellers',
      fullDescription: 'Proven conversation scripts for calling listing agents, talking to FSBO sellers, and handling initial seller conversations. Includes objection responses.',
      keyPoints: [
        'Agent introduction scripts',
        'FSBO seller scripts',
        'Value proposition talking points',
        'Common objections & responses',
        'Callback reminders'
      ],
      icon: '💬',
      file: 'KB_1_Seller_Conversation_Scripts.docx'
    },
    {
      id: 'email_templates',
      name: 'Email Templates Library',
      description: 'Pre-written email templates for all scenarios',
      fullDescription: 'Collection of email templates for every situation - initial contact, follow-ups, offer presentations, negotiation, and closing.',
      keyPoints: [
        'Initial offer email',
        'Follow-up sequences',
        'Counter-offer templates',
        'Thank you notes',
        'MLS supplement requests'
      ],
      icon: '📧',
      file: 'KB_2_Email_Templates_Library.docx'
    },
    {
      id: 'deal_calculator',
      name: 'Deal Calculator & Underwriting',
      description: 'Math for analyzing deals and calculating returns',
      fullDescription: 'Comprehensive deal analysis tools including ARV calculations, repair estimates, holding costs, and return metrics.',
      keyPoints: [
        'ARV calculation worksheet',
        'Repair cost estimator',
        'Monthly cash flow analysis',
        'Cap rate & cash-on-cash',
        'Exit strategy calculators'
      ],
      icon: '🧮',
      file: 'KB_3_Deal_Calculator_Underwriting.docx'
    },
    {
      id: 'agent_psychology',
      name: 'Agent Psychology Guide',
      description: 'Understanding how to work with listing agents',
      fullDescription: 'Master the psychology of listing agents. Learn what motivates them and how to get them to present your offer favorably.',
      keyPoints: [
        'What agents really want',
        'How to get listing appointments',
        'Presenting offers effectively',
        'Building agent relationships',
        'Handling difficult agents'
      ],
      icon: '🧠',
      file: 'KB_4_Agent_Psychology_Guide.docx'
    },
    {
      id: 'legal_due_diligence',
      name: 'Legal Due Diligence Checklist',
      description: 'Legal items to verify before closing',
      fullDescription: 'Complete due diligence checklist covering title, zoning, permits, liens, and all legal verification needed before closing.',
      keyPoints: [
        'Title search checklist',
        'Zoning verification',
        'Permit verification',
        'Lien search requirements',
        'Closing contingency checklist'
      ],
      icon: '⚖️',
      file: 'KB_5_Legal_Due_Diligence_Checklist.docx'
    },
    {
      id: 'ai_prompts',
      name: 'AI System Prompts Master',
      description: 'AI prompts for automating deal analysis',
      fullDescription: 'Master prompts for using AI to analyze deals, generate offers, write contracts, and automate your business.',
      keyPoints: [
        'Deal analysis prompts',
        'Offer generation prompts',
        'Contract review prompts',
        'Market research prompts',
        'Follow-up automation'
      ],
      icon: '🤖',
      file: 'KB_6_AI_System_Prompts_Master.docx'
    },
    {
      id: 'market_deep_dive',
      name: 'Market Deep Dive Guide',
      description: 'How to analyze any market for opportunities',
      fullDescription: 'Comprehensive guide to market analysis - understanding neighborhoods, price points, rental markets, and finding undervalued areas.',
      keyPoints: [
        'Neighborhood analysis',
        'Rental market metrics',
        'Foreclosure tracking',
        'Absorption rate calculation',
        'Market timing strategies'
      ],
      icon: '📊',
      file: 'KB_7_Hawaii_Market_Deep_Dive.docx'
    },
    {
      id: 'objection_handling',
      name: 'Objection Handling Master Guide',
      description: 'Handle any seller objection with confidence',
      fullDescription: 'Master objection handling for every type of seller objection. From "price too low" to "we\'re not selling" - turn no\'s into yes.',
      keyPoints: [
        'Price objection responses',
        'Timing objection responses',
        'Competition objection responses',
        'Emotional objection responses',
        'Closing techniques'
      ],
      icon: '🛡️',
      file: 'KB_8_Objection_Handling_Master_Guide.docx'
    },
    {
      id: 'negotiation_flows',
      name: 'Negotiation Conversation Flows',
      description: 'Step-by-step negotiation scripts',
      fullDescription: 'Complete negotiation playbooks for every stage of the deal. From initial offer to closing - scripts that work.',
      keyPoints: [
        'Initial offer presentation',
        'Counter-offer handling',
        'Multiple offer situations',
        'Last chance offers',
        'Deal salvaging techniques'
      ],
      icon: '⚡',
      file: 'KB_9_Negotiation_Conversation_Flows.docx'
    },
    {
      id: 'property_scoring',
      name: 'Property Scoring Master Guide',
      description: 'Score and rank properties instantly',
      fullDescription: 'System for quickly scoring and comparing properties. Know which deals to pursue and which to pass in seconds.',
      keyPoints: [
        'Quick evaluation criteria',
        'Score weighting system',
        'Deal grader worksheet',
        'Comparative analysis',
        'Risk assessment matrix'
      ],
      icon: '🏆',
      file: 'KB_10_Property_Scoring_Master_Guide.docx'
    },
    {
      id: 'contract_terms',
      name: 'Contract Terms Reference',
      description: 'Essential contract clauses and terms',
      fullDescription: 'Reference guide for real estate contract terms, contingencies, and clauses. Know what to include in every contract.',
      keyPoints: [
        'Financing contingencies',
        'Inspection contingencies',
        'Appraisal contingencies',
        'Title contingencies',
        'Special provisions'
      ],
      icon: '📜',
      file: 'KB_11_Contract_Terms_Reference.docx'
    }
  ]
}
