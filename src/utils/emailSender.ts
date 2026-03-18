// Simple Email Sender - Works in browser
// Uses Gmail SMTP via form submission

const EMAIL_CONFIG = {
  // Your Gmail credentials
  email: 'aiwealthanaire@gmail.com',
  appPassword: 'sraz djcd zskd uzkx'  // Note: spaces need to be removed
}

// Email templates
const TEMPLATES = {
  initial_offer: {
    subject: 'Cash Offer - {address}',
    body: `Dear {agent_name},

I hope this message finds you well. I'm reaching out regarding {address}.

Our team has reviewed the property and we're prepared to move forward with the following offer:

OFFER DETAILS:
Purchase Price: {offer_price}
Estimated Value: {estimated_value}
Down Payment: {down_payment}%
Closing Timeline: {closing_days} days
Financing: {financing_type}

TERMS:
- Property to be conveyed As-Is
- All inspections for informational purposes only
- Commission protected at standard rate
- Multiple financing pathways available

We're a direct buyer with established lending relationships and can close quickly. Our goal is a smooth, efficient transaction that works for all parties.

Please let me know if you'd like to discuss the terms or schedule a call to answer any questions.

Best regards,
GTA 6 Real Estate
(954) 555-0123

---
This offer is valid for 72 hours.`
  },
  follow_up_1: {
    subject: 'Following Up - {address}',
    body: `Hi {agent_name},

I wanted to follow up on our offer for {address}.

Our offer remains open and we're genuinely interested in acquiring this property. I understand you're busy - just wanted to keep this on your radar.

Please let me know if you have any questions or if the seller would like to discuss. We're flexible on terms and want to find a way to make this work.

Best,
GTA 6 Real Estate`
  },
  follow_up_2: {
    subject: '{address} - Any Updates?',
    body: `Dear {agent_name},

Checking in again on our offer for {address}, {city}.

I understand the market is active and there may be multiple interested parties. Our offer stands as presented and we're prepared to move quickly.

Key points:
- Pre-approval in place
- Flexible closing timeline (21-45 days)
- As-Is condition - no repairs requested
- Quick decision timeline

If there's additional information we can provide, or if the seller has questions, we're available for a quick call.

Otherwise, we'll plan to follow up again in a few days.

Best regards,
GTA 6 Real Estate`
  },
  negotiation: {
    subject: 'Re: Counteroffer - {address}',
    body: `Dear {agent_name},

Thank you for presenting the seller's counter offer of {counter_price}.

We've reviewed carefully and are prepared to respond at {response_price}.

This represents our best compromise and demonstrates genuine interest in acquiring this property.

Key terms remain the same:
- Closing in {closing_days} days
- As-Is condition
- Commission protected

If this works, we can move forward immediately. Please advise if the seller can accept this or if further discussion is needed.

Best regards,
GTA 6 Real Estate`
  },
  acceptance: {
    subject: 'Agreement Reached - {address}!',
    body: `Hi {agent_name},

We are pleased to confirm agreement on {address}!

TERMS ACCEPTED:
- Purchase Price: {agreed_price}
- Closing Date: {closing_date}
- Condition: As-Is
- Financing: {financing_type}

NEXT STEPS:
1. We will wire earnest money within 24 hours
2. Please send contract for review
3. We'll schedule inspection at earliest convenient time

We're excited to close this deal and look forward to working with your team.

Best regards,
GTA 6 Real Estate`
  }
}

// Fill template with data
function fillTemplate(template, data) {
  let result = template;
  for (const [key, value] of Object.entries(data)) {
    result = result.replace(new RegExp(`{${key}}`, 'g'), value);
  }
  return result;
}

// Send email using a simple mailto: link (opens email client)
// This is the simplest method that works without backend
function createMailtoLink(to, subject, body) {
  const mailto = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return mailto;
}

// For actual sending, we need a backend. This function prepares the data
function prepareEmail(templateType, propertyData, offerData = {}) {
  const template = TEMPLATES[templateType] || TEMPLATES.initial_offer;
  
  const data = {
    address: propertyData.address || '',
    city: propertyData.city || '',
    agent_name: propertyData.listing_agent_full_name || 'Agent',
    offer_price: `$${(offerData.offer_price || propertyData.listing_price || 0).toLocaleString()}`,
    estimated_value: `$${(propertyData.estimated_value || 0).toLocaleString()}`,
    down_payment: offerData.down_payment_percent || '10',
    closing_days: offerData.closing_days || '21',
    financing_type: offerData.financing_type || 'Flexible Financing Available',
    counter_price: `$${(offerData.counter_price || 0).toLocaleString()}`,
    response_price: `$${(offerData.response_price || 0).toLocaleString()}`,
    agreed_price: `$${(offerData.agreed_price || offerData.offer_price || 0).toLocaleString()}`,
    closing_date: offerData.closing_date || '21 days'
  };
  
  return {
    to: propertyData.listing_agent_email || '',
    subject: fillTemplate(template.subject, data),
    body: fillTemplate(template.body, data)
  };
}

// Export for use
if (typeof window !== 'undefined') {
  window.EmailSender = {
    prepareEmail,
    createMailtoLink,
    TEMPLATES
  };
}
