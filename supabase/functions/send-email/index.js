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
// Mock email sending function (in production, this would use actual SMTP/IMAP libraries)
function sendEmailSMTP(credentials, to, subject, body) {
    return __awaiter(this, void 0, void 0, function () {
        var success, messageId, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    console.log('📧 Sending email via SMTP...');
                    console.log("From: ".concat(credentials.fromEmail, " (").concat(credentials.fromName, ")"));
                    console.log("To: ".concat(to));
                    console.log("Subject: ".concat(subject));
                    // In a real implementation, this would use a library like nodemailer
                    // For now, we'll simulate the email sending process
                    // Simulate SMTP connection and sending
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000 + Math.random() * 2000); })
                        // Simulate success/failure (90% success rate)
                    ];
                case 1:
                    // In a real implementation, this would use a library like nodemailer
                    // For now, we'll simulate the email sending process
                    // Simulate SMTP connection and sending
                    _a.sent();
                    success = Math.random() > 0.1;
                    if (!success) {
                        throw new Error('SMTP server temporarily unavailable');
                    }
                    messageId = "msg_".concat(Date.now(), "_").concat(Math.random().toString(36).substr(2, 9));
                    console.log('✅ Email sent successfully:', messageId);
                    return [2 /*return*/, { success: true, messageId: messageId }];
                case 2:
                    error_1 = _a.sent();
                    console.error('❌ Email sending failed:', error_1.message);
                    return [2 /*return*/, { success: false, error: error_1.message }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var emailRequest, supabaseUrl, supabaseKey, supabase, _a, credentialsData, credError, credentials, finalSubject, finalBody, templateResult, sendResult, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                // Handle CORS
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: cors_ts_1.corsHeaders, status: 200 })];
                }
                _b.label = 1;
            case 1:
                _b.trys.push([1, 11, , 12]);
                return [4 /*yield*/, req.json()];
            case 2:
                emailRequest = _b.sent();
                console.log('📤 Send Email Agent started for:', emailRequest.to);
                // Validate request
                if (!emailRequest.to || !emailRequest.accountId) {
                    throw new Error('Missing required fields: to, accountId');
                }
                if (!emailRequest.subject && !emailRequest.templateName) {
                    throw new Error('Either subject/body or templateName must be provided');
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
                        .eq('account_id', emailRequest.accountId)
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
                finalSubject = emailRequest.subject || '';
                finalBody = emailRequest.body || '';
                if (emailRequest.templateName) {
                    try {
                        templateResult = (0, emailConfig_ts_1.generateEmailFromTemplate)(emailRequest.templateName, emailRequest.templateVariables || {});
                        finalSubject = templateResult.subject;
                        finalBody = templateResult.body;
                    }
                    catch (error) {
                        throw new Error("Template generation failed: ".concat(error.message));
                    }
                }
                return [4 /*yield*/, sendEmailSMTP(credentials, emailRequest.to, finalSubject, finalBody)];
            case 4:
                sendResult = _b.sent();
                if (!(sendResult.success && sendResult.messageId)) return [3 /*break*/, 8];
                // Log successful email send
                return [4 /*yield*/, supabase
                        .from('email_log')
                        .insert({
                        account_id: emailRequest.accountId,
                        property_id: emailRequest.propertyId,
                        to_email: emailRequest.to,
                        from_email: credentials.fromEmail,
                        subject: finalSubject,
                        body: finalBody,
                        message_id: sendResult.messageId,
                        status: 'sent',
                        template_used: emailRequest.templateName,
                        sent_at: new Date().toISOString()
                    })
                    // Update property status if this is part of a deal flow
                ];
            case 5:
                // Log successful email send
                _b.sent();
                if (!emailRequest.propertyId) return [3 /*break*/, 7];
                return [4 /*yield*/, supabase
                        .from('activity_log')
                        .insert({
                        property_id: emailRequest.propertyId,
                        agent_name: 'email-sender',
                        action: 'email_sent',
                        details: {
                            to: emailRequest.to,
                            subject: finalSubject,
                            template: emailRequest.templateName,
                            messageId: sendResult.messageId
                        },
                        user_id: emailRequest.accountId
                    })];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                console.log('✅ Email sent and logged successfully');
                return [2 /*return*/, new Response(JSON.stringify({
                        success: true,
                        messageId: sendResult.messageId,
                        message: 'Email sent successfully'
                    }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 200
                    })];
            case 8: 
            // Log failed email send
            return [4 /*yield*/, supabase
                    .from('email_log')
                    .insert({
                    account_id: emailRequest.accountId,
                    property_id: emailRequest.propertyId,
                    to_email: emailRequest.to,
                    from_email: credentials.fromEmail,
                    subject: finalSubject,
                    body: finalBody,
                    status: 'failed',
                    error_message: sendResult.error,
                    template_used: emailRequest.templateName,
                    sent_at: new Date().toISOString()
                })];
            case 9:
                // Log failed email send
                _b.sent();
                console.log('❌ Email sending failed:', sendResult.error);
                return [2 /*return*/, new Response(JSON.stringify({
                        success: false,
                        error: sendResult.error || 'Unknown error occurred'
                    }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 400
                    })];
            case 10: return [3 /*break*/, 12];
            case 11:
                error_2 = _b.sent();
                console.error('Send email agent error:', error_2);
                return [2 /*return*/, new Response(JSON.stringify({
                        success: false,
                        error: error_2.message
                    }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 400
                    })];
            case 12: return [2 /*return*/];
        }
    });
}); });
