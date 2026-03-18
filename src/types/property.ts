// Property and Deal Types

export interface Property {
  property_id: string;
  dataset_id: string;
  account_id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  list_price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  year_built: number;
  lot_size: number;
  property_type: string;
  status: PropertyStatus;
  agent_name?: string;
  agent_email?: string;
  agent_phone?: string;
  ml_number?: string;
  days_on_market?: number;
  price_per_sqft?: number;
  hoa_fee?: number;
  tax_amount?: number;
  tax_year?: number;
  zestimate?: number;
  rent_estimate?: number;
  created_at: string;
  updated_at: string;

  // Market Research Data
  market_analysis?: MarketAnalysis;

  // Underwriting Data
  underwriting?: UnderwritingAnalysis;

  // Offer Data
  offers?: Offer[];

  // Email/CRM Data
  communications?: Communication[];
}

export type PropertyStatus =
  | 'PENDING_RESEARCH'
  | 'RESEARCHING'
  | 'RESEARCH_COMPLETE'
  | 'UNDERWRITING'
  | 'UNDERWRITING_COMPLETE'
  | 'OFFER_GENERATED'
  | 'OFFER_SENT'
  | 'UNDER_CONTRACT'
  | 'CLOSED'
  | 'REJECTED';

export interface MarketAnalysis {
  // Area Statistics
  area_avg_price: number;
  area_median_price: number;
  area_avg_sqft: number;
  area_avg_price_per_sqft: number;
  area_avg_bedrooms: number;
  area_avg_bathrooms: number;
  area_avg_year_built: number;
  area_avg_dom: number;

  // Comparables
  comparables: Comparable[];

  // On-Market Data
  on_market_count: number;
  on_market_avg_price: number;
  on_market_median_price: number;

  // Off-Market Data
  off_market_count: number;
  off_market_avg_price: number;
  off_market_discount: number; // % discount vs on-market

  // Market Health
  absorption_rate: number; // months of inventory
  appreciation_rate: number; // YoY %
  cash_buyer_percentage: number;
  foreign_buyer_percentage: number;

  // Area Competence Score (0-100)
  area_competence_score: number;

  // Investment Metrics
  estimated_arv: number;
  estimated_rent_str: number; // Short-term rental
  estimated_rent_mtr: number; // Medium-term rental
  estimated_rent_ltr: number; // Long-term rental

  researched_at?: string;
}

export interface Comparable {
  address: string;
  distance_miles: number;
  sold_price: number;
  sold_date: string;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  year_built: number;
  price_per_sqft: number;
  similarity_score: number; // 0-100
}

export interface UnderwritingAnalysis {
  // 3-Tier Offer Structure
  tier1: OfferTier; // 70% asking + Terms (negotiation anchor)
  tier2: OfferTier; // 70% all cash (negotiation fallback)
  tier3: OfferTier; // 100% asking + Terms (competitive)

  // Financial Analysis
  arv: number;
  repair_estimate: number;
  after_repair_value: number;
  estimated_monthly_rent: number;
  gross_yield: number;
  cap_rate: number;
  cash_on_cash_return: number;

  // Terms Analysis
  mortgage_analysis?: MortgageAnalysis;
  equity_analysis?: EquityAnalysis;

  // Entry Fee Calculation
  entry_fee: EntryFee;

  // Deal Score (0-5 stars)
  deal_score: number;
  deal_tier: number; // 1-5

  underwritten_at?: string;
}

export interface OfferTier {
  tier: 1 | 2 | 3;
  offer_price: number;
  offer_percentage: number; // % of asking
  offer_type: 'terms' | 'all_cash';
  earnest_money: number;
  closing_costs: number;
  total_acquisition_cost: number;

  // Terms (for tier 1 and 3)
  terms?: DealTerms;

  // Rationale
  rationale: string;
  use_case: string;
}

export interface DealTerms {
  // Purchase Structure
  purchase_price: number;
  down_payment: number; // Entry fee
  down_payment_percentage: number;

  // Financing
  loan_amount: number;
  interest_rate: number;
  loan_term_years: number;
  balloon_term_years: number;
  monthly_payment: number;

  // Seller Finance / Subject-To
  seller_finance?: boolean;
  subject_to?: boolean;
  existing_mortgage?: ExistingMortgage;

  // Creative Finance
  lease_option?: boolean;
  option_fee: number;
  lease_term_months: number;
  rent_credit: number;

  // Payoff
  payoff_date?: string;

  // Rental Strategy
  rental_strategy: 'STR' | 'MTR' | 'LTR';
  estimated_market_rent: number;
  short_term_rent: number;
  medium_term_rent: number;
  long_term_rent: number;
}

export interface ExistingMortgage {
  balance: number;
  interest_rate: number;
  monthly_payment: number;
  remaining_term_months: number;
  lender: string;
}

