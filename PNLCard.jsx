import { useState } from "react";

/* ============ SHARED ============ */
function getStyles(isDark, isProfit) {
  const accent = isProfit
    ? isDark ? "#22c55e" : "#16a34a"
    : isDark ? "#ef4444" : "#dc2626";
  const accentDim = isProfit
    ? isDark ? "rgba(34,197,94,0.5)" : "rgba(22,163,74,0.3)"
    : isDark ? "rgba(239,68,68,0.5)" : "rgba(220,38,38,0.3)";
  const subtleGlow = isProfit
    ? isDark ? "rgba(34,197,94,0.08)" : "rgba(22,163,74,0.06)"
    : isDark ? "rgba(239,68,68,0.08)" : "rgba(220,38,38,0.06)";
  const pillBg = isProfit
    ? isDark ? "rgba(34,197,94,0.06)" : "rgba(22,163,74,0.05)"
    : isDark ? "rgba(239,68,68,0.06)" : "rgba(220,38,38,0.05)";
  const pillBorder = isProfit
    ? isDark ? "rgba(34,197,94,0.12)" : "rgba(22,163,74,0.1)"
    : isDark ? "rgba(239,68,68,0.12)" : "rgba(220,38,38,0.1)";
  const bg = isDark
    ? isProfit
      ? "linear-gradient(155deg, #09090b 0%, #071a0e 35%, #0a2a14 65%, #09090b 100%)"
      : "linear-gradient(155deg, #09090b 0%, #1a0708 35%, #2a0a0d 65%, #09090b 100%)"
    : isProfit
    ? "linear-gradient(155deg, #fafcfb 0%, #ecfdf3 35%, #d1fae0 65%, #fafcfb 100%)"
    : "linear-gradient(155deg, #fafcfb 0%, #fef2f2 35%, #fde2e4 65%, #fafcfb 100%)";
  const text1 = isDark ? "#e4e4e7" : "#18181b";
  const text3 = isDark ? "#71717a" : "#a1a1aa";
  const divider = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const cardBorder = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.08)";
  const lbl = { fontSize: 10, color: text3, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 500, marginBottom: 2 };
  return { accent, accentDim, subtleGlow, pillBg, pillBorder, bg, text1, text3, divider, cardBorder, lbl };
}

function Watermark({ text3, type, handle, isFree = true }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
      {!isFree && handle ? (
        <span style={{ fontSize: 13, color: text3, fontWeight: 500 }}>{handle}</span>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <div style={{ width: 15, height: 15, borderRadius: 4, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, fontWeight: 800, color: "#fff" }}>P</div>
          <span style={{ fontSize: 10, color: text3, fontWeight: 500 }}>PNLCard</span>
        </div>
      )}
      <span style={{ fontSize: 10, color: text3 }}>{type}</span>
    </div>
  );
}

function StreakDots({ streak, accent }) {
  if (streak < 5) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      <div style={{ display: "flex", gap: 3 }}>
        {Array.from({ length: Math.min(streak, 10) }).map((_, i) => (
          <div key={i} style={{ width: 6, height: 6, borderRadius: 3, background: accent, opacity: 0.3 + (i / Math.min(streak, 10)) * 0.7 }} />
        ))}
      </div>
      <span style={{ fontSize: 11, color: accent, fontWeight: 600 }}>{streak}d streak</span>
    </div>
  );
}

function CardShell({ isDark, isProfit, children }) {
  const s = getStyles(isDark, isProfit);
  return (
    <div style={{
      width: 370, height: 370, background: s.bg, borderRadius: 24,
      padding: "20px 26px 16px", display: "flex", flexDirection: "column",
      border: `1px solid ${s.cardBorder}`, position: "relative", overflow: "hidden",
      boxShadow: isDark ? "0 20px 50px rgba(0,0,0,0.5)" : "0 20px 50px rgba(0,0,0,0.08)",
    }}>
      <div style={{ position: "absolute", top: -60, right: -60, width: 180, height: 180, borderRadius: "50%", background: `radial-gradient(circle, ${s.subtleGlow}, transparent 70%)`, filter: "blur(50px)", pointerEvents: "none" }} />
      {children}
    </div>
  );
}

