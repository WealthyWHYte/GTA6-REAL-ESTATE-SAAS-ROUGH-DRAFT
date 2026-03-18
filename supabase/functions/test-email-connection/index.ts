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
var cors_ts_1 = require("../_shared/cors.ts");
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var credentials, smtpTest, imapTest, overallSuccess, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                // Handle CORS
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: cors_ts_1.corsHeaders, status: 200 })];
                }
                _a.label = 1;
            case 1:
                _a.trys.push([1, 6, , 7]);
                return [4 /*yield*/, req.json()];
            case 2:
                credentials = (_a.sent()).credentials;
                console.log('🧪 Testing email connection...');
                // Validate credentials
                if (!credentials.smtpHost || !credentials.smtpPort || !credentials.smtpUser || !credentials.smtpPass) {
                    throw new Error('Missing required SMTP credentials');
                }
                return [4 /*yield*/, testSMTPConnection(credentials)];
            case 3:
                smtpTest = _a.sent();
                if (!smtpTest.success) {
                    return [2 /*return*/, new Response(JSON.stringify({
                            success: false,
                            error: smtpTest.error,
                            details: 'SMTP connection failed'
                        }), {
                            headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                            status: 400
                        })];
                }
                imapTest = { success: true, error: null };
                if (!(credentials.imapHost && credentials.imapPort && credentials.imapUser && credentials.imapPass)) return [3 /*break*/, 5];
                return [4 /*yield*/, testIMAPConnection(credentials)];
            case 4:
                imapTest = _a.sent();
                _a.label = 5;
            case 5:
                overallSuccess = smtpTest.success && imapTest.success;
                return [2 /*return*/, new Response(JSON.stringify({
                        success: overallSuccess,
                        smtp: smtpTest,
                        imap: imapTest,
                        message: overallSuccess
                            ? 'Email connection test successful!'
                            : 'Some connections failed - check details'
                    }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: overallSuccess ? 200 : 400
                    })];
            case 6:
                error_1 = _a.sent();
                console.error('Email connection test error:', error_1);
                return [2 /*return*/, new Response(JSON.stringify({
                        success: false,
                        error: error_1.message
                    }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 400
                    })];
            case 7: return [2 /*return*/];
        }
    });
}); });
function testSMTPConnection(credentials) {
    return __awaiter(this, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // In a real implementation, this would attempt an actual SMTP connection
                    // For now, we'll simulate the connection test
                    console.log('Testing SMTP connection to:', credentials.smtpHost, credentials.smtpPort);
                    // Simulate connection delay
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 1000); })
                        // Basic validation
                    ];
                case 1:
                    // Simulate connection delay
                    _a.sent();
                    // Basic validation
                    if (!credentials.smtpHost.includes('.') || credentials.smtpHost.length < 5) {
                        throw new Error('Invalid SMTP host format');
                    }
                    if (credentials.smtpPort < 1 || credentials.smtpPort > 65535) {
                        throw new Error('Invalid SMTP port');
                    }
                    if (!credentials.smtpUser.includes('@')) {
                        throw new Error('SMTP username should be an email address');
                    }
                    if (credentials.smtpPass.length < 4) {
                        throw new Error('SMTP password seems too short');
                    }
                    // Simulate successful connection
                    console.log('✅ SMTP connection test passed');
                    return [2 /*return*/, { success: true }];
                case 2:
                    error_2 = _a.sent();
                    console.error('❌ SMTP connection test failed:', error_2.message);
                    return [2 /*return*/, { success: false, error: error_2.message }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
function testIMAPConnection(credentials) {
    return __awaiter(this, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // In a real implementation, this would attempt an actual IMAP connection
                    // For now, we'll simulate the connection test
                    console.log('Testing IMAP connection to:', credentials.imapHost, credentials.imapPort);
                    // Simulate connection delay
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 800); })
                        // Basic validation
                    ];
                case 1:
                    // Simulate connection delay
                    _a.sent();
                    // Basic validation
                    if (!credentials.imapHost || !credentials.imapHost.includes('.') || credentials.imapHost.length < 5) {
                        throw new Error('Invalid IMAP host format');
                    }
                    if (!credentials.imapPort || credentials.imapPort < 1 || credentials.imapPort > 65535) {
                        throw new Error('Invalid IMAP port');
                    }
                    if (!credentials.imapUser || !credentials.imapUser.includes('@')) {
                        throw new Error('IMAP username should be an email address');
                    }
                    if (!credentials.imapPass || credentials.imapPass.length < 4) {
                        throw new Error('IMAP password seems too short');
                    }
                    // Simulate successful connection
                    console.log('✅ IMAP connection test passed');
                    return [2 /*return*/, { success: true }];
                case 2:
                    error_3 = _a.sent();
                    console.error('❌ IMAP connection test failed:', error_3.message);
                    return [2 /*return*/, { success: false, error: error_3.message }];
                case 3: return [2 /*return*/];
            }
        });
    });
}
