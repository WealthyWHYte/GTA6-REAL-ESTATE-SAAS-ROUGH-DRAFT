-- Add contacted tracking to property_analysis
-- This allows us to filter out properties that have already been contacted

ALTER TABLE public.property_analysis
ADD COLUMN IF NOT EXISTS contacted_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contacted_via TEXT CHECK (contacted_via IN ('email', 'call', 'text', 'mail')),
ADD COLUMN IF NOT EXISTS last_contact_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS contact_count INTEGER DEFAULT 0;

CREATE INDEX IF NOT EXISTS idx_property_analysis_contacted ON public.property_analysis(contacted_at) WHERE contacted_at IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.property_analysis.contacted_at IS 'Timestamp when the first outreach was sent to this property';
COMMENT ON COLUMN public.property_analysis.contact_count IS 'Total number of communications sent to this property';
