# Gmail Best Practices Guide
## Sending Offers Without Triggering Spam Flags

---

## Overview

This guide ensures your email offers reach listing agents without being marked as spam or triggering Gmail's security alerts.

---

## Gmail Sending Limits

### Official Limits
- **500 emails/day** (official limit)
- **100 recipients/day** for new accounts
- **3000 recipients/day** for verified business accounts

### Safe Operating Limits
| Account Age | Safe Daily Limit | Warm-Up Period |
|-------------|------------------|----------------|
| New (< 7 days) | 5-10 emails | Week 1 |
| Week 2 | 15-20 emails | 2 weeks |
| Week 3 | 25-35 emails | 3 weeks |
| Week 4 | 40-50 emails | 1 month |
| Established (1+ month) | 75-100 emails | Ongoing |

**Recommendation:** Stay below 50/day to remain under radar

---

## Warm-Up Strategy

### Phase 1: Days 1-7
- Send 5-10 emails/day
- Include replies to previous emails
- Use personalized subject lines
- Vary email content slightly

### Phase 2: Days 8-21
- Gradually increase to 15-25 emails/day
- Continue replying to responses
- Maintain varied content

### Phase 3: Days 22-30
- Reach 30-40 emails/day
- Start consistent daily volume

### Phase 4: Ongoing
- Maintain 40-50 emails/day
- Always reply when agents respond
- Monitor for any blocks

---

## Email Content Guidelines

### Subject Lines ✅ DO

- **Keep under 50 characters**
- Include property address (personalization)
- Professional tone
- Examples:
  - "Offer on 123 Main St, Los Angeles"
  - "Following up - 456 Oak Ave"
  - "Re: Property Inquiry - 789 Pine Rd"

### Subject Lines ❌ DON'T

- ALL CAPS
- Excessive punctuation (!!!, ???)
- Spam triggers: "FREE", "ACT NOW", "LIMITED TIME"
- Generic subjects: "Investment Offer", "Real Estate"
- Numbers only: "12345"

### Body Content ✅ DO

- Plain text or simple HTML
- Include agent name (personalization)
- Property address prominently
- Clear offer details
- Professional sign-off
- Physical address in footer (optional)

### Body Content ❌ DON'T

- Multiple links (max 1-2)
- Attachments on initial contact
- Excessive formatting
- All caps
- Overly promotional language
- HTML-heavy designs

---

## Technical Configuration

### App Password Setup

1. Enable 2-Factor Authentication on Gmail
2. Go to Google Account → Security
3. App passwords → Generate new password
4. Use this password (not regular Gmail password) for SMTP

### SMTP Settings

```
Server: smtp.gmail.com
Port: 587 (TLS) or 465 (SSL)
Username: your-email@gmail.com
Password: [App Password]
```

---

## Sending Strategy

### Daily Schedule

- **Best times:** 9-11 AM, 2-4 PM local time
- **Avoid:** 11 PM - 6 AM (looks bot-like)
- **Space emails:** 30-60 seconds between sends

### Batch Sending

```python
# Recommended batch pattern
emails_per_batch = 10
delay_between_batches = 30  # minutes
batches_per_day = 4
# Total: 40 emails/day safely
```

### Delay Between Emails

- **Minimum:** 30 seconds
- **Recommended:** 60 seconds
- **Batch mode:** 60-120 seconds after every 10 emails

---

## Monitoring & Maintenance

### Health Indicators to Watch

1. **Open Rate:** Should be 20%+ for good lists
2. **Reply Rate:** Target 3-5%
3. **Bounce Rate:** Keep under 2%
4. **Spam Complaints:** Keep at 0%

### Red Flags ⚠️

- Emails going to Spam folder
- Receiving security alerts from Google
- Sudden drop in delivery
- Bounce rate increasing

### If Issues Occur

1. **Reduce volume by 50%**
2. **Pause for 24-48 hours**
3. **Review email content for triggers**
4. **Re-verify sending address**
5. **Consider adding more personal content**

---

## Multiple Account Strategy

For higher volume, use multiple Gmail accounts:

### Account Rotation
- Account 1: 40 emails/day
- Account 2: 40 emails/day  
- Account 3: 40 emails/day
- **Total: 120 emails/day**

### Best Practices for Multi-Account
- Each account needs separate warm-up
- Use different display names
- Send from different IP if possible
- Track each account's deliverability

---

## Quick Reference Checklist

Before sending each batch:

- [ ] Subject line < 50 chars, personalized
- [ ] Agent name included
- [ ] Property address in body
- [ ] No attachments
- [ ] No more than 1-2 links
- [ ] Plain text or simple HTML
- [ ] Delay between emails (30-60 sec)
- [ ] Daily limit not exceeded
- [ ] Reply to any responses received

---

## Emergency Response

### If Gmail Blocks Sending:

1. **Don't panic** - usually temporary
2. **Stop sending immediately**
3. **Wait 24-48 hours**
4. **Reduce daily volume by 50%**
5. **Add more personalization**
6. **Consider phone warm-up** (make calls from same account)

### Recovery Timeline:
- Minor blocks: 24 hours
- Moderate blocks: 3-7 days
- Severe blocks: 2-4 weeks (rare)

---

## Summary

| Factor | Safe Practice |
|--------|---------------|
| Daily Volume | 40-50 emails |
| Subject | < 50 chars, address included |
| Body | Plain text, personalized |
| Attachments | None on initial |
| Links | Max 1-2 |
| Delay | 30-60 seconds |
| Warm-up | 2-4 weeks |

**Key Principle:** Volume + Consistency + Personalization = Deliverability

---

*Last Updated: Feb 2026*
*GTA 6 Real Estate*
