-- Admin visibility: service role can read all assessments (bypasses RLS)
-- This lets you query all user data from the Supabase dashboard or a future admin panel
-- without touching user-facing RLS policies.

ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;

-- Index for fast admin queries by user and date
CREATE INDEX IF NOT EXISTS assessments_user_id_idx ON public.assessments (user_id);
CREATE INDEX IF NOT EXISTS assessments_created_at_idx ON public.assessments (created_at DESC);
CREATE INDEX IF NOT EXISTS assessments_risk_tier_idx ON public.assessments (risk_tier);
