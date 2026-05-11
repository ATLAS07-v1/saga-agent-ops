import type { MemoryTrust } from "@saga-agent-ops/shared";

export type KnowledgeSource = {
  id: string;
  title: string;
  sourceType: "markdown" | "system_rule";
  sourceUri: string;
  trust: MemoryTrust;
  summary: string;
  content: string;
  tags: string[];
};

export const phase1KnowledgeBase = [
  {
    id: "saga-service-packages-v0",
    title: "Saga service packages",
    sourceType: "markdown",
    sourceUri: "docs/knowledge/phase-1/saga-service-packages.md",
    trust: "system_rule",
    summary: "Saga'nin AI operasyon, yazilim teslimat ve siber guvenlik hizmet paketleri.",
    content:
      "Primary packages: AI operations audit, managed AI workforce pilot, software delivery planning, application security review, automation opportunity analysis.",
    tags: ["services", "proposal", "scope"]
  },
  {
    id: "pricing-logic-v0",
    title: "Pricing logic",
    sourceType: "markdown",
    sourceUri: "docs/knowledge/phase-1/pricing-logic.md",
    trust: "system_rule",
    summary: "Fiyat ve taahhutler owner onayi olmadan kesinlestirilemez.",
    content:
      "Agents may describe package options and pricing assumptions, but final prices, discounts, and contractual commitments require explicit human approval.",
    tags: ["pricing", "approval", "risk"]
  },
  {
    id: "icp-target-customer-notes-v0",
    title: "ICP and target customer notes",
    sourceType: "markdown",
    sourceUri: "docs/knowledge/phase-1/icp-target-customer-notes.md",
    trust: "system_rule",
    summary: "Saga icin ilk ideal musteri profilleri.",
    content:
      "Priority ICPs: B2B software companies, local service businesses with repeatable operations, agencies, tourism/hotel operators, and companies with software/security delivery needs.",
    tags: ["icp", "sales", "research"]
  },
  {
    id: "offer-style-guide-v0",
    title: "Offer style guide",
    sourceType: "markdown",
    sourceUri: "docs/knowledge/phase-1/offer-style-guide.md",
    trust: "system_rule",
    summary: "Teklif taslaklari net, baglayici olmayan ve approval-ready yazilir.",
    content:
      "Proposal drafts must separate facts, assumptions, risks, scope, out-of-scope items, security notes, and next steps. Avoid absolute claims and binding language.",
    tags: ["proposal", "style", "artifact"]
  },
  {
    id: "approval-risk-rules-v0",
    title: "Approval and risk rules",
    sourceType: "system_rule",
    sourceUri: "docs/knowledge/phase-1/approval-and-risk-rules.md",
    trust: "system_rule",
    summary: "Dis aksiyon, kisisel veri, sozlesme, fiyat ve guvenlik testi onay kapisindadir.",
    content:
      "No external communication, CRM write, personal data memory write, binding offer, active security testing, deployment, or payment may happen without human approval.",
    tags: ["approval", "security", "compliance"]
  }
] satisfies KnowledgeSource[];

export function getPhase1KnowledgeBase() {
  return phase1KnowledgeBase;
}
