import PptxGenJS from "pptxgenjs";
import type { AssessmentData } from "@/components/AssessmentCard";

const BRAND = {
  dark: "0A0A1A",
  blue: "1A3A8F",
  blueLight: "4D7CFF",
  white: "FFFFFF",
  grey: "888899",
  lightBg: "F0F2F8",
};

const RISK_COLORS: Record<string, string> = {
  unacceptable: "DC2626",
  high: "EA580C",
  limited: "CA8A04",
  minimal: "16A34A",
  not_ai: "6B7280",
  needs_clarification: "9333EA",
  unknown: "6B7280",
};

const RISK_LABELS: Record<string, string> = {
  unacceptable: "UNACCEPTABLE RISK",
  high: "HIGH RISK",
  limited: "LIMITED RISK",
  minimal: "MINIMAL RISK",
  not_ai: "NOT AN AI SYSTEM",
  needs_clarification: "NEEDS CLARIFICATION",
  unknown: "UNKNOWN",
};

interface ObligationRow {
  obligation: string;
  article: string;
  action: string;
}

const HIGH_RISK_OBLIGATIONS: ObligationRow[] = [
  { obligation: "Risk management system", article: "Art. 9", action: "Establish risk register with named owner, review quarterly" },
  { obligation: "Data governance", article: "Art. 10", action: "Document data sourcing, bias-test before each release" },
  { obligation: "Technical documentation", article: "Art. 11", action: "One living doc per system, update within 30 days of changes" },
  { obligation: "Record-keeping", article: "Art. 12", action: "Enable automatic decision logs, retain for system lifetime + 6 months" },
  { obligation: "Transparency", article: "Art. 13", action: "Deployer instruction sheet with limits and intended use" },
  { obligation: "Human oversight", article: "Art. 14", action: "Trained reviewer with authority to pause, named escalation path" },
  { obligation: "Accuracy & robustness", article: "Art. 15", action: "Pre-launch benchmarks + adversarial testing before go-live" },
  { obligation: "Post-market monitoring", article: "Art. 72", action: "Live performance dashboard with quarterly trend review" },
  { obligation: "Serious incident reporting", article: "Art. 73", action: "72-hour reporting window, threshold documented in advance" },
];

const LIMITED_RISK_OBLIGATIONS: ObligationRow[] = [
  { obligation: "Disclose AI interaction", article: "Art. 50(1)", action: "Add clear AI disclosure at point of interaction" },
  { obligation: "Mark synthetic content", article: "Art. 50(2)", action: "Machine-readable labelling on AI-generated outputs" },
  { obligation: "Inform about emotion recognition", article: "Art. 50(3)", action: "Disclosure notice + GDPR compliance" },
  { obligation: "Disclose deep fakes", article: "Art. 50(4)", action: "Label all AI-generated public content" },
];

const DEPLOYER_ACTIONS: ObligationRow[] = [
  { obligation: "Use per provider instructions", article: "Art. 26(1)", action: "Review and follow instructions of use" },
  { obligation: "Assign human oversight", article: "Art. 26(2)", action: "Assign trained staff to oversee AI operation" },
  { obligation: "Ensure input data quality", article: "Art. 26(4)", action: "Validate data relevance and representativeness" },
  { obligation: "Conduct DPIA", article: "Art. 26(5)", action: "Data Protection Impact Assessment before deployment" },
  { obligation: "Inform affected individuals", article: "Art. 26(7)", action: "Notify workers and individuals of AI decisions" },
];

function addSlideHeader(slide: PptxGenJS.Slide, title: string) {
  slide.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.08, fill: { color: BRAND.blue } });
  slide.addText("AI ACT Buddy", { x: 0.5, y: 0.2, w: 3, h: 0.3, fontSize: 9, color: BRAND.grey, fontFace: "Arial" });
  slide.addText(title, { x: 0.5, y: 0.5, w: 9, h: 0.5, fontSize: 22, bold: true, color: BRAND.dark, fontFace: "Arial" });
}

function addObligationTable(slide: PptxGenJS.Slide, obligations: ObligationRow[], yPos: number) {
  const rows: PptxGenJS.TableRow[] = [
    [
      { text: "Obligation", options: { bold: true, color: BRAND.white, fill: { color: BRAND.blue }, fontSize: 9 } },
      { text: "Article", options: { bold: true, color: BRAND.white, fill: { color: BRAND.blue }, fontSize: 9 } },
      { text: "Required Action", options: { bold: true, color: BRAND.white, fill: { color: BRAND.blue }, fontSize: 9 } },
    ],
  ];
  obligations.forEach((o, i) => {
    const bg = i % 2 === 0 ? BRAND.lightBg : BRAND.white;
    rows.push([
      { text: o.obligation, options: { fontSize: 8, fill: { color: bg } } },
      { text: o.article, options: { fontSize: 8, fill: { color: bg }, color: BRAND.blue, bold: true } },
      { text: o.action, options: { fontSize: 8, fill: { color: bg } } },
    ]);
  });

  slide.addTable(rows, {
    x: 0.5, y: yPos, w: 9,
    border: { type: "solid", pt: 0.5, color: "CCCCCC" },
    colW: [2.5, 1, 5.5],
    rowH: 0.35,
    fontFace: "Arial",
  });
}

