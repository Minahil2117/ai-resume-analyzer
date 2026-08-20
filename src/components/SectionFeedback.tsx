import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { SectionFeedback as SectionFeedbackItem } from "@/lib/types";

const RATING_CONFIG = {
  strong: { icon: CheckCircle2, color: "var(--color-teal)", label: "Strong" },
  "needs-work": { icon: AlertTriangle, color: "var(--color-amber)", label: "Needs work" },
  missing: { icon: XCircle, color: "var(--color-rose)", label: "Missing" },
} as const;

export default function SectionFeedback({ items }: { items: SectionFeedbackItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => {
        const config = RATING_CONFIG[item.rating] ?? RATING_CONFIG["needs-work"];
        const Icon = config.icon;
        return (
          <div
            key={`${item.section}-${i}`}
            className="flex gap-3 rounded-sm border-l-2 bg-ink-800/60 p-3"
            style={{ borderLeftColor: config.color }}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" style={{ color: config.color }} />
            <div>
              <p className="font-mono text-xs tracking-wide text-text-primary">
                {item.section.toUpperCase()} <span className="text-text-muted">· {config.label}</span>
              </p>
              <p className="mt-1 text-sm text-text-muted">{item.feedback}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
