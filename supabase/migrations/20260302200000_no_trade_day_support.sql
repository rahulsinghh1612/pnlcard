-- Support "No Trade" days (num_trades = 0) and rest-day execution tags.

-- Relax num_trades from >= 1 to >= 0
ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_num_trades_check;

ALTER TABLE public.trades
  ADD CONSTRAINT trades_num_trades_check
  CHECK (num_trades >= 0);

-- Update execution_tag constraint to include rest-day tags
ALTER TABLE public.trades
  DROP CONSTRAINT IF EXISTS trades_execution_tag_check;

ALTER TABLE public.trades
  ADD CONSTRAINT trades_execution_tag_check
  CHECK (
    execution_tag IS NULL
    OR execution_tag ~ '^(followed_plan|overtraded|revenge_traded|fomo_entry|cut_early|stayed_out|avoided_fomo)(,(followed_plan|overtraded|revenge_traded|fomo_entry|cut_early|stayed_out|avoided_fomo))*$'
  );