/* ============ DAILY ============ */
function DailyCard({ isDark, isProfit = true }) {
  const s = getStyles(isDark, isProfit);
  const d = isProfit
    ? { date: "12th Feb, 2026", trades: 3, pnl: "+21,294", charges: "553.89", netPnl: "+20,740.11", netRoi: "+0.73%", streak: 7 }
    : { date: "11th Feb, 2026", trades: 5, pnl: "-8,430", charges: "892.50", netPnl: "-9,322.50", netRoi: "-0.33%", streak: 0 };

  return (
    <CardShell isDark={isDark} isProfit={isProfit}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, color: s.text3 }}>{d.date}</span>
        <div style={{ background: s.pillBg, border: `1px solid ${s.pillBorder}`, borderRadius: 8, padding: "3px 10px" }}>
          <span style={{ fontSize: 12, color: s.text1, fontWeight: 600 }}>{d.trades} trades</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontSize: 13, color: s.text3, marginBottom: 14 }}>
          <span style={{ color: s.accentDim, fontWeight: 600 }}>{d.pnl}</span>
          <span> · charges {d.charges}</span>
        </div>
        <div style={s.lbl}>Net P/L (₹)</div>
        <div style={{ fontSize: 50, fontWeight: 800, color: s.accent, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 18 }}>{d.netPnl}</div>
        <div style={{ height: 1, background: s.divider, marginBottom: 14 }} />
        <div style={s.lbl}>Net ROI</div>
        <div style={{ fontSize: 42, fontWeight: 800, color: s.accent, letterSpacing: "-0.04em", lineHeight: 1 }}>{d.netRoi}</div>
      </div>

      <div>
        <StreakDots streak={d.streak} accent={s.accent} />
        <Watermark text3={s.text3} type="Daily Recap" />
      </div>
    </CardShell>
  );
}

/* ============ WEEKLY ============ */
function WeeklyCard({ isDark, isProfit = true }) {
  const s = getStyles(isDark, isProfit);
  const profitDays = [
    { day: "M", pnl: 12400, win: true },
    { day: "T", pnl: -3200, win: false },
    { day: "W", pnl: 8900, win: true },
    { day: "T", pnl: 21294, win: true },
    { day: "F", pnl: -1800, win: false },
  ];
  const lossDays = [
    { day: "M", pnl: -5600, win: false },
    { day: "T", pnl: 2100, win: true },
    { day: "W", pnl: -8900, win: false },
    { day: "T", pnl: -3400, win: false },
    { day: "F", pnl: 1200, win: true },
  ];
  const days = isProfit ? profitDays : lossDays;
  const maxPnl = Math.max(...days.map(d => Math.abs(d.pnl)));

  const d = isProfit
    ? { range: "10 – 16 Feb, 2026", wl: "3W · 2L", pnl: "+37,594", roi: "+1.32%", winRate: "60%", best: "Thu +21,294" }
    : { range: "3 – 9 Feb, 2026", wl: "2W · 3L", pnl: "-14,600", roi: "-0.51%", winRate: "40%", best: "Tue +2,100" };

  return (
    <CardShell isDark={isDark} isProfit={isProfit}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 13, color: s.text3 }}>{d.range}</span>
        <div style={{ background: s.pillBg, border: `1px solid ${s.pillBorder}`, borderRadius: 8, padding: "3px 10px" }}>
          <span style={{ fontSize: 12, color: s.text1, fontWeight: 600 }}>{d.wl}</span>
        </div>
      </div>

      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={s.lbl}>Net P/L (₹)</div>
        <div style={{ fontSize: 46, fontWeight: 800, color: s.accent, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8 }}>{d.pnl}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 20, marginBottom: 14 }}>
          <div>
            <div style={s.lbl}>Net ROI</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.accent, letterSpacing: "-0.03em", lineHeight: 1 }}>{d.roi}</div>
          </div>
          <div>
            <div style={s.lbl}>Win Rate</div>
            <div style={{ fontSize: 26, fontWeight: 800, color: s.accent, letterSpacing: "-0.03em", lineHeight: 1 }}>{d.winRate}</div>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 44 }}>
          {days.map((day, i) => {
            const height = Math.max((Math.abs(day.pnl) / maxPnl) * 36, 4);
            const barColor = day.win
              ? isDark ? "rgba(34,197,94,0.5)" : "rgba(22,163,74,0.4)"
              : isDark ? "rgba(239,68,68,0.5)" : "rgba(220,38,38,0.4)";
            return (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, flex: 1 }}>
                <div style={{ width: "100%", height, background: barColor, borderRadius: 3 }} />
                <span style={{ fontSize: 9, color: s.text3, fontWeight: 500 }}>{day.day}</span>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 8, fontSize: 11, color: s.text3 }}>
          Best day: <span style={{ color: s.accent, fontWeight: 600 }}>{d.best}</span>
        </div>
      </div>

      <Watermark text3={s.text3} type="Weekly Recap" />
    </CardShell>
  );
}

