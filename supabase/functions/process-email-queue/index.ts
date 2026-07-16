import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const TEMPLATES: Record<string, Record<number, { subject: string; html: (email: string) => string }>> = {
  welcome: {
    1: {
      subject: "you're probably a deployer",
      html: () => wrapEmail(`
<p>Most business owners I talk to say the same thing.</p>
<p>"We're not an AI company. The AI Act doesn't apply to us."</p>
<p>They're wrong.</p>
<p>If you turned on an AI recruiter inside your HR platform, you're a deployer. If your website has a chatbot powered by AI, you're a deployer. If your credit scoring, customer triage, or fraud detection uses machine learning, you're a deployer.</p>
<p>The AI Act doesn't only regulate the companies that build AI. It regulates the companies that use it. And "deployer" is the legal term for you.</p>
<p>Under Regulation (EU) 2024/1689, deployers of high-risk AI systems have real obligations. Documentation. Transparency. Human oversight. Risk management.</p>
<p>The problem is that nobody told you.</p>
<p>You still have free assessments this month. If you haven't run one yet, try this.</p>
<p>Describe the AI tool you use most. The one a vendor sold you. The one you enabled with a checkbox. See what comes back.</p>
<a href="https://aiactbuddy.com/assess" class="cta">Run Your Assessment</a>
<p>Michael</p>
<p class="ps">P.S. Article 26 of the AI Act lays out deployer obligations specifically. If you want to read it yourself, it's 3 pages. But your assessment will tell you which parts apply to your systems.</p>`),
    },
    2: {
      subject: "the obligation nobody talks about",
      html: () => wrapEmail(`
<p>There's one deployer obligation that almost nobody is talking about.</p>
<p>Article 26(5) of the AI Act requires deployers of high-risk AI systems to conduct a Data Protection Impact Assessment before putting the system into use.</p>
<p>If you're using AI for hiring decisions, credit scoring, or any form of automated decision-making about people, this applies to you.</p>
<p>Here's what that means in practice.</p>
<p><strong>Step 1.</strong> List every AI system you use that processes personal data.</p>
<p><strong>Step 2.</strong> For each high-risk system, document what data goes in, what decisions come out, and who is affected.</p>
<p><strong>Step 3.</strong> Assess the risks to individuals. Not theoretical risks. Real ones. Could someone be denied a job? Refused credit? Flagged incorrectly?</p>
<p><strong>Step 4.</strong> Document the safeguards you have in place. Human review. Override mechanisms. Complaint processes.</p>
<p>Most of this you already know informally. The regulation just requires you to write it down.</p>
<a href="https://aiactbuddy.com/assess" class="cta">Check Which Obligations Apply to You</a>
<p>Michael</p>
<p class="ps">P.S. If you've already done a GDPR Data Protection Impact Assessment, you're halfway there. The AI Act DPIA builds on the same framework. You're not starting from zero.</p>`),
    },
    3: {
      subject: "the question I kept hearing",
      html: () => wrapEmail(`
<p>Six months ago, I was sitting across from a founder at a 40-person recruitment agency in Berlin.</p>
<p>She'd just enabled an AI screening feature inside her HR platform. The vendor told her it would "save 30 hours a week on candidate filtering."</p>
<p>Then she heard about the AI Act.</p>
<p>She asked me the same question I'd been hearing for months. "We just turned on a feature inside someone else's software. Are we responsible for complying with the regulation?"</p>
<p>The answer is yes. Under the AI Act, she's a deployer. And AI-assisted hiring decisions fall under Annex III, Category 4. High-risk.</p>
<p>Here's what hit me. I do AI Governance Assurance in the automotive industry. I work with companies that have compliance teams, legal departments, and six-figure advisory budgets. They'll be fine.</p>
<p>But this founder had 40 employees. No legal team. No compliance officer. And every path to understanding her obligations led to a EUR 500 per hour consultant or an enterprise platform built for companies ten times her size.</p>
<p>So I started building AI ACT Buddy.</p>
<p>You have one more free assessment this month. Use it on the AI system that matters most to your business.</p>
<a href="https://aiactbuddy.com/assess" class="cta">Run Your Final Free Assessment</a>
<p>Michael</p>`),
    },
    4: {
      subject: "427 days until enforcement",
      html: () => wrapEmail(`
<p>The AI Act deployer obligations become enforceable in August 2026.</p>
<p>Here's what I'm seeing.</p>
<p>Companies that started early are already classifying their AI systems. They're documenting which tools use AI, what risk tier each falls under, and what obligations apply. They're building an audit trail before anyone asks for one.</p>
<p>Companies that haven't started are still hoping it won't apply to them.</p>
<p>It will.</p>
<p>Over the past week, you've seen how AI ACT Buddy works. You've seen your risk classification. You've read the Article citations. You know more about your obligations than 95% of SMEs in the EU right now.</p>
<p>The free tier gives you 3 assessments per month. That's enough to check one or two systems.</p>
<p>But if you have multiple AI tools. If you need saved history you can show an auditor. If you want documentation templates that map to your specific obligations.</p>
<p>That's what Starter is for.</p>
<p>EUR 79 per month. Unlimited assessments. Saved compliance history. Documentation templates.</p>
<p>No pressure. The free tier isn't going anywhere. But 427 days is less time than it sounds like when you're running a business.</p>
<a href="https://aiactbuddy.com/#pricing" class="cta">See Pricing Options</a>
<p>Michael</p>
<p class="ps">P.S. If you're not ready to upgrade, that's fine. Your free assessments reset every month. But your assessment history and documentation are only available on Starter and above. Something to keep in mind when audit season arrives.</p>`),
    },
  },
};

function wrapEmail(body: string): string {
  return `<!DOCTYPE html>
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
<body>${body}</body>
</html>`;
}

serve(async (req) => {
  try {
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const now = new Date().toISOString();
    const { data: pending, error } = await serviceClient
      .from("email_queue")
      .select("*, auth_user:user_id(email)")
      .eq("status", "pending")
      .lte("send_at", now)
      .limit(50);

    if (error || !pending || pending.length === 0) {
      return new Response(
        JSON.stringify({ processed: 0 }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    let sent = 0;
    for (const item of pending) {
      const template = TEMPLATES[item.sequence]?.[item.step];
      const userEmail = (item.auth_user as any)?.email;
      if (!template || !userEmail) {
        await serviceClient
          .from("email_queue")
          .update({ status: "cancelled" })
          .eq("id", item.id);
        continue;
      }

      const { data: prefs } = await serviceClient
        .from("email_preferences")
        .select("unsubscribed")
        .eq("user_id", item.user_id)
        .single();

      if (prefs?.unsubscribed) {
        await serviceClient
          .from("email_queue")
          .update({ status: "cancelled" })
          .eq("id", item.id);
        continue;
      }

      try {
        await serviceClient.functions.invoke("send-email", {
          body: {
            to: userEmail,
            subject: template.subject,
            html: template.html(userEmail),
            sequence: item.sequence,
            step: item.step,
            user_id: item.user_id,
          },
        });

        await serviceClient
          .from("email_queue")
          .update({ status: "sent" })
          .eq("id", item.id);
        sent++;
      } catch (err) {
        console.error(`Failed to send email ${item.id}:`, err);
      }
    }

    console.log(`Processed ${sent}/${pending.length} queued emails`);
    return new Response(
      JSON.stringify({ processed: sent, total: pending.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Queue processor error:", error);
    return new Response(
      JSON.stringify({ error: "Processing failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
