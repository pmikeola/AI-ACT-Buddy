import { supabase } from "@/integrations/supabase/client";
import type { AssessmentData } from "@/components/AssessmentCard";

let currentSessionId: string | null = null;
let conversationHistory: Array<{ role: string; content: string }> = [];

interface LyzrResponse {
  response?: string;
  session_id?: string;
  [key: string]: unknown;
}

function extractBetween(text: string, startHeadings: string[]): string {
  for (const heading of startHeadings) {
    const escapedHeading = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const re = new RegExp(
      `(?:^|\\n)(?:#{1,3}\\s*)?${escapedHeading}[:\\s]*\\n([\\s\\S]*?)(?=\\n(?:#{1,3}\\s*)?(?:AI System Summary|Risk Classification|Justification|Confidence Level|Confidence|Missing Information|Assumptions|Recommended next steps)\\b|$)`,
      "i"
    );
    const match = text.match(re);
    if (match?.[1]?.trim()) return match[1].trim();
  }
  return "";
}

function parseResponse(raw: string): AssessmentData {
  // Try to extract JSON from the response (may be wrapped in markdown fences)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const json = JSON.parse(jsonMatch[0]);
      if (json.summary && json.riskTier) {
        // Map new risk tiers to display-friendly values
        const tier = json.riskTier === "not_ai" || json.riskTier === "needs_clarification"
          ? json.riskTier
          : json.riskTier;
        return {
          summary: json.summary,
          riskTier: tier as AssessmentData["riskTier"],
          justification: json.justification || "",
          confidence: json.confidence || "low",
          assumptions: json.assumptions || "",
          role: json.role,
          nextSteps: json.nextSteps,
        };
      }
    } catch { /* malformed JSON, fall through */ }
  }

  let riskTier: AssessmentData["riskTier"] = "unknown";
  const riskSection = extractBetween(raw, ["Risk Classification"]);
  const riskText = (riskSection || raw).toLowerCase();
  if (riskText.includes("unacceptable")) riskTier = "unacceptable";
  else if (riskText.includes("not_ai") || riskText.includes("not an ai")) riskTier = "not_ai";
  else if (/\bhigh[\s-]?risk\b/.test(riskText) || (riskSection && /\bhigh\b/i.test(riskSection))) riskTier = "high";
  else if (/\blimited[\s-]?risk\b/.test(riskText)) riskTier = "limited";
  else if (/\bminimal[\s-]?risk\b/.test(riskText)) riskTier = "minimal";

  let confidence: AssessmentData["confidence"] = "low";
  const confSection = extractBetween(raw, ["Confidence Level", "Confidence"]);
  const confText = (confSection || "").toLowerCase();
  if (confText.includes("high") || confText.includes("90%")) confidence = "high";
  else if (confText.includes("medium") || confText.includes("moderate")) confidence = "medium";

  const summary = extractBetween(raw, ["AI System Summary", "System Summary", "Summary"]) || raw.slice(0, 500);
  const justification = extractBetween(raw, ["Justification", "Reasoning", "Rationale"]);
  const assumptions = extractBetween(raw, [
    "Missing Information / Assumptions",
    "Missing Information",
    "Assumptions",
  ]);

  return {
    summary: summary || raw.slice(0, 500),
    riskTier,
    justification: justification || raw,
    confidence,
    assumptions: assumptions || "Based on the information provided. Additional details may refine this assessment.",
  };
}

export async function sendMessage(message: string): Promise<{
  assessment: AssessmentData;
  sessionId: string;
  rawResponse: string;
  latencyMs: number;
}> {
  const start = performance.now();

  const { data, error } = await supabase.functions.invoke<LyzrResponse>("lyzr-proxy", {
    body: { message, session_id: currentSessionId, history: conversationHistory },
  });

  const latencyMs = Math.round(performance.now() - start);

  if (error) throw new Error(error.message || "Failed to get assessment");
  if (!data) throw new Error("No response from compliance agent");

  if (data.session_id) currentSessionId = data.session_id;

  const responseText = data.response || JSON.stringify(data);
  const assessment = parseResponse(responseText);

  // Track conversation history for follow-up context
  conversationHistory.push({ role: "user", content: message });
  conversationHistory.push({ role: "assistant", content: responseText });
  // Keep last 6 messages to stay within token budget
  if (conversationHistory.length > 6) {
    conversationHistory = conversationHistory.slice(-6);
  }

  return { assessment, sessionId: currentSessionId || "", rawResponse: responseText, latencyMs };
}

export async function sendFollowUp(message: string): Promise<{
  text: string;
  sessionId: string;
  latencyMs: number;
}> {
  const start = performance.now();

  const { data, error } = await supabase.functions.invoke<LyzrResponse>("lyzr-proxy", {
    body: { message, session_id: currentSessionId, history: conversationHistory },
  });

  const latencyMs = Math.round(performance.now() - start);

  if (error) throw new Error(error.message || "Failed to get response");
  if (!data) throw new Error("No response from compliance agent");

  if (data.session_id) currentSessionId = data.session_id;

  const responseText = data.response || JSON.stringify(data);

  conversationHistory.push({ role: "user", content: message });
  conversationHistory.push({ role: "assistant", content: responseText });
  if (conversationHistory.length > 6) {
    conversationHistory = conversationHistory.slice(-6);
  }

  return { text: responseText, sessionId: currentSessionId || "", latencyMs };
}

export function resetSession() {
  currentSessionId = null;
  conversationHistory = [];
}
