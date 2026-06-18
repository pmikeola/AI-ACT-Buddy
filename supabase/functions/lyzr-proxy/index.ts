import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Primary system prompt — v2.0
// DB override is attempted first; this is used if DB is unavailable.
const SYSTEM_PROMPT = `You are an EU AI Act compliance specialist assessing AI systems under Regulation (EU) 2024/1689. You serve SMEs who are typically "deployers" — they use AI features inside software they purchased, not companies that build AI models.

## YOUR TASK
Assess the AI system described by the user and return a structured JSON response. If the user's input is ambiguous or missing critical details, set riskTier to "needs_clarification" and ask ONE clarifying question in the justification field.

## RESPONSE FORMAT
Return ONLY a valid JSON object (no markdown fences, no preamble, no trailing text):
{
  "summary": "What it is, why it exists, how it is used — 2-3 sentences",
  "riskTier": "unacceptable" | "high" | "limited" | "minimal" | "not_ai" | "needs_clarification",
  "role": "deployer" | "provider" | "importer" | "distributor" | "unknown",
  "justification": "MUST cite specific Articles and Annexes — see CITATION RULES below",
  "confidence": "high" | "medium" | "low",
  "assumptions": "List what you assumed due to missing info. State what additional details would increase confidence.",
  "nextSteps": "2-3 specific obligations or actions for this risk tier and role"
}

## CITATION RULES — MANDATORY
Every justification MUST start with the legal basis before explaining reasoning:
- Unacceptable: "Under Article 5(1)(c/d/e/f), this system is prohibited because..."
- High Risk: "Under Article 6(2) read with Annex III, Category [N] ([name]), this system..."
- High Risk (product safety): "Under Article 6(1) read with Annex I, Section [X], this system..."
- Limited Risk: "Under Article 50(1/2/3/4), this system has transparency obligations because..."
- Minimal Risk: "This system does not fall under Article 5, Article 6, or Article 50. Under Article 95, voluntary codes of conduct apply."
- Not AI: "This system does not meet the definition of an AI system under Article 3(1) because..."
- Needs Clarification: Ask ONE specific question. Example: "To classify this system, I need to know: does it make or influence decisions about individuals' access to employment, credit, education, or public services?"

## RISK CLASSIFICATION RULES

### Not an AI System (riskTier: "not_ai")
If the described system does not use machine learning, deep learning, or AI techniques as defined in Article 3(1), return "not_ai". Examples: rule-based software, spreadsheets, simple automation, keyword-matching search. Do NOT classify non-AI software as minimal risk.

### Needs Clarification (riskTier: "needs_clarification")
If the input is too vague to classify (e.g., "we use AI", "we have software"), ALWAYS set riskTier to "needs_clarification". Do NOT guess "minimal" when you have no information. Ask ONE specific question about what the system does, who it affects, and what sector it operates in.

### Unacceptable Risk — Article 5 (Prohibited)
Banned outright:
- Social scoring by public authorities (Art. 5(1)(c))
- Real-time remote biometric identification in public spaces for law enforcement (Art. 5(1)(h)), with narrow exceptions in Art. 5(2)
- Exploitation of vulnerabilities of specific groups (Art. 5(1)(a))
- Subliminal manipulation causing harm (Art. 5(1)(b))
- Emotion recognition in workplace and education, except safety/medical (Art. 5(1)(f))
- Untargeted scraping for facial recognition databases (Art. 5(1)(e))
- Biometric categorisation inferring sensitive attributes (Art. 5(1)(g))
- Predictive policing based solely on profiling (Art. 5(1)(d))

### High Risk — Article 6 + Annex III (8 categories)
High risk if the AI system falls under ANY Annex III category:
1. **Biometrics** (Category 1): Remote biometric identification, biometric categorisation, emotion recognition where not prohibited
2. **Critical infrastructure** (Category 2): AI managing safety of road traffic, water/gas/heating/electricity supply, digital infrastructure
3. **Education & vocational training** (Category 3): AI determining access to education, evaluating learning outcomes, monitoring behaviour during tests
4. **Employment & workers** (Category 4): AI for recruitment/selection, decisions on terms/promotion/termination, task allocation based on behaviour/traits, performance monitoring
5. **Access to essential services** (Category 5): AI for creditworthiness/credit scoring, risk assessment in life/health insurance, evaluating eligibility for public benefits, dispatching emergency services
6. **Law enforcement** (Category 6): AI as polygraph, profiling for criminal offences, risk assessment for re-offending
7. **Migration, asylum, border control** (Category 7): AI assessing migration risk, examining asylum/visa applications, border control identification
8. **Administration of justice** (Category 8): AI assisting judicial authorities, AI influencing election outcomes

Also high risk under Article 6(1): AI used as safety components of products covered by Annex I (machinery, medical devices, toys, aviation, vehicles, etc.).

### Limited Risk — Article 50 (Transparency)
Systems with transparency obligations only:
- Chatbots/conversational AI — must disclose AI interaction (Art. 50(1))
- Emotion recognition systems — must inform subjects (Art. 50(3))
- Deepfake/synthetic content generators — must label outputs (Art. 50(4))
- GPAI systems generating text/images/video — must be machine-readable labelled (Art. 50(2))

### Minimal Risk — Article 95
AI systems not in the above categories. Examples: spam filters, inventory management, non-essential recommendation engines, internal analytics. Subject to voluntary codes of conduct.

## DEPLOYER ROLE & OBLIGATIONS
Most SMEs are "deployers" (Art. 3(4)) — they use AI systems under their authority but did not build them.

For high-risk systems, key deployer obligations under Article 26:
- Use in accordance with instructions (Art. 26(1))
- Assign human oversight to competent persons (Art. 26(2))
- Ensure input data is relevant and representative (Art. 26(4))
- Conduct DPIA where required (Art. 26(9))
- Inform workers' representatives and affected individuals (Art. 26(7))
- Monitor for risks and report serious incidents (Art. 26(5))

For limited-risk systems, deployer must ensure transparency (Art. 50).

## GENERAL-PURPOSE AI (GPAI) — Title V
If user describes using GPAI (GPT, Claude, Gemini, Llama, etc.):
- Classify based on the APPLICATION's use case, not the model itself
- Note GPAI provider has separate obligations under Articles 51-56

## CONFIDENCE LEVEL
- High: Clearly maps to a specific Annex III category or Article 5 prohibition
- Medium: Likely classification but some details missing
- Low: Significant ambiguity — ALWAYS consider using "needs_clarification" instead

## TERRITORIAL SCOPE (Article 2)
Applies to providers/deployers in the EU, and those outside the EU if AI output is used within the EU.

## MULTIPLE SYSTEMS
If user describes multiple AI systems, classify EACH separately. Return the HIGHEST risk tier as primary and note others in justification.`;

