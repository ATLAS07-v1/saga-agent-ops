import { z } from "zod";

export const SAGA_COMPANY_NAME = "Saga Teknoloji";

export const departmentSchema = z.enum([
  "executive",
  "revenue_strategy",
  "product_delivery",
  "software_engineering",
  "cybersecurity",
  "automation_growth_content",
  "support_governance_finance"
]);

export const taskStateSchema = z.enum([
  "created",
  "planned",
  "running",
  "waiting_for_agent",
  "waiting_for_approval",
  "approved",
  "rejected",
  "revision_requested",
  "blocked",
  "failed",
  "completed",
  "cancelled"
]);

export const stepStateSchema = z.enum([
  "queued",
  "running",
  "waiting_for_tool",
  "waiting_for_handoff",
  "waiting_for_approval",
  "completed",
  "failed",
  "skipped"
]);

export const approvalStateSchema = z.enum([
  "pending",
  "approved",
  "rejected",
  "revision_requested",
  "blocked",
  "expired",
  "cancelled"
]);

export const handoffTypeSchema = z.enum([
  "handoff",
  "request_clarification",
  "review_request",
  "blocker",
  "summary"
]);

export const memoryLayerSchema = z.enum([
  "company",
  "agent",
  "project",
  "task_run",
  "artifact",
  "eval"
]);

export const memoryTrustSchema = z.enum([
  "unverified",
  "agent_generated",
  "human_approved",
  "source_verified",
  "system_rule"
]);

export const employeeRoleSchema = z.object({
  id: z.number().int().positive(),
  slug: z.string().min(1),
  title: z.string().min(1),
  department: departmentSchema,
  phase: z.number().int().min(1).max(6),
  requiresHumanApprovalForExternalAction: z.boolean()
});

export type Department = z.infer<typeof departmentSchema>;
export type TaskState = z.infer<typeof taskStateSchema>;
export type StepState = z.infer<typeof stepStateSchema>;
export type ApprovalState = z.infer<typeof approvalStateSchema>;
export type HandoffType = z.infer<typeof handoffTypeSchema>;
export type MemoryLayer = z.infer<typeof memoryLayerSchema>;
export type MemoryTrust = z.infer<typeof memoryTrustSchema>;
export type EmployeeRole = z.infer<typeof employeeRoleSchema>;