export function exportAssessmentToPptx(data: AssessmentData, userQuery?: string) {
  const pptx = new PptxGenJS();
  pptx.author = "AI ACT Buddy";
  pptx.title = "EU AI Act Risk Assessment";
  pptx.layout = "LAYOUT_16x9";

  // Slide 1: Title
  const slide1 = pptx.addSlide();
  slide1.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: BRAND.dark } });
  slide1.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.12, fill: { color: BRAND.blue } });
  slide1.addText("EU AI Act\nRisk Assessment", {
    x: 0.8, y: 1.2, w: 8, h: 2,
    fontSize: 36, bold: true, color: BRAND.white, fontFace: "Arial", lineSpacingMultiple: 1.2,
  });
  slide1.addText(userQuery || "AI System Assessment", {
    x: 0.8, y: 3.4, w: 8, h: 0.6,
    fontSize: 14, color: BRAND.grey, fontFace: "Arial",
  });
  slide1.addText(`Prepared by AI ACT Buddy  |  ${new Date().toLocaleDateString("en-GB")}`, {
    x: 0.8, y: 4.8, w: 8, h: 0.4,
    fontSize: 10, color: BRAND.grey, fontFace: "Arial",
  });
  slide1.addText("CONFIDENTIAL", {
    x: 0.8, y: 5.1, w: 8, h: 0.3,
    fontSize: 8, color: BRAND.blueLight, bold: true, fontFace: "Arial",
  });

  // Slide 2: Risk Classification Result
  const slide2 = pptx.addSlide();
  addSlideHeader(slide2, "Risk Classification");
  const riskColor = RISK_COLORS[data.riskTier] || BRAND.grey;
  const riskLabel = RISK_LABELS[data.riskTier] || data.riskTier.toUpperCase();

  slide2.addShape("roundRect", {
    x: 0.5, y: 1.2, w: 3, h: 1.2, fill: { color: riskColor }, rectRadius: 0.1,
  });
  slide2.addText(riskLabel, {
    x: 0.5, y: 1.2, w: 3, h: 1.2,
    fontSize: 20, bold: true, color: BRAND.white, fontFace: "Arial", align: "center", valign: "middle",
  });

  slide2.addText(`Confidence: ${data.confidence.toUpperCase()}`, {
    x: 4, y: 1.2, w: 2.5, h: 0.4,
    fontSize: 11, color: BRAND.dark, fontFace: "Arial",
  });
  slide2.addText(`Role: ${(data.role || "Deployer").toUpperCase()}`, {
    x: 4, y: 1.6, w: 2.5, h: 0.4,
    fontSize: 11, color: BRAND.dark, fontFace: "Arial",
  });

  slide2.addText("Summary", {
    x: 0.5, y: 2.8, w: 9, h: 0.3,
    fontSize: 12, bold: true, color: BRAND.blue, fontFace: "Arial",
  });
  slide2.addText(data.summary, {
    x: 0.5, y: 3.1, w: 9, h: 0.8,
    fontSize: 10, color: BRAND.dark, fontFace: "Arial", lineSpacingMultiple: 1.3,
  });

  slide2.addText("Legal Basis", {
    x: 0.5, y: 4.1, w: 9, h: 0.3,
    fontSize: 12, bold: true, color: BRAND.blue, fontFace: "Arial",
  });
  slide2.addText(data.justification.slice(0, 500), {
    x: 0.5, y: 4.4, w: 9, h: 1,
    fontSize: 9, color: BRAND.dark, fontFace: "Arial", lineSpacingMultiple: 1.3,
  });

  // Slide 3: Obligations (tier-specific)
  if (data.riskTier === "high" || data.riskTier === "limited") {
    const slide3 = pptx.addSlide();
    const obligations = data.riskTier === "high" ? HIGH_RISK_OBLIGATIONS : LIMITED_RISK_OBLIGATIONS;
    addSlideHeader(slide3, `${riskLabel} — Compliance Obligations`);
    addObligationTable(slide3, obligations, 1.2);
  }

  // Slide 4: Deployer Obligations
  const slide4 = pptx.addSlide();
  addSlideHeader(slide4, "Deployer Obligations (Art. 26)");
  slide4.addText("As a deployer, you use AI systems under your authority but did not build them. These obligations apply regardless of risk tier for high-risk systems.", {
    x: 0.5, y: 1.1, w: 9, h: 0.5,
    fontSize: 9, color: BRAND.grey, fontFace: "Arial",
  });
  addObligationTable(slide4, DEPLOYER_ACTIONS, 1.7);

  // Slide 5: Enforcement Timeline
  const slide5 = pptx.addSlide();
  addSlideHeader(slide5, "Enforcement Timeline");

  const timelineData = [
    { date: "Feb 2025", event: "Prohibitions (Art. 5) + AI literacy", color: "16A34A" },
    { date: "Aug 2025", event: "GPAI obligations, governance, penalties", color: "16A34A" },
    { date: "Aug 2026", event: "Regulation generally applies", color: "EA580C" },
    { date: "Dec 2026", event: "Art. 50 transparency obligations", color: "EA580C" },
    { date: "Dec 2027", event: "Standalone Annex III high-risk", color: "CA8A04" },
    { date: "Aug 2028", event: "Embedded high-risk (safety components)", color: "CA8A04" },
  ];

  timelineData.forEach((item, i) => {
    const y = 1.3 + i * 0.7;
    slide5.addShape("roundRect", { x: 0.5, y, w: 1.5, h: 0.5, fill: { color: item.color }, rectRadius: 0.05 });
    slide5.addText(item.date, {
      x: 0.5, y, w: 1.5, h: 0.5,
      fontSize: 9, bold: true, color: BRAND.white, fontFace: "Arial", align: "center", valign: "middle",
    });
    slide5.addText(item.event, {
      x: 2.3, y, w: 7, h: 0.5,
      fontSize: 10, color: BRAND.dark, fontFace: "Arial", valign: "middle",
    });
  });

  // Slide 6: Recommended Actions
  const slide6 = pptx.addSlide();
  addSlideHeader(slide6, "Recommended Next Steps");

  const actions = [
    "Document this risk classification and retain as evidence of compliance awareness",
    "Identify all AI systems in your organisation and classify each one",
    "Assign a named owner for AI Act compliance within your organisation",
    data.riskTier === "high"
      ? "Begin building the risk management system and technical documentation required under Articles 9-15"
      : data.riskTier === "limited"
      ? "Implement the transparency measures required under Article 50"
      : "Monitor for changes in AI Act guidance that may affect your classification",
    "Conduct a Data Protection Impact Assessment (DPIA) for any high-risk systems",
    "Establish a review cycle to reassess AI systems as they change or new ones are adopted",
  ];

  actions.forEach((action, i) => {
    const y = 1.2 + i * 0.65;
    slide6.addShape("ellipse", { x: 0.5, y: y + 0.1, w: 0.25, h: 0.25, fill: { color: BRAND.blue } });
    slide6.addText(`${i + 1}`, {
      x: 0.5, y: y + 0.1, w: 0.25, h: 0.25,
      fontSize: 8, bold: true, color: BRAND.white, fontFace: "Arial", align: "center", valign: "middle",
    });
    slide6.addText(action, {
      x: 1, y, w: 8.5, h: 0.5,
      fontSize: 10, color: BRAND.dark, fontFace: "Arial", valign: "middle",
    });
  });

  // Slide 7: Closing
  const slide7 = pptx.addSlide();
  slide7.addShape("rect", { x: 0, y: 0, w: "100%", h: "100%", fill: { color: BRAND.dark } });
  slide7.addShape("rect", { x: 0, y: 0, w: "100%", h: 0.12, fill: { color: BRAND.blue } });
  slide7.addText("Questions?", {
    x: 0.8, y: 1.8, w: 8, h: 1,
    fontSize: 36, bold: true, color: BRAND.white, fontFace: "Arial",
  });
  slide7.addText("This assessment was generated by AI ACT Buddy.\nFor formal compliance advice, consult qualified legal counsel.", {
    x: 0.8, y: 3.2, w: 8, h: 0.8,
    fontSize: 12, color: BRAND.grey, fontFace: "Arial", lineSpacingMultiple: 1.5,
  });
  slide7.addText("aiactbuddy.com", {
    x: 0.8, y: 4.6, w: 8, h: 0.4,
    fontSize: 14, color: BRAND.blueLight, fontFace: "Arial",
  });

  pptx.writeFile({ fileName: `AI-ACT-Buddy-Assessment-${new Date().toISOString().slice(0, 10)}.pptx` });
}
