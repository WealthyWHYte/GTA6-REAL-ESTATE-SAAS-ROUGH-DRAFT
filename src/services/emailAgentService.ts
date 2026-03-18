// Email Agent Service - Full CRM with Communication Management

import {
  Property,
  Communication,
  CommunicationPurpose,
  EmailTemplate,
  EmailCampaign,
  Offer,
  CounterOffer,
  DealTerms
} from "@/types/property";

/**
 * Email Agent Service
 * Full CRM capabilities:
 * - Select offers from underwriter
 * - Preview/edit generated emails
 * - Send and track contacts/communications
 * - Follow-up automation
 * - Pain point discovery
 * - Objection handling
 * - Close deals autonomously
 * - Human-in-loop for mortgage statement review
 */

export class EmailAgentService {
  private templates: Map<string, EmailTemplate> = new Map();
  private communications: Map<string, Communication> = new Map();
  private campaigns: Map<string, EmailCampaign> = new Map();

  constructor() {
    this.initializeTemplates();
  }

  /**
   * Initialize email templates for all communication purposes
   */
  private initializeTemplates() {
    const templates: EmailTemplate[] = [
      {
        template_id: 'initial_outreach',
        name: 'Initial Outreach',
        purpose: 'initial_outreach',
        subject: 'Interested in Your Property at {{address}}',
        body: this.getInitialOutreachTemplate(),
        variables: ['address', 'city', 'state', 'buyer_name'],
        is_default: true
      },
      {
        template_id: 'follow_up',
        name: 'Follow-Up',
        purpose: 'follow_up',
        subject: 'Following Up - {{address}}',
        body: this.getFollowUpTemplate(),
        variables: ['address', 'days_since_contact', 'next_step'],
        is_default: true
      },
      {
        template_id: 'offer_presentation',
        name: 'Offer Presentation',
        purpose: 'offer_presentation',
        subject: 'Purchase Offer for {{address}}',
        body: this.getOfferPresentationTemplate(),
        variables: ['address', 'offer_price', 'offer_terms', 'earnest_money', 'closing_timeline'],
        is_default: true
      },
      {
        template_id: 'negotiation',
        name: 'Negotiation',
        purpose: 'negotiation',
        subject: 'Re: Offer for {{address}}',
        body: this.getNegotiationTemplate(),
        variables: ['address', 'counter_price', 'counter_terms', 'rationale'],
        is_default: true
      },
      {
        template_id: 'pain_point_discovery',
        name: 'Pain Point Discovery',
        purpose: 'pain_point_discovery',
        subject: 'Quick Question About {{address}}',
        body: this.getPainPointDiscoveryTemplate(),
        variables: ['address', 'question_1', 'question_2', 'question_3'],
        is_default: true
      },
      {
        template_id: 'objection_handling',
        name: 'Objection Handling',
        purpose: 'objection_handling',
        subject: 'Re: Your Concerns About {{address}}',
        body: this.getObjectionHandlingTemplate(),
        variables: ['address', 'objection', 'response', 'alternative'],
        is_default: true
      },
      {
        template_id: 'closing',
        name: 'Closing',
        purpose: 'closing',
        subject: 'Ready to Move Forward - {{address}}',
        body: this.getClosingTemplate(),
        variables: ['address', 'agreed_price', 'agreed_terms', 'closing_date'],
        is_default: true
      },
      {
        template_id: 'contract_review',
        name: 'Contract Review',
        purpose: 'contract_review',
        subject: 'Contract for Review - {{address}}',
        body: this.getContractReviewTemplate(),
        variables: ['address', 'contract_terms', 'review_deadline'],
        is_default: true
      },
      {
        template_id: 'mortgage_statement_request',
        name: 'Mortgage Statement Request',
        purpose: 'mortgage_statement_request',
        subject: 'Mortgage Information Needed - {{address}}',
        body: this.getMortgageStatementRequestTemplate(),
        variables: ['address', 'lender_name', 'loan_number'],
        is_default: true
      },
      {
        template_id: 'human_in_loop_review',
        name: 'Human-in-Loop Review',
        purpose: 'human_in_loop_review',
        subject: 'Action Required: {{address}} Counter Offer',
        body: this.getHumanInLoopTemplate(),
        variables: ['address', 'seller_counter', 'our_recommendation', 'notes'],
        is_default: true
      }
    ];

    templates.forEach(t => this.templates.set(t.template_id, t));
  }

