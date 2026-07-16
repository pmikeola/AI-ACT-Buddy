import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import type { AssessmentData } from "@/components/AssessmentCard";

const BRAND_BLUE = "1A3A8F";
const BRAND_DARK = "0A0A1A";
const WHITE = "FFFFFF";
const LIGHT_BG = "F0F2F8";

const RISK_COLORS: Record<string, string> = {
  unacceptable: "DC2626",
  high: "EA580C",
  limited: "CA8A04",
  minimal: "16A34A",
  not_ai: "6B7280",
  needs_clarification: "9333EA",
  unknown: "6B7280",
};

const HIGH_RISK_OBLIGATIONS = [
  { obligation: "Risk management system", article: "Art. 9", what: "Continuous, iterative process identifying and mitigating risks throughout the system's lifecycle", action: "Establish a risk register, assign a named owner per risk, review quarterly" },
  { obligation: "Data governance", article: "Art. 10", what: "Training, validation, and testing data must be relevant, representative, and appropriately free of errors", action: "Document data sourcing for every training set, bias-test before each release" },
  { obligation: "Technical documentation", article: "Art. 11", what: "Comprehensive documentation proving compliance, kept up to date", action: "Create one living doc per system, update within 30 days of any material change" },
  { obligation: "Record-keeping", article: "Art. 12", what: "Automatic logging of events during operation", action: "Enable automatic decision logs, retain for the system's lifetime plus six months" },
  { obligation: "Transparency", article: "Art. 13", what: "Clear information for deployers about the system's capabilities, limitations, and intended purpose", action: "Prepare a deployer instruction sheet naming the limits and use cases the system was not designed for" },
  { obligation: "Human oversight", article: "Art. 14", what: "Measures enabling humans to monitor, intervene, override, or stop the system", action: "Assign a trained reviewer with authority to pause the system and a named escalation path" },
  { obligation: "Accuracy, robustness, cybersecurity", article: "Art. 15", what: "The system must perform as intended and be resilient to errors and attacks", action: "Pre-launch accuracy benchmarks plus adversarial testing signed off before go-live" },
  { obligation: "Conformity assessment", article: "Art. 43", what: "Formal verification of compliance before market access", action: "Complete either internal control (Annex VI) or notified body assessment (Annex VII)" },
  { obligation: "CE marking", article: "Art. 48", what: "The compliance stamp. Without it, no market access.", action: "Affix CE marking visible on the product or its documents before market entry" },
  { obligation: "Registration", article: "Art. 49", what: "High-risk AI systems must be registered in the EU database", action: "Register in the EU database before placing on the market" },
  { obligation: "Post-market monitoring", article: "Art. 72", what: "Ongoing tracking of system performance after deployment", action: "Build a live dashboard of real-world performance with quarterly trend review" },
  { obligation: "Serious incident reporting", article: "Art. 73", what: "Incidents causing death, serious harm, or fundamental rights breaches must be reported to authorities", action: "Document threshold and trigger for 72-hour reporting window in advance" },
];

const LIMITED_RISK_OBLIGATIONS = [
  { obligation: "Disclose AI interaction", article: "Art. 50(1)", what: "People must know they are interacting with an AI system", action: "Add clear AI disclosure notice at point of interaction" },
  { obligation: "Mark synthetic content", article: "Art. 50(2)", what: "AI-generated audio, image, video, or text must be marked as artificially generated", action: "Implement machine-readable labelling on all AI-generated outputs" },
  { obligation: "Inform about emotion recognition", article: "Art. 50(3)", what: "Deployers of emotion recognition or biometric categorisation must inform subjects", action: "Add disclosure notice and ensure GDPR obligations are also met" },
  { obligation: "Disclose deep fakes", article: "Art. 50(4)", what: "AI-generated public interest content must disclose AI involvement", action: "Label all AI-generated content published for public consumption" },
];

const DEPLOYER_OBLIGATIONS = [
  { obligation: "Use in accordance with instructions", article: "Art. 26(1)", action: "Review and follow provider's instructions of use" },
  { obligation: "Human oversight by competent persons", article: "Art. 26(2)", action: "Assign trained staff to oversee AI system operation" },
  { obligation: "Input data relevance", article: "Art. 26(4)", action: "Ensure data fed to the system is relevant and representative" },
  { obligation: "Monitor for risks and report incidents", article: "Art. 26(5)", action: "Conduct DPIA where required, report serious incidents" },
  { obligation: "Inform workers and affected individuals", article: "Art. 26(7)", action: "Notify employees and individuals affected by AI decisions" },
];

const ENFORCEMENT_TIMELINE = [
  { date: "2 February 2025", milestone: "Prohibitions (Art. 5) and AI literacy (Art. 4)", status: "In force" },
  { date: "2 August 2025", milestone: "GPAI obligations, governance, penalties", status: "In force" },
  { date: "2 August 2026", milestone: "Regulation generally applies; governance architecture goes live", status: "Upcoming" },
  { date: "2 December 2026", milestone: "Article 50 transparency obligations (deferred by omnibus)", status: "Upcoming" },
  { date: "2 December 2027", milestone: "Standalone Annex III high-risk obligations (deferred)", status: "Future" },
  { date: "2 August 2028", milestone: "Embedded high-risk (safety components in regulated products)", status: "Future" },
];

