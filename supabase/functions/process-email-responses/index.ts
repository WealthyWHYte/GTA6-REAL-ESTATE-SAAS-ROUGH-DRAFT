"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var supabase_js_2_1 = require("https://esm.sh/@supabase/supabase-js@2");
var cors_ts_1 = require("../_shared/cors.ts");
var emailConfig_ts_1 = require("../../../src/config/emailConfig.ts");
// Mock IMAP email fetching function (in production, this would use actual IMAP libraries)
function fetchNewEmailsIMAP(credentials, since) {
    return __awaiter(this, void 0, void 0, function () {
        var emailCount, mockEmails, i, responses, randomResponse, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('📬 Checking for new emails via IMAP...');
                    // In a real implementation, this would connect to IMAP server and fetch emails
                    // For now, we'll simulate fetching emails
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 500 + Math.random() * 1000); })
                        // Simulate finding 0-3 new emails (most of the time none)
                    ];
                case 1:
                    // In a real implementation, this would connect to IMAP server and fetch emails
                    // For now, we'll simulate fetching emails
                    _a.sent();
                    emailCount = Math.random() > 0.7 ? Math.floor(Math.random() * 3) + 1 : 0;
                    mockEmails = [];
                    for (i = 0; i < emailCount; i++) {
                        responses = [
                            "Thanks for your offer. I'm interested but would like to discuss the terms.",
                            "The price seems a bit low. Can we meet in the middle?",
                            "I'm not interested in selling right now.",
                            "That sounds reasonable. Let's move forward with the paperwork.",
                            "Can you tell me more about the closing process?",
                            "I have another offer that's higher. Can you match $550k?",
                            "This is perfect timing. When can we close?",
                            "I need to think about it. Can I get back to you next week?",
                            "The property needs some repairs. Will you cover those?",
                            "I'm out of town right now. Can we schedule a call for tomorrow?"
                        ];
                        randomResponse = responses[Math.floor(Math.random() * responses.length)];
                        mockEmails.push({
                            id: "email_".concat(Date.now(), "_").concat(i),
                            from: "seller".concat(i + 1, "@example.com"),
                            subject: "Re: Offer for 123 Main St",
                            body: randomResponse,
                            receivedAt: new Date(Date.now() - Math.random() * 3600000), // Within last hour
                            threadId: "thread_".concat(Math.random().toString(36).substr(2, 9)),
                            propertyId: "prop_".concat(Math.random().toString(36).substr(2, 9))
                        });
                    }
                    console.log("\uD83D\uDCE8 Found ".concat(mockEmails.length, " new emails"));
                    return [2 /*return*/, mockEmails];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ IMAP fetch failed:', error_1.message);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
