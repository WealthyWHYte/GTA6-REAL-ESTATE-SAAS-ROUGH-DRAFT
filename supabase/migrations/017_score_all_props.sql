-- Direct SQL function to score all properties for a user
-- Run this in Supabase SQL Editor

-- Create the scoring function
CREATE OR REPLACE FUNCTION score_all_properties(p_account_id UUID)
RETURNS JSONB AS $$
DECLARE
  prop RECORD;
  score INT;
  strategy VARCHAR(50);
  offer_price NUMERIC;
  offer_percent INT;
  equity_percent NUMERIC;
  dom INT;
  listing_price NUMERIC;
  estimated_value NUMERIC;
  mortgage_balance NUMERIC;
  count_processed INT := 0;
  result JSONB := '[]'::JSONB;
BEGIN
  -- Loop through all properties for this account
  FOR prop IN 
    SELECT property_id, listing_price, estimated_value, estimated_equity, 
           days_on_market, mortgage_balance
    FROM properties 
    WHERE account_id = p_account_id
  LOOP
    -- Calculate equity percent
    IF prop.estimated_value > 0 THEN
      equity_percent := (prop.estimated_equity / prop.estimated_value) * 100;
    ELSE
      equity_percent := 0;
    END IF;
    
    dom := COALESCE(prop.days_on_market, 0);
    listing_price := COALESCE(prop.listing_price, 0);
    estimated_value := COALESCE(prop.estimated_value, listing_price);
    mortgage_balance := COALESCE(prop.mortgage_balance, 0);
    
    -- Calculate score (0-10)
    score := 0;
    
    -- Equity scoring (0-4 points)
    IF equity_percent >= 50 THEN score := score + 4;
    ELSIF equity_percent >= 30 THEN score := score + 3;
    ELSIF equity_percent >= 20 THEN score := score + 2;
    ELSIF equity_percent >= 10 THEN score := score + 1;
    END IF;
    
    -- DOM scoring (0-3 points)
    IF dom >= 120 THEN score := score + 3;
    ELSIF dom >= 90 THEN score := score + 2;
    ELSIF dom >= 60 THEN score := score + 1;
    END IF;
    
    -- Free & clear bonus
    IF mortgage_balance = 0 THEN
      score := score + 2;
    ELSIF mortgage_balance > 0 AND equity_percent >= 30 THEN
      score := score + 2;
    END IF;
    
    -- Price discount
    IF estimated_value > listing_price THEN
      IF ((estimated_value - listing_price) / estimated_value) * 100 >= 25 THEN
        score := score + 2;
      ELSIF ((estimated_value - listing_price) / estimated_value) * 100 >= 15 THEN
        score := score + 1;
      END IF;
    END IF;
    
    score := LEAST(score, 10);
    
    -- Determine strategy
    IF mortgage_balance = 0 THEN
      strategy := 'Seller Finance';
      offer_percent := CASE WHEN equity_percent >= 50 THEN 65 ELSE 75 END;
    ELSIF mortgage_balance > 0 AND equity_percent >= 30 THEN
      strategy := 'Subject-To';
      offer_percent := 80;
    ELSE
      strategy := 'Wholesale';
      offer_percent := 70;
    END IF;
    
    offer_price := ROUND(listing_price * (offer_percent / 100.0));
    
    -- Upsert into property_analysis
    INSERT INTO property_analysis (
      account_id, property_id, win_win_score, strategy, 
      offer_price, offer_percent, reasoning, recommendation, analyzed_at
    ) VALUES (
      p_account_id, prop.property_id, score, strategy,
      offer_price, offer_percent, 
      'Score ' || score || '/10 - ' || ROUND(equity_percent) || '% equity, ' || dom || ' days on market',
      CASE WHEN score >= 7 THEN 'STRONG DEAL' WHEN score >= 5 THEN 'GOOD DEAL' ELSE 'WEAK DEAL' END,
      NOW()
    ) ON CONFLICT (account_id, property_id) DO UPDATE SET
      win_win_score = score,
      strategy = strategy,
      offer_price = offer_price,
      offer_percent = offer_percent,
      reasoning = 'Score ' || score || '/10 - ' || ROUND(equity_percent) || '% equity, ' || dom || ' days on market',
      recommendation = CASE WHEN score >= 7 THEN 'STRONG DEAL' WHEN score >= 5 THEN 'GOOD DEAL' ELSE 'WEAK DEAL' END,
      analyzed_at = NOW();
    
    count_processed := count_processed + 1;
  END LOOP;
  
  RETURN jsonb_build_object(
    'success', true,
    'properties_scored', count_processed
  );
END;
$$ LANGUAGE plpgsql;

-- Run it for your account
SELECT score_all_properties((SELECT id FROM auth.users ORDER BY created_at DESC LIMIT 1));

-- Check results
SELECT 
  count(*) as total_scored,
  sum(CASE WHEN win_win_score >= 7 THEN 1 ELSE 0 END) as strong_deals,
  sum(CASE WHEN win_win_score >= 5 AND win_win_score < 7 THEN 1 ELSE 0 END) as good_deals,
  sum(CASE WHEN win_win_score < 5 THEN 1 ELSE 0 END) as weak_deals
FROM property_analysis;