export interface MortgageAnalysis {
  // Traditional Bank Comparison
  traditional_down_payment: number; // 20-30%
  traditional_interest_rate: number; // 7-9%
  traditional_term_years: number; // 30
  traditional_balloon_years: number; // 7-10

  // Our Terms
  our_down_payment: number; // Target <20%, steal <10%
  our_interest_rate: number; // Target <5%, great 4-6%
  our_term_years: number; // Target 40+
  our_balloon_years: number; // Target 10+

  // Comparison
  down_payment_savings: number;
  interest_rate_savings: number;
  term_extension_years: number;
  monthly_payment_difference: number;
}

export interface EquityAnalysis {
  current_equity: number;
  seller_equity: number;
  loan_to_value: number;
  combined_loan_to_value: number;
  equity_available: number;
}

export interface EntryFee {
  // Components
  cash_to_seller: number;
  arrears_liens: number;
  cost_of_acquisition: number; // Pay myself
  close_escrow_costs: number;
  renovation_reserve: number;
  maintenance_reserve: number;
  marketing_reserve: number;

  // Percentages
  seller_percent: number; // 3%
  agent_percent: number; // 3%
  other_percent: number; // 3%

  // Total
  total_entry_fee: number;
  entry_fee_percentage: number; // % of asking

  // Assessment
  is_steal: boolean; // <10%
  is_target: boolean; // <20%
  traditional_comparison: string;
}

export interface Offer {
  offer_id: string;
  property_id: string;
  account_id: string;
  tier: 1 | 2 | 3;
  offer_price: number;
  terms: DealTerms;
  status: OfferStatus;
  generated_at: string;
  sent_at?: string;
  response_at?: string;
  counter_offer?: CounterOffer;
}

export type OfferStatus =
  | 'DRAFT'
  | 'PREVIEW'
  | 'SENT'
  | 'OPENED'
  | 'RESPONDED'
  | 'COUNTERED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'WITHDRAWN';

export interface CounterOffer {
  counter_price: number;
  counter_terms: Partial<DealTerms>;
  counter_from: 'seller' | 'agent';
  countered_at: string;
  response?: string;
}

export interface Communication {
  comm_id: string;
  property_id: string;
  account_id: string;
  type: 'email' | 'call' | 'text' | 'note';
  direction: 'outbound' | 'inbound';
  recipient?: string;
  sender?: string;
  subject?: string;
  body: string;
  status: 'draft' | 'sent' | 'delivered' | 'opened' | 'replied';
  sent_at?: string;
  opened_at?: string;
  replied_at?: string;

  // Email tracking
  tracking?: EmailTracking;

  // Purpose
  purpose: CommunicationPurpose;

  // Discovery
  discovered_pain_points?: string[];
  objections_handled?: string[];
  next_action?: string;
  follow_up_date?: string;

  created_at: string;
}

export type CommunicationPurpose =
  | 'initial_outreach'
  | 'follow_up'
  | 'offer_presentation'
  | 'negotiation'
  | 'pain_point_discovery'
  | 'objection_handling'
  | 'closing'
  | 'contract_review'
  | 'mortgage_statement_request'
  | 'human_in_loop_review';

export interface EmailTracking {
  message_id: string;
  provider: 'sendgrid' | 'resend' | 'ses' | 'other';
  delivered_at?: string;
  opened_at?: string;
  clicked_at?: string;
  bounced?: boolean;
  bounced_reason?: string;
}

// Market Research Input/Output types
export interface MarketResearchInput {
  property: Property;
  on_market_properties: Property[];
  off_market_data: OffMarketData[];
}

export interface OffMarketData {
  address: string;
  city: string;
  state: string;
  estimated_value: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  year_built: number;
  last_sold_price?: number;
  last_sold_date?: string;
  owner_name?: string;
  distressed_indicators?: string[];
}

export interface MarketResearchOutput {
  market_analysis: MarketAnalysis;
  confidence_score: number;
  data_sources: string[];
  researched_at: string;
}

// Underwriting Input/Output types
export interface UnderwritingInput {
  property: Property;
  market_analysis: MarketAnalysis;
  seller_motivation?: string;
  known_issues?: string[];
}

export interface UnderwritingOutput {
  underwriting: UnderwritingAnalysis;
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  underwritten_at: string;
}

// Email Agent types
export interface EmailCampaign {
  campaign_id: string;
  account_id: string;
  properties: string[]; // property_ids
  status: 'draft' | 'active' | 'paused' | 'completed';
  template_type: CommunicationPurpose;
  total_emails: number;
  sent_count: number;
  opened_count: number;
  replied_count: number;
  created_at: string;
  started_at?: string;
  completed_at?: string;
}

export interface EmailTemplate {
  template_id: string;
  name: string;
  purpose: CommunicationPurpose;
  subject: string;
  body: string;
  variables: string[];
  is_default: boolean;
}
