-- ============================================================================
-- Complete CRM Features Migration
-- Adds: Tags, Notes, Attachments, Snooze/Archive, Email Threading, Activity Timeline
-- ============================================================================

-- ============================================================================
-- 1. PROPERTY TAGS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property_tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  tag_name TEXT NOT NULL,
  color TEXT DEFAULT '#6366f1',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(account_id, tag_name)
);

CREATE TABLE IF NOT EXISTS public.property_tag_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT NOT NULL,
  tag_id UUID NOT NULL REFERENCES public.property_tags(id) ON DELETE CASCADE,
  account_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(property_id, tag_id)
);

CREATE INDEX idx_property_tags_account ON public.property_tags(account_id);
CREATE INDEX idx_property_tag_assignments_property ON public.property_tag_assignments(property_id);
CREATE INDEX idx_property_tag_assignments_tag ON public.property_tag_assignments(tag_id);

-- ============================================================================
-- 2. PERSISTENT NOTES SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.property_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  property_id TEXT NOT NULL,
  content TEXT NOT NULL,
  note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'showing', 'negotiation', 'inspection', 'repair', 'other')),
  is_persistent BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_property_notes_account ON public.property_notes(account_id);
CREATE INDEX idx_property_notes_property ON public.property_notes(property_id);
CREATE INDEX idx_property_notes_type ON public.property_notes(note_type);

-- ============================================================================
-- 3. ATTACHMENTS SYSTEM
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('property', 'offer', 'communication', 'contract', 'note')),
  entity_id TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  storage_bucket TEXT DEFAULT 'attachments',
  storage_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_attachments_account ON public.attachments(account_id);
CREATE INDEX idx_attachments_entity ON public.attachments(entity_type, entity_id);

-- ============================================================================
-- 4. SNOOZE/ARCHIVE FOR PROPERTIES
-- ============================================================================

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS snoozed_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS snooze_reason TEXT,
ADD COLUMN IF NOT EXISTS archived BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS archived_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS archived_by UUID;

CREATE INDEX idx_properties_snoozed ON public.properties(snoozed_until) WHERE snoozed_until IS NOT NULL;
CREATE INDEX idx_properties_archived ON public.properties(archived) WHERE archived = TRUE;

-- ============================================================================
-- 5. EMAIL THREADING FOR COMMUNICATIONS
-- ============================================================================

ALTER TABLE communications
ADD COLUMN IF NOT EXISTS thread_id UUID,
ADD COLUMN IF NOT EXISTS in_reply_to_message_id TEXT,
ADD COLUMN IF NOT EXISTS references_header TEXT[],
ADD COLUMN IF NOT EXISTS parent_comm_id UUID REFERENCES communications(id),
ADD COLUMN IF NOT EXISTS gmail_thread_id TEXT;

CREATE INDEX idx_communications_thread ON communications(thread_id);
CREATE INDEX idx_communications_parent ON communications(parent_comm_id);

-- ============================================================================
-- 6. ACTIVITY TIMELINE ENHANCEMENTS
-- ============================================================================

-- Check if activity_log exists and add columns
DO $$
BEGIN
  -- Add activity_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'activity_type') THEN
    ALTER TABLE public.activity_log ADD COLUMN activity_type TEXT;
  END IF;

  -- Add thread_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'thread_id') THEN
    ALTER TABLE public.activity_log ADD COLUMN thread_id UUID;
  END IF;

  -- Add related_entity_type if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'related_entity_type') THEN
    ALTER TABLE public.activity_log ADD COLUMN related_entity_type TEXT;
  END IF;

  -- Add related_entity_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'activity_log' AND column_name = 'related_entity_id') THEN
    ALTER TABLE public.activity_log ADD COLUMN related_entity_id TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_activity_log_type ON public.activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_thread ON public.activity_log(thread_id);

-- ============================================================================
-- 7. DEAL OUTCOME TRACKING (Win/Loss Analysis)
-- ============================================================================

ALTER TABLE public.properties
ADD COLUMN IF NOT EXISTS deal_outcome TEXT CHECK (deal_outcome IN ('won', 'lost', 'withdrawn')),
ADD COLUMN IF NOT EXISTS deal_outcome_reason TEXT,
ADD COLUMN IF NOT EXISTS deal_outcome_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS deal_outcome_details JSONB;

CREATE INDEX idx_properties_outcome ON public.properties(deal_outcome) WHERE deal_outcome IS NOT NULL;

-- ============================================================================
-- 8. CALENDAR EVENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('showing', 'inspection', 'closing', 'call', 'meeting', 'follow_up', 'deadline', 'other')),
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  all_day BOOLEAN DEFAULT FALSE,
  property_id TEXT,
  offer_id TEXT,
  contact_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  google_event_id TEXT,
  google_calendar_id TEXT,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  reminder_minutes INTEGER DEFAULT 30,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_calendar_events_account ON public.calendar_events(account_id);