  /**
   * Select offers from underwriter and prepare for email generation
   */
  selectOffersForCampaign(properties: Property[], underwritingResults: Map<string, any>): Property[] {
    // Filter properties with strong underwriting scores
    const qualifiedProperties = properties.filter(p => {
      const underwriting = underwritingResults.get(p.property_id);
      if (!underwriting) return false;

      // Only select properties with deal score >= 3
      return underwriting.deal_score >= 3;
    });

    return qualifiedProperties;
  }

  /**
   * Generate email for a specific purpose
   */
  generateEmail(
    property: Property,
    purpose: CommunicationPurpose,
    offer?: Offer,
    counterOffer?: CounterOffer,
    customVariables?: Record<string, string>
  ): { subject: string; body: string; template: EmailTemplate } {
    const template = this.templates.get(purpose);
    if (!template) {
      throw new Error(`No template found for purpose: ${purpose}`);
    }

    // Build variables
    const variables: Record<string, string> = {
      address: `${property.address}, ${property.city}, ${property.state}`,
      city: property.city,
      state: property.state,
      buyer_name: 'Wealthy Wholesalers',
      ...customVariables
    };

    // Add offer-specific variables
    if (offer) {
      variables.offer_price = `$${offer.offer_price.toLocaleString()}`;
      variables.offer_terms = offer.terms?.seller_finance ? 'Seller Financing' : 'Creative Terms';
      variables.earnest_money = `$${offer.earnest_money.toLocaleString()}`;
      variables.closing_timeline = '30-45 days';
    }

    // Add counter-specific variables
    if (counterOffer) {
      variables.counter_price = `$${counterOffer.counter_price.toLocaleString()}`;
      variables.counter_terms = 'Flexible Terms';
      variables.rationale = 'Based on market analysis and property condition';
    }

    // Replace variables in template
    let subject = template.subject;
    let body = template.body;

    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    return { subject, body, template };
  }

  /**
   * Preview email with ability to edit
   */
  previewEmail(
    generated: { subject: string; body: string },
    edits?: { subject?: string; body?: string }
  ): { subject: string; body: string; readyToSend: boolean } {
    return {
      subject: edits?.subject || generated.subject,
      body: edits?.body || generated.body,
      readyToSend: true
    };
  }

  /**
   * Send email and track
   */
  async sendEmail(
    propertyId: string,
    accountId: string,
    recipient: string,
    sender: string,
    subject: string,
    body: string,
    purpose: CommunicationPurpose
  ): Promise<Communication> {
    const comm: Communication = {
      comm_id: `COMM-${Date.now()}-${crypto.randomUUID().slice(0, 8)}`,
      property_id: propertyId,
      account_id: accountId,
      type: 'email',
      direction: 'outbound',
      recipient,
      sender,
      subject,
      body,
      status: 'sent',
      purpose,
      created_at: new Date().toISOString(),
      sent_at: new Date().toISOString(),
      tracking: {
        message_id: `msg_${crypto.randomUUID()}`,
        provider: 'resend'
      }
    };

    this.communications.set(comm.comm_id, comm);
    return comm;
  }

  /**
   * Track email opens, clicks, replies
   */
  trackEmailEvent(
    commId: string,
    event: 'opened' | 'clicked' | 'replied' | 'bounced',
    details?: string
  ) {
    const comm = this.communications.get(commId);
    if (!comm) return;

    switch (event) {
      case 'opened':
        comm.status = 'opened';
        comm.opened_at = new Date().toISOString();
        break;
      case 'clicked':
        comm.tracking = { ...comm.tracking!, clicked_at: new Date().toISOString() };
        break;
      case 'replied':
        comm.status = 'replied';
        comm.replied_at = new Date().toISOString();
        break;
      case 'bounced':
        comm.status = 'delivered';
        comm.tracking = { ...comm.tracking!, bounced: true, bounced_reason: details };
        break;
    }

    this.communications.set(commId, comm);
  }