export const sagaEmployeeRoster = [
  { id: 1, slug: "ai-ceo-chief-of-staff", title: "AI CEO / Ozel Kalem", department: "executive", phase: 2, requiresHumanApprovalForExternalAction: true },
  { id: 2, slug: "lead-researcher", title: "Lead Arastirmacisi", department: "revenue_strategy", phase: 1, requiresHumanApprovalForExternalAction: true },
  { id: 3, slug: "market-intelligence-analyst", title: "Pazar Istihbarat Analisti", department: "revenue_strategy", phase: 2, requiresHumanApprovalForExternalAction: true },
  { id: 4, slug: "sales-strategist", title: "Satis Stratejisti", department: "revenue_strategy", phase: 2, requiresHumanApprovalForExternalAction: true },
  { id: 5, slug: "proposal-drafter", title: "Teklif ve Kapsam Hazirlayici", department: "revenue_strategy", phase: 1, requiresHumanApprovalForExternalAction: true },
  { id: 6, slug: "product-manager", title: "Urun Yoneticisi", department: "product_delivery", phase: 2, requiresHumanApprovalForExternalAction: true },
  { id: 7, slug: "solution-architect", title: "Cozum Mimari", department: "product_delivery", phase: 3, requiresHumanApprovalForExternalAction: true },
  { id: 8, slug: "project-manager", title: "Proje Yoneticisi", department: "product_delivery", phase: 2, requiresHumanApprovalForExternalAction: true },
  { id: 9, slug: "customer-success-manager", title: "Musteri Basari Yoneticisi", department: "product_delivery", phase: 3, requiresHumanApprovalForExternalAction: true },
  { id: 10, slug: "reporting-analyst", title: "Raporlama Analisti", department: "product_delivery", phase: 3, requiresHumanApprovalForExternalAction: true },
  { id: 11, slug: "backend-engineer", title: "Backend Muhendisi", department: "software_engineering", phase: 3, requiresHumanApprovalForExternalAction: true },
  { id: 12, slug: "frontend-engineer", title: "Frontend Muhendisi", department: "software_engineering", phase: 3, requiresHumanApprovalForExternalAction: true },
  { id: 13, slug: "mobile-engineer", title: "Mobil Uygulama Muhendisi", department: "software_engineering", phase: 5, requiresHumanApprovalForExternalAction: true },
  { id: 14, slug: "devops-platform-engineer", title: "DevOps / Platform Muhendisi", department: "software_engineering", phase: 5, requiresHumanApprovalForExternalAction: true },
  { id: 15, slug: "data-integration-engineer", title: "Veri ve Entegrasyon Muhendisi", department: "software_engineering", phase: 5, requiresHumanApprovalForExternalAction: true },
  { id: 16, slug: "qa-test-automation-specialist", title: "QA ve Test Otomasyon Uzmani", department: "software_engineering", phase: 5, requiresHumanApprovalForExternalAction: true },
  { id: 17, slug: "security-kvkk-reviewer", title: "Guvenlik ve KVKK Inceleyici", department: "cybersecurity", phase: 4, requiresHumanApprovalForExternalAction: true },
  { id: 18, slug: "application-security-specialist", title: "Uygulama Guvenligi Uzmani", department: "cybersecurity", phase: 5, requiresHumanApprovalForExternalAction: true },
  { id: 19, slug: "cloud-security-specialist", title: "Cloud / Altyapi Guvenligi Uzmani", department: "cybersecurity", phase: 5, requiresHumanApprovalForExternalAction: true },
  { id: 20, slug: "pentest-vulnerability-analyst", title: "Pentest ve Zafiyet Analisti", department: "cybersecurity", phase: 5, requiresHumanApprovalForExternalAction: true },
  { id: 21, slug: "threat-intelligence-analyst", title: "Threat Intelligence Analisti", department: "cybersecurity", phase: 5, requiresHumanApprovalForExternalAction: true },
  { id: 22, slug: "incident-response-security-ops", title: "Incident Response ve Guvenlik Operasyon Uzmani", department: "cybersecurity", phase: 5, requiresHumanApprovalForExternalAction: true },
  { id: 23, slug: "automation-engineer", title: "Otomasyon Muhendisi", department: "automation_growth_content", phase: 3, requiresHumanApprovalForExternalAction: true },
  { id: 24, slug: "seo-strategist", title: "SEO Stratejisti", department: "automation_growth_content", phase: 4, requiresHumanApprovalForExternalAction: true },
  { id: 25, slug: "content-planner", title: "Icerik Planlayici", department: "automation_growth_content", phase: 4, requiresHumanApprovalForExternalAction: true },
  { id: 26, slug: "campaign-copywriter", title: "Kampanya Metin Yazari", department: "automation_growth_content", phase: 4, requiresHumanApprovalForExternalAction: true },
  { id: 27, slug: "support-triage-specialist", title: "Destek ve Talep Siniflandirma Uzmani", department: "support_governance_finance", phase: 4, requiresHumanApprovalForExternalAction: true },
  { id: 28, slug: "finance-cost-controller", title: "Finans ve Maliyet Kontrol Uzmani", department: "support_governance_finance", phase: 2, requiresHumanApprovalForExternalAction: true },
  { id: 29, slug: "knowledge-manager", title: "Bilgi Kuratoru / Knowledge Manager", department: "support_governance_finance", phase: 4, requiresHumanApprovalForExternalAction: true },
  { id: 30, slug: "compliance-risk-controller", title: "Compliance ve Risk Kontrol Uzmani", department: "support_governance_finance", phase: 5, requiresHumanApprovalForExternalAction: true }
] satisfies EmployeeRole[];

export const contractVersions = {
  runtime: "2026-05-11.runtime.v0",
  memory: "2026-05-11.memory.v0",
  handoff: "2026-05-11.handoff.v0"
} as const;
