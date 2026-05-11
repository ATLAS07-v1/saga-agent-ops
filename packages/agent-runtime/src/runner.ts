import type { TaskState } from "@saga-agent-ops/shared";
import type {
  AgentDefinition,
  AgentRunInput,
  AgentRunResult,
  Artifact,
  HandoffMessage,
  MemoryContext
} from "./index";
import { agentRunResultSchema } from "./index";
import { getPhase1KnowledgeBase, type KnowledgeSource } from "./knowledge";
import {
  collectRequestedTools,
  defaultRuntimePolicy,
  findBlockedTools,
  runWithRetryAndTimeout,
  type RuntimePolicy
} from "./policies";
import { localDeterministicProvider, type ProviderAdapter } from "./providers";
import { fetchCompanyWebsiteSummary, type WebResearchResult } from "./tools";

export type RunAgentOptions = {
  definition: AgentDefinition;
  provider?: ProviderAdapter;
  runtimePolicy?: RuntimePolicy;
  knowledgeSources?: KnowledgeSource[];
};

function valueAsString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function normalizeCompanyName(input: AgentRunInput["input"]) {
  const companyName = valueAsString(input.companyName, "");
  if (companyName) return companyName;

  const companyUrl = valueAsString(input.companyUrl, "");
  try {
    const hostname = new URL(companyUrl).hostname.replace(/^www\./, "");
    return hostname.split(".")[0] ?? "unknown-company";
  } catch {
    return "unknown-company";
  }
}

function sourceFromInput(input: AgentRunInput["input"]) {
  const companyUrl = valueAsString(input.companyUrl, "");

  return companyUrl
    ? [
        {
          title: "User-provided company URL",
          url: companyUrl,
          note: "Human supplied Phase 1 input"
        }
      ]
    : [
        {
          title: "User-provided lead description",
          note: "Human supplied Phase 1 input"
        }
      ];
}

