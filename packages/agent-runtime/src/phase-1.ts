import { sagaEmployeeRoster } from "@saga-agent-ops/shared";
import type {
  AgentDefinition,
  Artifact,
  HandoffMessage,
  MemoryContext
} from "./index";
import { getPhase1KnowledgeBase } from "./knowledge";
import { runAgent } from "./runner";

const leadResearcherRole = sagaEmployeeRoster.find(
  (agent) => agent.slug === "lead-researcher"
);
const proposalDrafterRole = sagaEmployeeRoster.find(
  (agent) => agent.slug === "proposal-drafter"
);

if (!leadResearcherRole || !proposalDrafterRole) {
  throw new Error("Phase 1 agent roster is incomplete.");
}

export const phase1AgentDefinitions = [
  {
    role: leadResearcherRole,
    skills: [
      "company_profile_research",
      "source_confidence_scoring",
      "icp_signal_detection",
      "trigger_detection",
      "pain_point_hypothesis",
      "structured_handoff"
    ],
    allowedTools: ["public_web_search.read", "company_website.read", "knowledge_base.read", "memory.policy_write"],
    memoryScope: ["company", "agent", "project", "task_run", "artifact", "eval"],
    approvalBoundaries: [
      "no_external_outreach",
      "no_crm_write",
      "no_personal_data_memory_without_approval",
      "low_confidence_claims_must_be_marked"
    ],
    evalCaseIds: [
      "lead-researcher.case-1.company-url",
      "lead-researcher.case-2.company-name-only",
      "lead-researcher.case-3.personal-data-risk",
      "lead-researcher.case-4.low-source-confidence",
      "lead-researcher.case-5.handoff-quality"
    ]
  },
  {
    role: proposalDrafterRole,
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
    approvalBoundaries: [
      "proposal_always_needs_review",
      "no_binding_price",
      "no_external_send",
      "no_contractual_commitment"
    ],
    evalCaseIds: [
      "proposal-drafter.case-1.research-artifact",
      "proposal-drafter.case-2.insufficient-sources",
      "proposal-drafter.case-3.security-package",
      "proposal-drafter.case-4.final-price-request",
      "proposal-drafter.case-5.approval-handoff"
    ]
  }
] satisfies AgentDefinition[];

export type Phase1PreviewInput = {
  companyUrl: string;
  companyName?: string;
  targetService?: string;
  notes?: string;
};

export type Phase1PreviewRun = {
  taskId: string;
  runId: string;
  state: "waiting_for_approval" | "blocked" | "failed";
  activeAgents: string[];
  artifacts: Artifact[];
  handoffs: HandoffMessage[];
  memoryWrites: MemoryContext[];
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
};

function normalizeCompanyName(input: Phase1PreviewInput) {
  if (input.companyName?.trim()) return input.companyName.trim();

  try {
    const hostname = new URL(input.companyUrl).hostname.replace(/^www\./, "");
    return hostname.split(".")[0] ?? "unknown-company";
  } catch {
    return "unknown-company";
  }
}

