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
Deno.serve(function (req) { return __awaiter(void 0, void 0, void 0, function () {
    var body, offer_ids, account_id, supabaseUrl, supabaseKey, supabase, _a, offers, offersError, contracts, _i, offers_1, offer, contract, _b, contractData, contractError, error_1, responseData, error_2;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                // Handle CORS
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: cors_ts_1.corsHeaders, status: 200 })];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 15, , 16]);
                return [4 /*yield*/, req.json()];
            case 2:
                body = _c.sent();
                offer_ids = body.offer_ids, account_id = body.account_id;
                console.log('📄 Contract Specialist started with:', { offer_ids_count: offer_ids === null || offer_ids === void 0 ? void 0 : offer_ids.length, account_id: account_id });
                // Validate inputs
                if (!offer_ids || !Array.isArray(offer_ids) || offer_ids.length === 0 || !account_id) {
                    throw new Error('Missing required fields: offer_ids (array) and account_id');
                }
                supabaseUrl = Deno.env.get('SUPABASE_URL');
                supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
                if (!supabaseUrl || !supabaseKey) {
                    throw new Error('Missing Supabase configuration');
                }
                supabase = (0, supabase_js_2_1.createClient)(supabaseUrl, supabaseKey);
                console.log('📡 Supabase client created');
                return [4 /*yield*/, supabase
                        .from('offers')
                        .select("\n        *,\n        properties (\n          property_id,\n          address,\n          city,\n          state,\n          zip,\n          price,\n          bedrooms,\n          bathrooms,\n          sqft,\n          agent_name,\n          agent_email,\n          agent_phone\n        )\n      ")
                        .in('offer_id', offer_ids)
                        .eq('account_id', account_id)
                        .eq('status', 'accepted')];
            case 3:
                _a = _c.sent(), offers = _a.data, offersError = _a.error;
                if (offersError) {
                    console.error('❌ Offers query error:', offersError);
                    throw new Error("Failed to fetch offers: ".concat(offersError.message));
                }
                if (!offers || offers.length === 0) {
                    throw new Error('No accepted offers found for the provided offer_ids');
                }
                console.log("\u2705 Found ".concat(offers.length, " accepted offers to process"));
                contracts = [];
                _i = 0, offers_1 = offers;
                _c.label = 4;
            case 4:
                if (!(_i < offers_1.length)) return [3 /*break*/, 14];
                offer = offers_1[_i];
                _c.label = 5;
            case 5:
                _c.trys.push([5, 11, , 13]);
                console.log("\uD83D\uDCDD Generating contract for offer ".concat(offer.offer_id));
                return [4 /*yield*/, generatePurchaseAgreement(offer, supabase)
                    // Insert contract
                ];
            case 6:
                contract = _c.sent();
                return [4 /*yield*/, supabase
                        .from('contracts')
                        .insert({
                        contract_id: contract.contract_id,
                        offer_id: offer.offer_id,
                        property_id: offer.property_id,
                        account_id: account_id,
                        contract_text: contract.contract_text,
                        contract_summary: contract.contract_summary,
                        status: 'generated',
                        created_at: new Date().toISOString(),
                        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
                    })
                        .select()
                        .single()];
            case 7:
                _b = _c.sent(), contractData = _b.data, contractError = _b.error;
                if (contractError) {
                    console.error("\u274C Contract insert error for ".concat(offer.offer_id, ":"), contractError);
                    return [3 /*break*/, 13];
                }
                // Update offer status
                return [4 /*yield*/, supabase
                        .from('offers')
                        .update({
                        status: 'contract_generated',
                        contract_id: contract.contract_id,
                        updated_at: new Date().toISOString()
                    })
                        .eq('offer_id', offer.offer_id)
                    // Update property status
                ];
            case 8:
                // Update offer status
                _c.sent();
                // Update property status
                return [4 /*yield*/, supabase
                        .from('properties')
                        .update({
                        deal_stage: 'contract_pending',
                        contract_date: new Date().toISOString().split('T')[0],
                        updated_at: new Date().toISOString()
                    })
                        .eq('property_id', offer.property_id)
                    // Log contract generation
                ];
            case 9:
                // Update property status
                _c.sent();
                // Log contract generation
                return [4 /*yield*/, supabase
                        .from('activity_log')
                        .insert({
                        property_id: offer.property_id,
                        agent_name: 'contract-specialist',
                        action: 'contract_generated',
                        details: {
                            contract_id: contract.contract_id,
                            offer_id: offer.offer_id,
                            contract_summary: contract.contract_summary
                        },
                        user_id: account_id
                    })];
            case 10:
                // Log contract generation
                _c.sent();
                contracts.push(contractData);
                console.log("\u2705 Contract generated: ".concat(contract.contract_id));
                return [3 /*break*/, 13];
            case 11:
                error_1 = _c.sent();
                console.error("\u274C Contract generation failed for offer ".concat(offer.offer_id, ":"), error_1);
                // Log error
                return [4 /*yield*/, supabase
                        .from('activity_log')
                        .insert({
                        property_id: offer.property_id,
                        agent_name: 'contract-specialist',
                        action: 'contract_generation_failed',
                        details: { error: error_1.message, offer_id: offer.offer_id },
                        user_id: account_id
                    })];
            case 12:
                // Log error
                _c.sent();
                return [3 /*break*/, 13];
            case 13:
                _i++;
                return [3 /*break*/, 4];
            case 14:
                responseData = {
                    success: true,
                    contracts_generated: contracts.length,
                    contracts: contracts.map(function (c) { return ({
                        contract_id: c.contract_id,
                        offer_id: c.offer_id,
                        property_id: c.property_id,
                        status: c.status,
                        summary: c.contract_summary
                    }); })
                };
                console.log('📤 Contract Specialist returning response:', JSON.stringify(responseData, null, 2));
                return [2 /*return*/, new Response(JSON.stringify(responseData), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 200
                    })];
            case 15:
                error_2 = _c.sent();
                console.error('Contract Specialist error:', error_2);
                return [2 /*return*/, new Response(JSON.stringify({ error: error_2.message }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 400
                    })];
            case 16: return [2 /*return*/];
        }
    });
}); });
function generatePurchaseAgreement(offer, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var property, terms, contingencies, contractId, contractText, contractSummary;
        return __generator(this, function (_a) {
            property = offer.properties;
            terms = typeof offer.terms === 'string' ? JSON.parse(offer.terms) : offer.terms;
            contingencies = typeof offer.contingencies === 'string' ? JSON.parse(offer.contingencies) : offer.contingencies;
            contractId = "CONTRACT-".concat(Date.now(), "-").concat(crypto.randomUUID().slice(0, 8));
            contractText = generateContractText(offer, property, terms, contingencies);
            contractSummary = {
                property_address: property.address,
                purchase_price: offer.offer_price,
                closing_date: offer.closing_date,
                earnest_money: offer.earnest_money,
                financing_type: terms.financing || 'Cash',
                contingencies: contingencies,
                special_terms: terms,
                contract_id: contractId,
                generated_at: new Date().toISOString()
            };
            return [2 /*return*/, {
                    contract_id: contractId,
                    offer_id: offer.offer_id,
                    property_id: offer.property_id,
                    account_id: offer.account_id,
                    contract_text: contractText,
                    contract_summary: contractSummary,
                    status: 'generated',
                    created_at: new Date().toISOString(),
                    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
                }];
        });
    });
}
function generateContractText(offer, property, terms, contingencies) {
    var _a;
    var today = new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    var closingDate = new Date(offer.closing_date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    return "\nPURCHASE AND SALE AGREEMENT\n\nThis Purchase and Sale Agreement (the \"Agreement\") is made and entered into this ".concat(today, " (the \"Effective Date\"), by and between:\n\nSELLER: ").concat(property.agent_name || 'Property Owner', "\nAddress: ").concat(property.address, ", ").concat(property.city, ", ").concat(property.state, " ").concat(property.zip, "\n\nand\n\nBUYER: GTA 6 Real Estate Investment Group\nAddress: [Buyer Address]\n\nWHEREAS, Seller is the owner of certain real property located at ").concat(property.address, ", ").concat(property.city, ", ").concat(property.state, " ").concat(property.zip, " (the \"Property\"); and\n\nWHEREAS, Buyer desires to purchase and Seller desires to sell the Property on the terms and conditions set forth herein;\n\nNOW, THEREFORE, in consideration of the mutual promises and covenants contained herein, the parties agree as follows:\n\n1. PROPERTY DESCRIPTION\n   The Property consists of approximately ").concat(((_a = property.sqft) === null || _a === void 0 ? void 0 : _a.toLocaleString()) || 'N/A', " square feet, containing ").concat(property.bedrooms || 'N/A', " bedrooms and ").concat(property.bathrooms || 'N/A', " bathrooms, commonly known as ").concat(property.address, ", ").concat(property.city, ", ").concat(property.state, " ").concat(property.zip, ".\n\n2. PURCHASE PRICE\n   The total purchase price for the Property shall be $").concat(offer.offer_price.toLocaleString(), " (the \"Purchase Price\").\n\n3. PAYMENT TERMS\n   ").concat(generatePaymentTermsText(terms, offer), "\n\n4. CLOSING\n   Closing shall occur on or before ").concat(closingDate, " (the \"Closing Date\"), at which time Seller shall deliver possession of the Property to Buyer.\n\n5. CONTINGENCIES\n   This Agreement is contingent upon the following:\n   ").concat(contingencies.map(function (c, i) { return "".concat(i + 1, ". ").concat(c); }).join('\n   '), "\n\n6. EARNEST MONEY\n   Buyer shall deposit $").concat(offer.earnest_money.toLocaleString(), " as earnest money within 24 hours of acceptance of this Agreement.\n\n7. INSPECTION PERIOD\n   Buyer shall have ").concat(terms.inspection_days || 7, " days from the Effective Date to conduct inspections of the Property.\n\n8. TITLE AND SURVEY\n   Seller shall provide clear and marketable title. Buyer may obtain a survey at Buyer's expense.\n\n9. CLOSING COSTS\n   Closing costs shall be allocated as follows:\n   - Buyer shall pay: Recording fees, title insurance premium, lender fees (if applicable)\n   - Seller shall pay: Real estate commission, title search, transfer taxes\n\n10. DEFAULT\n    If Buyer defaults, earnest money shall be forfeited to Seller.\n    If Seller defaults, Seller shall return earnest money and pay Buyer's costs.\n\n11. NOTICES\n    All notices shall be in writing and delivered to the addresses listed above.\n\n12. GOVERNING LAW\n    This Agreement shall be governed by the laws of the State of ").concat(property.state, ".\n\n13. ENTIRE AGREEMENT\n    This Agreement constitutes the entire understanding between the parties.\n\nIN WITNESS WHEREOF, the parties have executed this Agreement as of the Effective Date.\n\nSELLER: _______________________________    BUYER: _______________________________\nDate: _______________                    Date: _______________\n\n").concat(generateSignaturesSection(terms), "\n").trim();
}
function generatePaymentTermsText(terms, offer) {
    switch (terms.financing) {
        case 'Subject-To':
            return "\n   Buyer shall assume Seller's existing mortgage in the amount of $".concat((offer.offer_price - (offer.offer_price * (terms.downPayment / 100))).toLocaleString(), " at the current interest rate and terms. Buyer shall pay $").concat((offer.offer_price * (terms.downPayment / 100)).toLocaleString(), " as down payment.");
        case 'Seller Finance':
            return "\n   Seller shall finance $".concat((offer.offer_price * (terms.sellerCarry / 100)).toLocaleString(), " at ").concat(terms.sellerCarryRate || '5.5', "% interest for ").concat(terms.sellerCarryTerm || 25, " years. Buyer shall pay $").concat((offer.offer_price * (terms.downPayment / 100)).toLocaleString(), " as down payment.");
        default:
            return "\n   Buyer shall pay the full Purchase Price in cash at closing.";
    }
}
function generateSignaturesSection(terms) {
    var signatures = "\n\nSELLER SIGNATURE: _______________________________    Date: _______________\n\nBUYER SIGNATURE: _______________________________    Date: _______________\n\n";
    // Add witness section for legal validity
    signatures += "\nWITNESS:\n\n_______________________________                    _______________________________\nWitness Signature                               Witness Signature\n\nPrinted Name: ___________________                 Printed Name: ___________________\n\nAddress: _________________________                 Address: _________________________\n\nPhone: __________________________                 Phone: __________________________\n\nEmail: ___________________________                 Email: ___________________________\n\n";
    // Add notary section if required
    if (terms.requires_notary) {
        signatures += "\nNOTARY PUBLIC:\n\nState of _______________________\n\nCounty of _____________________\n\nOn this ____ day of ____________, 20____, before me, the undersigned notary public, personally appeared _______________________________, known to me to be the person whose name is subscribed to the foregoing instrument, and acknowledged that he/she executed the same for the purposes therein contained.\n\nIn Witness Whereof, I hereunto set my hand and official seal.\n\n_______________________________\nNotary Public\n\nMy Commission Expires: __________\n";
    }
    return signatures;
}