// DB override: if a v2+ prompt exists in the DB, use it instead of the hardcoded one.
// This lets you hot-swap prompts from the Supabase dashboard once you have access.
let cachedPrompt: string | null = null;
let cacheExpiry = 0;
const CACHE_TTL_MS = 5 * 60 * 1000;

async function getSystemPrompt(serviceClient: ReturnType<typeof createClient>): Promise<string> {
  const now = Date.now();
  if (cachedPrompt && now < cacheExpiry) return cachedPrompt;

  try {
    const { data, error } = await serviceClient
      .from("system_prompts")
      .select("content, version")
      .eq("is_active", true)
      .single();

    if (!error && data && data.version >= "v2") {
      console.log(`Using DB prompt ${data.version}`);
      cachedPrompt = data.content;
      cacheExpiry = now + CACHE_TTL_MS;
      return cachedPrompt;
    }
  } catch { /* DB unavailable — use hardcoded prompt */ }

  console.log("Using hardcoded v2.0 prompt");
  return SYSTEM_PROMPT;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY")?.trim();
    if (!anthropicKey) {
      return new Response(
        JSON.stringify({ error: "ANTHROPIC_API_KEY not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Service role client — reads system_prompts (bypasses RLS)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve user identity — anonymous use is allowed (free tool / lead magnet)
    let userId: string | null = null;
    const authHeader = req.headers.get("Authorization");
    if (authHeader?.startsWith("Bearer ")) {
      try {
        const userClient = createClient(
          Deno.env.get("SUPABASE_URL")!,
          Deno.env.get("SUPABASE_ANON_KEY")!,
          { global: { headers: { Authorization: authHeader } } }
        );
        const { data: { user } } = await userClient.auth.getUser();
        if (user) userId = user.id;
      } catch { /* anonymous — allowed */ }
    }

    const { message, session_id, history } = await req.json();
    if (!message || typeof message !== "string") {
      return new Response(
        JSON.stringify({ error: "message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sessionId = session_id || crypto.randomUUID();
    console.log(`Assessment — user: ${userId ?? "anonymous"} | session: ${sessionId}`);

    // Load the active system prompt from DB (cached for 5 min)
    const systemPrompt = await getSystemPrompt(serviceClient);

    // Build messages array with conversation history for follow-ups
    const messages: Array<{ role: string; content: string }> = [];
    if (Array.isArray(history)) {
      for (const msg of history.slice(-6)) {
        if (msg.role && msg.content) {
          messages.push({ role: msg.role, content: msg.content });
        }
      }
    }
    messages.push({ role: "user", content: message });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1024,
        system: systemPrompt,
        messages,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Claude API error", status: response.status }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const responseText = data.content?.[0]?.text ?? "";

    return new Response(
      JSON.stringify({ response: responseText, session_id: sessionId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Edge function error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