function processEmailResponse(email, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var analysis, _a, emailRecord, emailError, followUpEmail, statusUpdates, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 7, , 9]);
                    console.log('🔍 Analyzing email response:', email.subject);
                    analysis = (0, emailConfig_ts_1.analyzeEmailResponse)(email.body);
                    console.log('📊 Analysis result:', analysis);
                    return [4 /*yield*/, supabase
                            .from('email_responses')
                            .insert({
                            property_id: email.propertyId,
                            from_email: email.from,
                            subject: email.subject,
                            body: email.body,
                            received_at: email.receivedAt.toISOString(),
                            sentiment: analysis.sentiment,
                            confidence: analysis.confidence,
                            key_phrases: analysis.keyPhrases,
                            action_required: analysis.actionRequired,
                            urgency: analysis.urgency,
                            next_steps: analysis.nextSteps,
                            processed_at: new Date().toISOString()
                        })
                            .select()
                            .single()];
                case 1:
                    _a = _b.sent(), emailRecord = _a.data, emailError = _a.error;
                    if (emailError) {
                        console.error('❌ Failed to store email:', emailError);
                        return [2 /*return*/];
                    }
                    // Log the analysis in activity log
                    return [4 /*yield*/, supabase
                            .from('activity_log')
                            .insert({
                            property_id: email.propertyId,
                            agent_name: 'email-responder',
                            action: 'email_analyzed',
                            details: {
                                emailId: emailRecord.id,
                                analysis: analysis,
                                originalEmail: {
                                    from: email.from,
                                    subject: email.subject,
                                    receivedAt: email.receivedAt
                                }
                            },
                            user_id: email.accountId
                        })
                        // Generate automated response if needed
                    ];
                case 2:
                    // Log the analysis in activity log
                    _b.sent();
                    if (!(analysis.actionRequired === 'follow_up' || analysis.actionRequired === 'counter_offer')) return [3 /*break*/, 4];
                    console.log('🤖 Generating automated follow-up...');
                    followUpEmail = (0, emailConfig_ts_1.generateFollowUpEmail)(analysis, email.propertyId);
                    if (!followUpEmail) return [3 /*break*/, 4];
                    // Queue the follow-up email for sending
                    return [4 /*yield*/, supabase
                            .from('email_queue')
                            .insert({
                            property_id: email.propertyId,
                            to_email: email.from,
                            subject: followUpEmail.subject,
                            body: followUpEmail.body,
                            template_used: 'follow_up',
                            priority: analysis.urgency === 'high' ? 'high' : 'normal',
                            scheduled_for: analysis.urgency === 'high' ?
                                new Date(Date.now() + 1000 * 60 * 30).toISOString() : // 30 minutes for high priority
                                new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(), // 24 hours for normal
                            created_at: new Date().toISOString()
                        })];
                case 3:
                    // Queue the follow-up email for sending
                    _b.sent();
                    console.log('📧 Follow-up email queued for sending');
                    _b.label = 4;
                case 4:
                    statusUpdates = {
                        'positive': 'interested',
                        'interested': 'hot_lead',
                        'negative': 'not_interested',
                        'neutral': 'follow_up_needed',
                        'objection': 'objection_handling'
                    };
                    if (!statusUpdates[analysis.sentiment]) return [3 /*break*/, 6];
                    return [4 /*yield*/, supabase
                            .from('properties')
                            .update({
                            pipeline_status: statusUpdates[analysis.sentiment],
                            last_activity: new Date().toISOString(),
                            updated_at: new Date().toISOString()
                        })
                            .eq('id', email.propertyId)];
                case 5:
                    _b.sent();
                    _b.label = 6;
                case 6:
                    console.log('✅ Email response processed successfully');
                    return [3 /*break*/, 9];
                case 7:
                    error_2 = _b.sent();
                    console.error('❌ Email processing failed:', error_2.message);
                    // Log the error
                    return [4 /*yield*/, supabase
                            .from('activity_log')
                            .insert({
                            property_id: email.propertyId,
                            agent_name: 'email-responder',
                            action: 'email_processing_error',
                            details: {
                                error: error_2.message,
                                email: {
                                    from: email.from,
                                    subject: email.subject
                                }
                            },
                            user_id: email.accountId
                        })];
                case 8:
                    // Log the error
                    _b.sent();
                    return [3 /*break*/, 9];
                case 9: return [2 /*return*/];
            }
        });
    });
}
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var request, supabaseUrl, supabaseKey, supabase, _a, credentialsData, credError, credentials, lastCheck, newEmails, results, _i, newEmails_1, email, error_3;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // Handle CORS
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: cors_ts_1.corsHeaders, status: 200 })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 9, , 10]);
                return [4 /*yield*/, req.json()];
            case 2:
                request = _b.sent();
                console.log('📬 Email Response Processor started for account:', request.accountId);
                // Validate request
                if (!request.accountId) {
                    throw new Error('Missing required field: accountId');
                }
                supabaseUrl = Deno.env.get('SUPABASE_URL');
                supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
                if (!supabaseUrl || !supabaseKey) {
                    throw new Error('Missing Supabase configuration');
                }
                supabase = (0, supabase_js_2_1.createClient)(supabaseUrl, supabaseKey);
                return [4 /*yield*/, supabase
                        .from('email_credentials')
                        .select('*')
                        .eq('account_id', request.accountId)
                        .single()];
            case 3:
                _a = _b.sent(), credentialsData = _a.data, credError = _a.error;
                if (credError || !credentialsData) {
                    throw new Error('Email credentials not found. Please configure email settings first.');
                }
                credentials = {
                    smtpHost: credentialsData.smtp_host,
                    smtpPort: credentialsData.smtp_port,
                    smtpUser: credentialsData.smtp_user,
                    smtpPass: credentialsData.smtp_pass,
                    fromEmail: credentialsData.from_email,
                    fromName: credentialsData.from_name,
                    imapHost: credentialsData.imap_host,
                    imapPort: credentialsData.imap_port,
                    imapUser: credentialsData.imap_user,
                    imapPass: credentialsData.imap_pass
                };
                // Check if IMAP is configured
                if (!credentials.imapHost || !credentials.imapUser) {
                    throw new Error('IMAP settings not configured. Please update your email settings.');
                }
                lastCheck = new Date(Date.now() - 1000 * 60 * 60) // Last hour
                ;
                return [4 /*yield*/, fetchNewEmailsIMAP(credentials, lastCheck)];
            case 4:
                newEmails = _b.sent();
                console.log("\uD83D\uDCE8 Processing ".concat(newEmails.length, " new emails..."));
                results = [];
                _i = 0, newEmails_1 = newEmails;
                _b.label = 5;
            case 5:
                if (!(_i < newEmails_1.length)) return [3 /*break*/, 8];
                email = newEmails_1[_i];
                email.accountId = request.accountId; // Add account ID for processing
                return [4 /*yield*/, processEmailResponse(email, supabase)];
            case 6:
                _b.sent();
                results.push({
                    emailId: email.id,
                    from: email.from,
                    subject: email.subject,
                    processed: true
                });
                _b.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 5];
            case 8:
                console.log('✅ Email response processing completed');
                return [2 /*return*/, new Response(JSON.stringify({
                        success: true,
                        emailsProcessed: results.length,
                        results: results,
                        message: "Successfully processed ".concat(results.length, " email responses")
                    }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 200
                    })];
            case 9:
                error_3 = _b.sent();
                console.error('Email response processor error:', error_3);
                return [2 /*return*/, new Response(JSON.stringify({
                        success: false,
                        error: error_3.message
                    }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 400
                    })];
            case 10: return [2 /*return*/];
        }
    });
}); });