function buildLeadResearchResult(
  input: AgentRunInput,
  provider: ProviderAdapter,
  providerCost: { inputTokens: number; outputTokens: number; estimatedUsd: number },
  knowledgeSources: KnowledgeSource[],
  webResearch?: WebResearchResult
) {
  const companyName = normalizeCompanyName(input.input);
  const companyUrl = valueAsString(input.input.companyUrl, "");
  const targetService = valueAsString(input.input.targetService, "AI operasyon ve otomasyon on analizi");
  const notes = valueAsString(input.input.notes, "");
  const privacyRisk = /personal|phone|email|kişisel|kisisel|telefon/i.test(notes);
  const sourceWarning = companyUrl.length === 0 ? "insufficient_sources" : undefined;

  const researchArtifact: Artifact = {
    kind: "lead_research",
    title: `${companyName} kaynakli arastirma ozeti`,
    payload: {
      company: {
        name: companyName,
        url: companyUrl || "not_provided",
        industry: "Dogrulanacak",
        locationSignals: [],
        offerSignals: [targetService]
      },
      researchFindings: [
        {
          claim: "Firma bilgisi Phase 1 input uzerinden alindi.",
          sourceUrl: companyUrl || "user_input",
          confidence: companyUrl ? "medium" : "low"
        },
        {
          claim: "Hedef hizmet sinyali teklif kapsaminda kullanilabilir.",
          sourceUrl: "user_input",
          confidence: "high"
        },
        {
          claim: "Saga bilgi tabani teklif sinirlari ve onay kurallari icin kullanildi.",
          sourceUrl: "docs/knowledge/phase-1",
          confidence: "high"
        },
        {
          claim: webResearch?.ok
            ? `Company website read-only tool returned ${webResearch.title ?? "a page"}`
            : "Company website read-only tool did not return verified page content.",
          sourceUrl: webResearch?.url ?? (companyUrl || "company_website.read"),
          confidence: webResearch?.ok ? "medium" : "low"
        }
      ],
      painPoints: [
        "Tekrarlayan operasyonlarin izlenebilir AI calisan akisina baglanma potansiyeli var.",
        "Kaynak, maliyet, trace ve onay kaydi olmadan AI operasyonu guvenli olceklenemez."
      ],
      opportunityHypotheses: [
        `${targetService} icin kontrollu AI calisan pilotu onerilebilir.`,
        "Ilk deger alani arastirma, teklif ve guvenli teslimat planlama akisidir."
      ],
      icpFit: {
        score: companyUrl ? 68 : 42,
        reason: companyUrl
          ? "Firma URL'si mevcut; kaynakli dogrulama ve teklif taslagi icin yeterli baslangic sinyali var."
          : "Firma bilgisi zayif; tekliften once ek kaynak dogrulamasi gerekir."
      },
      risks: [
        ...(sourceWarning ? [sourceWarning] : []),
        ...(privacyRisk ? ["personal_data_request_blocked"] : []),
        ...(webResearch && !webResearch.ok ? [`web_research_${webResearch.error ?? "unverified"}`] : []),
        "Dis aksiyon ve CRM write insan onayi olmadan yapilamaz."
      ],
      handoffSummary: `${companyName} icin ${targetService} odakli teklif taslagi hazirlanabilir; kaynak guven notlari korunmali.`,
      toolResults: webResearch ? [webResearch] : [],
      knowledgeUsed: knowledgeSources.map((source) => source.id)
    },
    sources: [
      ...sourceFromInput(input.input),
      ...(webResearch
        ? [
            {
              title: webResearch.ok ? "Read-only company website summary" : "Read-only company website attempt",
              url: webResearch.url,
              note: webResearch.ok
                ? `status=${webResearch.status}; title=${webResearch.title ?? "not_found"}`
                : `error=${webResearch.error ?? "unknown"}`
            }
          ]
        : [])
    ]
  };

  const handoff: HandoffMessage = {
    type: "handoff",
    fromAgentSlug: "lead-researcher",
    toAgentSlug: "proposal-drafter",
    taskId: input.taskId,
    summary: researchArtifact.payload.handoffSummary as string,
    artifactIds: ["artifact_lead_research_runtime"],
    requiresResponse: true
  };

  const memoryWrite: MemoryContext = {
    layer: "task_run",
    trust: "agent_generated",
    title: `${companyName} lead research memory candidate`,
    content: `${targetService} icin arastirma ozeti uretildi. Kalici memory icin owner onayi gerekir.`
  };

  return agentRunResultSchema.parse({
    status: "completed" satisfies TaskState,
    artifacts: [researchArtifact],
    handoffs: [handoff],
    memoryWrites: [memoryWrite],
    traceEvents: [
      {
        eventType: "agent.started",
        message: "Lead Arastirmacisi context pack yukledi",
        agentSlug: input.agentSlug,
        promptVersion: input.promptVersion
      },
      {
        eventType: "provider.completed",
        message: `${provider.name}/${provider.model} provider adapter tamamlandi`,
        agentSlug: input.agentSlug,
        promptVersion: input.promptVersion
      },
      {
        eventType: webResearch?.ok ? "tool.completed" : "tool.skipped_or_failed",
        message: webResearch
          ? `company_website.read ${webResearch.ok ? "completed" : "failed"}`
          : "company_website.read not requested",
        agentSlug: input.agentSlug,
        promptVersion: input.promptVersion
      },
      {
        eventType: "artifact.created",
        message: "Kaynakli research artifact uretildi",
        agentSlug: input.agentSlug,
        promptVersion: input.promptVersion
      }
    ],
    cost: providerCost,
    notes: ["external_actions_disabled", ...(privacyRisk ? ["privacy_risk_detected"] : [])]
  });
}

