// Underwriting Service - 3-Tier Offer Structure with Creative Finance

import {
  Property,
  UnderwritingAnalysis,
  OfferTier,
  DealTerms,
  EntryFee,
  MortgageAnalysis,
  EquityAnalysis,
  UnderwritingInput,
  UnderwritingOutput
} from "@/types/property";

/**
 * Underwriting Service
 * 3-tier underwriting structure:
 * - Tier 1: 70% of asking + Terms (negotiation anchor - best for buyer, terrible for seller)
 * - Tier 2: 70% all cash (negotiation fallback - we hate this but use as leverage)
 * - Tier 3: 100% of asking + Terms (competitive offer - counter offer positioning)
 */

export class UnderwritingService {
  /**
   * Underwrite a property with comprehensive financial analysis
   */
  async underwriteProperty(input: UnderwritingInput): Promise<UnderwritingOutput> {
    const { property, market_analysis, seller_motivation, known_issues } = input;

    // Calculate 3-tier offers
    const tier1 = this.calculateTier1Offer(property, market_analysis);
    const tier2 = this.calculateTier2Offer(property, market_analysis);
    const tier3 = this.calculateTier3Offer(property, market_analysis);

    // Calculate entry fee (down payment structure)
    const entryFee = this.calculateEntryFee(property, tier1);

    // Analyze mortgage/financing
    const mortgageAnalysis = this.analyzeMortgage(property, market_analysis);

    // Analyze equity
    const equityAnalysis = this.analyzeEquity(property, market_analysis);

    // Calculate investment metrics
    const arv = market_analysis.estimated_arv || property.list_price * 1.1;
    const repairEstimate = this.estimateRepairs(property, known_issues);
    const monthlyRent = market_analysis.estimated_rent_ltr;
    const grossYield = monthlyRent * 12 / property.list_price * 100;
    const capRate = this.calculateCapRate(property, monthlyRent);
    const cashOnCash = this.calculateCashOnCash(entryFee, monthlyRent);

    // Calculate deal score
    const dealScore = this.calculateDealScore(
      property,
      market_analysis,
      entryFee,
      grossYield,
      capRate
    );

    // Build underwriting analysis
    const underwriting: UnderwritingAnalysis = {
      tier1,
      tier2,
      tier3,

      // Financial Analysis
      arv,
      repair_estimate: repairEstimate,
      after_repair_value: arv,
      estimated_monthly_rent: monthlyRent,
      gross_yield: grossYield,
      cap_rate: capRate,
      cash_on_cash_return: cashOnCash,

      // Terms Analysis
      mortgage_analysis: mortgageAnalysis,
      equity_analysis: equityAnalysis,

      // Entry Fee
      entry_fee: entryFee,

      // Deal Score
      deal_score: dealScore.score,
      deal_tier: dealScore.tier,

      underwritten_at: new Date().toISOString()
    };

    // Generate recommendations, risks, opportunities
    const recommendations = this.generateRecommendations(underwriting);
    const risks = this.identifyRisks(property, underwriting);
    const opportunities = this.identifyOpportunities(underwriting, seller_motivation);

    return {
      underwriting,
      recommendations,
      risks,
      opportunities,
      underwritten_at: new Date().toISOString()
    };
  }

  /**
   * Tier 1: 70% asking + Terms (Negotiation Anchor)
   * Best for buyer, terrible for seller - used for negotiation positioning
   */
  private calculateTier1Offer(property: Property, market_analysis: any): OfferTier {
    const askingPrice = property.list_price;
    const offerPrice = askingPrice * 0.70;

    const terms: DealTerms = {
      purchase_price: offerPrice,
      down_payment: offerPrice * 0.05, // 5% entry fee
      down_payment_percentage: 5,
      loan_amount: offerPrice * 0.95,
      interest_rate: 4.5, // Great rate <5%
      loan_term_years: 40, // Target 40+ years
      balloon_term_years: 10, // Target 10+ year balloon
      monthly_payment: this.calculateMonthlyPayment(offerPrice * 0.95, 4.5, 40),

      // Creative Finance
      seller_finance: true,
      subject_to: false,
      lease_option: false,
      option_fee: offerPrice * 0.02,
      lease_term_months: 12,
      rent_credit: 500,

      // Rental Strategy
      rental_strategy: 'LTR',
      estimated_market_rent: market_analysis.estimated_rent_ltr || askingPrice * 0.005,
      short_term_rent: market_analysis.estimated_rent_str || askingPrice * 0.015,
      medium_term_rent: market_analysis.estimated_rent_mtr || askingPrice * 0.0075,
      long_term_rent: market_analysis.estimated_rent_ltr || askingPrice * 0.005
    };

    return {
      tier: 1,
      offer_price: offerPrice,
      offer_percentage: 70,
      offer_type: 'terms',
      earnest_money: offerPrice * 0.01,
      closing_costs: offerPrice * 0.03,
      total_acquisition_cost: offerPrice * 1.04,
      terms,
      rationale: "Aggressive negotiation anchor - 70% of asking with creative terms. Used to establish low-end positioning and leave room for counters.",
      use_case: "Initial offer for motivated sellers, distressed properties, or when testing seller flexibility"
    };
  }

