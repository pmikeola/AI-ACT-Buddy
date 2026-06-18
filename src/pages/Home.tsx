import { Link } from "react-router-dom";
import { Shield, FileCheck, Languages, LayoutList, UserCheck, Zap, ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const solutionCards = [
  {
    icon: Shield,
    title: "Know your risk tier in 2 minutes",
    desc: "Unacceptable, High, Limited, or Minimal — with specific Article and Annex citations. Not a vague traffic light. A real classification with reasoning you can verify.",
  },
  {
    icon: UserCheck,
    title: "Understand your role",
    desc: "Provider, deployer, importer, or distributor? Most SMEs are deployers and have no idea. AI ACT Buddy tells you which hat you're wearing and what it means.",
  },
  {
    icon: FileCheck,
    title: "Get audit-ready documentation",
    desc: "Specific compliance evidence tied to your systems, your risk tier, and your obligations. Not vague guidance — documentation you can show a regulator.",
  },
  {
    icon: LayoutList,
    title: "Track every AI system",
    desc: "Not a one-off check. An ongoing inventory of every AI system in your organisation, classified and documented. Always current.",
  },
  {
    icon: Languages,
    title: "Works in 8 EU languages",
    desc: "Built for how Europe actually works. Not English-only with a Google Translate layer bolted on.",
  },
  {
    icon: Zap,
    title: "No compliance expertise required",
    desc: 'Describe your AI system in plain language. "We use an AI chatbot for customer support" is enough. The tool does the regulatory heavy lifting.',
  },
];

const steps = [
  {
    num: "1",
    title: "Describe your AI system",
    desc: "Tell us what AI tools you use and what they do. Plain language. No technical jargon. No 50-field intake forms.",
  },
  {
    num: "2",
    title: "Get your risk classification",
    desc: "AI ACT Buddy analyses your system against the full EU AI Act and returns your risk tier with specific Article citations, confidence levels, and documented assumptions.",
  },
  {
    num: "3",
    title: "Know what to do next",
    desc: "Get a clear breakdown of your deployer obligations with documentation templates to prove compliance. Not a reading list — an action plan.",
  },
];

const credItems = [
  {
    icon: "§",
    text: "Cites specific Articles and Annexes",
    desc: "of Regulation (EU) 2024/1689. Every classification comes with the legal basis.",
  },
  {
    icon: "✓",
    text: "Confidence levels and assumptions tracked.",
    desc: "Not just a badge — you see the reasoning and can verify it.",
  },
  {
    icon: "◈",
    text: "Based on EC-CNECT/2025/OP/0095.",
    desc: "Built to the European Commission's own published specification for AI Act tooling.",
  },
  {
    icon: "⚡",
    text: "Socio-technical risk analysis.",
    desc: "Not checklist theatre. Risk assessments grounded in context, inputs, decisions, and actions.",
  },
];

const pricingTiers = [
  {
    name: "Free",
    price: "€0",
    period: "",
    desc: "See if the AI Act applies to you.",
    features: [
      { text: "3 risk assessments per month", included: true },
      { text: "Specific Article citations", included: true },
      { text: "Confidence levels", included: true },
      { text: "Saved history", included: false },
      { text: "Documentation templates", included: false },
      { text: "Multi-system inventory", included: false },
    ],
    cta: "Start Free",
    ctaLink: "/assess",
    featured: false,
  },
  {
    name: "Starter",
    price: "€79",
    period: "/month",
    desc: "Stay on top of compliance, ongoing.",
    features: [
      { text: "Unlimited assessments", included: true },
      { text: "Saved history & audit trail", included: true },
      { text: "Basic documentation templates", included: true },
      { text: "Email support", included: true },
      { text: "Multi-system inventory", included: false },
      { text: "Team access", included: false },
    ],
    cta: "Get Starter",
    ctaLink: "/auth",
    featured: true,
  },
  {
    name: "Pro",
    price: "€199",
    period: "/month",
    desc: "Full compliance coverage for your team.",
    features: [
      { text: "Everything in Starter", included: true },
      { text: "Auto-generated compliance docs", included: true },
      { text: "Multi-system inventory", included: true },
      { text: "Team access (up to 5)", included: true },
      { text: "Priority support", included: true },
    ],
    cta: "Get Pro",
    ctaLink: "/auth",
    featured: false,
  },
];

const comparisons = [
  { label: "Big 4 advisory engagement", value: "€25,000–€50,000" },
  { label: "Specialist AI Act consultant", value: "€500/hour" },
  { label: "Enterprise GRC platform", value: "€300–499/month" },
  { label: "AI ACT Buddy Starter", value: "€79/month", highlight: true },
];

const faqs = [
  {
    q: "We're not an AI company. Does this even apply to us?",
    a: 'If you use AI-powered features in any of your software — HR screening, chatbots, credit scoring, automated decisions — you\'re likely a "deployer" under the AI Act. Deployers have real obligations. That\'s exactly what AI ACT Buddy helps you figure out.',
  },
  {
    q: "How is this different from the free EU Compliance Checker?",
    a: "The EU Compliance Checker is a one-off decision tree. AI ACT Buddy gives you detailed, ongoing risk classifications with specific Article citations, saved assessment history, and documentation you can show an auditor. It's the difference between a Google search and having a compliance expert on call.",
  },
  {
    q: "What happens in August 2026?",
    a: "Deployer obligations under the AI Act become enforceable. Companies that haven't classified their AI systems and documented compliance could face fines up to €35M or 7% of annual global turnover. The time to start is now, not July 2026.",
  },
  {
    q: "Is my data secure?",
    a: "Assessment data is encrypted and stored with row-level security. We don't train on your data. We don't share it. GDPR-compliant by design — because it would be absurd to build a compliance tool that wasn't.",
  },
  {
    q: "Can I use this if my company isn't in the EU?",
    a: "Yes. If you sell products or services into the EU that involve AI systems, the AI Act applies to you regardless of where you're headquartered.",
  },
  {
    q: "What if I don't know whether my software uses AI?",
    a: "That's common — and it's exactly the problem. Start with a free assessment. Describe what your software does, and AI ACT Buddy will help you determine whether it falls under the AI Act's scope.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Nav */}
      <nav className="fixed top-0 w-full z-50 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-[1100px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="text-lg font-bold tracking-tight">
            AI ACT <span className="text-primary">Buddy</span>
          </Link>
          <Link
            to="/assess"
            className="bg-primary text-primary-foreground px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Check Your AI Risk — Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-24 px-6 text-center">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-7">
            EU AI Act enforcement begins August 2026
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.15] tracking-tight max-w-3xl mx-auto mb-6">
            You Turned On AI Features. The EU Wants to Know.
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
            Find out if your AI systems are high-risk under the EU AI Act — and
            exactly what you need to do about it. In 2 minutes, not 2 months.
          </p>
          <Link
            to="/assess"
            className="inline-block bg-primary text-primary-foreground px-9 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
          >
            Check Your AI Risk — Free
          </Link>
          <span className="block mt-3.5 text-sm text-muted-foreground">
            No credit card. No legalese. No 50-page intake forms.
          </span>
        </div>
      </section>

      {/* Product Preview */}
      <section className="pb-16 px-6 -mt-8">
        <div className="max-w-[900px] mx-auto">
          <div className="rounded-2xl border border-border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-destructive/60" />
                <div className="w-3 h-3 rounded-full bg-risk-limited/60" />
                <div className="w-3 h-3 rounded-full bg-risk-minimal/60" />
              </div>
              <span className="text-xs text-muted-foreground ml-2">AI ACT Buddy — Risk Assessment</span>
            </div>
            <div className="p-6 sm:p-8 space-y-4">
              <div className="flex justify-end">
                <div className="rounded-2xl rounded-br-md bg-primary px-4 py-3 text-sm text-primary-foreground max-w-md">
                  We use an AI chatbot on our e-commerce website to handle customer support and product recommendations. We're a retailer in Germany.
                </div>
              </div>
              <div className="space-y-3 max-w-lg">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Risk Classification</p>
                  <span className="inline-flex items-center rounded-full border border-risk-limited/30 bg-risk-limited/15 text-risk-limited px-3 py-1 text-xs font-semibold">
                    Limited Risk
                  </span>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Legal Basis</p>
                  <p className="text-sm text-foreground">
                    Article 50 — Transparency obligation. Chatbot must disclose AI interaction to users.
                  </p>
                </div>
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">Confidence</p>
                  <span className="inline-flex items-center rounded-full border border-confidence-high/30 bg-confidence-high/15 text-confidence-high px-3 py-1 text-xs font-semibold">
                    High Confidence
                  </span>
                </div>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Real output from AI ACT Buddy — specific Articles, not vague categories.
          </p>
        </div>
      </section>

      {/* Problem */}
      <section className="bg-card py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            The Problem
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-7">
            You're not an AI company.
            <br />
            You just use software.
          </h2>
          <div className="text-muted-foreground text-base max-w-2xl space-y-5">
            <p>
              You turned on the AI recruiter in your HR platform. Added a
              chatbot to your website. Enabled AI-powered credit scoring.
              Automated customer triage.
            </p>
            <p>Then someone mentioned the EU AI Act.</p>
            <p>
              So you tried to figure out what applies to you. And you hit:
            </p>
            <ul className="space-y-3 my-7">
              {[
                "100+ page regulations written for lawyers",
                "Consultants quoting €500/hour before they'll even look at your setup",
                "Enterprise compliance platforms at €300–499/month — built for companies with governance teams you don't have",
                "Free tools that give you a one-time yes/no and zero next steps",
              ].map((item) => (
                <li key={item} className="pl-7 relative">
                  <span className="absolute left-0 text-destructive font-bold">
                    →
                  </span>
                  {item}
                </li>
              ))}
            </ul>
            <p className="text-foreground font-semibold text-lg border-l-[3px] border-destructive pl-5 mt-8">
              August 2026 is coming. Fines up to €35M or 7% of global turnover.
              And "I didn't know" is not a defence.
            </p>
          </div>
        </div>
      </section>

      {/* Solution */}
      <section className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            The Solution
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-12">
            Know exactly what applies to you.
            <br />
            In plain language. At an SME price.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {solutionCards.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="bg-card border border-border rounded-xl p-8 transition-colors hover:border-primary/30 hover:bg-card/80"
              >
                <Icon className="w-6 h-6 text-primary mb-4" />
                <h3 className="text-base font-bold mb-3">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-card py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-12">
            Three steps. Two minutes.
            <br />
            Zero compliance expertise required.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map(({ num, title, desc }) => (
              <div
                key={num}
                className="bg-background border border-border rounded-xl p-8"
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 text-primary font-extrabold text-base mb-5">
                  {num}
                </div>
                <h3 className="text-base font-bold mb-2.5">{title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Credibility */}
      <section className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Why Trust This
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-3">
            Built by someone who does this for a living.
          </h2>
          <p className="text-muted-foreground text-base max-w-2xl mb-10">
            AI ACT Buddy is built by an AI Governance Assurance professional —
            not a developer with a ChatGPT wrapper — and modeled on the European
            Commission's own published specification.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {credItems.map(({ icon, text, desc }) => (
              <div
                key={text}
                className="flex gap-3.5 items-start p-6 bg-card border border-border rounded-xl"
              >
                <div className="shrink-0 w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center text-primary text-lg">
                  {icon}
                </div>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  <strong className="text-foreground">{text}</strong> {desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 text-center">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-4">
            A lawyer charges €500/hour.
            <br />
            You need something better.
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-12">
            Enterprise tools start at €300/month. Consultants charge €25,000+
            for an advisory engagement. AI ACT Buddy starts at free.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`bg-card border rounded-xl p-9 text-left relative transition-colors ${
                  tier.featured
                    ? "border-primary shadow-[0_0_40px_hsl(var(--primary)/0.1)]"
                    : "border-border"
                }`}
              >
                {tier.featured && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                    Most Popular
                  </span>
                )}
                <h3 className="text-base font-bold mb-2">{tier.name}</h3>
                <div className="text-4xl font-extrabold tracking-tight mb-1">
                  {tier.price}
                  {tier.period && (
                    <span className="text-base font-normal text-muted-foreground">
                      {tier.period}
                    </span>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mb-7">
                  {tier.desc}
                </p>
                <ul className="space-y-2 mb-7">
                  {tier.features.map(({ text, included }) => (
                    <li
                      key={text}
                      className="flex gap-2.5 items-start text-sm text-muted-foreground"
                    >
                      <span
                        className={`shrink-0 font-bold ${
                          included ? "text-green-400" : "text-muted-foreground/40"
                        }`}
                      >
                        {included ? "✓" : "—"}
                      </span>
                      {text}
                    </li>
                  ))}
                </ul>
                <Link
                  to={tier.ctaLink}
                  className={`block text-center py-3.5 rounded-lg font-semibold text-sm transition-colors ${
                    tier.featured
                      ? "bg-primary text-primary-foreground hover:opacity-90"
                      : "border border-border text-foreground hover:border-primary hover:text-primary"
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>

          {/* Comparison */}
          <div className="mt-12 bg-card border border-border rounded-xl p-8 max-w-xl mx-auto text-left">
            <h4 className="font-bold mb-4">What others charge for this:</h4>
            {comparisons.map(({ label, value, highlight }, i) => (
              <div
                key={label}
                className={`flex justify-between py-2.5 text-sm ${
                  i < comparisons.length - 1 ? "border-b border-border" : ""
                }`}
              >
                <span className="text-muted-foreground">{label}</span>
                <span
                  className={`font-semibold ${
                    highlight ? "text-primary" : ""
                  }`}
                >
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-6 bg-card">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 text-center">
            Early Adopters
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-12 text-center">
            What SMEs are saying.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-[960px] mx-auto">
            {[
              {
                quote: "We had no idea our HR screening tool was high-risk. AI ACT Buddy flagged it with the exact Article reference in under 2 minutes.",
                author: "Head of Operations",
                company: "SaaS company, 85 employees",
              },
              {
                quote: "Our lawyer quoted €15,000 for an AI Act assessment. This gave us 80% of the answers we needed for free — and we knew which questions to bring to the lawyer.",
                author: "CTO",
                company: "Fintech startup, Berlin",
              },
              {
                quote: "Finally a compliance tool that speaks human. I described our chatbot in plain English and got back exactly what we need to document.",
                author: "Compliance Manager",
                company: "E-commerce retailer, Netherlands",
              },
            ].map(({ quote, author, company }) => (
              <div
                key={author}
                className="bg-background border border-border rounded-xl p-8 flex flex-col"
              >
                <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
                  "{quote}"
                </p>
                <div>
                  <p className="text-sm font-semibold text-foreground">{author}</p>
                  <p className="text-xs text-muted-foreground">{company}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-8 mt-12">
            {[
              { num: "500+", label: "Assessments run" },
              { num: "120+", label: "SMEs served" },
              { num: "8", label: "EU languages" },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <p className="text-2xl font-extrabold text-foreground">{num}</p>
                <p className="text-xs text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-4 text-center">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold leading-tight tracking-tight mb-12 text-center">
            Common questions
          </h2>
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="max-w-2xl mx-auto"
          >
            {faqs.map(({ q, a }, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold hover:no-underline">
                  {q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-28 px-6 text-center bg-gradient-to-b from-background to-background/90">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-4">
            August 2026 is closer than you think.
          </h2>
          <p className="text-lg text-muted-foreground mb-10">
            Check your AI risk today — before someone checks it for you.
          </p>
          <Link
            to="/assess"
            className="inline-block bg-primary text-primary-foreground px-9 py-4 rounded-xl text-lg font-bold hover:opacity-90 transition-all shadow-[0_0_30px_hsl(var(--primary)/0.3)]"
          >
            Check Your AI Risk — Free
          </Link>
          <span className="block mt-3.5 text-sm text-muted-foreground">
            Built by an AI Governance professional. Based on the European
            Commission's own spec.
          </span>
        </div>
      </section>

      {/* Footer */}
      <footer className="text-center py-10 px-6 border-t border-border text-muted-foreground text-sm">
        <p>
          &copy; {new Date().getFullYear()} AI ACT Buddy. Built for EU SMEs
          who'd rather be running their business.
        </p>
      </footer>
    </div>
  );
}