function buildProposalResult(
  input: AgentRunInput,
  provider: ProviderAdapter,
  providerCost: { inputTokens: number; outputTokens: number; estimatedUsd: number },
  knowledgeSources: KnowledgeSource[]
) {
  const researchArtifact = input.input.researchArtifact as
    | { payload?: Record<string, unknown>; title?: string }
    | undefined;
  const researchPayload = researchArtifact?.payload ?? {};
  const company = (researchPayload.company ?? {}) as Record<string, unknown>;
  const companyName = valueAsString(company.name, normalizeCompanyName(input.input));
  const targetService = valueAsString(input.input.targetService, "AI operasyon ve otomasyon on analizi");
  const handoffSummary = valueAsString(
    researchPayload.handoffSummary,
    "Arastirma ozeti yeterli degil; varsayimlar ve kaynak riski acik belirtilmeli."
  );
  const constraints = Array.isArray(input.input.constraints)
    ? input.input.constraints.filter((item): item is string => typeof item === "string")
    : [];
  const insufficientSources = constraints.includes("insufficient_sources");

  const proposalArtifact: Artifact = {
    kind: "proposal_draft",
    title: `${companyName} icin teklif taslagi`,
    payload: {
      proposalTitle: `${companyName} - ${targetService} Taslak Teklif`,
      clientContext: handoffSummary,
      problemHypothesis:
        "Firma, AI destekli operasyon kurarken izlenebilir gorev, kaynak, maliyet, onay ve hafiza katmanina ihtiyac duyabilir.",
      recommendedScope: insufficientSources
        ? ["Ek kaynak dogrulama", "Kisa AI operasyon kesfi", "Owner onayli teklif revizyonu"]
        : [
            "AI calisan operasyon analizi",
            "Lead -> Research -> Offer Draft -> Approval workflow kurulumu",
            "Agent memory, trace, source ve cost kayitlarinin yapilandirilmasi",
            "Insan onayli pilot raporu"
          ],
      deliverables: [
        "Kaynakli arastirma raporu",
        "Teklif ve kapsam taslagi",
        "Risk ve varsayim listesi",
        "Approval-ready artifact"
      ],
      outOfScope: [
        "Otomatik musteri iletisimi",
        "Baglayici fiyat",
        "CRM write",
        "Canli deployment",
        "Yazili onay olmadan aktif guvenlik testi"
      ],
      assumptions: [
        "Kaynaklar gercek arastirma adiminda dogrulanacak.",
        "Nihai teklif insan onayiyla gonderilecek.",
        ...constraints.map((constraint) => `Constraint: ${constraint}`)
      ],
      securityAndComplianceNotes: [
        "Kisisel veri kalici memory'ye yazilmayacak.",
        "Dis sistemlere yazma ve musteri iletisimi approval gate arkasinda kalacak.",
        "Pentest veya aktif guvenlik testi yazili kapsam ve owner onayi olmadan baslatilmayacak."
      ],
      risks: [
        "Kaynaksiz iddialar teklif metnine tasinmamali.",
        "Fiyat ve taahhut owner onayi olmadan kesinlesmemeli.",
        ...(insufficientSources ? ["Kaynak yetersizligi nedeniyle confidence dusuk."] : [])
      ],
      nextStep: "Owner review: approve / reject / revise / block",
      confidence: insufficientSources ? 0.44 : 0.72,
      approvalState: "needs_review",
      knowledgeUsed: knowledgeSources.map((source) => source.id)
    },
    sources: [
      {
        title: researchArtifact?.title ?? "Lead research artifact",
        note: "Produced by Lead Arastirmacisi"
      },
      ...knowledgeSources.slice(0, 2).map((source) => ({
        title: source.title,
        note: source.sourceUri
      }))
    ]
  };

  const reviewRequest: HandoffMessage = {
    type: "review_request",
    fromAgentSlug: "proposal-drafter",
    taskId: input.taskId,
    summary: "Teklif taslagi owner approval inbox'a dusurulmeli.",
    artifactIds: ["artifact_proposal_draft_runtime"],
    requiresResponse: true
  };

  const memoryWrite: MemoryContext = {
    layer: "task_run",
    trust: "agent_generated",
    title: `${companyName} proposal memory candidate`,
    content: `${targetService} icin teklif taslagi uretildi. Onay sonucu memory'ye donusturulebilir.`
  };

  return agentRunResultSchema.parse({
    status: "waiting_for_approval" satisfies TaskState,
    artifacts: [proposalArtifact],
    handoffs: [reviewRequest],
    memoryWrites: [memoryWrite],
    traceEvents: [
      {
        eventType: "agent.started",
        message: "Teklif Hazirlayici research artifact ve bilgi tabanini yukledi",
        agentSlug: input.agentSlug,
        promptVersion: input.promptVersion
      },
      {
        eventType: "provider.completed",
        message: `${provider.name}/${provider.model} provider adapter tamamlandi`,
        agentSlug: input.agentSlug,
        promptVersion: input.promptVersion
      },
      {
        eventType: "approval.requested",
        message: "Proposal owner approval bekliyor",
        agentSlug: input.agentSlug,
        promptVersion: input.promptVersion
      }
    ],
    cost: providerCost,
    notes: ["proposal_requires_human_approval"]
  });
}