CREATE INDEX idx_calendar_events_start ON public.calendar_events(start_time);
CREATE INDEX idx_calendar_events_property ON public.calendar_events(property_id);
CREATE INDEX idx_calendar_events_google ON public.calendar_events(google_event_id) WHERE google_event_id IS NOT NULL;

-- ============================================================================
-- 9. TASKS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'done', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  property_id TEXT,
  offer_id TEXT,
  assigned_to UUID,
  created_by UUID NOT NULL,
  recurrence_rule TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tasks_account ON public.tasks(account_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_due_date ON public.tasks(due_date);
CREATE INDEX idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX idx_tasks_property ON public.tasks(property_id);

-- ============================================================================
-- 10. TEAM MANAGEMENT TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  email TEXT NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended', 'removed')),
  invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  joined_at TIMESTAMP WITH TIME ZONE,
  invited_by UUID,
  UNIQUE(account_id, email)
);

CREATE TABLE IF NOT EXISTS public.team_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  role TEXT NOT NULL,
  permission TEXT NOT NULL,
  granted BOOLEAN DEFAULT TRUE,
  UNIQUE(account_id, role, permission)
);

CREATE INDEX idx_team_members_account ON public.team_members(account_id);
CREATE INDEX idx_team_members_status ON public.team_members(status);

-- Default permissions for roles
INSERT INTO public.team_permissions (account_id, role, permission, granted) VALUES
  (NULL, 'owner', 'manage_team', TRUE),
  (NULL, 'owner', 'manage_deals', TRUE),
  (NULL, 'owner', 'send_offers', TRUE),
  (NULL, 'owner', 'view_all', TRUE),
  (NULL, 'admin', 'manage_deals', TRUE),
  (NULL, 'admin', 'send_offers', TRUE),
  (NULL, 'admin', 'view_all', TRUE),
  (NULL, 'member', 'manage_deals', TRUE),
  (NULL, 'member', 'send_offers', TRUE),
  (NULL, 'member', 'view_all', FALSE),
  (NULL, 'viewer', 'view_all', FALSE)
ON CONFLICT (account_id, role, permission) DO NOTHING;

-- ============================================================================
-- 11. DOCUSIGN ENVELOPES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.docusign_envelopes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  envelope_id TEXT,
  property_id TEXT,
  offer_id TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'signed', 'completed', 'declined', 'voided')),
  document_name TEXT NOT NULL,
  document_url TEXT,
  signers JSONB NOT NULL DEFAULT '[]',
  sent_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  declined_at TIMESTAMP WITH TIME ZONE,
  declined_reason TEXT,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_docusign_envelopes_account ON public.docusign_envelopes(account_id);
CREATE INDEX idx_docusign_envelopes_status ON public.docusign_envelopes(status);
CREATE INDEX idx_docusign_envelopes_property ON public.docusign_envelopes(property_id);

-- ============================================================================
-- 12. AUTO-RESPONSE RULES TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.auto_response_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id UUID NOT NULL,
  name TEXT NOT NULL,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('subject_contains', 'body_contains', 'pain_point_detected', 'objection_detected', 'sender_match')),
  trigger_value TEXT NOT NULL,
  response_template_id UUID REFERENCES public.email_templates(id),
  response_body TEXT,
  action_type TEXT NOT NULL CHECK (action_type IN ('auto_draft', 'auto_send', 'notify_only')),
  active BOOLEAN DEFAULT TRUE,
  priority INTEGER DEFAULT 0,
  match_count INTEGER DEFAULT 0,
  last_matched_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_auto_response_rules_account ON public.auto_response_rules(account_id);
CREATE INDEX idx_auto_response_rules_active ON public.auto_response_rules(active) WHERE active = TRUE;