  /**
   * Create follow-up sequence
   */
  createFollowUp(
    originalComm: Communication,
    followUpPurpose: CommunicationPurpose,
    followUpDate: string,
    property: Property
  ): Communication {
    const followUp: Communication = {
      comm_id: `COMM-${Date.now()}-followup`,
      property_id: originalComm.property_id,
      account_id: originalComm.account_id,
      type: 'email',
      direction: 'outbound',
      recipient: originalComm.recipient,
      sender: originalComm.sender,
      status: 'draft',
      purpose: followUpPurpose,
      body: this.generateFollowUpContent(originalComm, followUpPurpose, property),
      follow_up_date: followUpDate,
      created_at: new Date().toISOString()
    };

    return followUp;
  }

  /**
   * Discover pain points from communication
   */
  discoverPainPoints(communication: Communication, sellerResponse?: string): string[] {
    const painPoints: string[] = [];

    if (!sellerResponse) return painPoints;

    const indicators: Record<string, string[]> = {
      'divorce': ['divorce', 'separating', 'splitting'],
      'relocation': ['relocating', 'moving', 'new job', 'transfer'],
      'financial': ['foreclosure', 'arrears', 'behind', 'hardship'],
      'inheritance': ['inherited', 'estate', 'probate'],
      'repair': ['repair', 'renovation', 'fix', 'condition'],
      'timeline': ['rush', 'quick', 'fast', 'asap']
    };

    Object.entries(indicators).forEach(([category, keywords]) => {
      if (keywords.some(k => sellerResponse.toLowerCase().includes(k))) {
        painPoints.push(category);
      }
    });

    return painPoints;
  }

  /**
   * Handle objections
   */
  handleObjection(objection: string, property: Property, offer: Offer): string {
    const objectionHandlers: Record<string, string> = {
      'price_too_low': `I understand the offer may seem low. However, our terms provide significant value: ${offer.terms?.seller_finance ? 'seller financing eliminates realtor fees' : 'creative terms save on closing costs'}. The net result to you is often comparable to a higher traditional offer.`,

      'need_more_time': 'We can work with your timeline. Our flexible closing dates allow us to close when you\'re ready - whether that\'s 2 weeks or 2 months.',

      'want_to_think': 'Absolutely - this is a big decision. What specific concerns can I address to help you feel confident?',

      'got_better_offer': 'I appreciate your honesty. May I ask what terms they\'re offering? Sometimes a higher price comes with traditional financing that can fall through. Our cash/terms offer provides certainty.',

      'not_ready_to_sell': 'No pressure at all. When do you see yourself potentially selling? I\'d be happy to check back in at a better time.'
    };

    return objectionHandlers[objection] || 'I hear your concern. Let me understand better - can you tell me more about what\'s holding you back?';
  }

  /**
   * Human-in-loop: Review counter offer and get approval
   */
  requestHumanReview(
    property: Property,
    counterOffer: CounterOffer,
    originalOffer: Offer,
    recommendation: string
  ): {
    requiresReview: boolean;
    summary: string;
    recommendation: string;
    actionOptions: string[]
  } {
    const review = {
      requiresReview: true,
      summary: `Seller countered at $${counterOffer.counter_price.toLocaleString()} vs our $${originalOffer.offer_price.toLocaleString()}`,
      recommendation,
      actionOptions: [
        'Accept Counter',
        'Counter Back',
        'Withdraw Offer',
        'Request Mortgage Statement'
      ]
    };

    return review;
  }

  /**
   * Translate notes to seller/agent communication
   */
  translateToCommunication(
    notes: string,
    recipient: 'seller' | 'agent',
    property: Property
  ): string {
    const tone = recipient === 'seller' ? 'warm and direct' : 'professional and collaborative';

    return `Dear ${recipient === 'seller' ? 'Homeowner' : 'Agent'},

${notes}

Regarding the property at ${property.address}, ${property.city}, ${property.state}.

Best regards,
Wealthy Wholesalers`;
  }

