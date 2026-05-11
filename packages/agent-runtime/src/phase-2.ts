import { sagaEmployeeRoster } from "@saga-agent-ops/shared";
import type {
  AgentDefinition,
  Artifact,
  HandoffMessage,
  MemoryContext
} from "./index";
import { getPhase1KnowledgeBase } from "./knowledge";
import type { ProviderAdapter } from "./providers";
import { runAgent } from "./runner";

export type Phase2WorkflowType =
  | "lead_to_offer_v2"
  | "weekly_ops_report"
  | "product_scope_draft";

export type Phase2WorkflowInput = {
  workflowType: Phase2WorkflowType;
  companyUrl?: string;
  companyName?: string;
  targetService?: string;
  notes?: string;
  period?: string;
  completedWork?: string[];
  openApprovals?: string[];
  blockers?: string[];
  enableWebResearch?: boolean;
};

export type Phase2TaskStepPlan = {
  order: number;
  agentSlug: string;
  name: string;
  purpose: string;
  expectedArtifactKind: string;
};

export type Phase2AgentCost = {
  agentSlug: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedUsd: number;
};

export type Phase2WorkflowRun = {
  taskId: string;
  runId: string;
  workflowType: Phase2WorkflowType;
  state: "waiting_for_approval" | "blocked" | "failed";
  activeAgents: string[];
  taskPlan: Phase2TaskStepPlan[];
  artifacts: Artifact[];
  handoffs: HandoffMessage[];
  memoryWrites: Array<MemoryContext & { agentSlug?: string }>;
  traceEvents: Array<Record<string, unknown>>;
  approvals: Array<{
    id: string;
    artifactTitle: string;
    state: "pending";
    reason: string;
  }>;
  cost: {
    estimatedUsd: number;
    inputTokens: number;
    outputTokens: number;
  };
  agentCosts: Phase2AgentCost[];
};

const phase2Slugs = [
  "ai-ceo-chief-of-staff",
  "lead-researcher",
  "market-intelligence-analyst",
  "sales-strategist",
  "proposal-drafter",
  "product-manager",
  "project-manager",
  "finance-cost-controller"
];

function role(slug: string) {
  const employee = sagaEmployeeRoster.find((agent) => agent.slug === slug);
  if (!employee) throw new Error(`Missing Saga employee role: ${slug}`);
  return employee;
}

export const phase2ActiveRoster = sagaEmployeeRoster.filter((agent) =>
  phase2Slugs.includes(agent.slug)
);