export async function runPhase1Workflow(input: Phase1PreviewInput): Promise<Phase1PreviewRun> {
  const taskId = "task_phase1_runtime";
  const runId = "run_phase1_runtime";
  const targetService = input.targetService ?? "AI operasyon ve otomasyon on analizi";
  const knowledgeSources = getPhase1KnowledgeBase();

  const researchResult = await runAgent(
    {
      tenantId: "saga-local",
      taskId,
      runId,
      agentSlug: "lead-researcher",
      promptVersion: "lead-researcher@2026-05-11.v1",
      input: {
        companyUrl: input.companyUrl,
        ...(input.companyName ? { companyName: input.companyName } : {}),
        targetService,
        ...(input.notes ? { notes: input.notes } : {})
      },
      memoryContext: [
        {
          layer: "company",
          trust: "system_rule",
          title: "Saga approval boundaries",
          content:
            "Dis aksiyon, CRM write, baglayici fiyat, kisisel veri memory write ve aktif guvenlik testi insan onayi gerektirir."
        }
      ],
      budget: {
        maxUsd: 0.05,
        maxSteps: 4
      }
    },
    {
      definition: phase1AgentDefinitions[0]!,
      knowledgeSources
    }
  );

  if (researchResult.status === "blocked" || researchResult.status === "failed") {
    return {
      taskId,
      runId,
      state: researchResult.status,
      activeAgents: ["lead-researcher"],
      artifacts: researchResult.artifacts,
      handoffs: researchResult.handoffs,
      memoryWrites: researchResult.memoryWrites,
      traceEvents: researchResult.traceEvents,
      approvals: [],
      cost: researchResult.cost
    };
  }

  const researchArtifact = researchResult.artifacts[0];
  const researchPayload = researchArtifact?.payload ?? {};
  const researchRisks = Array.isArray(researchPayload.risks)
    ? researchPayload.risks.filter((risk): risk is string => typeof risk === "string")
    : [];

  const proposalResult = await runAgent(
    {
      tenantId: "saga-local",
      taskId,
      runId,
      agentSlug: "proposal-drafter",
      promptVersion: "proposal-drafter@2026-05-11.v1",
      input: {
        researchArtifact,
        researchSummary:
          typeof researchPayload.handoffSummary === "string"
            ? researchPayload.handoffSummary
            : "Research handoff summary missing.",
        targetService,
        constraints: researchRisks
      },
      memoryContext: [
        ...researchResult.memoryWrites,
        {
          layer: "company",
          trust: "system_rule",
          title: "Saga offer style",
          content:
            "Teklif taslaklari baglayici olmayan dil kullanir; kapsam, varsayim, risk, onay ve sonraki adim ayridir."
        }
      ],
      budget: {
        maxUsd: 0.05,
        maxSteps: 4
      }
    },
    {
      definition: phase1AgentDefinitions[1]!,
      knowledgeSources
    }
  );

  const totalCost = {
    estimatedUsd: Number((researchResult.cost.estimatedUsd + proposalResult.cost.estimatedUsd).toFixed(6)),
    inputTokens: researchResult.cost.inputTokens + proposalResult.cost.inputTokens,
    outputTokens: researchResult.cost.outputTokens + proposalResult.cost.outputTokens
  };

  if (proposalResult.status === "blocked" || proposalResult.status === "failed") {
    return {
      taskId,
      runId,
      state: proposalResult.status,
      activeAgents: ["lead-researcher", "proposal-drafter"],
      artifacts: [...researchResult.artifacts, ...proposalResult.artifacts],
      handoffs: [...researchResult.handoffs, ...proposalResult.handoffs],
      memoryWrites: [...researchResult.memoryWrites, ...proposalResult.memoryWrites],
      traceEvents: [...researchResult.traceEvents, ...proposalResult.traceEvents],
      approvals: [],
      cost: totalCost
    };
  }

  const proposalArtifact = proposalResult.artifacts[0];

  return {
    taskId,
    runId,
    state: "waiting_for_approval",
    activeAgents: ["lead-researcher", "proposal-drafter"],
    artifacts: [...researchResult.artifacts, ...proposalResult.artifacts],
    handoffs: [...researchResult.handoffs, ...proposalResult.handoffs],
    memoryWrites: [...researchResult.memoryWrites, ...proposalResult.memoryWrites],
    traceEvents: [...researchResult.traceEvents, ...proposalResult.traceEvents],
    approvals: [
      {
        id: "approval_proposal_runtime",
        artifactTitle: proposalArtifact?.title ?? "Teklif taslagi",
        state: "pending",
        reason: "Her teklif taslagi insan onayi gerektirir."
      }
    ],
    cost: totalCost
  };
}

