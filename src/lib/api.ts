import type { AssessmentData } from "@/components/AssessmentCard";

const WORKER_URL = import.meta.env.VITE_API_URL as string;

function extractBetween(text: string, startHeadings: string[]): string {
  for (const heading of startHeadings) {
    const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(
      `(?:^|\\n)(?:#{1,3}\\s*)?${escaped}[:\\s]*\\n([\\s\\S]*?)(?=\\n(?:#{1,3}\\s*)?(?:AI System Summary|Risk Classification|Justification|Confidence Level|Confidence|Missing Information|Assumptions|Recommended next steps)\\b|$)`,
      "i"
    );
    const match = text.match(re);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return "";
}

function parseResponse(raw: string): AssessmentData {
  // Claude returns JSON directly — fast path
  try {
    const json = JSON.parse(raw);
    if (json.summary && json.riskTier) return json as AssessmentData;
  } catch { /* not JSON, fall through */ }

  // Fallback: extract from markdown sections
  let riskTier: AssessmentData["riskTier"] = "unknown";
  const riskSection = extractBetween(raw, ["Risk Classification"]);
  const riskText = (riskSection || raw).toLowerCase();
  if (riskText.includes("unacceptable")) riskTier = "unacceptable";
  else if (/\bhigh[\s-]?risk\b/.test(riskText) || (riskSection && /\bhigh\b/i.test(riskSection))) riskTier = "high";
  else if (/\blimited[\s-]?risk\b/.test(riskText)) riskTier = "limited";
  else if (/\bminimal[\s-]?risk\b/.test(riskText)) riskTier = "minimal";

  let confidence: AssessmentData["confidence"] = "low";
  const confSection = extractBetween(raw, ["Confidence Level", "Confidence"]);
  const confText = (confSection || "").toLowerCase();
  if (confText.includes("high")) confidence = "high";
  else if (confText.includes("medium") || confText.includes("moderate")) confidence = "medium";

  const summary = extractBetween(raw, ["AI System Summary", "System Summary", "Summary"]) || raw.slice(0, 500);
  const justification = extractBetween(raw, ["Justification", "Reasoning", "Rationale"]);
  const assumptions = extractBetween(raw, ["Missing Information / Assumptions", "Missing Information", "Assumptions"]);

  return {
    summary: summary || raw.slice(0, 500),
    riskTier,
    justification: justification || raw,
    confidence,
    assumptions: assumptions || "Based on the information provided.",
  };
}

export async function sendMessage(message: string): Promise<{
  assessment: AssessmentData;
  rawResponse: string;
  latencyMs: number;
}> {
  const start = performance.now();

  const res = await fetch(WORKER_URL, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ message }),
  });

  const latencyMs = Math.round(performance.now() - start);

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Unknown error" }));
    throw new Error((err as { error?: string }).error || "Assessment failed");
  }

  const data = await res.json() as { response: string };
  const responseText = data.response || "";
  const assessment = parseResponse(responseText);

  return { assessment, rawResponse: responseText, latencyMs };
}

// localStorage persistence
const LS_KEY = "probus_assessments";

export interface SavedAssessment {
  id: string;
  query: string;
  assessment: AssessmentData;
  rawResponse?: string;
  latencyMs?: number;
  createdAt: number;
}

export function loadSavedAssessments(): SavedAssessment[] {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveAssessment(entry: SavedAssessment): void {
  const existing = loadSavedAssessments();
  localStorage.setItem(LS_KEY, JSON.stringify([...existing, entry]));
}

export function deleteAssessment(id: string): void {
  const existing = loadSavedAssessments();
  localStorage.setItem(LS_KEY, JSON.stringify(existing.filter((e) => e.id !== id)));
}