export const phase2AgentDefinitions = [
  {
    role: role("ai-ceo-chief-of-staff"),
    goal: "Gelen isi parcalamak, dogru calisanlari secmek, onay sinirlarini korumak ve final durumu owner'a tasimak.",
    backstory:
      "Saga'nin operasyon lideri gibi davranir; kendisi her isi yapmaz, gorevi planlar ve calisanlar arasi handoff zincirini kurar.",
    skills: ["task_routing", "risk_triage", "multi_agent_planning", "executive_summary"],
    allowedTools: ["ledger.read", "agent_registry.read", "task_plan.write", "memory.policy_read"],
    memoryScope: ["company", "agent", "project", "task_run", "artifact", "eval"],
    memoryPolicy: {
      read: ["company", "agent", "project", "approved_artifact"],
      write: ["routing_lesson", "blocked_pattern", "approval_pattern"],
      forbidden: ["secrets", "raw_private_conversation", "unapproved_customer_data"]
    },
    outputSchemas: ["task_plan"],
    handoffRules: ["handoff_to_first_planned_worker", "approval_required_for_external_action"],
    approvalBoundaries: ["no_external_action", "no_binding_commitment", "no_security_test"],
    evalCaseIds: [
      "ai-ceo.case-1.route-lead-offer",
      "ai-ceo.case-2-route-weekly-report",
      "ai-ceo.case-3-block-external-action",
      "ai-ceo.case-4-cost-risk",
      "ai-ceo.case-5-handoff-plan"
    ]
  },
  {
    role: role("lead-researcher"),
    goal: "Firma, lead veya hizmet ihtiyacini kaynakli arastirma artifact'ine donusturur.",
    backstory:
      "Saga gelir operasyonunun ilk arastirma calisanidir; kesin iddialari kaynak ve confidence olmadan teklif zincirine tasimaz.",
    skills: [
      "company_profile_research",
      "source_confidence_scoring",
      "icp_signal_detection",
      "trigger_detection",
      "structured_handoff"
    ],
    allowedTools: ["public_web_search.read", "company_website.read", "knowledge_base.read", "memory.policy_write"],
    memoryScope: ["company", "agent", "project", "task_run", "artifact", "eval"],
    memoryPolicy: {
      read: ["company", "agent", "project", "approved_artifact"],
      write: ["icp_signal", "source_quality_note", "research_pattern"],
      forbidden: ["personal_data", "secrets", "unverified_contact_data"]
    },
    outputSchemas: ["lead_research"],
    handoffRules: ["handoff_to_market_intelligence_or_proposal"],
    approvalBoundaries: ["no_outreach", "no_crm_write", "low_confidence_claims_must_be_marked"],
    evalCaseIds: [
      "lead-researcher.case-1.company-url",
      "lead-researcher.case-2.company-name-only",
      "lead-researcher.case-3.personal-data-risk",
      "lead-researcher.case-4.low-source-confidence",
      "lead-researcher.case-5.handoff-quality"
    ]
  },
  {
    role: role("market-intelligence-analyst"),
    goal: "Lead ve sektor sinyallerini pazar, ICP, rakip ve satin alma baglamina cevirir.",
    backstory:
      "Teklif ekibine pazar bakisi verir; kaynaksiz kesin iddia yerine sinyal, varsayim ve dogrulama ihtiyacini ayirir.",
    skills: ["market_research", "icp_segmentation", "competitor_angle", "buying_signal_detection"],
    allowedTools: ["public_web_search.read", "company_website.read", "knowledge_base.read", "memory.policy_write"],
    memoryScope: ["company", "agent", "project", "task_run", "artifact", "eval"],
    memoryPolicy: {
      read: ["company", "agent", "project", "approved_artifact"],
      write: ["icp_pattern", "market_signal", "source_quality_note"],
      forbidden: ["personal_data", "unverified_contact_data", "secrets"]
    },
    outputSchemas: ["market_intelligence_brief"],
    handoffRules: ["handoff_to_sales_strategy_or_proposal"],
    approvalBoundaries: ["low_confidence_claims_must_be_marked", "no_outreach"],
    evalCaseIds: [
      "market.case-1-icp-signal",
      "market.case-2-low-source-risk",
      "market.case-3-competitor-angle",
      "market.case-4-security-service",
      "market.case-5-handoff"
    ]
  },
  {
    role: role("sales-strategist"),
    goal: "Arastirma ve pazar bilgisini satis pozisyonlama, itiraz, discovery ve teklif acisina cevirir.",
    backstory:
      "Kisa vadeli kazanc icin abartili taahhut vermez; Saga'nin guvenli ve onayli AI workforce konumunu korur.",
    skills: ["positioning", "offer_strategy", "objection_handling", "discovery_question_design"],
    allowedTools: ["artifact.read", "knowledge_base.read", "memory.policy_write", "template.render"],
    memoryScope: ["company", "agent", "project", "task_run", "artifact", "eval"],
    memoryPolicy: {
      read: ["company", "agent", "project", "approved_artifact", "eval"],
      write: ["approved_positioning", "rejected_objection_pattern", "offer_angle"],
      forbidden: ["binding_price", "contract_commitment", "private_customer_data"]
    },
    outputSchemas: ["sales_strategy_brief"],
    handoffRules: ["handoff_to_proposal_drafter"],
    approvalBoundaries: ["no_binding_price", "no_external_send", "no_contract_commitment"],
    evalCaseIds: [
      "sales.case-1-positioning",
      "sales.case-2-objections",
      "sales.case-3-discovery",
      "sales.case-4-no-binding-claim",
      "sales.case-5-proposal-handoff"
    ]
  },
  {
    role: role("proposal-drafter"),
    goal: "Role'lerden gelen artifact zincirini onay hazir teklif veya kapsam taslagina cevirir.",
    backstory:
      "Teklifleri baglayici olmayan, kaynakli, varsayimlari ayrilmis ve owner review'a hazir bicimde yazar.",
    skills: [
      "proposal_scope_drafting",
      "assumption_risk_separation",
      "security_compliance_notes",
      "approval_ready_artifact",
      "revision_feedback_use",
      "structured_review_request"
    ],
    allowedTools: ["artifact.read", "knowledge_base.read", "memory.policy_write", "template.render"],
    memoryScope: ["company", "agent", "project", "task_run", "artifact", "eval"],
    memoryPolicy: {
      read: ["company", "agent", "project", "approved_artifact", "task_run"],
      write: ["approved_offer_pattern", "revision_lesson", "rejected_scope_pattern"],
      forbidden: ["final_price_without_approval", "contract_commitment", "secrets"]
    },
    outputSchemas: ["proposal_draft"],
    handoffRules: ["review_request_to_owner"],
    approvalBoundaries: ["proposal_always_needs_review", "no_binding_price", "no_external_send"],
    evalCaseIds: [
      "proposal-drafter.case-1.research-artifact",
      "proposal-drafter.case-2.insufficient-sources",
      "proposal-drafter.case-3.security-package",
      "proposal-drafter.case-4.final-price-request",
      "proposal-drafter.case-5.approval-handoff"
    ]
  },
  {
    role: role("product-manager"),
    goal: "Is ihtiyacini urun kapsam, kullanici isi, kabul kriteri ve teslim varsayimlarina donusturur.",
    backstory:
      "Saga icin scope creep'i onler; yazilim/AI operasyon isteklerini uygulanabilir kapsam parcalarina ayirir.",
    skills: ["scope_design", "acceptance_criteria", "user_story_mapping", "product_risk"],
    allowedTools: ["artifact.read", "knowledge_base.read", "memory.policy_write", "template.render"],
    memoryScope: ["company", "agent", "project", "task_run", "artifact", "eval"],
    memoryPolicy: {
      read: ["company", "agent", "project", "approved_artifact"],
      write: ["scope_pattern", "acceptance_criteria_pattern", "delivery_risk"],
      forbidden: ["unapproved_customer_secret", "raw_private_message"]
    },
    outputSchemas: ["product_scope_brief"],
    handoffRules: ["handoff_to_proposal_or_project_manager"],
    approvalBoundaries: ["no_commitment_without_owner", "high_risk_scope_requires_review"],
    evalCaseIds: [
      "product.case-1-scope",
      "product.case-2-acceptance",
      "product.case-3-out-of-scope",
      "product.case-4-security-boundary",
      "product.case-5-handoff"
    ]
  },
  {
    role: role("project-manager"),
    goal: "Saga ic operasyonlarini haftalik rapor, durum, blokaj, onay ve sonraki adim olarak toparlar.",
    backstory:
      "Gercek bir proje yoneticisi gibi ciktilari takip eder; eksik onaylari ve blokajlari owner'a net tasir.",
    skills: ["status_reporting", "blocker_tracking", "approval_followup", "weekly_planning"],
    allowedTools: ["ledger.read", "approval_queue.read", "cost_dashboard.read", "memory.policy_write"],
    memoryScope: ["company", "agent", "project", "task_run", "artifact", "eval"],
    memoryPolicy: {
      read: ["company", "agent", "project", "task_run", "approved_artifact"],
      write: ["weekly_report_pattern", "blocker_pattern", "decision_log"],
      forbidden: ["secrets", "unapproved_customer_data"]
    },
    outputSchemas: ["weekly_ops_report"],
    handoffRules: ["handoff_to_finance_or_owner_review"],
    approvalBoundaries: ["report_requires_owner_review_before_external_share"],
    evalCaseIds: [
      "project.case-1-weekly-summary",
      "project.case-2-blockers",
      "project.case-3-approval-followup",
      "project.case-4-cost-risk",
      "project.case-5-next-week-plan"
    ]
  },
  {
    role: role("finance-cost-controller"),
    goal: "Token/tool maliyeti, fiyat riski, margin varsayimi ve bilgi guncelleme adaylarini kontrol eder.",
    backstory:
      "Finans ve bilgi disiplinini ayni kapida tutar; final fiyat veya taahhut vermez, riskleri owner onayina tasir.",
    skills: ["cost_review", "budget_cap_review", "margin_risk", "knowledge_update_candidate"],
    allowedTools: ["ledger.read", "cost_dashboard.read", "memory.policy_write", "knowledge_base.read"],
    memoryScope: ["company", "agent", "project", "task_run", "artifact", "eval"],
    memoryPolicy: {
      read: ["company", "agent", "project", "task_run", "eval"],
      write: ["cost_pattern", "approved_budget_rule", "feedback_to_knowledge_candidate"],
      forbidden: ["bank_data", "payment_data", "binding_financial_commitment"]
    },
    outputSchemas: ["cost_control_report", "knowledge_update_candidate"],
    handoffRules: ["review_request_to_owner"],
    approvalBoundaries: ["no_final_price", "no_payment", "knowledge_update_requires_policy"],
    evalCaseIds: [
      "finance.case-1-cost-summary",
      "finance.case-2-budget-cap",
      "finance.case-3-margin-risk",
      "finance.case-4-memory-candidate",
      "finance.case-5-approval-boundary"
    ]
  }
] satisfies AgentDefinition[];