/* ============ MONTHLY (Option B — Calendar top + intensity + legend) ============ */
function MonthlyCard({ isDark, isProfit = true }) {
  const s = getStyles(isDark, isProfit);
  const emptyColor = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)";

  const calendarDays = [
    null, null, null, null, null, null, 1,
    2, 3, 4, 5, 6, 7, 8,
    9, 10, 11, 12, 13, 14, 15,
    16, 17, 18, 19, 20, 21, 22,
    23, 24, 25, 26, 27, 28, null,
  ];
  const profitTradeData = {
    2: 8400, 3: 12600, 4: -3200, 5: 5800, 6: 15200,
    9: 24800, 10: -8200, 11: 6400, 12: 18900, 13: -4100,
    16: 21300, 17: 9800, 18: 14200, 19: -6700, 20: 11500,
    23: 7200, 24: 16800, 25: -5400, 26: 13100, 27: 10600,
  };
  const lossTradeData = {
    2: -9200, 3: 4100, 4: -12400, 5: -3800, 6: 8200,
    9: -15600, 10: -7200, 11: 5400, 12: -4600, 13: -11800,
    16: 6800, 17: -8400, 18: -3200, 19: -10200, 20: 7600,
    23: -6400, 24: 3800, 25: -9800, 26: -5200, 27: 4200,
  };
  const tradeData = isProfit ? profitTradeData : lossTradeData;
  const values = Object.values(tradeData).map(Math.abs);
  const maxVal = Math.max(...values);

  function getCellColor(day) {
    if (!tradeData[day]) return emptyColor;
    const pnl = tradeData[day];
    const intensity = Math.abs(pnl) / maxVal;
    const minOpacity = 0.15;
    const maxOpacity = 0.75;
    const opacity = minOpacity + intensity * (maxOpacity - minOpacity);
    if (pnl > 0) {
      return isDark ? `rgba(34,197,94,${opacity})` : `rgba(22,163,74,${opacity})`;
    } else {
      return isDark ? `rgba(239,68,68,${opacity})` : `rgba(220,38,38,${opacity})`;
    }
  }

  const d = isProfit
    ? { month: "February 2026", wl: "14W · 5L", pnl: "+1,87,420", roi: "+6.58%", winRate: "73.7%", best: "16th · +24,800", worst: "4th · -8,200" }
    : { month: "January 2026", wl: "6W · 13L", pnl: "-42,680", roi: "-1.50%", winRate: "31.6%", best: "16th · +8,200", worst: "9th · -12,400" };

  return (
    <CardShell isDark={isDark} isProfit={isProfit}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 14, color: s.text1, fontWeight: 600 }}>{d.month}</span>
        <div style={{ background: s.pillBg, border: `1px solid ${s.pillBorder}`, borderRadius: 8, padding: "2px 9px" }}>
          <span style={{ fontSize: 11, color: s.text1, fontWeight: 600 }}>{d.wl}</span>
        </div>
      </div>

      {/* Calendar heatmap — TOP with intensity */}
      <div style={{ marginBottom: 4 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 3, width: "100%" }}>
          {["M", "T", "W", "T", "F", "S", "S"].map((day, i) => (
            <div key={`h${i}`} style={{ height: 12, fontSize: 8, color: s.text3, textAlign: "center", fontWeight: 600, display: "flex", alignItems: "center", justifyContent: "center" }}>{day}</div>
          ))}
          {calendarDays.map((day, i) => {
            if (day === null) return <div key={i} style={{ height: 22 }} />;
            const c = getCellColor(day);
            return <div key={i} style={{ height: 22, borderRadius: 4, background: c }} />;
          })}
        </div>
        {/* Best/Worst legend */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: 5 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: isDark ? "rgba(34,197,94,0.7)" : "rgba(22,163,74,0.6)" }} />
            <span style={{ fontSize: 10, color: isDark ? "#22c55e" : "#16a34a", fontWeight: 600 }}>Best: {d.best}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: 2, background: isDark ? "rgba(239,68,68,0.7)" : "rgba(220,38,38,0.6)" }} />
            <span style={{ fontSize: 10, color: isDark ? "#ef4444" : "#dc2626", fontWeight: 600 }}>Worst: {d.worst}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: s.divider, marginBottom: 8 }} />

      {/* Hero numbers */}
      <div style={{ marginBottom: 4 }}>
        <div style={s.lbl}>Net P/L (₹)</div>
        <div style={{ fontSize: 36, fontWeight: 800, color: s.accent, letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 6 }}>{d.pnl}</div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 18 }}>
          <div>
            <div style={s.lbl}>Net ROI</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.accent, letterSpacing: "-0.03em", lineHeight: 1 }}>{d.roi}</div>
          </div>
          <div>
            <div style={s.lbl}>Win Rate</div>
            <div style={{ fontSize: 20, fontWeight: 800, color: s.accent, letterSpacing: "-0.03em", lineHeight: 1 }}>{d.winRate}</div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Watermark text3={s.text3} type="Monthly Recap" />
    </CardShell>
  );
}

