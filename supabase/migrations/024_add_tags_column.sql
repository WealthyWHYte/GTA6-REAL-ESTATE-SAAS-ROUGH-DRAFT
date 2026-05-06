-- Add tags column to property_analysis for labeling deals
ALTER TABLE property_analysis 
ADD COLUMN IF NOT EXISTS tags TEXT[];