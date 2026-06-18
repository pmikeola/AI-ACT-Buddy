import { cn } from "@/lib/utils";

type RiskTier = "unacceptable" | "high" | "limited" | "minimal" | "not_ai" | "needs_clarification" | "unknown";

const riskConfig: Record<RiskTier, { label: string; className: string }> = {
  unacceptable: { label: "Unacceptable Risk", className: "bg-risk-unacceptable/15 text-risk-unacceptable border-risk-unacceptable/30" },
  high: { label: "High Risk", className: "bg-risk-high/15 text-risk-high border-risk-high/30" },
  limited: { label: "Limited Risk", className: "bg-risk-limited/15 text-risk-limited border-risk-limited/30" },
  minimal: { label: "Minimal Risk", className: "bg-risk-minimal/15 text-risk-minimal border-risk-minimal/30" },
  not_ai: { label: "Not an AI System", className: "bg-muted text-foreground border-border" },
  needs_clarification: { label: "More Info Needed", className: "bg-risk-limited/15 text-risk-limited border-risk-limited/30" },
  unknown: { label: "Unknown", className: "bg-muted text-muted-foreground border-border" },
};

export function RiskBadge({ tier }: { tier: RiskTier }) {
  const config = riskConfig[tier] || riskConfig.unknown;
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
}

export function ConfidenceBadge({ level }: { level: "high" | "medium" | "low" }) {
  const map = {
    high: { label: "High Confidence", className: "bg-confidence-high/15 text-confidence-high border-confidence-high/30" },
    medium: { label: "Medium Confidence", className: "bg-confidence-medium/15 text-confidence-medium border-confidence-medium/30" },
    low: { label: "Low Confidence", className: "bg-confidence-low/15 text-confidence-low border-confidence-low/30" },
  };
  const config = map[level];
  return (
    <span className={cn("inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold", config.className)}>
      {config.label}
    </span>
  );
}