/* ============ MAIN ============ */
export default function PNLCardFinal() {
  const [theme, setTheme] = useState("light");
  const [cardType, setCardType] = useState("daily");
  const [pnl, setPnl] = useState("profit");
  const isDark = theme === "dark";
  const isProfit = pnl === "profit";

  return (
    <div className={`min-h-screen flex flex-col items-center ${isDark ? "bg-zinc-950 text-white" : "bg-zinc-100 text-zinc-900"}`} style={{ padding: "28px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 4 }}>
          <div style={{ width: 26, height: 26, borderRadius: 7, background: "linear-gradient(135deg, #3b82f6, #8b5cf6)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, color: "#fff" }}>P</div>
          <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-0.02em" }}>PNLCard</h1>
        </div>
        <p style={{ fontSize: 13, color: "#71717a" }}>Final card designs — all types</p>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 8, justifyContent: "center" }}>
        {["light", "dark"].map((t) => (
          <button key={t} onClick={() => setTheme(t)} style={{ padding: "4px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: "1px solid", borderColor: theme === t ? "#3b82f6" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)", background: theme === t ? "rgba(59,130,246,0.1)" : "transparent", color: theme === t ? "#3b82f6" : "#71717a", cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, justifyContent: "center" }}>
        {["daily", "weekly", "monthly"].map((t) => (
          <button key={t} onClick={() => setCardType(t)} style={{ padding: "5px 16px", borderRadius: 8, fontSize: 12, fontWeight: 600, border: "1px solid", borderColor: cardType === t ? "#3b82f6" : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)", background: cardType === t ? "rgba(59,130,246,0.1)" : "transparent", color: cardType === t ? "#3b82f6" : "#71717a", cursor: "pointer", textTransform: "capitalize" }}>{t}</button>
        ))}
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 28, justifyContent: "center" }}>
        {["profit", "loss"].map((p) => (
          <button key={p} onClick={() => setPnl(p)} style={{ padding: "4px 14px", borderRadius: 8, fontSize: 12, fontWeight: 500, border: "1px solid", borderColor: pnl === p ? (p === "profit" ? "#22c55e" : "#ef4444") : isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.1)", background: pnl === p ? (p === "profit" ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)") : "transparent", color: pnl === p ? (p === "profit" ? "#22c55e" : "#ef4444") : "#71717a", cursor: "pointer", textTransform: "capitalize" }}>{p}</button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "center" }}>
        {cardType === "daily" && <DailyCard isDark={isDark} isProfit={isProfit} />}
        {cardType === "weekly" && <WeeklyCard isDark={isDark} isProfit={isProfit} />}
        {cardType === "monthly" && <MonthlyCard isDark={isDark} isProfit={isProfit} />}
      </div>
    </div>
  );
}