function styleHeader(row: ExcelJS.Row, color = BRAND_BLUE) {
  row.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: WHITE }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: color } };
    cell.alignment = { vertical: "middle", wrapText: true };
    cell.border = {
      bottom: { style: "thin", color: { argb: "CCCCCC" } },
    };
  });
  row.height = 28;
}

function styleDataRow(row: ExcelJS.Row, index: number) {
  row.eachCell((cell) => {
    cell.alignment = { vertical: "top", wrapText: true };
    cell.font = { size: 10 };
    if (index % 2 === 0) {
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: LIGHT_BG } };
    }
  });
}

export async function exportAssessmentToExcel(data: AssessmentData, userQuery?: string) {
  const wb = new ExcelJS.Workbook();
  wb.creator = "AI ACT Buddy";
  wb.created = new Date();

  // Sheet 1: Assessment Summary
  const ws1 = wb.addWorksheet("Assessment Summary", { properties: { tabColor: { argb: RISK_COLORS[data.riskTier] || BRAND_BLUE } } });
  ws1.columns = [
    { header: "Field", key: "field", width: 30 },
    { header: "Value", key: "value", width: 80 },
  ];
  styleHeader(ws1.getRow(1));

  const summaryRows = [
    { field: "Assessment Date", value: new Date().toLocaleDateString("en-GB") },
    { field: "AI System Description", value: userQuery || "N/A" },
    { field: "Summary", value: data.summary },
    { field: "Risk Classification", value: data.riskTier.replace("_", " ").toUpperCase() },
    { field: "Role Under AI Act", value: (data.role || "deployer").toUpperCase() },
    { field: "Confidence Level", value: data.confidence.toUpperCase() },
    { field: "Legal Basis / Justification", value: data.justification },
    { field: "Assumptions", value: data.assumptions },
    { field: "Recommended Next Steps", value: data.nextSteps || "N/A" },
    { field: "Generated By", value: "AI ACT Buddy (aiactbuddy.com)" },
  ];
  summaryRows.forEach((row, i) => {
    const r = ws1.addRow(row);
    styleDataRow(r, i);
  });

  // Sheet 2: Obligations (based on risk tier)
  const ws2 = wb.addWorksheet("Obligations", { properties: { tabColor: { argb: BRAND_BLUE } } });
  if (data.riskTier === "high") {
    ws2.columns = [
      { header: "Obligation", key: "obligation", width: 28 },
      { header: "Article", key: "article", width: 12 },
      { header: "What It Means", key: "what", width: 50 },
      { header: "Required Action", key: "action", width: 50 },
    ];
    styleHeader(ws2.getRow(1));
    HIGH_RISK_OBLIGATIONS.forEach((row, i) => {
      const r = ws2.addRow(row);
      styleDataRow(r, i);
    });
  } else if (data.riskTier === "limited") {
    ws2.columns = [
      { header: "Obligation", key: "obligation", width: 30 },
      { header: "Article", key: "article", width: 14 },
      { header: "What It Means", key: "what", width: 50 },
      { header: "Required Action", key: "action", width: 50 },
    ];
    styleHeader(ws2.getRow(1));
    LIMITED_RISK_OBLIGATIONS.forEach((row, i) => {
      const r = ws2.addRow(row);
      styleDataRow(r, i);
    });
  } else {
    ws2.columns = [
      { header: "Note", key: "note", width: 80 },
    ];
    styleHeader(ws2.getRow(1));
    const tierMsg = data.riskTier === "unacceptable"
      ? "This AI system is PROHIBITED under Article 5. It cannot exist. Cease use immediately."
      : data.riskTier === "minimal"
      ? "Minimal risk. No specific obligations under the AI Act. Voluntary codes of conduct apply (Art. 95)."
      : "Classification pending. Run a more detailed assessment to determine obligations.";
    ws2.addRow({ note: tierMsg });
  }

  // Sheet 3: Deployer Obligations
  const ws3 = wb.addWorksheet("Deployer Obligations", { properties: { tabColor: { argb: "16A34A" } } });
  ws3.columns = [
    { header: "Obligation", key: "obligation", width: 35 },
    { header: "Article", key: "article", width: 14 },
    { header: "Required Action", key: "action", width: 60 },
    { header: "Status", key: "status", width: 15 },
  ];
  styleHeader(ws3.getRow(1));
  DEPLOYER_OBLIGATIONS.forEach((row, i) => {
    const r = ws3.addRow({ ...row, status: "Not Started" });
    styleDataRow(r, i);
  });

  // Sheet 4: Enforcement Timeline
  const ws4 = wb.addWorksheet("Enforcement Timeline", { properties: { tabColor: { argb: "CA8A04" } } });
  ws4.columns = [
    { header: "Date", key: "date", width: 22 },
    { header: "Milestone", key: "milestone", width: 65 },
    { header: "Status", key: "status", width: 15 },
  ];
  styleHeader(ws4.getRow(1));
  ENFORCEMENT_TIMELINE.forEach((row, i) => {
    const r = ws4.addRow(row);
    styleDataRow(r, i);
    if (row.status === "In force") {
      r.getCell("status").font = { size: 10, color: { argb: "16A34A" }, bold: true };
    } else if (row.status === "Upcoming") {
      r.getCell("status").font = { size: 10, color: { argb: "EA580C" }, bold: true };
    }
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  saveAs(blob, `AI-ACT-Buddy-Assessment-${new Date().toISOString().slice(0, 10)}.xlsx`);
}
