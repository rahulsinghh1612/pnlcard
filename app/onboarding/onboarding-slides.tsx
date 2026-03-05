"use client";

import { useState, useEffect } from "react";

const SLIDES = [
  {
    title: "Best traders track their behaviour",
    body: "Log daily. See patterns.",
  },
  {
    title: "Patterns become obvious",
    body: "Trends appear at a glance.",
  },
  {
    title: "Discipline vs profit becomes clear",
    body: "Discipline meets profit.",
  },
];

function LineChartVisual() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
      <polyline
        points="10,80 50,55 90,65 130,30 170,20 190,35"
        stroke="rgb(16,185,129)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="animate-pnl-draw"
        style={{ strokeDasharray: 300, "--line-length": 300 } as React.CSSProperties}
      />
      {[
        { cx: 10, cy: 80, delay: "0.4s" },
        { cx: 50, cy: 55, delay: "0.6s" },
        { cx: 90, cy: 65, delay: "0.8s" },
        { cx: 130, cy: 30, delay: "1.0s" },
        { cx: 170, cy: 20, delay: "1.2s" },
        { cx: 190, cy: 35, delay: "1.4s" },
      ].map((dot, i) => (
        <circle
          key={i}
          cx={dot.cx}
          cy={dot.cy}
          r="4"
          fill="rgb(16,185,129)"
          className="animate-pnl-dot"
          style={{ animationDelay: dot.delay }}
        />
      ))}
      <line x1="10" y1="90" x2="190" y2="90" stroke="hsl(0 0% 90%)" strokeWidth="1" />
    </svg>
  );
}

function HeatmapVisual() {
  const cells = Array.from({ length: 25 }, (_, i) => {
    const row = Math.floor(i / 5);
    const col = i % 5;
    const isGreen = [0, 2, 5, 7, 8, 10, 12, 14, 16, 18, 20, 22, 24].includes(i);
    const isRed = [3, 6, 11, 19].includes(i);
    const fill = isGreen
      ? "rgb(187,247,208)"
      : isRed
        ? "rgb(254,202,202)"
        : "rgb(243,244,246)";
    return { row, col, fill, delay: i * 0.04 };
  });

  return (
    <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
      {cells.map((c, i) => (
        <rect
          key={i}
          x={20 + c.col * 34}
          y={5 + c.row * 19}
          width="28"
          height="14"
          rx="3"
          fill={c.fill}
          className="onboarding-cell-in"
          style={{ animationDelay: `${c.delay}s` }}
        />
      ))}
    </svg>
  );
}

function BarChartVisual() {
  return (
    <svg viewBox="0 0 200 100" className="w-full h-full" fill="none">
      <text
        x="15"
        y="28"
        fontSize="10"
        fill="hsl(0 0% 45%)"
        fontFamily="sans-serif"
        className="onboarding-label-in"
        style={{ animationDelay: "0.1s" }}
      >
        Discipline
      </text>
      <g transform="translate(80, 18)">
        <rect
          x="0"
          y="0"
          width="100"
          height="14"
          rx="4"
          fill="rgb(16,185,129)"
          className="onboarding-bar-scale"
        />
      </g>
      <text
        x="15"
        y="62"
        fontSize="10"
        fill="hsl(0 0% 45%)"
        fontFamily="sans-serif"
        className="onboarding-label-in"
        style={{ animationDelay: "0.25s" }}
      >
        Profit
      </text>
      <g transform="translate(80, 52)">
        <rect
          x="0"
          y="0"
          width="75"
          height="14"
          rx="4"
          fill="rgb(74,222,128)"
          className="onboarding-bar-scale"
          style={{ animationDelay: "0.35s" }}
        />
      </g>
      <line x1="80" y1="8" x2="80" y2="78" stroke="hsl(0 0% 90%)" strokeWidth="1" opacity="0.6" />
    </svg>
  );
}

const VISUALS = [LineChartVisual, HeatmapVisual, BarChartVisual];

interface OnboardingSlidesProps {
  onComplete: () => void;
}

export function OnboardingSlides({ onComplete }: OnboardingSlidesProps) {
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<"enter" | "exit">("enter");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setDirection("enter");
    setVisible(true);
  }, [current]);

  const handleNext = () => {
    if (current === SLIDES.length - 1) {
      finish();
      return;
    }
    setDirection("exit");
    setVisible(false);
    setTimeout(() => {
      setCurrent((c) => c + 1);
    }, 250);
  };

  const handlePrev = () => {
    if (current === 0) return;
    setDirection("exit");
    setVisible(false);
    setTimeout(() => {
      setCurrent((c) => c - 1);
    }, 250);
  };

  const finish = () => {
    try {
      localStorage.setItem("pnlcard_onboarding_slides_done", "true");
    } catch {}
    onComplete();
  };

  const slide = SLIDES[current];
  const Visual = VISUALS[current];
  const isLast = current === SLIDES.length - 1;

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-full transition-all duration-250 ease-out ${
          visible && direction === "enter"
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-6"
        }`}
      >
        <div className="mx-auto mb-6 w-full max-w-[280px]">
          <div className="h-40 w-full rounded-xl bg-muted/40 border border-border p-4 flex items-center justify-center">
            <Visual />
          </div>
        </div>

        <h2 className="text-lg font-semibold text-foreground text-center leading-snug">
          {slide.title}
        </h2>
        <p className="mt-2 text-sm text-muted-foreground text-center leading-relaxed">
          {slide.body}
        </p>
      </div>

      <div className="relative mt-6 flex w-full items-center justify-center">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handlePrev}
            disabled={current === 0}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2"
            aria-label="Previous slide"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
          </button>
          <span className="min-w-[2rem] text-center text-xs text-muted-foreground">
            {current + 1}/{SLIDES.length}
          </span>
          <button
            type="button"
            onClick={handleNext}
            className={`flex h-8 items-center justify-center rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 ${
              isLast
                ? "min-w-[4.5rem] border border-slate-300 bg-white px-3 text-xs font-semibold text-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-muted hover:shadow-md active:translate-y-0 active:scale-[0.98]"
                : "w-8 shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
            aria-label={isLast ? "Start setup" : "Next slide"}
          >
            {isLast ? (
              <span>Start setup</span>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
            )}
          </button>
        </div>
        <button
          type="button"
          onClick={finish}
          className="absolute right-0 text-xs text-muted-foreground transition-colors hover:text-foreground"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
