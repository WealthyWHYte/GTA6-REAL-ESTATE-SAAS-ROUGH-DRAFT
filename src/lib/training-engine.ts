// Training Simulation Engine
// Runs automated conversations between AI and agent personas

import { AGENT_PERSONAS, AgentPersona, Objection } from './agent-personas';

export interface ConversationTurn {
  speaker: 'ai' | 'agent';
  message: string;
  timestamp: Date;
}

export interface SimulationResult {
  id: string;
  personaId: string;
  personaName: string;
  propertyId: string;
  turns: ConversationTurn[];
  outcome: 'success' | 'failure' | 'stalled';
  duration: number; // seconds
  objectionHandled: string;
  finalOffer: number;
  agentResponse: string;
  score: number; // 0-100
  failureReason?: string;
}

export interface TrainingStats {
  totalSimulations: number;
  successRate: number;
  avgDuration: number;
  byPersona: {
    [personaId: string]: {
      name: string;
      attempts: number;
      successes: number;
      successRate: number;
      avgScore: number;
    };
  };
  byObjection: {
    [category: string]: {
      attempts: number;
      successes: number;
      successRate: number;
    };
  };
}

// Sample property data for simulation
const SAMPLE_PROPERTIES = [
  { id: 'prop-001', address: '123 Main St', city: 'Los Angeles', arv: 850000, repairs: 25000, offer: 595000 },
  { id: 'prop-002', address: '456 Oak Ave', city: 'Long Beach', arv: 620000, repairs: 35000, offer: 435000 },
  { id: 'prop-003', address: '789 Palm Dr', city: 'Santa Monica', arv: 1200000, repairs: 50000, offer: 840000 },
];

// Simulated objection responses from agents
export function generateAgentResponse(persona: AgentPersona, turnNumber: number, aiMessage?: string): string {
  // Pick a random objection based on persona style
  const objection = persona.commonObjections[Math.floor(Math.random() * persona.commonObjections.length)];
  
  // Modify based on turn number
  if (turnNumber === 1) {
    // First response - usually initial objection
    return objection.response;
  } else if (turnNumber === 2) {
    // Second response - follow up on objection
    return getFollowUpResponse(persona, objection);
  } else {
    // Third+ response - resolution or rejection
    return getFinalResponse(persona, objection);
  }
}

function getFollowUpResponse(persona: AgentPersona, objection: Objection): string {
  const responses: { [key: string]: string } = {
    'sarah-skeptic': "I appreciate you explaining that, but I've heard promises like this before. What specifically makes this different from the last investor who promised the world and then backed out?",
    'mike-friendly': "That's actually a good point. Let me talk to my sellers and see what they think. Can you send me some more info about your company?",
    'lisa-aggressive': "I'm not convinced. My seller has other options. What's your best and final?",
    'brian-busy': "Okay, I've got the numbers. The seller wants $50K more. Take it or leave it - I need an answer by 5pm today.",
    'debbie-distressed': "The bank might go for that. Let me submit your terms and see what they say. It might take a few weeks though.",
    'tom-legacy': "I presented your offer to the seller. They want to meet you face-to-face before deciding. Can you come to my office tomorrow at 2pm?",
    'jessica-motivated': "They were really excited about your offer! There's just one thing - they need to net at least $50K after the sale. Can you work with that?",
    'carlos-mls': "I've got two other offers on the table. If you want this property, you're going to need to match or beat them. What'll it be?",
    'amy-inherited': "My siblings are arguing about the price again. Some want to accept, others want to wait for a better offer. It's been emotional.",
    'robert-novice': "My broker looked at the contract and had some questions. Can you explain the earnest money part again? I'm a little confused."
  };
  
  return responses[persona.id] || objection.response;
}

function getFinalResponse(persona: AgentPersona, objection: Objection): string {
  const rand = Math.random();
  
  // Success rate varies by persona
  const successThreshold = persona.likelihoodToRespond;
  
  if (rand < successThreshold) {
    return "You know what, let's do this. I think we can make this work. Let me get the seller on board and we'll move forward.";
  } else if (rand < successThreshold + 0.3) {
    return "I'm still not sure. Give me one more reason why I should present this to my seller over the other offers.";
  } else {
    return "I've decided to go with a different buyer. Thanks for your time, but this isn't going to work out.";
  }
}