  /**
   * Get communication history for property
   */
  getCommunicationHistory(propertyId: string): Communication[] {
    return Array.from(this.communications.values())
      .filter(c => c.property_id === propertyId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  /**
   * Get contacts and tracking
   */
  getContacts(accountId: string): Map<string, Communication[]> {
    const contactMap = new Map<string, Communication[]>();

    Array.from(this.communications.values())
      .filter(c => c.account_id === accountId)
      .forEach(comm => {
        const key = comm.recipient || 'unknown';
        const existing = contactMap.get(key) || [];
        existing.push(comm);
        contactMap.set(key, existing);
      });

    return contactMap;
  }

  // Template content methods
  private getInitialOutreachTemplate(): string {
    return `Dear Homeowner,

I hope this message finds you well. My name is {{buyer_name}} and I'm reaching out regarding your property at {{address}}.

We are actively purchasing properties in {{city}} and would like to present a fair, hassle-free offer. Unlike traditional buyers, we can:

✓ Close on your timeline (fast or slow)
✓ Pay cash or use flexible financing
✓ Cover closing costs
✓ Buy as-is - no repairs needed

Would you be open to discussing a potential sale? I'd love to learn more about your situation and present an offer that works for you.

Best regards,
{{buyer_name}}`;
  }

  private getFollowUpTemplate(): string {
    return `Hi there,

Following up on my previous message about {{address}}. I know life gets busy, so I wanted to circle back.

{{days_since_contact}} days ago I reached out - have you had a chance to consider?

Next step: {{next_step}}

No pressure at all. Just let me know if you'd like to explore further or if now isn't the right time.

Best,
{{buyer_name}}`;
  }

  private getOfferPresentationTemplate(): string {
    return `Dear Homeowner,

Thank you for considering our offer on {{address}}.

**Offer Summary:**
- Purchase Price: {{offer_price}}
- Earnest Money: {{earnest_money}}
- Terms: {{offer_terms}}
- Closing Timeline: {{closing_timeline}}

**What This Means for You:**
- No repairs needed - we buy as-is
- No showings after acceptance
- No financing contingencies
- Flexible closing date

Please review and let me know if you have any questions. We're ready to move forward when you are.

Best regards,
{{buyer_name}}`;
  }

  private getNegotiationTemplate(): string {
    return `Thank you for your response.

Regarding {{address}}, we've reviewed your counter and here's our position:

**Counter Offer:**
- Price: {{counter_price}}
- Terms: {{counter_terms}}

**Rationale:**
{{rationale}}

We believe this creates a win-win situation. Let me know your thoughts.

Best,
{{buyer_name}}`;
  }

  private getPainPointDiscoveryTemplate(): string {
    return `Hi,

Quick question about {{address}} - I'd love to understand your situation better:

{{question_1}}
{{question_2}}
{{question_3}}

No pressure to answer all - just helps me tailor the best solution for you.

Thanks,
{{buyer_name}}`;
  }

  private getObjectionHandlingTemplate(): string {
    return `I completely understand your concern about {{objection}}.

{{response}}

{{alternative}}

Would this address your concern? Happy to discuss further.

Best,
{{buyer_name}}`;
  }

  private getClosingTemplate(): string {
    return `Great news - we're ready to move forward!

**Agreed Terms:**
- Property: {{address}}
- Price: {{agreed_price}}
- Terms: {{agreed_terms}}
- Target Closing: {{closing_date}}

Next steps:
1. I'll send the purchase agreement
2. You review and sign
3. We open escrow
4. Close on your timeline

Excited to work with you!

Best,
{{buyer_name}}`;
  }

  private getContractReviewTemplate(): string {
    return `Please find attached the purchase agreement for {{address}}.

**Key Terms:**
{{contract_terms}}

**Review Deadline:** {{review_deadline}}

Please review and let me know if you have any questions or need modifications.

Best,
{{buyer_name}}`;
  }

  private getMortgageStatementRequestTemplate(): string {
    return `Dear Homeowner,

To move forward with {{address}}, we need some mortgage information:

**Required:**
- Current mortgage statement
- Lender: {{lender_name}}
- Loan Number: {{loan_number}} (if available)

This helps us structure the best financing solution for you.

Please share at your earliest convenience.

Best,
{{buyer_name}}`;
  }

  private getHumanInLoopTemplate(): string {
    return `ACTION REQUIRED

**Property:** {{address}}
**Seller Counter:** {{seller_counter}}
**Our Recommendation:** {{recommendation}}

**Notes:**
{{notes}}

Please review and approve/reject the counter response.

---
This requires human approval before sending.`;
  }

  private generateFollowUpContent(
    original: Communication,
    purpose: CommunicationPurpose,
    property: Property
  ): string {
    const template = this.templates.get(purpose);
    if (!template) return '';

    return template.body
      .replace('{{address}}', `${property.address}, ${property.city}, ${property.state}`)
      .replace('{{buyer_name}}', 'Wealthy Wholesalers')
      .replace('{{days_since_contact}}', '3')
      .replace('{{next_step}}', 'Schedule a call or review offer');
  }
}