  /**
   * Tier 2: 70% All Cash (Negotiation Fallback)
   * We hate this but use as leverage - shows we can close fast
   */
  private calculateTier2Offer(property: Property, market_analysis: any): OfferTier {
    const askingPrice = property.list_price;
    const offerPrice = askingPrice * 0.70;

    return {
      tier: 2,
      offer_price: offerPrice,
      offer_percentage: 70,
      offer_type: 'all_cash',
      earnest_money: offerPrice * 0.05,
      closing_costs: offerPrice * 0.02,
      total_acquisition_cost: offerPrice * 1.02,
      rationale: "All-cash fallback - same 70% price but with cash certainty. Used when seller needs speed over terms. We dislike this but it's powerful leverage.",
      use_case: "When seller prioritizes speed/certainty over creative terms, or when countering requires cash proof"
    };
  }

  /**
   * Tier 3: 100% Asking + Terms (Competitive/Counter Position)
   * Used for counter offers and competitive situations
   */
  private calculateTier3Offer(property: Property, market_analysis: any): OfferTier {
    const askingPrice = property.list_price;
    const offerPrice = askingPrice * 1.00;

    const terms: DealTerms = {
      purchase_price: offerPrice,
      down_payment: offerPrice * 0.10, // 10% entry fee
      down_payment_percentage: 10,
      loan_amount: offerPrice * 0.90,
      interest_rate: 5.0, // Still good rate
      loan_term_years: 40,
      balloon_term_years: 10,
      monthly_payment: this.calculateMonthlyPayment(offerPrice * 0.90, 5.0, 40),

      // Creative Finance
      seller_finance: true,
      subject_to: true,
      lease_option: false,
      option_fee: offerPrice * 0.03,
      lease_term_months: 24,
      rent_credit: 750,

      // Rental Strategy
      rental_strategy: 'MTR',
      estimated_market_rent: market_analysis.estimated_rent_mtr || askingPrice * 0.0075,
      short_term_rent: market_analysis.estimated_rent_str || askingPrice * 0.015,
      medium_term_rent: market_analysis.estimated_rent_mtr || askingPrice * 0.0075,
      long_term_rent: market_analysis.estimated_rent_ltr || askingPrice * 0.005
    };

    return {
      tier: 3,
      offer_price: offerPrice,
      offer_percentage: 100,
      offer_type: 'terms',
      earnest_money: offerPrice * 0.03,
      closing_costs: offerPrice * 0.03,
      total_acquisition_cost: offerPrice * 1.03,
      terms,
      rationale: "Full asking with favorable terms - competitive positioning for counters or multiple offer situations. Shows flexibility while maintaining term advantages.",
      use_case: "Counter offers, competitive markets, or when seller has multiple offers"
    };
  }

