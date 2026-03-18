// Agent Personas for Training System
// 10 different listing agent personalities with realistic objection patterns

export interface AgentPersona {
  id: string;
  name: string;
  role: string;
  personality: string;
  commonObjections: Objection[];
  responseStyle: 'aggressive' | 'passive' | 'analytical' | 'friendly' | 'skeptical';
  likelihoodToRespond: number; // 0-1
  closingStyle: string;
}

export interface Objection {
  trigger: string; // What causes this objection
  response: string; // How agent expresses it
  difficulty: number; // 1-10
  bestResponse: string; // What works best
  category: 'price' | 'timeline' | 'trust' | 'process' | 'competition';
}

export const AGENT_PERSONAS: AgentPersona[] = [
  {
    id: 'sarah-skeptic',
    name: 'Sarah (The Skeptic)',
    role: 'Listing Agent - 15 years experience',
    personality: 'Highly analytical, distrusts "we buy houses" offers, needs hard data',
    commonObjections: [
      {
        trigger: 'any creative finance mention',
        response: "I've been doing this for 15 years. Every 'we buy houses' company ends up being a nightmare. My sellers want certainty, not some complicated deal that's going to fall apart.",
        difficulty: 9,
        bestResponse: 'Provide proof of funds, show past closings, offer earnest money deposit',
        category: 'trust'
      },
      {
        trigger: 'below asking price',
        response: "My sellers have done their research. The price is fair market value. If you can't meet them there, we're wasting each other's time.",
        difficulty: 7,
        bestResponse: 'Present market data, show comparable sales, explain your buyer pool',
        category: 'price'
      },
      {
        trigger: 'seller financing',
        response: "Seller financing? No way. My clients want cash in hand at closing, not become a bank for some investor.",
        difficulty: 8,
        bestResponse: 'Explain benefits: faster close, no financing contingency, all cash at table',
        category: 'process'
      }
    ],
    responseStyle: 'skeptical',
    likelihoodToRespond: 0.3,
    closingStyle: 'Needs extensive proof and credibility building'
  },
  {
    id: 'mike-friendly',
    name: 'Mike (The Friendly Negotiator)',
    role: 'Listing Agent - 8 years, high volume',
    personality: 'Easy-going, willing to listen, but shrewd negotiator who protects seller',
    commonObjections: [
      {
        trigger: 'initial contact',
        response: "Hey, thanks for reaching out! Always happy to talk deals. What exactly are you offering? My sellers have been getting a lot of interest.",
        difficulty: 3,
        bestResponse: 'Be direct, show enthusiasm, provide clear terms',
        category: 'process'
      },
      {
        trigger: 'low offer',
        response: "I hear you, but here's the thing - we just got another offer that's closer to asking. Can you do better?",
        difficulty: 5,
        bestResponse: 'Counter with speed of close, certainty, no contingencies',
        category: 'price'
      },
      {
        trigger: 'subject to existing mortgage',
        response: "Interesting. I've done a couple of those before. What happens to the existing loan? Who's responsible if the borrower defaults?",
        difficulty: 4,
        bestResponse: 'Explain your due diligence, credit requirements, backup plans',
        category: 'process'
      }
    ],
    responseStyle: 'friendly',
    likelihoodToRespond: 0.7,
    closingStyle: 'Relationship-based, responds to mutual benefit arguments'
  },
  {
    id: 'lisa-aggressive',
    name: 'Lisa (The Shark)',
    role: 'Top Producer - Luxury Homes',
    personality: 'Aggressive, works only with top offers, protects high-end listings fiercely',
    commonObjections: [
      {
        trigger: 'any offer below 95% of asking',
        response: "Let me stop you right there. This is a $2M+ property in one of the best neighborhoods in the city. We don't entertain low-ball offers. If you can't come in at 95% or better, don't waste my time.",
        difficulty: 10,
        bestResponse: 'Come in strong, show pre-approval, emphasize buyer readiness',
        category: 'price'
      },
      {
        trigger: 'creative financing',
        response: "Are you serious right now? My seller is a CEO who needs certainty. We're not experimenting with some complicated subject-to deal. Get me a conventional loan or don't call.",
        difficulty: 10,
        bestResponse: 'Have proof of funds ready, show traditional financing pre-approval',
        category: 'trust'
      },
      {
        trigger: 'extended closing',
        response: "30-day close minimum. My seller is relocating for work and needs to know this is a solid deal. Any longer and we're moving to the next buyer.",
        difficulty: 7,
        bestResponse: 'Match timeline or offer rent-back with higher deposit',
        category: 'timeline'
      }
    ],
    responseStyle: 'aggressive',
    likelihoodToRespond: 0.2,
    closingStyle: 'Only responds to strong, professional, above-asking offers'
  },
  {
    id: 'brian-busy',
    name: 'Brian (The Busy Professional)',
    role: 'High-Volume Investor Agent',
    personality: 'Very busy, delegates heavily, evaluates offers quickly based on numbers',
    commonObjections: [
      {
        trigger: 'initial contact',
        response: "Look, I'm juggling 20 listings right now. Send me the numbers - ARV, repair costs, your offer - and I'll run it by the seller. Don't call me again unless you have a solid number.",
        difficulty: 4,
        bestResponse: 'Send complete package immediately, include all numbers upfront',
        category: 'process'
      },
      {
        trigger: 'negotiation',
        response: "I've already presented your offer. The seller countered at X. Take it or leave it - I've got other buyers interested.",
        difficulty: 6,
        bestResponse: 'Make quick decisions, have decision-maker available',
        category: 'price'
      },
      {
        trigger: 'inspection issues',
        response: "What's the repair cost estimate? Look, I don't have time to negotiate every little thing. Give me a number or we're moving on.",
        difficulty: 5,
        bestResponse: 'Provide detailed estimates, make firm decisions quickly',
        category: 'process'
      }
    ],
    responseStyle: 'analytical',
    likelihoodToRespond: 0.6,
    closingStyle: 'Numbers-driven, values speed and decisiveness'
  },
  {
    id: 'debbie-distressed',
    name: 'Debbie (The Distressed Property Specialist)',
    role: 'Foreclosure/Short Sale Expert',
    personality: 'Experienced with distressed properties, understands creative deals',
    commonObjections: [
      {
        trigger: 'short sale',
        response: "This is a short sale - the bank has to approve any offer. It could take 2-4 months. You sure you want to wait around?",
        difficulty: 5,
        bestResponse: 'Show patience, demonstrate short sale experience, pre-qualify with bank',
        category: 'timeline'
      },
      {
        trigger: 'low offer',
        response: "The bank already rejected two offers like yours. They want 85% of list minimum. You're going to need to come up or this is dead on arrival.",
        difficulty: 7,
        bestResponse: 'Have lender pre-qualification letter showing ability to pay more',
        category: 'price'
      },
      {
        trigger: 'creative financing',
        response: "For a short sale? Actually, the bank might go for seller financing since they're just trying to get what they can. Let me run it by them.",
        difficulty: 3,
        bestResponse: 'Present creative terms confidently, show flexibility',
        category: 'process'
      }
    ],
    responseStyle: 'passive',
    likelihoodToRespond: 0.5,
    closingStyle: 'Understands creative deals, works within bank constraints'
  },
  {
    id: 'tom-legacy',
    name: 'Tom (The Old School)',
    role: 'Traditional Agent - 30 years',
    personality: 'Old-school, distrusts new investors, values face-to-face, paper deals',
    commonObjections: [
      {
        trigger: 'digital communication',
        response: "I don't do business over email. If you want to make an offer, come to my office with a check in hand. That's how it's done.",
        difficulty: 8,
        bestResponse: 'Offer to meet in person, bring earnest money, show respect for tradition',
        category: 'process'
      },
      {
        trigger: 'investor buyer',
        response: "I've seen a hundred investors come and go. Most of them flake out. Until I see proof of funds and a serious deposit, I'm not presenting anything to my seller.",
        difficulty: 7,
        bestResponse: 'Bring bank statements, offer substantial earnest money, meet in person',
        category: 'trust'
      },
      {
        trigger: 'quick close',
        response: "A 7-day close? Are you crazy? Title searches take time, inspections take time. You're not buying a loaf of bread.",
        difficulty: 6,
        bestResponse: 'Explain your title company, show you can close fast with proper docs',
        category: 'timeline'
      }
    ],
    responseStyle: 'skeptical',
    likelihoodToRespond: 0.25,
    closingStyle: 'Relationship and trust-based, needs to see you in person'
  },
  {
    id: 'jessica-motivated',
    name: 'Jessica (The Motivated Seller Agent)',
    role: 'Agent with motivated seller',
    personality: 'Honest about seller situation, looking for creative solutions',
    commonObjections: [
      {
        trigger: 'any serious offer',
        response: "Honestly? My sellers are behind on payments and about to lose the house. They're desperate. Whatever you can offer, they'll consider - as long as it can close before the foreclosure date.",
        difficulty: 2,
        bestResponse: 'Move fast, ask what seller needs to walk away, offer leaseback',
        category: 'timeline'
      },
      {
        trigger: 'low price',
        response: "I can't present anything under $X - the seller needs at least that much to pay off the loan and avoid foreclosure on their record. But beyond that, we have flexibility.",
        difficulty: 4,
        bestResponse: 'Ask what number they need, offer cash at table, consider secondary payoff',
        category: 'price'
      },
      {
        trigger: 'inspection',
        response: "They know the house isn't perfect. Just give me a list of what you need fixed and we'll see what we can do. They're more worried about the foreclosure than a few repairs.",
        difficulty: 2,
        bestResponse: 'Be reasonable on inspections, focus on major issues only',
        category: 'process'
      }
    ],
    responseStyle: 'friendly',
    likelihoodToRespond: 0.8,
    closingStyle: 'Motivated by helping sellers avoid foreclosure, flexible on terms'
  },
  {
    id: 'carlos-mls',
    name: 'Carlos (The MLS Warrior)',
    role: 'iBuyer/Investor-Friendly Agent',
    personality: 'Works with many investors, knows the market, transactional',
    commonObjections: [
      {
        trigger: 'any offer',
        response: "I've got 5 other investors looking at this. Your competitor offered all cash, 10-day close. What do you bring to the table?",
        difficulty: 6,
        bestResponse: 'Match or beat terms, emphasize reliability, show track record',
        category: 'competition'
      },
      {
        trigger: 'financing',
        response: "All my best investors pay cash. Why should I present a financed offer when I have cash buyers waiting?",
        difficulty: 7,
        bestResponse: 'Show proof of funds, fast close, no financing contingency',
        category: 'competition'
      },
      {
        trigger: 'low earnest money',
        response: "$1,000 earnest money? That's insulting for a $500K house. Show me you're serious or I'm moving on to the next one.",
        difficulty: 5,
        bestResponse: 'Increase earnest money, show financial strength',
        category: 'trust'
      }
    ],
    responseStyle: 'aggressive',
    likelihoodToRespond: 0.4,
    closingStyle: 'Transactional, responds to competitive offers and terms'
  },
  {
    id: 'amy-inherited',
    name: 'Amy (The Inherited Property)',
    role: 'Probate/Estate Agent',
    personality: 'Deals with heirs and estates, complex situations, emotional',
    commonObjections: [
      {
        trigger: 'estate property',
        response: "This is my mother's house. We just inherited it last month. We're not in a rush - we're still deciding what to do. We'd rather rent it out than sell for less than it's worth.",
        difficulty: 6,
        bestResponse: 'Build relationship, explain market conditions, offer timeline flexibility',
        category: 'process'
      },
      {
        trigger: 'price discussion',
        response: "My siblings and I can't agree on the price. Some want to hold onto it, some want to sell. It's complicated family stuff.",
        difficulty: 7,
        bestResponse: 'Offer to meet all heirs, present market data separately, be patient',
        category: 'process'
      },
      {
        trigger: 'quick sale',
        response: "We're still in probate. The estate lawyer says it could take 6-12 months before we can even sell. You'll need to wait.",
        difficulty: 8,
        bestResponse: 'Connect with estate attorney, offer to wait, show patience',
        category: 'timeline'
      }
    ],
    responseStyle: 'passive',
    likelihoodToRespond: 0.35,
    closingStyle: 'Patient, builds trust, works through family dynamics'
  },
  {
    id: 'robert-novice',
    name: 'Robert (The New Agent)',
    role: 'New Agent - Eager to close',
    personality: 'New, eager to prove themselves, may make mistakes, very responsive',
    commonObjections: [
      {
        trigger: 'any contact',
        response: "Oh wow, an offer! I've only closed 3 deals so far. Let me present this to my seller right away! They actually really need to sell.",
        difficulty: 1,
        bestResponse: 'Guide them through the process, be patient, help them close their first deal',
        category: 'process'
      },
      {
        trigger: 'seller hesitation',
        response: "I think they might be interested but they're nervous. Can you tell me more about how this works? I want to present it the right way.",
        difficulty: 2,
        bestResponse: 'Provide training, scripts, objection responses - become their mentor',
        category: 'process'
      },
      {
        trigger: 'contract complexity',
        response: "This contract looks really complicated. My broker is busy and I don't want to bother them. Is there a simpler version?",
        difficulty: 3,
        bestResponse: 'Offer simplified explanation, provide contract coaching, be flexible',
        category: 'process'
      }
    ],
    responseStyle: 'friendly',
    likelihoodToRespond: 0.85,
    closingStyle: 'Needs guidance and support, highly responsive to relationship building'
  }
];

export function getRandomPersona(): AgentPersona {
  return AGENT_PERSONAS[Math.floor(Math.random() * AGENT_PERSONAS.length)];
}

export function getPersonaById(id: string): AgentPersona | undefined {
  return AGENT_PERSONAS.find(p => p.id === id);
}

export function getPersonasByStyle(style: AgentPersona['responseStyle']): AgentPersona[] {
  return AGENT_PERSONAS.filter(p => p.responseStyle === style);
}

// Get all unique objection categories
export function getObjectionCategories(): string[] {
  const categories = new Set<string>();
  AGENT_PERSONAS.forEach(p => {
    p.commonObjections.forEach(o => categories.add(o.category));
  });
  return Array.from(categories);
}