export const phase2WorkflowPlans: Record<Phase2WorkflowType, Phase2TaskStepPlan[]> = {
  lead_to_offer_v2: [
    {
      order: 1,
      agentSlug: "ai-ceo-chief-of-staff",
      name: "Gorev planlama ve yonlendirme",
      purpose: "Isi calisanlara bol ve onay sinirlarini belirle.",
      expectedArtifactKind: "task_plan"
    },
    {
      order: 2,
      agentSlug: "lead-researcher",
      name: "Kaynakli lead arastirmasi",
      purpose: "Firma, hizmet ihtiyaci ve kaynak guvenini cikar.",
      expectedArtifactKind: "lead_research"
    },
    {
      order: 3,
      agentSlug: "market-intelligence-analyst",
      name: "Pazar ve ICP istihbarati",
      purpose: "Pazar, ICP, rakip ve satin alma sinyallerini ayrıştır.",
      expectedArtifactKind: "market_intelligence_brief"
    },
    {
      order: 4,
      agentSlug: "sales-strategist",
      name: "Satis stratejisi",
      purpose: "Pozisyonlama, itiraz ve discovery acilarini hazirla.",
      expectedArtifactKind: "sales_strategy_brief"
    },
    {
      order: 5,
      agentSlug: "proposal-drafter",
      name: "Teklif ve kapsam taslagi",
      purpose: "Tum artifact zincirini approval-ready teklif taslagina cevir.",
      expectedArtifactKind: "proposal_draft"
    },
    {
      order: 6,
      agentSlug: "finance-cost-controller",
      name: "Maliyet ve bilgi kontrolu",
      purpose: "Maliyet, budget ve knowledge update adaylarini kontrol et.",
      expectedArtifactKind: "cost_control_report"
    }
  ],
  weekly_ops_report: [
    {
      order: 1,
      agentSlug: "ai-ceo-chief-of-staff",
      name: "Haftalik rapor planlama",
      purpose: "Operasyon raporunun kapsam ve onay sinirlarini belirle.",
      expectedArtifactKind: "task_plan"
    },
    {
      order: 2,
      agentSlug: "project-manager",
      name: "Haftalik operasyon raporu",
      purpose: "Tamamlanan is, blokaj ve sonraki hafta planini toparla.",
      expectedArtifactKind: "weekly_ops_report"
    },
    {
      order: 3,
      agentSlug: "finance-cost-controller",
      name: "Maliyet ve bilgi kontrolu",
      purpose: "Raporun maliyet ve bilgi guncelleme risklerini kontrol et.",
      expectedArtifactKind: "cost_control_report"
    }
  ],
  product_scope_draft: [
    {
      order: 1,
      agentSlug: "ai-ceo-chief-of-staff",
      name: "Urun kapsam yonlendirme",
      purpose: "Urun/kapsam isini dogru calisanlara dagit.",
      expectedArtifactKind: "task_plan"
    },
    {
      order: 2,
      agentSlug: "product-manager",
      name: "Urun kapsam taslagi",
      purpose: "Problem, kapsam, kabul kriteri ve riskleri yaz.",
      expectedArtifactKind: "product_scope_brief"
    },
    {
      order: 3,
      agentSlug: "proposal-drafter",
      name: "Kapsam teklif taslagi",
      purpose: "Urun kapsamini approval-ready teklif/kapsam diline cevir.",
      expectedArtifactKind: "proposal_draft"
    },
    {
      order: 4,
      agentSlug: "finance-cost-controller",
      name: "Maliyet ve bilgi kontrolu",
      purpose: "Kapsam maliyeti ve bilgi update adaylarini kontrol et.",
      expectedArtifactKind: "cost_control_report"
    }
  ]
};

