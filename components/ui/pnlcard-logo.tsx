/**
 * PnLCard logo — inline SVG icon + wordmark.
 * The icon is a card shape with 3 bars (1 red loss, 2 green profit).
 * Renders at any size via the `size` prop which controls the icon height.
 */
export function PnLCardLogo({ size = 18, showText = true }: { size?: number; showText?: boolean }) {
  const iconW = size * (512 / 512);

  return (
    <span className="inline-flex items-center gap-1.5">
      <svg
        width={iconW}
        height={size}
        viewBox="0 0 512 512"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        className="flex-shrink-0"
      >
        <rect x="56" y="24" width="400" height="464" rx="80" fill="#f4f4f5" stroke="#d4d4d8" strokeWidth="12" />
        <rect x="120" y="296" width="72" height="144" rx="16" fill="#dc2626" opacity="0.85" />
        <rect x="220" y="228" width="72" height="212" rx="16" fill="#16a34a" opacity="0.9" />
        <rect x="320" y="140" width="72" height="300" rx="16" fill="#16a34a" />
      </svg>
      {showText && (
        <span className="font-bold tracking-tight">
          <span className="text-foreground">PnL</span>
          <span className="text-muted-foreground">Card</span>
        </span>
      )}
    </span>
  );
}