// Run a single simulation
export function runSimulation(persona: AgentPersona, property: typeof SAMPLE_PROPERTIES[0]): SimulationResult {
  const startTime = Date.now();
  const turns: ConversationTurn[] = [];
  
  // AI initial message
  const initialOffer = `Hi, I came across your listing at ${property.address} and I'm interested in making a cash offer of $${property.offer.toLocaleString()}. I can close in 14 days with no contingencies.`;
  
  turns.push({
    speaker: 'ai',
    message: initialOffer,
    timestamp: new Date()
  });
  
  // Agent response
  const agentResponse1 = generateAgentResponse(persona, 1);
  turns.push({
    speaker: 'agent',
    message: agentResponse1,
    timestamp: new Date()
  });
  
  // Determine outcome based on persona likelihood
  const success = Math.random() < persona.likelihoodToRespond;
  const outcome: SimulationResult['outcome'] = success ? 'success' : Math.random() < 0.5 ? 'failure' : 'stalled';
  
  const duration = Math.round((Date.now() - startTime) / 1000);
  
  // Calculate score
  const score = calculateScore(outcome, turns.length, persona);
  
  return {
    id: `sim-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    personaId: persona.id,
    personaName: persona.name,
    propertyId: property.id,
    turns,
    outcome,
    duration,
    objectionHandled: persona.commonObjections[0].category,
    finalOffer: property.offer,
    agentResponse: agentResponse1,
    score,
    failureReason: outcome === 'failure' ? 'Agent rejected offer' : outcome === 'stalled' ? 'Negotiation stalled' : undefined
  };
}

function calculateScore(outcome: SimulationResult['outcome'], turns: number, persona: AgentPersona): number {
  let baseScore = 0;
  
  if (outcome === 'success') baseScore = 80;
  else if (outcome === 'stalled') baseScore = 40;
  else baseScore = 20;
  
  // Bonus for handling more turns (persistence)
  if (turns > 3) baseScore += 10;
  
  // Difficulty adjustment
  const avgDifficulty = persona.commonObjections.reduce((sum, o) => sum + o.difficulty, 0) / persona.commonObjections.length;
  if (baseScore > 50) baseScore += Math.round(avgDifficulty / 2);
  
  return Math.min(100, baseScore);
}

// Run batch simulations
export function runBatchSimulation(count: number = 100): SimulationResult[] {
  const results: SimulationResult[] = [];
  
  for (let i = 0; i < count; i++) {
    const persona = AGENT_PERSONAS[Math.floor(Math.random() * AGENT_PERSONAS.length)];
    const property = SAMPLE_PROPERTIES[Math.floor(Math.random() * SAMPLE_PROPERTIES.length)];
    const result = runSimulation(persona, property);
    results.push(result);
  }
  
  return results;
}

// Calculate training statistics
export function calculateStats(results: SimulationResult[]): TrainingStats {
  const totalSimulations = results.length;
  const successes = results.filter(r => r.outcome === 'success').length;
  const successRate = (successes / totalSimulations) * 100;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / totalSimulations;
  
  // By persona
  const byPersona: TrainingStats['byPersona'] = {};
  AGENT_PERSONAS.forEach(p => {
    const personaResults = results.filter(r => r.personaId === p.id);
    if (personaResults.length > 0) {
      byPersona[p.id] = {
        name: p.name,
        attempts: personaResults.length,
        successes: personaResults.filter(r => r.outcome === 'success').length,
        successRate: (personaResults.filter(r => r.outcome === 'success').length / personaResults.length) * 100,
        avgScore: personaResults.reduce((sum, r) => sum + r.score, 0) / personaResults.length
      };
    }
  });
  
  // By objection category
  const byObjection: TrainingStats['byObjection'] = {};
  results.forEach(r => {
    if (!byObjection[r.objectionHandled]) {
      byObjection[r.objectionHandled] = { attempts: 0, successes: 0, successRate: 0 };
    }
    byObjection[r.objectionHandled].attempts++;
    if (r.outcome === 'success') {
      byObjection[r.objectionHandled].successes++;
    }
  });
  
  Object.keys(byObjection).forEach(key => {
    byObjection[key].successRate = (byObjection[key].successes / byObjection[key].attempts) * 100;
  });
  
  return {
    totalSimulations,
    successRate,
    avgDuration,
    byPersona,
    byObjection
  };
}