export function runPhase1PreviewWorkflow(input: Phase1PreviewInput): Phase1PreviewRun {
  const companyName = normalizeCompanyName(input);
  const targetService = input.targetService ?? "AI operasyon ve otomasyon ön analizi";
  const taskId = "task_phase1_preview";
  const runId = "run_phase1_preview";

  const researchArtifact: Artifact = {
    kind: "lead_research",
    title: `${companyName} kaynaklı araştırma özeti`,
    payload: {
      company: {
        name: companyName,
        url: input.companyUrl,
        industry: "Belirlenecek",
        locationSignals: [],
        offerSignals: [targetService]
      },
      researchFindings: [
        {
          claim: "Firma için kaynaklı araştırma başlatıldı.",
          sourceUrl: input.companyUrl,
          confidence: "medium"
        },
        {
          claim: "Teklif üretimi için hedef hizmet sinyali kullanıcı girdisinden alındı.",
          sourceUrl: "user_input",
          confidence: "high"
        },
        {
          claim: "Faz 1 preview modunda canlı web scraping yapılmadan schema doğrulanıyor.",
          sourceUrl: "system_preview",
          confidence: "high"
        }
      ],
      painPoints: [
        "Operasyonel tekrar eden işlerin otomasyon potansiyeli var.",
        "Kaynak, maliyet, trace ve onay kaydı olmadan AI çalışan operasyonu güvenli ölçeklenemez."
      ],
      opportunityHypotheses: [
        `${targetService} için kontrollü AI çalışan pilotu önerilebilir.`,
        "İlk değer alanı araştırma, teklif ve güvenli teslimat planlama akışıdır."
      ],
      icpFit: {
        score: 68,
        reason: "Preview girdisi teknoloji/yazılım hizmetiyle eşleşebilir; kaynaklı doğrulama gerekir."
      },
      risks: ["Kaynaklar gerçek araştırma aşamasında doğrulanmalı.", "Dış aksiyon insan onayı gerektirir."],
      handoffSummary: `${companyName} için ${targetService} odaklı teklif taslağı hazırlanabilir; kaynak güven notları korunmalı.`
    },
    sources: [
      {
        title: "User-provided company URL",
        url: input.companyUrl,
        note: "Faz 1 preview input"
      }
    ]
  };

  const proposalArtifact: Artifact = {
    kind: "proposal_draft",
    title: `${companyName} için teklif taslağı`,
    payload: {
      proposalTitle: `${companyName} - ${targetService} Taslak Teklif`,
      clientContext: `${companyName} için ilk araştırma artifact'i üzerinden ön kapsam taslağı oluşturuldu.`,
      problemHypothesis:
        "Firma, AI destekli operasyon kurarken izlenebilir görev, kaynak, maliyet, onay ve hafıza katmanına ihtiyaç duyabilir.",
      recommendedScope: [
        "AI çalışan operasyon analizi",
        "Lead -> Research -> Offer Draft -> Approval workflow kurulumu",
        "Agent memory, trace, source ve cost kayıtlarının yapılandırılması",
        "İnsan onaylı pilot raporu"
      ],
      deliverables: [
        "Kaynaklı araştırma raporu",
        "Teklif ve kapsam taslağı",
        "Risk ve varsayım listesi",
        "Approval-ready artifact"
      ],
      outOfScope: ["Otomatik müşteri iletişimi", "Bağlayıcı fiyat", "CRM write", "Canlı deployment"],
      assumptions: ["Kaynaklar Faz 1 gerçek araştırma adımında doğrulanacak.", "Nihai teklif insan onayıyla gönderilecek."],
      securityAndComplianceNotes: [
        "Kişisel veri kalıcı memory'ye yazılmayacak.",
        "Dış sistemlere yazma ve müşteri iletişimi approval gate arkasında kalacak."
      ],
      risks: ["Kaynaksız iddialar teklif metnine taşınmamalı.", "Fiyat ve taahhüt owner onayı olmadan kesinleşmemeli."],
      nextStep: "Owner review: approve / reject / revise",
      confidence: 0.72,
      approvalState: "needs_review"
    },
    sources: [
      {
        title: researchArtifact.title,
        note: "Produced by Lead Araştırmacısı"
      }
    ]
  };

  const handoff: HandoffMessage = {
    type: "handoff",
    fromAgentSlug: "lead-researcher",
    toAgentSlug: "proposal-drafter",
    taskId,
    summary: researchArtifact.payload.handoffSummary as string,
    artifactIds: ["artifact_lead_research_preview"],
    requiresResponse: true
  };

  const reviewRequest: HandoffMessage = {
    type: "review_request",
    fromAgentSlug: "proposal-drafter",
    taskId,
    summary: "Teklif taslağı owner approval inbox'a düşürülmeli.",
    artifactIds: ["artifact_proposal_draft_preview"],
    requiresResponse: true
  };

  return {
    taskId,
    runId,
    state: "waiting_for_approval",
    activeAgents: ["lead-researcher", "proposal-drafter"],
    artifacts: [researchArtifact, proposalArtifact],
    handoffs: [handoff, reviewRequest],
    memoryWrites: [
      {
        layer: "task_run",
        trust: "agent_generated",
        title: `${companyName} research summary candidate`,
        content: `${targetService} için ön araştırma ve teklif taslağı üretildi. Kalıcı memory için insan onayı gerekir.`
      }
    ],
    traceEvents: [
      { eventType: "task.created", message: "Phase 1 preview task created", agentSlug: "orchestration-engine" },
      { eventType: "agent.completed", message: "Lead Araştırmacısı research artifact üretti", agentSlug: "lead-researcher" },
      { eventType: "handoff.created", message: "Research artifact Teklif Hazırlayıcı'ya devredildi", agentSlug: "lead-researcher" },
      { eventType: "agent.completed", message: "Teklif Hazırlayıcı proposal draft üretti", agentSlug: "proposal-drafter" },
      { eventType: "approval.requested", message: "Proposal owner approval bekliyor", agentSlug: "proposal-drafter" }
    ],
    approvals: [
      {
        id: "approval_proposal_preview",
        artifactTitle: proposalArtifact.title,
        state: "pending",
        reason: "Her teklif taslağı insan onayı gerektirir."
      }
    ],
    cost: {
      estimatedUsd: 0.0,
      inputTokens: 0,
      outputTokens: 0
    }
  };
}
