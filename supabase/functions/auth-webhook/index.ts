import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const WELCOME_SEQUENCE = [
  { step: 0, delayDays: 0 },
  { step: 1, delayDays: 1 },
  { step: 2, delayDays: 3 },
  { step: 3, delayDays: 5 },
  { step: 4, delayDays: 8 },
];

serve(async (req) => {
  try {
    const payload = await req.json();
    const event = payload.type || payload.event;
    const user = payload.record || payload.user;

    if (!user?.id || !user?.email) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (event === "INSERT" || event === "user.created") {
      const { data: existing } = await serviceClient
        .from("email_preferences")
        .select("welcome_sent")
        .eq("user_id", user.id)
        .single();

      if (existing?.welcome_sent) {
        return new Response(JSON.stringify({ ok: true, skipped: true }), {
          headers: { "Content-Type": "application/json" },
        });
      }

      await serviceClient.from("email_preferences").upsert({
        user_id: user.id,
        welcome_sent: true,
      });

      const now = new Date();
      const queueItems = WELCOME_SEQUENCE.map(({ step, delayDays }) => {
        const sendAt = new Date(now);
        sendAt.setDate(sendAt.getDate() + delayDays);
        return {
          user_id: user.id,
          sequence: "welcome",
          step,
          send_at: sendAt.toISOString(),
          status: "pending",
        };
      });

      await serviceClient.from("email_queue").insert(queueItems);

      // Send the first welcome email immediately
      const welcomeHtml = getWelcomeEmail(user.email);
      await serviceClient.functions.invoke("send-email", {
        body: {
          to: user.email,
          subject: "your first AI Act risk check is ready",
          html: welcomeHtml,
          sequence: "welcome",
          step: 0,
          user_id: user.id,
        },
      });

      await serviceClient
        .from("email_queue")
        .update({ status: "sent" })
        .eq("user_id", user.id)
        .eq("sequence", "welcome")
        .eq("step", 0);

      console.log(`Welcome sequence queued for ${user.email}`);
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Auth webhook error:", error);
    return new Response(JSON.stringify({ error: "Webhook failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

function getWelcomeEmail(email: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.7; color: #1a1a2e; max-width: 600px; margin: 0 auto; padding: 32px 24px; }
  a.cta { display: inline-block; background: #1a3a8f; color: #fff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
  .ps { margin-top: 32px; padding-top: 16px; border-top: 1px solid #e5e5e5; font-size: 14px; color: #666; }
</style>
</head>
<body>
<p>You just took the first real step toward AI Act compliance.</p>

<p>Most SMEs I talk to are stuck in the same place. They know the regulation exists. They know August 2026 is coming. But every time they try to figure out what applies to them, they hit a wall of legal documents and expensive consultants.</p>

<p>That stops today.</p>

<p><strong>Your account is live.</strong> You have 3 free risk assessments this month. Here's how to make the first one count.</p>

<p>Go to AI ACT Buddy and describe one AI system you use. Keep it simple.</p>

<p>Something like "We use an AI chatbot for customer support" or "Our HR platform has an AI screening tool."</p>

<p>You'll get back your risk classification under the EU AI Act. Specific Articles. Specific Annexes. A clear confidence level.</p>

<p>Two minutes. No legalese.</p>

<p><strong>Over the next week, I'll send you a few short emails</strong> with specific things most SMEs don't know about the AI Act. Each one will help you understand what actually applies to your business.</p>

<p>No fluff. No corporate compliance brochure. Just the parts that matter for a company your size.</p>

<a href="https://aiactbuddy.com/assess" class="cta">Check Your AI Risk</a>

<p>Michael<br>AI ACT Buddy</p>

<p class="ps">P.S. If your assessment comes back "High-Risk," don't panic. That's exactly what the tool is for. I'll walk you through what that means in the next email.</p>
</body>
</html>`;
}
