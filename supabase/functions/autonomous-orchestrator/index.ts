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
    var body, csv_data, account_id_1, dataset_id, supabaseUrl, supabaseKey, supabase, fileHash_1, _a, existingDuplicates, duplicateError, _b, datasetData, datasetError, scoutResult, researchResult, researchError_1, underwritingResult, underwritingError_1, offerResult, offerError_1, closerResult, closerError_1, dispoResult, dispoError_1, blacklistEntries, blacklistError, responseData, error_1;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                // Handle CORS
                if (req.method === 'OPTIONS') {
                    return [2 /*return*/, new Response('ok', { headers: cors_ts_1.corsHeaders, status: 200 })];
                }
                _c.label = 1;
            case 1:
                _c.trys.push([1, 37, , 38]);
                return [4 /*yield*/, req.json()];
            case 2:
                body = _c.sent();
                csv_data = body.csv_data, account_id_1 = body.account_id;
                dataset_id = body.dataset_id;
                // Generate dataset_id if not provided
                if (!dataset_id) {
                    dataset_id = "DS-".concat(Date.now(), "-").concat(crypto.randomUUID().slice(0, 8));
                }
                console.log('🚀 Autonomous orchestrator started with:', { csv_data_length: csv_data === null || csv_data === void 0 ? void 0 : csv_data.length, account_id: account_id_1, dataset_id: dataset_id });
                // Validate inputs
                if (!csv_data || !account_id_1) {
                    throw new Error('Missing required fields: csv_data or account_id');
                }
                supabaseUrl = Deno.env.get('SUPABASE_URL');
                supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
                if (!supabaseUrl || !supabaseKey) {
                    throw new Error('Missing Supabase configuration');
                }
                supabase = (0, supabase_js_2_1.createClient)(supabaseUrl, supabaseKey);
                console.log('📡 Supabase client created');
                return [4 /*yield*/, calculateFileHash(csv_data)];
            case 3:
                fileHash_1 = _c.sent();
                console.log('🔐 File hash:', fileHash_1);
                // Check for duplicate uploads
                console.log('🔍 Checking for duplicate uploads...');
                return [4 /*yield*/, supabase
                        .from('upload_blacklist')
                        .select('property_id, address')
                        .eq('account_id', account_id_1)
                        .eq('file_hash', fileHash_1)];
            case 4:
                _a = _c.sent(), existingDuplicates = _a.data, duplicateError = _a.error;
                if (duplicateError) {
                    console.warn('⚠️ Duplicate check error (continuing anyway):', duplicateError.message);
                }
                if (existingDuplicates && existingDuplicates.length > 0) {
                    console.log('⚠️ Found duplicates:', existingDuplicates.length);
                    // Return early with warning
                    return [2 /*return*/, new Response(JSON.stringify({
                            success: false,
                            error: 'DUPLICATE_UPLOAD',
                            message: 'This file has already been uploaded',
                            duplicates_count: existingDuplicates.length
                        }), {
                            headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                            status: 400
                        })];
                }
                console.log('✅ No duplicates found, proceeding...');
                // Create dataset record first
                console.log('💾 Creating dataset record...');
                return [4 /*yield*/, supabase
                        .from('datasets')
                        .insert({
                        dataset_id: dataset_id,
                        account_id: account_id_1,
                        file_name: 'uploaded.csv',
                        total_properties: 0,
                        qualified_properties: 0,
                        researched_properties: 0,
                        qualified_deals: 0,
                        offers_sent: 0,
                        black_market_listings: 0,
                        held_deals: 0,
                        pipeline_status: 'processing',
                        started_at: new Date().toISOString()
                    })
                        .select()
                        .single()];
            case 5:
                _b = _c.sent(), datasetData = _b.data, datasetError = _b.error;
                if (datasetError) {
                    console.error('❌ Dataset insert error:', datasetError);
                    // If datasets table doesn't exist, continue without it
                    if (datasetError.message.includes('relation "datasets" not found')) {
                        console.warn('⚠️ Datasets table not found, skipping dataset creation');
                    }
                    else {
                        throw new Error("Failed to create dataset: ".concat(datasetError.message));
                    }
                }
                else {
                    console.log('✅ Dataset created:', datasetData);
                }
                // Log autonomous orchestrator start
                return [4 /*yield*/, supabase
                        .from('event_log')
                        .insert({
                        account_id: account_id_1,
                        event_type: 'AUTONOMOUS_PIPELINE_START',
                        entity_type: 'dataset',
                        entity_id: dataset_id,
                        agent_name: 'autonomous-orchestrator',
                        details: { csv_size: csv_data.length }
                    })
                    // Step 1: Pipeline Scout - Process CSV and validate properties
                ];
            case 6:
                // Log autonomous orchestrator start
                _c.sent();
                // Step 1: Pipeline Scout - Process CSV and validate properties
                console.log('🔍 Step 1: Running Pipeline Scout...');
                return [4 /*yield*/, runPipelineScout(csv_data, account_id_1, dataset_id, supabase)];
            case 7:
                scoutResult = _c.sent();
                console.log('✅ Pipeline Scout result:', scoutResult);
                // Step 2: Market Research - Get ARV and comps for qualified properties
                console.log('🔍 Step 2: Running Market Research...');
                researchResult = void 0;
                _c.label = 8;
            case 8:
                _c.trys.push([8, 10, , 12]);
                return [4 /*yield*/, runMarketResearch(scoutResult.qualified_properties, account_id_1, supabase)];
            case 9:
                researchResult = _c.sent();
                console.log('✅ Market Research result:', researchResult);
                return [3 /*break*/, 12];
            case 10:
                researchError_1 = _c.sent();
                console.error('❌ Market Research failed:', researchError_1);
                // Log the error to event_log
                return [4 /*yield*/, supabase
                        .from('event_log')
                        .insert({
                        account_id: account_id_1,
                        event_type: 'MARKET_RESEARCH_ERROR',
                        entity_type: 'dataset',
                        entity_id: dataset_id,
                        agent_name: 'autonomous-orchestrator',
                        details: { error: researchError_1.message, csv_size: csv_data.length }
                    })
                    // Continue with empty results
                ];
            case 11:
                // Log the error to event_log
                _c.sent();
                // Continue with empty results
                researchResult = {
                    researched_properties: []
                };
                return [3 /*break*/, 12];
            case 12:
                // Step 3: Underwriter - Analyze deals and score them
                console.log('🔍 Step 3: Running Underwriter...');
                underwritingResult = void 0;
                _c.label = 13;
            case 13:
                _c.trys.push([13, 15, , 17]);
                return [4 /*yield*/, runUnderwriter(researchResult.researched_properties, account_id_1, supabase)];
            case 14:
                underwritingResult = _c.sent();
                console.log('✅ Underwriter result:', underwritingResult);
                return [3 /*break*/, 17];
            case 15:
                underwritingError_1 = _c.sent();
                console.error('❌ Underwriter failed:', underwritingError_1);
                // Log the error to event_log
                return [4 /*yield*/, supabase
                        .from('event_log')
                        .insert({
                        account_id: account_id_1,
                        event_type: 'UNDERWRITING_ERROR',
                        entity_type: 'dataset',
                        entity_id: dataset_id,
                        agent_name: 'autonomous-orchestrator',
                        details: { error: underwritingError_1.message, csv_size: csv_data.length }
                    })
                    // Continue with empty results
                ];
            case 16:
                // Log the error to event_log
                _c.sent();
                // Continue with empty results
                underwritingResult = {
                    qualified_deals: []
                };
                return [3 /*break*/, 17];
            case 17:
                // Step 4: Offer Generator - Create offers for high-scoring deals
                console.log('🔍 Step 4: Running Offer Generator...');
                offerResult = void 0;
                _c.label = 18;
            case 18:
                _c.trys.push([18, 20, , 22]);
                return [4 /*yield*/, runOfferGenerator(underwritingResult.qualified_deals, account_id_1, supabase)];
            case 19:
                offerResult = _c.sent();
                console.log('✅ Offer Generator result:', offerResult);
                return [3 /*break*/, 22];
            case 20:
                offerError_1 = _c.sent();
                console.error('❌ Offer Generator failed:', offerError_1);
                // Log the error to event_log
                return [4 /*yield*/, supabase
                        .from('event_log')
                        .insert({
                        account_id: account_id_1,
                        event_type: 'OFFER_GENERATION_ERROR',
                        entity_type: 'dataset',
                        entity_id: dataset_id,
                        agent_name: 'autonomous-orchestrator',
                        details: { error: offerError_1.message, csv_size: csv_data.length }
                    })
                    // Continue with empty results
                ];
            case 21:
                // Log the error to event_log
                _c.sent();
                // Continue with empty results
                offerResult = {
                    offers: []
                };
                return [3 /*break*/, 22];
            case 22:
                // Step 5: Email Closer - Send offers and start follow-up sequences
                console.log('🔍 Step 5: Running Email Closer...');
                closerResult = void 0;
                _c.label = 23;
            case 23:
                _c.trys.push([23, 25, , 27]);
                return [4 /*yield*/, runEmailCloser(offerResult.offers, account_id_1, supabase)];
            case 24:
                closerResult = _c.sent();
                console.log('✅ Email Closer result:', closerResult);
                return [3 /*break*/, 27];
            case 25:
                closerError_1 = _c.sent();
                console.error('❌ Email Closer failed:', closerError_1);
                // Log the error to event_log
                return [4 /*yield*/, supabase
                        .from('event_log')
                        .insert({
                        account_id: account_id_1,
                        event_type: 'EMAIL_CLOSER_ERROR',
                        entity_type: 'dataset',
                        entity_id: dataset_id,
                        agent_name: 'autonomous-orchestrator',
                        details: { error: closerError_1.message, csv_size: csv_data.length }
                    })
                    // Continue with empty results
                ];
            case 26:
                // Log the error to event_log
                _c.sent();
                // Continue with empty results
                closerResult = {
                    sent_offers: []
                };
                return [3 /*break*/, 27];
            case 27:
                // Step 6: Dispo Agent - Handle deal disposition and black market listings
                console.log('🔍 Step 6: Running Dispo Agent...');
                dispoResult = void 0;
                _c.label = 28;
            case 28:
                _c.trys.push([28, 30, , 32]);
                return [4 /*yield*/, runDispoAgent(closerResult.sent_offers, account_id_1, supabase)];
            case 29:
                dispoResult = _c.sent();
                console.log('✅ Dispo Agent result:', dispoResult);
                return [3 /*break*/, 32];
            case 30:
                dispoError_1 = _c.sent();
                console.error('❌ Dispo Agent failed:', dispoError_1);
                // Log the error to event_log
                return [4 /*yield*/, supabase
                        .from('event_log')
                        .insert({
                        account_id: account_id_1,
                        event_type: 'DISPO_AGENT_ERROR',
                        entity_type: 'dataset',
                        entity_id: dataset_id,
                        agent_name: 'autonomous-orchestrator',
                        details: { error: dispoError_1.message, csv_size: csv_data.length }
                    })
                    // Continue with empty results
                ];
            case 31:
                // Log the error to event_log
                _c.sent();
                // Continue with empty results
                dispoResult = {
                    black_market_listings: [],
                    held_deals: []
                };
                return [3 /*break*/, 32];
            case 32: 
            // Update dataset with final counts
            return [4 /*yield*/, supabase
                    .from('datasets')
                    .update({
                    total_properties: scoutResult.total_properties,
                    qualified_properties: scoutResult.qualified_properties.length,
                    researched_properties: researchResult.researched_properties.length,
                    qualified_deals: underwritingResult.qualified_deals.length,
                    offers_sent: offerResult.offers.length,
                    black_market_listings: dispoResult.black_market_listings.length,
                    held_deals: dispoResult.held_deals.length,
                    pipeline_status: 'completed',
                    completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                })
                    .eq('dataset_id', dataset_id)
                // Add processed properties to blacklist to prevent duplicate uploads
            ];
            case 33:
                // Update dataset with final counts
                _c.sent();
                // Add processed properties to blacklist to prevent duplicate uploads
                console.log('💾 Adding properties to blacklist...');
                blacklistEntries = scoutResult.qualified_properties.map(function (p) { return ({
                    account_id: account_id_1,
                    property_id: p.property_id,
                    file_hash: fileHash_1,
                    address: p.address,
                    city: p.city,
                    state: p.state,
                    zip: p.zip
                }); });
                if (!(blacklistEntries.length > 0)) return [3 /*break*/, 35];
                return [4 /*yield*/, supabase
                        .from('upload_blacklist')
                        .insert(blacklistEntries)];
            case 34:
                blacklistError = (_c.sent()).error;
                if (blacklistError) {
                    console.warn('⚠️ Blacklist insert error (non-critical):', blacklistError.message);
                }
                else {
                    console.log('✅ Added', blacklistEntries.length, 'properties to blacklist');
                }
                _c.label = 35;
            case 35: 
            // Log completion
            return [4 /*yield*/, supabase
                    .from('event_log')
                    .insert({
                    account_id: account_id_1,
                    event_type: 'AUTONOMOUS_PIPELINE_COMPLETE',
                    entity_type: 'dataset',
                    entity_id: dataset_id,
                    agent_name: 'autonomous-orchestrator',
                    details: {
                        total_properties: scoutResult.total_properties,
                        qualified_properties: scoutResult.qualified_properties.length,
                        researched_properties: researchResult.researched_properties.length,
                        qualified_deals: underwritingResult.qualified_deals.length,
                        offers_sent: offerResult.offers.length,
                        black_market_listings: dispoResult.black_market_listings.length,
                        held_deals: dispoResult.held_deals.length,
                        pipeline_complete: true
                    }
                })];
            case 36:
                // Log completion
                _c.sent();
                responseData = {
                    success: true,
                    dataset_id: dataset_id,
                    pipeline_complete: true,
                    stats: {
                        total_properties: scoutResult.total_properties,
                        qualified_properties: scoutResult.qualified_properties.length,
                        researched_properties: researchResult.researched_properties.length,
                        qualified_deals: underwritingResult.qualified_deals.length,
                        offers_sent: offerResult.offers.length,
                        black_market_listings: dispoResult.black_market_listings.length,
                        held_deals: dispoResult.held_deals.length
                    }
                };
                console.log('📤 Function returning response:', JSON.stringify(responseData, null, 2));
                return [2 /*return*/, new Response(JSON.stringify(responseData), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 200
                    })];
            case 37:
                error_1 = _c.sent();
                console.error('Autonomous orchestrator error:', error_1);
                return [2 /*return*/, new Response(JSON.stringify({ error: error_1.message, dataset_id: dataset_id }), {
                        headers: __assign(__assign({}, cors_ts_1.corsHeaders), { 'Content-Type': 'application/json' }),
                        status: 400
                    })];
            case 38: return [2 /*return*/];
        }
    });
}); });
function runPipelineScout(csvData, accountId, datasetId, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var lines, headers, properties, qualifiedProperties, columnMap, mapping, _loop_1, i, batchSize, i, batch, insertError;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('🏁 Starting Pipeline Scout with data length:', csvData.length);
                    lines = csvData.split('\n');
                    console.log('📄 CSV lines parsed:', lines.length);
                    if (lines.length < 2) {
                        throw new Error('CSV file must have at least a header row and one data row');
                    }
                    headers = lines[0].split(',').map(function (h) { return h.trim().toLowerCase().replace(/[^a-z0-9_]/g, '_'); });
                    console.log('📋 Headers found:', headers);
                    properties = [];
                    qualifiedProperties = [];
                    columnMap = {
                        'address': ['address', 'property_address', 'street_address'],
                        'city': ['city'],
                        'state': ['state', 'st'],
                        'zip': ['zip', 'zipcode', 'postal_code'],
                        'price': ['price', 'list_price', 'asking_price'],
                        'bedrooms': ['bedrooms', 'beds'],
                        'bathrooms': ['bathrooms', 'baths'],
                        'sqft': ['sqft', 'square_feet', 'living_area'],
                        'mls_status': ['status', 'mls_status'],
                        'agent_name': ['agent_name', 'listing_agent'],
                        'agent_email': ['agent_email', 'email'],
                        'agent_phone': ['agent_phone', 'phone']
                    };
                    mapping = {};
                    Object.keys(columnMap).forEach(function (field) {
                        var possibleNames = columnMap[field];
                        var matchedHeader = headers.find(function (h) { return possibleNames.includes(h); });
                        if (matchedHeader) {
                            mapping[field] = matchedHeader;
                        }
                    });
                    _loop_1 = function (i) {
                        if (!lines[i].trim())
                            return "continue";
                        var values = lines[i].split(',');
                        var property = {
                            id: crypto.randomUUID(),
                            property_id: "PROP-".concat(Date.now(), "-").concat(i),
                            address: '',
                            city: '',
                            state: '',
                            zip: '',
                            price: 0,
                            bedrooms: 0,
                            bathrooms: 0,
                            sqft: 0,
                            status: 'pending',
                            account_id: accountId
                        };
                        // Map CSV data
                        Object.keys(mapping).forEach(function (field) {
                            var _a;
                            var csvIndex = headers.indexOf(mapping[field]);
                            if (csvIndex !== -1) {
                                var value = (_a = values[csvIndex]) === null || _a === void 0 ? void 0 : _a.trim();
                                switch (field) {
                                    case 'address':
                                        property.address = value;
                                        break;
                                    case 'city':
                                        property.city = value;
                                        break;
                                    case 'state':
                                        property.state = value === null || value === void 0 ? void 0 : value.toUpperCase();
                                        break;
                                    case 'zip':
                                        property.zip = value;
                                        break;
                                    case 'price':
                                        property.price = value ? parseFloat(value.replace(/[$,]/g, '')) : 0;
                                        break;
                                    case 'bedrooms':
                                        property.bedrooms = value ? parseInt(value) : 0;
                                        break;
                                    case 'bathrooms':
                                        property.bathrooms = value ? parseFloat(value) : 0;
                                        break;
                                    case 'sqft':
                                        property.sqft = value ? parseInt(value.replace(/,/g, '')) : 0;
                                        break;
                                    case 'mls_status':
                                        property.mls_status = value;
                                        break;
                                    case 'agent_name':
                                        property.agent_name = value;
                                        break;
                                    case 'agent_email':
                                        property.agent_email = value;
                                        break;
                                    case 'agent_phone':
                                        property.agent_phone = value;
                                        break;
                                }
                            }
                        });
                        // Validate and qualify property
                        var validation = validateProperty(property);
                        property.validation_notes = validation.warnings.join('; ');
                        if (validation.isQualified) {
                            qualifiedProperties.push(property);
                        }
                        properties.push(property);
                    };
                    for (i = 1; i < lines.length; i++) {
                        _loop_1(i);
                    }
                    // Insert all properties in batches to avoid timeout
                    console.log('💾 Inserting properties in batches...');
                    batchSize = 100;
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < properties.length)) return [3 /*break*/, 4];
                    batch = properties.slice(i, i + batchSize);
                    console.log("\uD83D\uDCE6 Inserting batch ".concat(Math.floor(i / batchSize) + 1, "/").concat(Math.ceil(properties.length / batchSize), " (").concat(batch.length, " properties)"));
                    return [4 /*yield*/, supabase
                            .from('properties')
                            .insert(batch.map(function (p) { return ({
                            property_id: p.property_id,
                            dataset_id: datasetId,
                            address: p.address,
                            city: p.city,
                            state: p.state,
                            zip: p.zip,
                            price: p.price,
                            bedrooms: p.bedrooms,
                            bathrooms: p.bathrooms,
                            sqft: p.sqft,
                            status: p.status,
                            account_id: p.account_id,
                            list_price: p.price,
                            mls_status: p.mls_status,
                            agent_name: p.agent_name,
                            agent_email: p.agent_email,
                            agent_phone: p.agent_phone,
                            validation_notes: p.validation_notes
                        }); }))];
                case 2:
                    insertError = (_a.sent()).error;
                    if (insertError) {
                        console.error('❌ Batch insert error:', insertError);
                        throw new Error("Failed to insert properties batch: ".concat(insertError.message));
                    }
                    _a.label = 3;
                case 3:
                    i += batchSize;
                    return [3 /*break*/, 1];
                case 4:
                    console.log('✅ All properties inserted');
                    // Log pipeline scout completion
                    return [4 /*yield*/, supabase
                            .from('activity_log')
                            .insert({
                            property_id: null,
                            dataset_id: datasetId,
                            agent_name: 'pipeline-scout',
                            action: 'csv_processing_complete',
                            details: {
                                total_properties: properties.length,
                                qualified_properties: qualifiedProperties.length
                            },
                            user_id: accountId
                        })];
                case 5:
                    // Log pipeline scout completion
                    _a.sent();
                    return [2 /*return*/, {
                            total_properties: properties.length,
                            qualified_properties: qualifiedProperties
                        }];
            }
        });
    });
}
function runMarketResearch(properties, accountId, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var researchedProperties, _i, properties_1, property, marketData, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    researchedProperties = [];
                    _i = 0, properties_1 = properties;
                    _a.label = 1;
                case 1:
                    if (!(_i < properties_1.length)) return [3 /*break*/, 8];
                    property = properties_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, performMarketResearch(property)
                        // Update property with market research data
                    ];
                case 3:
                    marketData = _a.sent();
                    // Update property with market research data
                    return [4 /*yield*/, supabase
                            .from('properties')
                            .update({
                            arv: marketData.arv,
                            rent_str: marketData.rentEstimate,
                            price_per_sqft: marketData.pricePerSqft,
                            updated_at: new Date().toISOString()
                        })
                            .eq('property_id', property.property_id)
                        // Log market research
                    ];
                case 4:
                    // Update property with market research data
                    _a.sent();
                    // Log market research
                    return [4 /*yield*/, supabase
                            .from('activity_log')
                            .insert({
                            property_id: property.property_id,
                            agent_name: 'market-researcher',
                            action: 'market_research_complete',
                            details: marketData,
                            user_id: accountId
                        })];
                case 5:
                    // Log market research
                    _a.sent();
                    researchedProperties.push(__assign(__assign({}, property), marketData));
                    return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error("Market research failed for ".concat(property.property_id, ":"), error_2);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, { researched_properties: researchedProperties }];
            }
        });
    });
}
function runUnderwriter(properties, accountId, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var qualifiedDeals, _i, properties_2, property, underwritingResult, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    qualifiedDeals = [];
                    _i = 0, properties_2 = properties;
                    _a.label = 1;
                case 1:
                    if (!(_i < properties_2.length)) return [3 /*break*/, 8];
                    property = properties_2[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 6, , 7]);
                    return [4 /*yield*/, performUnderwriting(property)
                        // Update property with underwriting data
                    ];
                case 3:
                    underwritingResult = _a.sent();
                    // Update property with underwriting data
                    return [4 /*yield*/, supabase
                            .from('properties')
                            .update({
                            cash_on_cash: underwritingResult.cashOnCash,
                            dscr: underwritingResult.dscr,
                            cap_rate: underwritingResult.capRate,
                            irr: underwritingResult.irr,
                            strategy_recommended: underwritingResult.strategy,
                            updated_at: new Date().toISOString()
                        })
                            .eq('property_id', property.property_id)
                        // Log underwriting
                    ];
                case 4:
                    // Update property with underwriting data
                    _a.sent();
                    // Log underwriting
                    return [4 /*yield*/, supabase
                            .from('activity_log')
                            .insert({
                            property_id: property.property_id,
                            agent_name: 'underwriter',
                            action: 'underwriting_complete',
                            details: underwritingResult,
                            user_id: accountId
                        })
                        // Lowered threshold from 8 to 50 to qualify more deals
                    ];
                case 5:
                    // Log underwriting
                    _a.sent();
                    // Lowered threshold from 8 to 50 to qualify more deals
                    if (underwritingResult.score >= 50) {
                        qualifiedDeals.push(__assign(__assign({}, property), { underwriting: underwritingResult }));
                    }
                    else if (underwritingResult.score >= 30) {
                        // Still add marginal deals but flag them
                        qualifiedDeals.push(__assign(__assign({}, property), { underwriting: __assign(__assign({}, underwritingResult), { marginal: true }) }));
                    }
                    return [3 /*break*/, 7];
                case 6:
                    error_3 = _a.sent();
                    console.error("Underwriting failed for ".concat(property.property_id, ":"), error_3);
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 1];
                case 8: return [2 /*return*/, { qualified_deals: qualifiedDeals }];
            }
        });
    });
}
function runOfferGenerator(deals, accountId, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var offers, _i, deals_1, deal, offer, _a, offerData, error, error_4;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    offers = [];
                    _i = 0, deals_1 = deals;
                    _b.label = 1;
                case 1:
                    if (!(_i < deals_1.length)) return [3 /*break*/, 9];
                    deal = deals_1[_i];
                    _b.label = 2;
                case 2:
                    _b.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, generateOffer(deal)
                        // Insert offer
                    ];
                case 3:
                    offer = _b.sent();
                    return [4 /*yield*/, supabase
                            .from('offers')
                            .insert({
                            offer_id: "OFFER-".concat(Date.now(), "-").concat(crypto.randomUUID().slice(0, 8)),
                            property_id: deal.property_id,
                            account_id: accountId,
                            offer_price: offer.price,
                            terms: JSON.stringify(offer.terms),
                            contingencies: JSON.stringify(offer.contingencies),
                            closing_date: offer.closingDate,
                            earnest_money: offer.earnestMoney,
                            status: 'generated'
                        })
                            .select()
                            .single()];
                case 4:
                    _a = _b.sent(), offerData = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    // Update property
                    return [4 /*yield*/, supabase
                            .from('properties')
                            .update({
                            offer_sent: true,
                            offer_date: new Date().toISOString().split('T')[0],
                            offer_type: offer.type,
                            offer_terms: offer.terms,
                            deal_stage: 'offer_pending'
                        })
                            .eq('property_id', deal.property_id)
                        // Log offer generation
                    ];
                case 5:
                    // Update property
                    _b.sent();
                    // Log offer generation
                    return [4 /*yield*/, supabase
                            .from('activity_log')
                            .insert({
                            property_id: deal.property_id,
                            agent_name: 'offer-generator',
                            action: 'offer_generated',
                            details: offer,
                            user_id: accountId
                        })];
                case 6:
                    // Log offer generation
                    _b.sent();
                    offers.push(__assign(__assign({}, offer), { offer_id: offerData.offer_id, property_id: deal.property_id }));
                    return [3 /*break*/, 8];
                case 7:
                    error_4 = _b.sent();
                    console.error("Offer generation failed for ".concat(deal.property_id, ":"), error_4);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/, { offers: offers }];
            }
        });
    });
}
function runEmailCloser(offers, accountId, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var sentOffers, _i, offers_1, offer, emailResult, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    sentOffers = [];
                    _i = 0, offers_1 = offers;
                    _a.label = 1;
                case 1:
                    if (!(_i < offers_1.length)) return [3 /*break*/, 9];
                    offer = offers_1[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 7, , 8]);
                    return [4 /*yield*/, sendOfferEmail(offer)
                        // Insert communication record
                    ];
                case 3:
                    emailResult = _a.sent();
                    // Insert communication record
                    return [4 /*yield*/, supabase
                            .from('communications')
                            .insert({
                            property_id: offer.property_id,
                            comm_type: 'Email',
                            direction: 'Outbound',
                            to_email: offer.agentEmail,
                            to_name: offer.agentName,
                            subject: emailResult.subject,
                            message: emailResult.body,
                            category: 'Initial Contact',
                            sentiment: 'Neutral',
                            user_id: accountId
                        })
                        // Update offer status
                    ];
                case 4:
                    // Insert communication record
                    _a.sent();
                    // Update offer status
                    return [4 /*yield*/, supabase
                            .from('offers')
                            .update({
                            status: 'sent',
                            sent_at: new Date().toISOString()
                        })
                            .eq('offer_id', offer.offer_id)
                        // Log email sending
                    ];
                case 5:
                    // Update offer status
                    _a.sent();
                    // Log email sending
                    return [4 /*yield*/, supabase
                            .from('activity_log')
                            .insert({
                            property_id: offer.property_id,
                            agent_name: 'email-closer',
                            action: 'offer_email_sent',
                            details: {
                                offer_id: offer.offer_id,
                                recipient: offer.agentEmail,
                                subject: emailResult.subject
                            },
                            user_id: accountId
                        })];
                case 6:
                    // Log email sending
                    _a.sent();
                    sentOffers.push(offer);
                    return [3 /*break*/, 8];
                case 7:
                    error_5 = _a.sent();
                    console.error("Email sending failed for offer ".concat(offer.offer_id, ":"), error_5);
                    return [3 /*break*/, 8];
                case 8:
                    _i++;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/, { sent_offers: sentOffers }];
            }
        });
    });
}
// Helper functions
function validateProperty(property) {
    var errors = [];
    var warnings = [];
    var isQualified = true;
    // Core validation - address, city, state are required
    if (!property.address || property.address.trim() === '') {
        errors.push('Missing address');
        isQualified = false;
    }
    if (!property.city || property.city.trim() === '') {
        errors.push('Missing city');
        isQualified = false;
    }
    if (!property.state || property.state.trim() === '') {
        errors.push('Missing state');
        isQualified = false;
    }
    // Price validation - accept ANY price (no $1M threshold)
    if (property.price <= 0) {
        warnings.push('Price is zero or negative - may need manual review');
    }
    // No longer disqualifying based on price - all properties are qualified for processing
    // Agent email is optional - just a warning
    if (!property.agent_email) {
        warnings.push('Missing agent email - will still process but email cannot be sent');
    }
    // Property type validation - accept all types
    if (!property.sqft || property.sqft <= 0) {
        warnings.push('Missing or invalid square footage');
    }
    return { errors: errors, warnings: warnings, isQualified: isQualified };
}
function performMarketResearch(property) {
    return __awaiter(this, void 0, void 0, function () {
        var pricePerSqft, arv, rentEstimate;
        return __generator(this, function (_a) {
            // Simulate market research - in real implementation, this would call APIs
            // Validate inputs to prevent division by zero
            if (!property.price || property.price <= 0) {
                throw new Error("Invalid price for property ".concat(property.property_id, ": ").concat(property.price));
            }
            if (!property.sqft || property.sqft <= 0) {
                throw new Error("Invalid sqft for property ".concat(property.property_id, ": ").concat(property.sqft));
            }
            pricePerSqft = (property.price / property.sqft) * 1.05 // 5% premium for ARV
            ;
            arv = property.sqft * pricePerSqft;
            rentEstimate = arv * 0.008 // 0.8% of ARV monthly
            ;
            // Validate results
            if (!isFinite(arv) || !isFinite(rentEstimate) || !isFinite(pricePerSqft)) {
                throw new Error("Invalid market research calculations for property ".concat(property.property_id));
            }
            return [2 /*return*/, {
                    arv: Math.round(arv),
                    rentEstimate: Math.round(rentEstimate),
                    pricePerSqft: Math.round(pricePerSqft),
                    researchDate: new Date().toISOString(),
                    confidence: 'high'
                }];
        });
    });
}
function performUnderwriting(property) {
    return __awaiter(this, void 0, void 0, function () {
        var monthlyRent, purchasePrice, arv, cashOnCash, capRate, dscr, irr, score, strategy;
        var _a, _b, _c, _d, _e;
        return __generator(this, function (_f) {
            monthlyRent = property.rent_str || 0;
            purchasePrice = property.price || 0;
            // Validate inputs
            if (purchasePrice <= 0) {
                throw new Error("Invalid purchase price for property ".concat(property.property_id, ": ").concat(purchasePrice));
            }
            arv = property.arv || purchasePrice * 1.05;
            cashOnCash = 0;
            if (purchasePrice > 0) {
                cashOnCash = monthlyRent * 12 / purchasePrice * 100;
            }
            capRate = cashOnCash // Simplified
            ;
            dscr = monthlyRent > 0 ? monthlyRent / (monthlyRent * 0.3) : 0 // Simplified
            ;
            irr = capRate * 0.8 // Simplified
            ;
            // Validate calculations
            if (!isFinite(cashOnCash) || !isFinite(capRate) || !isFinite(dscr) || !isFinite(irr)) {
                throw new Error("Invalid underwriting calculations for property ".concat(property.property_id));
            }
            score = 0;
            if (cashOnCash >= 8)
                score += 30; // Lowered from 10%
            if (capRate >= 6)
                score += 25; // Lowered from 8%
            if (dscr >= 1.0)
                score += 20; // Lowered from 1.25
            if (property.sqft >= 1000)
                score += 10; // Lowered from 2000
            if (property.bedrooms >= 2)
                score += 10; // Lowered from 3
            if (((_a = property.city) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes('miami')) ||
                ((_b = property.city) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes('fort lauderdale')) ||
                ((_c = property.city) === null || _c === void 0 ? void 0 : _c.toLowerCase().includes('boca')) ||
                ((_d = property.city) === null || _d === void 0 ? void 0 : _d.toLowerCase().includes('pompano')) ||
                ((_e = property.city) === null || _e === void 0 ? void 0 : _e.toLowerCase().includes('hollywood')))
                score += 15;
            // Added: Bonus for any property with valid data
            if (property.price > 0 && property.sqft > 0)
                score += 5;
            strategy = score >= 70 ? 'Subject-To' : score >= 50 ? 'Seller Finance' : 'Cash';
            return [2 /*return*/, {
                    score: score,
                    cashOnCash: Math.round(cashOnCash * 100) / 100,
                    capRate: Math.round(capRate * 100) / 100,
                    dscr: Math.round(dscr * 100) / 100,
                    irr: Math.round(irr * 100) / 100,
                    strategy: strategy,
                    recommendation: score >= 8 ? 'PROCEED' : 'REVIEW'
                }];
        });
    });
}
function generateOffer(deal) {
    return __awaiter(this, void 0, void 0, function () {
        var purchasePrice, strategy, offerPrice, terms, contingencies, earnestMoney, closingDate;
        return __generator(this, function (_a) {
            purchasePrice = deal.price;
            strategy = deal.underwriting.strategy;
            switch (strategy) {
                case 'Subject-To':
                    offerPrice = Math.round(purchasePrice * 0.95); // 5% below list
                    terms = {
                        financing: 'Subject-To existing mortgage',
                        downPayment: '3%',
                        closingDays: 14,
                        sellerCarry: 'Balance at 4.5% for 30 years'
                    };
                    contingencies = ['Inspection', 'Appraisal', 'Mortgage assumption approval'];
                    break;
                case 'Seller Finance':
                    offerPrice = Math.round(purchasePrice * 0.97); // 3% below list
                    terms = {
                        financing: 'Seller financing',
                        downPayment: '5%',
                        closingDays: 21,
                        sellerCarry: '95% at 5.5% for 25 years'
                    };
                    contingencies = ['Inspection', 'Appraisal'];
                    break;
                default:
                    offerPrice = Math.round(purchasePrice * 0.90); // 10% below for cash
                    terms = {
                        financing: 'Cash',
                        downPayment: '100%',
                        closingDays: 7
                    };
                    contingencies = ['Inspection'];
            }
            earnestMoney = Math.round(offerPrice * 0.01) // 1% earnest money
            ;
            closingDate = new Date(Date.now() + terms.closingDays * 24 * 60 * 60 * 1000);
            return [2 /*return*/, {
                    type: strategy,
                    price: offerPrice,
                    terms: terms,
                    contingencies: contingencies,
                    earnestMoney: earnestMoney,
                    closingDate: closingDate.toISOString().split('T')[0],
                    agentEmail: deal.agent_email,
                    agentName: deal.agent_name
                }];
        });
    });
}
function sendOfferEmail(offer) {
    return __awaiter(this, void 0, void 0, function () {
        var subject, body;
        return __generator(this, function (_a) {
            subject = "Cash Offer for ".concat(offer.address || 'Property', " - $").concat(offer.price.toLocaleString());
            body = "\nDear ".concat(offer.agentName || 'Listing Agent', ",\n\nI am pleased to submit a purchase offer for the property located at ").concat(offer.address, ".\n\nOFFER DETAILS:\n- Purchase Price: $").concat(offer.price.toLocaleString(), "\n- Earnest Money: $").concat(offer.earnestMoney.toLocaleString(), "\n- Closing Date: ").concat(offer.closingDate, "\n- Terms: ").concat(JSON.stringify(offer.terms, null, 2), "\n- Contingencies: ").concat(offer.contingencies.join(', '), "\n\nPlease review this offer and let me know if you'd like to discuss any terms.\n\nBest regards,\nGTA 6 Real Estate Investment Team\n  ").trim();
            // Simulate email sending - in real implementation, integrate with SendGrid/Mailgun
            console.log("Sending email to ".concat(offer.agentEmail, ": ").concat(subject));
            return [2 /*return*/, { subject: subject, body: body, sent: true }];
        });
    });
}
function evaluateForBlackMarket(offer) {
    return __awaiter(this, void 0, void 0, function () {
        var purchasePrice, underwriting, cashOnCash, score, push, price, profitPotential, reason;
        return __generator(this, function (_a) {
            purchasePrice = offer.price || 0;
            underwriting = offer.underwriting || {};
            cashOnCash = underwriting.cashOnCash || 0;
            score = underwriting.score || 0;
            push = false;
            price = purchasePrice;
            profitPotential = 0;
            reason = '';
            // Decision criteria for black market
            if (score >= 9 && cashOnCash >= 12) {
                // High-quality deal - push to market
                push = true;
                price = Math.round(purchasePrice * 1.15); // 15% markup for investors
                profitPotential = Math.round(purchasePrice * 0.15);
                reason = 'High-quality deal with strong returns';
            }
            else if (score >= 8 && cashOnCash >= 10) {
                // Good deal - push at moderate markup
                push = true;
                price = Math.round(purchasePrice * 1.10); // 10% markup
                profitPotential = Math.round(purchasePrice * 0.10);
                reason = 'Solid deal with good cash flow';
            }
            else if (score >= 7 && cashOnCash >= 8) {
                // Marginal deal - hold for follow-up
                push = false;
                reason = 'Deal needs more seasoning or follow-up';
            }
            else {
                // Poor deal - hold or reject
                push = false;
                reason = 'Deal does not meet black market criteria';
            }
            return [2 /*return*/, {
                    push: push,
                    price: price,
                    profitPotential: profitPotential,
                    reason: reason,
                    score: score
                }];
        });
    });
}
function runDispoAgent(offers, accountId, supabase) {
    return __awaiter(this, void 0, void 0, function () {
        var blackMarketListings, heldDeals, _i, offers_2, offer, evaluation, listing, error, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    blackMarketListings = [];
                    heldDeals = [];
                    _i = 0, offers_2 = offers;
                    _a.label = 1;
                case 1:
                    if (!(_i < offers_2.length)) return [3 /*break*/, 10];
                    offer = offers_2[_i];
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, 8, , 9]);
                    return [4 /*yield*/, evaluateForBlackMarket(offer)];
                case 3:
                    evaluation = _a.sent();
                    if (!evaluation.push) return [3 /*break*/, 5];
                    listing = {
                        property_id: offer.property_id,
                        account_id: accountId,
                        price: evaluation.price,
                        profit_potential: evaluation.profitPotential,
                        deal_type: offer.type,
                        status: 'available',
                        created_at: new Date().toISOString()
                    };
                    return [4 /*yield*/, supabase
                            .from('black_market_listings')
                            .insert(listing)];
                case 4:
                    error = (_a.sent()).error;
                    if (!error) {
                        blackMarketListings.push(listing);
                    }
                    return [3 /*break*/, 6];
                case 5:
                    // Hold for follow-up
                    heldDeals.push(__assign(__assign({}, offer), { reason: evaluation.reason }));
                    _a.label = 6;
                case 6: 
                // Log disposition
                return [4 /*yield*/, supabase
                        .from('activity_log')
                        .insert({
                        property_id: offer.property_id,
                        agent_name: 'dispo-agent',
                        action: 'deal_disposition',
                        details: evaluation,
                        user_id: accountId
                    })];
                case 7:
                    // Log disposition
                    _a.sent();
                    return [3 /*break*/, 9];
                case 8:
                    error_6 = _a.sent();
                    console.error("Disposition failed for offer ".concat(offer.offer_id, ":"), error_6);
                    return [3 /*break*/, 9];
                case 9:
                    _i++;
                    return [3 /*break*/, 1];
                case 10: return [2 /*return*/, { black_market_listings: blackMarketListings, held_deals: heldDeals }];
            }
        });
    });
}
// Helper function to calculate file hash for duplicate detection
function calculateFileHash(data) {
    return __awaiter(this, void 0, void 0, function () {
        var encoder, dataBuffer, hashBuffer, hashArray, hashHex;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    encoder = new TextEncoder();
                    dataBuffer = encoder.encode(data);
                    return [4 /*yield*/, crypto.subtle.digest('SHA-256', dataBuffer)];
                case 1:
                    hashBuffer = _a.sent();
                    hashArray = Array.from(new Uint8Array(hashBuffer));
                    hashHex = hashArray.map(function (b) { return b.toString(16).padStart(2, '0'); }).join('');
                    return [2 /*return*/, hashHex];
            }
        });
    });
}
