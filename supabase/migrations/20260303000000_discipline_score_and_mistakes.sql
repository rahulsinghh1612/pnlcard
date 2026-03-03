-- Replace mood_tag + execution_tag with discipline_score + mistake tags.
-- discipline_score: 1-5 integer (nullable) — how disciplined was the trader today
-- execution_tag is reused for mistake tags: overtraded, fomo_entry, no_stop_loss

-- 1. Add discipline_score column
ALTER TABLE public.trades
  ADD COLUMN IF NOT EXISTS discipline_score integer;

ALTER TABLE public.trades
  ADD CONSTRAINT trades_discipline_score_check
  CHECK (discipline_score IS NULL OR (discipline_score >= 1 AND discipline_score <= 5));

-- 2. Drop mood_tag column entirely
ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_mood_tag_check;

ALTER TABLE public.trades
  DROP COLUMN IF EXISTS mood_tag;

-- 3. Clear old execution_tag values that don't match the new allowed tags
UPDATE public.trades
  SET execution_tag = NULL
  WHERE execution_tag IS NOT NULL
    AND NOT (execution_tag ~ '^(overtraded|fomo_entry|no_stop_loss)(,(overtraded|fomo_entry|no_stop_loss))*$');

-- 4. Update execution_tag constraint to only allow new mistake tags
ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_execution_tag_check;

ALTER TABLE public.trades
  ADD CONSTRAINT trades_execution_tag_check
  CHECK (
    execution_tag IS NULL
    OR execution_tag ~ '^(overtraded|fomo_entry|no_stop_loss)(,(overtraded|fomo_entry|no_stop_loss))*$'
  );