  /**
   * Calculate Entry Fee (Down Payment Structure)
   * Target: <20% (steal: <10%)
   * Traditional bank: 20-30% down
   */
  private calculateEntryFee(property: Property, tier1Offer: OfferTier): EntryFee {
    const askingPrice = property.list_price;
    const offerPrice = tier1Offer.offer_price;

    // Components
    const cashToSeller = offerPrice * 0.03; // 3% to seller
    const arrearsLiens = 0; // Would need to discover from seller
    const costOfAcquisition = offerPrice * 0.03; // 3% pay myself
    const closeEscrowCosts = offerPrice * 0.01;
    const renovationReserve = offerPrice * 0.02;
    const maintenanceReserve = offerPrice * 0.01;
    const marketingReserve = offerPrice * 0.01;

    // Total entry fee
    const totalEntryFee =
      cashToSeller +
      arrearsLiens +
      costOfAcquisition +
      closeEscrowCosts +
      renovationReserve +
      maintenanceReserve +
      marketingReserve;

    const entryFeePercentage = (totalEntryFee / askingPrice) * 100;

    return {
      cash_to_seller: cashToSeller,
      arrears_liens: arrearsLiens,
      cost_of_acquisition: costOfAcquisition,
      close_escrow_costs: closeEscrowCosts,
      renovation_reserve: renovationReserve,
      maintenance_reserve: maintenanceReserve,
      marketing_reserve: marketingReserve,

      seller_percent: 3,
      agent_percent: 3,
      other_percent: 3,

      total_entry_fee: totalEntryFee,
      entry_fee_percentage: entryFeePercentage,

      // Assessment
      is_steal: entryFeePercentage < 10,
      is_target: entryFeePercentage < 20,
      traditional_comparison: entryFeePercentage < 20
        ? `Our ${entryFeePercentage.toFixed(1)}% entry fee beats traditional 20-30% down payment`
        : "Entry fee exceeds target - consider renegotiation"
    };
  }

  /**
   * Analyze Mortgage - Compare vs Traditional Financing
   * Traditional: 20-30% down, 7-9% rate, 30yr term, 7-10yr balloon
   * Ours: <20% down (target <10%), <5% rate (great 4-6%), 40+yr term, 10+yr balloon
   */
  private analyzeMortgage(property: Property, market_analysis: any): MortgageAnalysis {
    const askingPrice = property.list_price;

    // Traditional Bank Financing
    const traditional = {
      down_payment: askingPrice * 0.25, // 25% average
      interest_rate: 8.0, // 7-9% average
      term_years: 30,
      balloon_years: 7
    };

    // Our Creative Terms
    const ours = {
      down_payment: askingPrice * 0.05, // 5% (Tier 1)
      interest_rate: 4.5, // <5% great rate
      term_years: 40,
      balloon_years: 10
    };

    // Calculate monthly payments
    const traditionalMonthly = this.calculateMonthlyPayment(
      askingPrice * 0.75,
      traditional.interest_rate,
      traditional.term_years
    );

    const oursMonthly = this.calculateMonthlyPayment(
      askingPrice * 0.95,
      ours.interest_rate,
      ours.term_years
    );

    return {
      traditional_down_payment: traditional.down_payment,
      traditional_interest_rate: traditional.interest_rate,
      traditional_term_years: traditional.term_years,
      traditional_balloon_years: traditional.balloon_years,

      our_down_payment: ours.down_payment,
      our_interest_rate: ours.interest_rate,
      our_term_years: ours.term_years,
      our_balloon_years: ours.balloon_years,

      down_payment_savings: traditional.down_payment - ours.down_payment,
      interest_rate_savings: traditional.interest_rate - ours.interest_rate,
      term_extension_years: ours.term_years - traditional.term_years,
      monthly_payment_difference: traditionalMonthly - oursMonthly
    };
  }

  /**
   * Analyze Equity Position
   */
  private analyzeEquity(property: Property, market_analysis: any): EquityAnalysis {
    const arv = market_analysis.estimated_arv || property.list_price;
    const listPrice = property.list_price;

    // Estimate seller equity (would need actual data from seller)
    const estimatedSellerEquity = arv * 0.30; // Assume 30% equity

    return {
      current_equity: arv - listPrice,
      seller_equity: estimatedSellerEquity,
      loan_to_value: listPrice / arv * 100,
      combined_loan_to_value: 0, // Would need second lien data
      equity_available: estimatedSellerEquity
    };
  }

  /**
   * Estimate repair costs
   */
  private estimateRepairs(property: Property, known_issues?: string[]): number {
    const baseRepair = property.sqft * 50; // $50/sqft base

    if (!known_issues || known_issues.length === 0) {
      return baseRepair;
    }

    // Add for known issues
    const issueCosts: Record<string, number> = {
      'roof': 15000,
      'hvac': 8000,
      'plumbing': 5000,
      'electrical': 7000,
      'foundation': 20000,
      'cosmetic': 3000
    };

    const additionalRepairs = known_issues.reduce(
      (sum, issue) => sum + (issueCosts[issue.toLowerCase()] || 2000),
      0
    );

    return baseRepair + additionalRepairs;
  }

