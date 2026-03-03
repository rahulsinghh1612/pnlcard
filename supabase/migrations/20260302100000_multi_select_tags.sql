-- Allow multi-select tags stored as comma-separated values.
-- Drop the old single-value CHECK constraints and replace with
-- a regex that validates each comma-separated token.

-- Drop old execution_tag constraint
ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_execution_tag_check;

-- Drop old mood_tag constraint
ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_mood_tag_check;

-- New constraint: each comma-separated value must be a known execution tag
ALTER TABLE public.trades
  ADD CONSTRAINT trades_execution_tag_check
  CHECK (
    execution_tag IS NULL
    OR execution_tag ~ '^(followed_plan|overtraded|revenge_traded|fomo_entry|cut_early)(,(followed_plan|overtraded|revenge_traded|fomo_entry|cut_early))*$'
  );

-- New constraint: each comma-separated value must be a known mood tag
ALTER TABLE public.trades
  ADD CONSTRAINT trades_mood_tag_check
  CHECK (
    mood_tag IS NULL
    OR mood_tag ~ '^(calm|confident|anxious|frustrated|tired)(,(calm|confident|anxious|frustrated|tired))*$'
  );