function definitionFor(slug: string) {
  const definition = phase2AgentDefinitions.find((agent) => agent.role.slug === slug);
  if (!definition) throw new Error(`Missing Phase 2 definition: ${slug}`);
  return definition;
}

function normalizeCompanyName(input: Phase2WorkflowInput) {
  if (input.companyName?.trim()) return input.companyName.trim();

  if (input.companyUrl) {
    try {
      const hostname = new URL(input.companyUrl).hostname.replace(/^www\./, "");
      return hostname.split(".")[0] ?? "Saga Teknoloji";
    } catch {
      return "Saga Teknoloji";
    }
  }

  return "Saga Teknoloji";
}

function targetServiceFor(input: Phase2WorkflowInput) {
  if (input.targetService?.trim()) return input.targetService.trim();
  if (input.workflowType === "weekly_ops_report") return "Saga haftalik operasyon raporu";
  if (input.workflowType === "product_scope_draft") return "AI calisanli urun kapsam taslagi";
  return "AI calisanli sirket isletim sistemi";
}

function approvalReasonFor(workflowType: Phase2WorkflowType) {
  if (workflowType === "weekly_ops_report") return "Haftalik operasyon raporu owner onayi gerektirir.";
  if (workflowType === "product_scope_draft") return "Urun kapsam taslagi owner onayi gerektirir.";
  return "Lead-to-offer v2 final paketi insan onayi gerektirir.";
}