export async function runAgent(input: AgentRunInput, options: RunAgentOptions) {
  const runtimePolicy = options.runtimePolicy ?? defaultRuntimePolicy;
  const provider = options.provider ?? localDeterministicProvider;
  const requestedTools = collectRequestedTools(input.input);
  const blockedTools = findBlockedTools(options.definition.allowedTools, requestedTools);

  if (blockedTools.length > 0) {
    return agentRunResultSchema.parse({
      status: "blocked" satisfies TaskState,
      artifacts: [],
      handoffs: [],
      memoryWrites: [],
      traceEvents: [
        {
          eventType: "tool.blocked",
          message: `Blocked tool call: ${blockedTools.join(", ")}`,
          agentSlug: input.agentSlug,
          promptVersion: input.promptVersion,
          blockedTools
        }
      ],
      cost: {
        estimatedUsd: 0,
        inputTokens: 0,
        outputTokens: 0
      },
      notes: ["blocked_tool_call"]
    }) satisfies AgentRunResult;
  }

  const systemPrompt = [
    `Role: ${options.definition.role.title}`,
    `Agent slug: ${input.agentSlug}`,
    `Allowed tools: ${options.definition.allowedTools.join(", ")}`,
    `Approval boundaries: ${options.definition.approvalBoundaries.join(", ")}`
  ].join("\n");
  const userPrompt = JSON.stringify(input.input);

  const providerResult = await runWithRetryAndTimeout(
    () =>
      provider.generate({
        agentSlug: input.agentSlug,
        promptVersion: input.promptVersion,
        systemPrompt,
        userPrompt,
        input: input.input,
        timeoutMs: runtimePolicy.timeoutMs
      }),
    runtimePolicy
  );
  if (providerResult.estimatedUsd > input.budget.maxUsd) {
    return agentRunResultSchema.parse({
      status: "blocked" satisfies TaskState,
      artifacts: [],
      handoffs: [],
      memoryWrites: [],
      traceEvents: [
        {
          eventType: "budget.blocked",
          message: `Budget cap exceeded: ${providerResult.estimatedUsd} > ${input.budget.maxUsd}`,
          agentSlug: input.agentSlug,
          promptVersion: input.promptVersion
        }
      ],
      cost: {
        estimatedUsd: providerResult.estimatedUsd,
        inputTokens: providerResult.inputTokens,
        outputTokens: providerResult.outputTokens
      },
      notes: ["budget_cap_exceeded"]
    }) satisfies AgentRunResult;
  }
  const knowledgeSources = options.knowledgeSources ?? getPhase1KnowledgeBase();
  const providerCost = {
    estimatedUsd: providerResult.estimatedUsd,
    inputTokens: providerResult.inputTokens,
    outputTokens: providerResult.outputTokens
  };

  if (input.agentSlug === "lead-researcher") {
    const companyUrl = typeof input.input.companyUrl === "string" ? input.input.companyUrl : "";
    const enableWebResearch = input.input.enableWebResearch === true;
    const webResearch =
      enableWebResearch && options.definition.allowedTools.includes("company_website.read")
        ? await fetchCompanyWebsiteSummary(companyUrl)
        : undefined;

    return buildLeadResearchResult(input, provider, providerCost, knowledgeSources, webResearch);
  }

  if (input.agentSlug === "proposal-drafter") {
    return buildProposalResult(input, provider, providerCost, knowledgeSources);
  }

  return agentRunResultSchema.parse({
    status: "failed" satisfies TaskState,
    artifacts: [],
    handoffs: [],
    memoryWrites: [],
    traceEvents: [
      {
        eventType: "agent.unsupported",
        message: `Unsupported Phase 1 agent: ${input.agentSlug}`,
        agentSlug: input.agentSlug,
        promptVersion: input.promptVersion
      }
    ],
    cost: providerCost,
    notes: ["unsupported_agent"]
  });
}
