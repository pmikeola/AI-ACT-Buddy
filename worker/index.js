/**
 * Probus AI — Claude proxy (Cloudflare Worker)
 *
 * Deploy:
 *   npx wrangler deploy
 *
 * Set secret:
 *   npx wrangler secret put ANTHROPIC_API_KEY
 *
 * Free tier: 100,000 requests/day
 */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Kept short to stay under Haiku's 2k-token cache minimum.
// Expand with EU AI Act article text later to unlock prompt caching.
const SYSTEM_PROMPT = `You are an EU AI Act compliance specialist. Assess the risk classification of the AI system described under the EU AI Act (Regulation 2024/1689).

Return ONLY a valid JSON object — no markdown, no extra text:
{
  "summary": "2-3 sentence description of the system",
  "riskTier": "unacceptable" | "high" | "limited" | "minimal",
  "justification": "Detailed justification citing specific Articles and Annex numbers",
  "confidence": "high" | "medium" | "low",
  "assumptions": "Assumptions made, or 'None — based on information provided.'"
}

Risk tiers:
- unacceptable: Prohibited by Article 5 (social scoring, real-time biometric ID in public, subliminal manipulation, exploitation of vulnerabilities, untargeted facial scraping)
- high: Annex III categories (biometrics, critical infrastructure, education, employment, essential services, law enforcement, migration, justice, democratic processes) or Article 6(1) safety components
- limited: Article 50 transparency obligations (chatbots, emotion recognition, biometric categorisation, AI-generated content)
- minimal: All other systems not in the above categories

Confidence:
- high: sufficient detail for a confident call
- medium: probable but ambiguous in places
- low: significant information missing

Always cite Article and Annex numbers in justification. Return ONLY the JSON.`;

export default {
  async fetch(request, env) {
    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...CORS, "content-type": "application/json" },
      });
    }

    try {
      const { message } = await request.json();

      if (!message || typeof message !== "string") {
        return new Response(JSON.stringify({ error: "message is required" }), {
          status: 400,
          headers: { ...CORS, "content-type": "application/json" },
        });
      }

      const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "x-api-key": env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-haiku-4-5-20251001",
          max_tokens: 1024,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: message }],
        }),
      });

      if (!anthropicRes.ok) {
        const err = await anthropicRes.text();
        console.error("Anthropic error:", anthropicRes.status, err);
        return new Response(
          JSON.stringify({ error: "Claude API error", status: anthropicRes.status }),
          { status: 502, headers: { ...CORS, "content-type": "application/json" } }
        );
      }

      const data = await anthropicRes.json();
      const responseText = data.content?.[0]?.text ?? "";

      return new Response(
        JSON.stringify({ response: responseText }),
        { headers: { ...CORS, "content-type": "application/json" } }
      );
    } catch (err) {
      console.error("Worker error:", err);
      return new Response(JSON.stringify({ error: "Internal error" }), {
        status: 500,
        headers: { ...CORS, "content-type": "application/json" },
      });
    }
  },
};