export async function runPhase2Workflow(
  input: Phase2WorkflowInput,
  options: { provider?: ProviderAdapter } = {}
): Promise<Phase2WorkflowRun> {
  const taskId = "task_phase2_runtime";
  const runId = "run_phase2_runtime";
  const workflowType = input.workflowType;
  const taskPlan = phase2WorkflowPlans[workflowType];
  const knowledgeSources = getPhase1KnowledgeBase();
  const targetService = targetServiceFor(input);
  const companyName = normalizeCompanyName(input);
  const artifacts: Artifact[] = [];
  const handoffs: HandoffMessage[] = [];
  const memoryWrites: Array<MemoryContext & { agentSlug?: string }> = [];
  const traceEvents: Array<Record<string, unknown>> = [
    {
      eventType: "workflow.planned",
      message: `${workflowType} icin ${taskPlan.length} adimli Phase 2 plan olusturuldu`,
      agentSlug: "orchestration-engine"
    }
  ];
  const agentCosts: Phase2AgentCost[] = [];

  for (const [index, step] of taskPlan.entries()) {
    const nextStep = taskPlan[index + 1];
    const definition = definitionFor(step.agentSlug);
    const researchArtifact = artifacts.find((artifact) => artifact.kind === "lead_research");
    const constraints = artifacts.flatMap((artifact) => {
      const risks = artifact.payload.risks;
      return Array.isArray(risks) ? risks.filter((risk): risk is string => typeof risk === "string") : [];
    });

    const result = await runAgent(
      {
        tenantId: "saga-local",
        taskId,
        runId,
        agentSlug: step.agentSlug,
        promptVersion: `${step.agentSlug}@2026-05-11.phase2.v1`,
        input: {
          workflowType,
          companyName,
          ...(input.companyUrl ? { companyUrl: input.companyUrl } : {}),
          targetService,
          ...(input.notes ? { notes: input.notes } : {}),
          ...(input.period ? { period: input.period } : {}),
          ...(input.completedWork ? { completedWork: input.completedWork } : {}),
          ...(input.openApprovals ? { openApprovals: input.openApprovals } : {}),
          ...(input.blockers ? { blockers: input.blockers } : {}),
          ...(input.enableWebResearch ? { enableWebResearch: true } : {}),
          plannedAgents: taskPlan.map((item) => item.agentSlug),
          previousArtifacts: artifacts,
          ...(researchArtifact ? { researchArtifact } : {}),
          constraints,
          ...(nextStep ? { nextAgentSlug: nextStep.agentSlug } : {})
        },
        memoryContext: [
          {
            layer: "company",
            trust: "system_rule",
            title: "Saga Phase 2 operating rule",
            content:
              "Faz 2 calisanlari gercek artifact, handoff, cost, trace ve memory kaydi uretir; dis aksiyon onaysiz yapilmaz."
          },
          ...memoryWrites.map((memory) => ({
            layer: memory.layer,
            trust: memory.trust,
            title: memory.title,
            content: memory.content,
            ...(memory.sourceId ? { sourceId: memory.sourceId } : {})
          }))
        ],
        budget: {
          maxUsd: 0.08,
          maxSteps: taskPlan.length + 2
        }
      },
      {
        definition,
        knowledgeSources,
        ...(options.provider ? { provider: options.provider } : {})
      }
    );

    if (result.status === "blocked" || result.status === "failed") {
      return {
        taskId,
        runId,
        workflowType,
        state: result.status,
        activeAgents: taskPlan.slice(0, index + 1).map((item) => item.agentSlug),
        taskPlan,
        artifacts: [...artifacts, ...result.artifacts],
        handoffs: [...handoffs, ...result.handoffs],
        memoryWrites: [
          ...memoryWrites,
          ...result.memoryWrites.map((memory) => ({ ...memory, agentSlug: step.agentSlug }))
        ],
        traceEvents: [...traceEvents, ...result.traceEvents],
        approvals: [],
        cost: {
          estimatedUsd: Number(
            (agentCosts.reduce((total, cost) => total + cost.estimatedUsd, 0) + result.cost.estimatedUsd).toFixed(6)
          ),
          inputTokens: agentCosts.reduce((total, cost) => total + cost.inputTokens, 0) + result.cost.inputTokens,
          outputTokens: agentCosts.reduce((total, cost) => total + cost.outputTokens, 0) + result.cost.outputTokens
        },
        agentCosts: [
          ...agentCosts,
          {
            agentSlug: step.agentSlug,
            provider: options.provider?.name ?? "local-runtime",
            model: options.provider?.model ?? "phase-1-deterministic-worker",
            inputTokens: result.cost.inputTokens,
            outputTokens: result.cost.outputTokens,
            estimatedUsd: result.cost.estimatedUsd
          }
        ]
      };
    }

    artifacts.push(...result.artifacts);
    handoffs.push(...result.handoffs);
    memoryWrites.push(...result.memoryWrites.map((memory) => ({ ...memory, agentSlug: step.agentSlug })));
    traceEvents.push(
      {
        eventType: "workflow.step.completed",
        message: `${step.name} tamamlandi`,
        agentSlug: step.agentSlug,
        promptVersion: `${step.agentSlug}@2026-05-11.phase2.v1`
      },
      ...result.traceEvents
    );
    agentCosts.push({
      agentSlug: step.agentSlug,
      provider: options.provider?.name ?? "local-runtime",
      model: options.provider?.model ?? "phase-1-deterministic-worker",
      inputTokens: result.cost.inputTokens,
      outputTokens: result.cost.outputTokens,
      estimatedUsd: result.cost.estimatedUsd
    });
  }

  const cost = {
    estimatedUsd: Number(agentCosts.reduce((total, item) => total + item.estimatedUsd, 0).toFixed(6)),
    inputTokens: agentCosts.reduce((total, item) => total + item.inputTokens, 0),
    outputTokens: agentCosts.reduce((total, item) => total + item.outputTokens, 0)
  };
  const finalArtifact = artifacts[artifacts.length - 1];

  return {
    taskId,
    runId,
    workflowType,
    state: "waiting_for_approval",
    activeAgents: taskPlan.map((step) => step.agentSlug),
    taskPlan,
    artifacts,
    handoffs,
    memoryWrites,
    traceEvents: [
      ...traceEvents,
      {
        eventType: "approval.requested",
        message: `${workflowType} final artifact owner approval bekliyor`,
        agentSlug: finalArtifact?.payload.agentSlug ?? "orchestration-engine"
      }
    ],
    approvals: [
      {
        id: "approval_phase2_runtime",
        artifactTitle: finalArtifact?.title ?? "Phase 2 final artifact",
        state: "pending",
        reason: approvalReasonFor(workflowType)
      }
    ],
    cost,
    agentCosts
  };
}
