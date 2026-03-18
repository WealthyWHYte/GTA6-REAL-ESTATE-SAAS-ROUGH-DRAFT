# 🚀 QUICK START GUIDE - AiWealthanaire

## YOUR DUAL-SYSTEM SETUP

```
┌─────────────────────────────────────────────┐
│           SYSTEM 1: SUPABASE                │
│  Upload → Analyze → Score → Send LOI       │
│  (Web App)                                 │
└──────────────────────┬──────────────────────┘
                       │
                       ▼ (Agent replies)
┌─────────────────────────────────────────────┐
│              SYSTEM 2: n8n                  │
│  Watch Gmail → AI Response → Auto-Reply    │
│  (Docker - Local)                          │
└─────────────────────────────────────────────┘
```

---

## ⚡ STEP 1: DEPLOY SUPABASE FUNCTIONS

```bash
cd ~/Downloads/GTA\ 6\ Real\ Estate/gta-6-real-estate-saas-rough\ draft

# Deploy edge functions
supabase functions deploy analyze-market
supabase functions deploy underwrite-properties  
supabase functions deploy send-email
```

---

## ⚡ STEP 2: SETUP n8n (Auto-Responder)

### Option A: Import Workflow
1. Open n8n at http://localhost:5678
2. Click "Import Workflow"
3. Upload: `n8n-workflows/ai-responder-v2.json`
4. Replace these placeholders:
   - `YOUR_OPENROUTER_KEY` → Your OpenRouter API key
   - `YOUR_SUPABASE_ANON_KEY` → Your Supabase anon key
   - `YOUR_SUPABASE_SERVICE_KEY` → Your Supabase service key
   - `YOUR_ACCOUNT_ID` → Your account UUID

### Option B: Build from Scratch (Easier)

```
1. Gmail Trigger (Every 5 min)
   └─ Connect your Gmail account

2. IF: Subject contains "Re:" or "LOI"
   └─ Only continue if reply to our email

3. Code: Detect Objection
   └─ Extract agent email, property address
   └─ Detect: price, cash, funds, timing, etc.

4. HTTP: OpenRouter AI
   URL: https://openrouter.ai/api/v1/chat/completions
   Method: POST
   Headers:
     Authorization: Bearer YOUR_KEY
   Body:
     {
       "model": "anthropic/claude-3-haiku",
       "messages": [{"role": "user", "content": "PROMPT"}],
       "max_tokens": 400
     }

5. Gmail: Send Reply
   └─ Reply to same thread
   └─ Body = AI response

6. HTTP: Log to Supabase (optional)
   └─ POST to conversation_outcomes table
```

---

## 🎯 THE AI PROMPT (Copy This)

```
You are a real estate investor negotiating via email.

PROPERTY: {address}
LISTED: ${listPrice}
OUR OFFER: ${offerPrice}
STRATEGY: {strategy}

AGENT'S REPLY:
{agentReply}

DETECTED OBJECTION: {objectionType}

KNOWLEDGE BASE:
{kbGuidance}

Write a SHORT (100-150 words) professional response that:
1. Addresses their specific objection
2. Emphasizes benefits to seller
3. Keeps negotiation moving forward
4. Has clear next step

Write ONLY the email body.
```

---

## 📊 OBJECTION TYPES & RESPONSES

| Objection | Detection Keywords | KB Guidance |
|-----------|-------------------|-------------|
| **Cash Only** | "cash", "all cash" | Tax advantages, monthly income, higher net |
| **Price Low** | "price", "low", "higher" | Full price on terms, equity protection |
| **Proof of Funds** | "proof", "funds", "letter" | Bank statement, references |
| **Seller Finance** | "seller financing", "owner" | Servicing company, secured mortgage |
| **Subject-To** | "subject", "mortgage" | Assume payments, seller relieved |
| **Timing** | "time", "deadline" | Flexible close, rent-back option |
| **Condition** | "repair", "condition" | As-is, no objections |
| **Positive** | "thank", "appreciate" | Move toward contract |

---

## 🧪 TEST IT

### Test Email Flow:
1. Send LOI via Supabase to agent@realty.com
2. Agent replies
3. n8n catches it (5 min)
4. AI generates response
5. n8n sends reply
6. Check Gmail - you sent a reply!

### Test AI Response:
1. In n8n, manually trigger the AI node
2. Paste an agent objection
3. See what AI generates
4. Tweak prompt if needed

---

## 💰 COST

| Component | Cost |
|-----------|------|
| Supabase | $0 (free tier) |
| n8n | $0 (local/docker) |
| OpenRouter AI | ~$0.01 per response |
| Gmail | $0 (your account) |

---

## 🎯 WORKFLOW

```
DAY 1:
1. Deploy Supabase functions
2. Setup n8n workflow
3. Upload 235 properties

DAY 2:
1. Score properties (SQL)
2. Send 50 LOIs via Supabase

DAYS 3-30:
1. n8n watches Gmail every 5 min
2. Agent replies → AI responds automatically
3. You monitor → Close deals
```

---

## 🔧 TROUBLESHOOTING

### n8n not connecting to Gmail?
- Go to: http://localhost:5678
- Credentials → Add → Gmail OAuth2
- Authorize your account

### AI responses are bad?
- Edit the prompt in the HTTP node
- Make it more specific to your strategy

### Not replying?
- Check n8n execution log
- Verify OpenRouter key is valid

---

## 📞 GETTING HELP

- n8n docs: https://docs.n8n.io
- OpenRouter: https://openrouter.ai
- Supabase: https://supabase.com

---

**Ready? Let's do this! 🚀**