  /**
   * Calculate monthly payment
   */
  private calculateMonthlyPayment(principal: number, rate: number, years: number): number {
    const monthlyRate = rate / 100 / 12;
    const numPayments = years * 12;

    if (monthlyRate === 0) return principal / numPayments;

    return (principal * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -numPayments));
  }

  /**
   * Calculate Cap Rate
   */
  private calculateCapRate(property: Property, monthlyRent: number): number {
    const noi = monthlyRent * 12;
    const value = property.list_price;
    return (noi / value) * 100;
  }

  /**
   * Calculate Cash on Cash Return
   */
  private calculateCashOnCash(entryFee: EntryFee, monthlyRent: number): number {
    const annualCashFlow = monthlyRent * 12;
    const cashInvested = entryFee.total_entry_fee;
    return cashInvested > 0 ? (annualCashFlow / cashInvested) * 100 : 0;
  }

  /**
   * Calculate Deal Score (0-5 stars, 1-5 tier)
   */
  private calculateDealScore(
    property: Property,
    market_analysis: any,
    entryFee: EntryFee,
    grossYield: number,
    capRate: number
  ): { score: number; tier: number } {
    let score = 0;

    // Entry fee score (0-2)
    if (entryFee.is_steal) score += 2;
    else if (entryFee.is_target) score += 1;

    // Yield score (0-2)
    if (grossYield >= 8) score += 2;
    else if (grossYield >= 5) score += 1;

    // Market score (0-1)
    if (market_analysis.area_competence_score > 70) score += 1;

    // Normalize to 5-star scale
    const normalizedScore = Math.min(5, score);
    const tier = Math.ceil(normalizedScore);

    return { score: normalizedScore, tier };
  }

  /**
   * Generate recommendations based on underwriting
   */
  private generateRecommendations(underwriting: UnderwritingAnalysis): string[] {
    const recommendations: string[] = [];

    if (underwriting.deal_score >= 4) {
      recommendations.push("Strong deal - proceed with Tier 1 offer immediately");
    } else if (underwriting.deal_score >= 3) {
      recommendations.push("Moderate deal - consider Tier 1 with escalation clause");
    } else {
      recommendations.push("Weak deal - only proceed if highly motivated seller");
    }

    if (underwriting.entry_fee.is_steal) {
      recommendations.push("Entry fee is excellent - under 10% is a steal");
    }

    if (underwriting.gross_yield >= 8) {
      recommendations.push("Strong yield - consider STR strategy for maximum returns");
    }

    if (underwriting.cap_rate >= 6) {
      recommendations.push("Cap rate supports LTR or MTR strategy");
    }

    return recommendations;
  }

  /**
   * Identify risks
   */
  private identifyRisks(property: Property, underwriting: UnderwritingAnalysis): string[] {
    const risks: string[] = [];

    if (property.list_price > underwriting.arv) {
      risks.push("Property may be overpriced vs ARV");
    }

    if (!underwriting.entry_fee.is_target) {
      risks.push("Entry fee exceeds 20% target - traditional financing may be better");
    }

    if (underwriting.cap_rate < 4) {
      risks.push("Low cap rate - cash flow may be tight");
    }

    return risks;
  }

  /**
   * Identify opportunities
   */
  private identifyOpportunities(underwriting: UnderwritingAnalysis, seller_motivation?: string): string[] {
    const opportunities: string[] = [];

    if (seller_motivation?.includes('divorce')) {
      opportunities.push("Divorce situation - may accept quick close");
    }

    if (seller_motivation?.includes('relocation')) {
      opportunities.push("Relocation - time sensitivity, use speed as leverage");
    }

    if (underwriting.deal_score >= 4) {
      opportunities.push("Super steal opportunity - strong underwriting metrics");
    }

    if (underwriting.equity_analysis && underwriting.equity_analysis.seller_equity > 50000) {
      opportunities.push("Significant seller equity - room for creative terms");
    }

    return opportunities;
  }
}
