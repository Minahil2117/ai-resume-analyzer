"use client";

import { useEffect, useState } from "react";

interface ScoreReadoutProps {
  score: number; // 0-100
}

function scoreColor(score: number): string {
  if (score >= 75) return "var(--color-teal)";
  if (score >= 50) return "var(--color-amber)";
  return "var(--color-rose)";
}

function scoreLabel(score: number): string {
  if (score >= 75) return "STRONG MATCH";
  if (score >= 50) return "PARTIAL MATCH";
  return "WEAK MATCH";
}

export default function ScoreReadout({ score }: ScoreReadoutProps) {
  const [display, setDisplay] = useState(0);
  const radius = 54;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Reset to 0 so the ring animates in fresh each time a new score arrives.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDisplay(0);
    const duration = 900;
    const start = performance.now();

    let frame: number;
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score]);

  const offset = circumference - (display / 100) * circumference;
  const color = scoreColor(score);

  return (
    <div className="flex items-center gap-5">
      <div className="relative h-32 w-32 shrink-0">
        <svg viewBox="0 0 128 128" className="h-full w-full -rotate-90">
          <circle cx="64" cy="64" r={radius} fill="none" stroke="var(--color-ink-700)" strokeWidth="8" />
          <circle
            cx="64"
            cy="64"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: "stroke 0.3s ease" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-mono text-3xl font-semibold text-text-primary">{display}</span>
          <span className="font-mono text-[10px] text-text-muted">/ 100</span>
        </div>
      </div>
      <div>
        <p className="font-mono text-xs tracking-widest" style={{ color }}>
          {scoreLabel(score)}
        </p>
        <p className="mt-1 font-display text-lg font-medium text-text-primary">ATS Match Score</p>
      </div>
    </div>
  );
}