-- ============================================================================
-- STORAGE BUCKET FOR ATTACHMENTS
-- ============================================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('attachments', 'attachments', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Users can upload attachments" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'attachments' AND
    EXISTS (SELECT 1 FROM public.accounts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can access their attachments" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'attachments' AND
    EXISTS (SELECT 1 FROM public.accounts WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their attachments" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'attachments' AND
    EXISTS (SELECT 1 FROM public.accounts WHERE user_id = auth.uid())
  );

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Property Tags
ALTER TABLE public.property_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_tag_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tags_select" ON public.property_tags FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "tags_insert" ON public.property_tags FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "tags_update" ON public.property_tags FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "tags_delete" ON public.property_tags FOR DELETE USING (account_id = auth.uid());

CREATE POLICY "tag_assignments_select" ON public.property_tag_assignments FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "tag_assignments_insert" ON public.property_tag_assignments FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "tag_assignments_delete" ON public.property_tag_assignments FOR DELETE USING (account_id = auth.uid());

-- Property Notes
ALTER TABLE public.property_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notes_select" ON public.property_notes FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "notes_insert" ON public.property_notes FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "notes_update" ON public.property_notes FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "notes_delete" ON public.property_notes FOR DELETE USING (account_id = auth.uid());

-- Attachments
ALTER TABLE public.attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attachments_select" ON public.attachments FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "attachments_insert" ON public.attachments FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "attachments_update" ON public.attachments FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "attachments_delete" ON public.attachments FOR DELETE USING (account_id = auth.uid());

-- Calendar Events
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "events_select" ON public.calendar_events FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "events_insert" ON public.calendar_events FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "events_update" ON public.calendar_events FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "events_delete" ON public.calendar_events FOR DELETE USING (account_id = auth.uid());

-- Tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (account_id = auth.uid());

-- Team Members
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_members_select" ON public.team_members FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "team_members_insert" ON public.team_members FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "team_members_update" ON public.team_members FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "team_members_delete" ON public.team_members FOR DELETE USING (account_id = auth.uid());

CREATE POLICY "team_permissions_select" ON public.team_permissions FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "team_permissions_insert" ON public.team_permissions FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "team_permissions_update" ON public.team_permissions FOR UPDATE USING (account_id = auth.uid());

-- DocuSign Envelopes
ALTER TABLE public.docusign_envelopes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "envelopes_select" ON public.docusign_envelopes FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "envelopes_insert" ON public.docusign_envelopes FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "envelopes_update" ON public.docusign_envelopes FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "envelopes_delete" ON public.docusign_envelopes FOR DELETE USING (account_id = auth.uid());

-- Auto Response Rules
ALTER TABLE public.auto_response_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rules_select" ON public.auto_response_rules FOR SELECT USING (account_id = auth.uid());
CREATE POLICY "rules_insert" ON public.auto_response_rules FOR INSERT WITH CHECK (account_id = auth.uid());
CREATE POLICY "rules_update" ON public.auto_response_rules FOR UPDATE USING (account_id = auth.uid());
CREATE POLICY "rules_delete" ON public.auto_response_rules FOR DELETE USING (account_id = auth.uid());

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_property_notes_updated_at BEFORE UPDATE ON public.property_notes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_docusign_envelopes_updated_at BEFORE UPDATE ON public.docusign_envelopes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auto_response_rules_updated_at BEFORE UPDATE ON public.auto_response_rules
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to get current account ID
CREATE OR REPLACE FUNCTION get_current_account_id()
RETURNS UUID AS $$
BEGIN
  RETURN (
    SELECT id FROM public.accounts
    WHERE user_id = auth.uid()
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to archive a property
CREATE OR REPLACE FUNCTION archive_property(p_property_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.properties
  SET archived = TRUE,
      archived_at = NOW(),
      archived_by = auth.uid()
  WHERE property_id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unarchive a property
CREATE OR REPLACE FUNCTION unarchive_property(p_property_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.properties
  SET archived = FALSE,
      archived_at = NULL,
      archived_by = NULL
  WHERE property_id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to snooze a property
CREATE OR REPLACE FUNCTION snooze_property(p_property_id TEXT, p_until TIMESTAMP WITH TIME ZONE, p_reason TEXT DEFAULT NULL)
RETURNS VOID AS $$
BEGIN
  UPDATE public.properties
  SET snoozed_until = p_until,
      snooze_reason = p_reason
  WHERE property_id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to unsnooze a property
CREATE OR REPLACE FUNCTION unsnooze_property(p_property_id TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE public.properties
  SET snoozed_until = NULL,
      snooze_reason = NULL
  WHERE property_id = p_property_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- SEED DATA: DEFAULT TAGS
-- ============================================================================

INSERT INTO public.property_tags (account_id, tag_name, color) VALUES
  (NULL, 'Hot Lead', '#ef4444'),
  (NULL, 'Price Objection', '#f59e0b'),
  (NULL, 'Needs Proof of Funds', '#3b82f6'),
  (NULL, 'Motivated Seller', '#10b981'),
  (NULL, 'Investor Owned', '#8b5cf6'),
  (NULL, 'FSBO', '#ec4899'),
  (NULL, 'Already Listed', '#6b7280'),
  (NULL, 'Follow Up', '#14b8a6')
ON CONFLICT (account_id, tag_name) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================

SELECT '✅ CRM Features Migration Complete!' as status,
       'Tables created: property_tags, property_tag_assignments, property_notes, attachments, calendar_events, tasks, team_members, team_permissions, docusign_envelopes, auto_response_rules' as summary,
       'Columns added to properties: snoozed_until, snooze_reason, archived, archived_at, archived_by, deal_outcome, deal_outcome_reason, deal_outcome_date, deal_outcome_details' as property_changes,
       'Columns added to communications: thread_id, in_reply_to_message_id, references_header, parent_comm_id, gmail_thread_id' as communications_changes;
