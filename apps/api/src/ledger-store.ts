import {
  createOllamaProvider,
  getPhase1KnowledgeBase,
  phase1AgentDefinitions,
  runAgent,
  runPhase1Workflow,
  type Phase1PreviewInput,
  type Phase1PreviewRun
} from "@saga-agent-ops/agent-runtime";
import { randomUUID } from "node:crypto";
import {
  persistApprovalDecisionToPostgres,
  persistSnapshotToPostgres,
  postgresLedgerMode
} from "./postgres-ledger";

type LedgerState =
  | "created"
  | "planned"
  | "running"
  | "waiting_for_approval"
  | "approved"
  | "rejected"
  | "revision_requested"
  | "blocked"
  | "failed"
  | "completed";

type ApprovalDecision = "approved" | "rejected" | "revision_requested" | "blocked";

export type LedgerTaskRecord = {
  id: string;
  title: string;
  description: string;
  state: LedgerState;
  createdAt: string;
  updatedAt: string;
};

export type LedgerRunRecord = {
  id: string;
  taskId: string;
  state: LedgerState;
  activeAgents: string[];
  startedAt: string;
  finishedAt?: string;
};

export type LedgerStepRecord = {
  id: string;
  taskId: string;
  runId: string;
  agentSlug: string;
  promptVersion: string;
  name: string;
  state: "queued" | "running" | "completed" | "waiting_for_approval" | "failed" | "skipped";
  orderIndex: number;
  createdAt: string;
  startedAt?: string;
  finishedAt?: string;
  durationMs?: number;
};

export type LedgerArtifactRecord = {
  id: string;
  taskId: string;
  runId: string;
  kind: string;
  title: string;
  version: number;
  state: "draft" | "needs_review" | "approved" | "rejected" | "revision_requested" | "blocked";
  payload: Record<string, unknown>;
  createdAt: string;
};

export type LedgerSourceRecord = {
  id: string;
  taskId: string;
  runId: string;
  artifactId: string;
  title: string;
  url?: string;
  note?: string;
  retrievedAt?: string;
  trust: "unverified" | "agent_generated" | "human_supplied" | "system_preview";
  createdAt: string;
};

export type LedgerHandoffRecord = {
  id: string;
  taskId: string;
  runId: string;
  type: string;
  fromAgentSlug: string;
  toAgentSlug?: string;
  summary: string;
  artifactIds: string[];
  requiresResponse: boolean;
  createdAt: string;
};

export type LedgerApprovalRecord = {
  id: string;
  taskId: string;
  runId: string;
  artifactId: string;
  artifactTitle: string;
  state: "pending" | ApprovalDecision;
  reason: string;
  createdAt: string;
  reviewer?: string;
  decidedAt?: string;
  decisionReason?: string;
};

export type LedgerTraceRecord = {
  id: string;
  taskId: string;
  runId: string;
  agentSlug?: string;
  promptVersion?: string;
  eventType: string;
  message: string;
  occurredAt: string;
};

export type LedgerCostRecord = {
  id: string;
  taskId: string;
  runId: string;
  agentSlug?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  estimatedUsd: number;
  metadata: Record<string, unknown>;
  createdAt: string;
};

export type LedgerMemoryRecord = {
  id: string;
  taskId: string;
  runId: string;
  layer: string;
  trust: string;
  title: string;
  content: string;
  createdAt: string;
};

export type LedgerSnapshot = {
  task: LedgerTaskRecord;
  run: LedgerRunRecord;
  steps: LedgerStepRecord[];
  artifacts: LedgerArtifactRecord[];
  sources: LedgerSourceRecord[];
  handoffs: LedgerHandoffRecord[];
  approvals: LedgerApprovalRecord[];
  costEvents: LedgerCostRecord[];
  traceEvents: LedgerTraceRecord[];
  memoryRecords: LedgerMemoryRecord[];
};

const snapshots = new Map<string, LedgerSnapshot>();
const approvalIndex = new Map<string, { runId: string; approvalId: string }>();

function createId(prefix: string) {
  void prefix;
  return randomUUID();
}

function now() {
  return new Date().toISOString();
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function startedBefore(timestamp: string, ms: number) {
  return new Date(Date.parse(timestamp) - ms).toISOString();
}

function mapHandoffArtifactId(artifactId: string, researchArtifactId: string, proposalArtifactId: string) {
  return artifactId.includes("research") ? researchArtifactId : proposalArtifactId;
}

function providerFromEnv() {
  if (process.env.SAGA_LLM_PROVIDER !== "ollama") return undefined;

  return createOllamaProvider({
    ...(process.env.OLLAMA_BASE_URL ? { endpoint: process.env.OLLAMA_BASE_URL } : {}),
    ...(process.env.OLLAMA_MODEL ? { model: process.env.OLLAMA_MODEL } : {})
  });
}

export async function createPhase1LedgerRun(input: Phase1PreviewInput) {
  const provider = providerFromEnv();
  const preview = await runPhase1Workflow(input, provider ? { provider } : {});
  const timestamp = now();
  const taskId = createId("task");
  const runId = createId("run");
  const researchArtifactId = createId("artifact_research");
  const proposalArtifactId = createId("artifact_proposal");

  const artifacts: LedgerArtifactRecord[] = preview.artifacts.map((artifact, index) => ({
    id: index === 0 ? researchArtifactId : proposalArtifactId,
    taskId,
    runId,
    kind: artifact.kind,
    title: artifact.title,
    version: 1,
    state: artifact.kind === "proposal_draft" ? "needs_review" : "draft",
    payload: artifact.payload,
    createdAt: timestamp
  }));

  const proposalArtifact = artifacts.find((artifact) => artifact.kind === "proposal_draft");
  const approvals: LedgerApprovalRecord[] = preview.approvals.map((approval) => {
    const approvalId = createId("approval");

    return {
      id: approvalId,
      taskId,
      runId,
      artifactId: proposalArtifact?.id ?? proposalArtifactId,
      artifactTitle: approval.artifactTitle,
      state: approval.state,
      reason: approval.reason,
      createdAt: timestamp
    };
  });

  const sources: LedgerSourceRecord[] = preview.artifacts.flatMap((artifact, artifactIndex) =>
    artifact.sources.map((source) => {
      const artifactId = artifacts[artifactIndex]?.id ?? createId("artifact_unknown");

      return {
        id: createId("source"),
        taskId,
        runId,
        artifactId,
        title: source.title,
        ...(source.url ? { url: source.url } : {}),
        ...(source.note ? { note: source.note } : {}),
        ...(source.retrievedAt ? { retrievedAt: source.retrievedAt } : {}),
        trust: source.url === input.companyUrl ? "human_supplied" : "agent_generated",
        createdAt: timestamp
      };
    })
  );

  const handoffs: LedgerHandoffRecord[] = preview.handoffs.map((handoff) => ({
    id: createId("handoff"),
    taskId,
    runId,
    type: handoff.type,
    fromAgentSlug: handoff.fromAgentSlug,
    ...(handoff.toAgentSlug ? { toAgentSlug: handoff.toAgentSlug } : {}),
    summary: handoff.summary,
    artifactIds: handoff.artifactIds.map((artifactId) =>
      mapHandoffArtifactId(artifactId, researchArtifactId, proposalArtifactId)
    ),
    requiresResponse: handoff.requiresResponse,
    createdAt: timestamp
  }));

  const costEvents: LedgerCostRecord[] = [
    {
      id: createId("cost"),
      taskId,
      runId,
      provider: "local-runtime",
      model: "phase-1-runtime-aggregate",
      inputTokens: preview.cost.inputTokens,
      outputTokens: preview.cost.outputTokens,
      estimatedUsd: preview.cost.estimatedUsd,
      metadata: {
        mode: "runtime",
        llmCalled: false,
        activeAgents: preview.activeAgents,
        note: "Phase 1 local runtime records estimated provider cost without making a paid LLM call."
      },
      createdAt: timestamp
    }
  ];

  const snapshot: LedgerSnapshot = {
    task: {
      id: taskId,
      title: `${input.companyName ?? "Firma"} lead-to-offer runtime`,
      description: input.targetService ?? "Phase 1 lead-to-offer workflow",
      state: preview.state,
      createdAt: timestamp,
      updatedAt: timestamp
    },
    run: {
      id: runId,
      taskId,
      state: preview.state,
      activeAgents: preview.activeAgents,
      startedAt: timestamp
    },
    steps: [
      {
        id: createId("step"),
        taskId,
        runId,
        agentSlug: "lead-researcher",
        promptVersion: "lead-researcher@2026-05-11.v1",
        name: "Kaynakli lead arastirmasi",
        state: preview.activeAgents.includes("lead-researcher") ? "completed" : "skipped",
        orderIndex: 1,
        createdAt: timestamp,
        startedAt: startedBefore(timestamp, 1_200),
        finishedAt: startedBefore(timestamp, 650),
        durationMs: 550
      },
      {
        id: createId("step"),
        taskId,
        runId,
        agentSlug: "proposal-drafter",
        promptVersion: "proposal-drafter@2026-05-11.v1",
        name: "Teklif taslagi hazirlama",
        state: preview.activeAgents.includes("proposal-drafter")
          ? preview.state === "blocked" || preview.state === "failed"
            ? "failed"
            : "completed"
          : "skipped",
        orderIndex: 2,
        createdAt: timestamp,
        startedAt: startedBefore(timestamp, 620),
        finishedAt: timestamp,
        durationMs: 620
      },
      {
        id: createId("step"),
        taskId,
        runId,
        agentSlug: "human-owner",
        promptVersion: "human-gate@2026-05-11.v1",
        name: "Owner approval",
        state: approvals.length > 0 ? "waiting_for_approval" : "skipped",
        orderIndex: 3,
        createdAt: timestamp
      }
    ],
    artifacts,
    sources,
    handoffs,
    approvals,
    costEvents,
    traceEvents: preview.traceEvents.map((event) => ({
      id: createId("trace"),
      taskId,
      runId,
      ...(typeof event.agentSlug === "string" ? { agentSlug: event.agentSlug } : {}),
      ...(typeof event.promptVersion === "string" ? { promptVersion: event.promptVersion } : {}),
      eventType: typeof event.eventType === "string" ? event.eventType : "runtime.event",
      message: typeof event.message === "string" ? event.message : "Runtime event",
      occurredAt: timestamp
    })),
    memoryRecords: preview.memoryWrites.map((memory) => ({
      id: createId("memory"),
      taskId,
      runId,
      layer: memory.layer,
      trust: memory.trust,
      title: memory.title,
      content: memory.content,
      createdAt: timestamp
    }))
  };

  snapshots.set(runId, snapshot);
  for (const approval of approvals) {
    approvalIndex.set(approval.id, { runId, approvalId: approval.id });
  }
  await persistSnapshotToPostgres(snapshot);

  const run: Phase1PreviewRun = {
    ...preview,
    taskId,
    runId,
    approvals: approvals.map((approval) => ({
      id: approval.id,
      artifactTitle: approval.artifactTitle,
      state: "pending",
      reason: approval.reason
    })),
    handoffs: handoffs.map((handoff) => ({
      type: handoff.type as "handoff" | "request_clarification" | "review_request" | "blocker" | "summary",
      fromAgentSlug: handoff.fromAgentSlug,
      ...(handoff.toAgentSlug ? { toAgentSlug: handoff.toAgentSlug } : {}),
      taskId,
      summary: handoff.summary,
      artifactIds: handoff.artifactIds,
      requiresResponse: handoff.requiresResponse
    })),
    traceEvents: snapshot.traceEvents.map((event) => asRecord(event)),
    memoryWrites: preview.memoryWrites
  };

  return {
    run,
    ledger: snapshot
  };
}

export function listTasks() {
  return Array.from(snapshots.values())
    .map((snapshot) => snapshot.task)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listRuns() {
  return Array.from(snapshots.values())
    .map((snapshot) => snapshot.run)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
}

export function getRun(runId: string) {
  return snapshots.get(runId);
}

export function listApprovals() {
  return Array.from(snapshots.values())
    .flatMap((snapshot) => snapshot.approvals)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listSources() {
  return Array.from(snapshots.values())
    .flatMap((snapshot) => snapshot.sources)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listHandoffs() {
  return Array.from(snapshots.values())
    .flatMap((snapshot) => snapshot.handoffs)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listCostEvents() {
  return Array.from(snapshots.values())
    .flatMap((snapshot) => snapshot.costEvents)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function decideApproval(
  approvalId: string,
  decision: ApprovalDecision,
  decisionReason?: string,
  reviewer = "local-owner"
) {
  const indexed = approvalIndex.get(approvalId);
  if (!indexed) return null;

  const snapshot = snapshots.get(indexed.runId);
  if (!snapshot) return null;

  const approval = snapshot.approvals.find((item) => item.id === approvalId);
  if (!approval) return null;

  const decidedAt = now();
  approval.state = decision;
  approval.reviewer = reviewer;
  approval.decidedAt = decidedAt;
  if (decisionReason) {
    approval.decisionReason = decisionReason;
  }

  const artifact = snapshot.artifacts.find((item) => item.id === approval.artifactId);
  if (artifact) {
    artifact.state = decision;
  }

  if (decision === "revision_requested" && artifact) {
    const researchArtifact = snapshot.artifacts.find((item) => item.kind === "lead_research");
    const provider = providerFromEnv();
    const proposalResult = await runAgent(
      {
        tenantId: "saga-local",
        taskId: snapshot.task.id,
        runId: snapshot.run.id,
        agentSlug: "proposal-drafter",
        promptVersion: "proposal-drafter@2026-05-11.revision.v1",
        input: {
          researchArtifact,
          researchSummary:
            typeof researchArtifact?.payload.handoffSummary === "string"
              ? researchArtifact.payload.handoffSummary
              : "Revision requested from approval inbox.",
          targetService: snapshot.task.description,
          constraints: ["revision_requested", decisionReason ?? "owner requested revision"]
        },
        memoryContext: snapshot.memoryRecords.map((memory) => ({
          layer: memory.layer as "company" | "agent" | "project" | "task_run" | "artifact" | "eval",
          trust: memory.trust as "unverified" | "agent_generated" | "human_approved" | "source_verified" | "system_rule",
          title: memory.title,
          content: memory.content
        })),
        budget: {
          maxUsd: 0.05,
          maxSteps: 4
        }
      },
      {
        definition: phase1AgentDefinitions[1]!,
        knowledgeSources: getPhase1KnowledgeBase(),
        ...(provider ? { provider } : {})
      }
    );
    const nextArtifact = proposalResult.artifacts[0];
    const revisionArtifact: LedgerArtifactRecord = {
      id: createId("artifact_revision"),
      taskId: snapshot.task.id,
      runId: snapshot.run.id,
      kind: nextArtifact?.kind ?? artifact.kind,
      title: nextArtifact?.title ?? artifact.title,
      version: artifact.version + 1,
      state: "needs_review",
      payload: {
        ...(nextArtifact?.payload ?? artifact.payload),
        revisionRequest: {
          requestedAt: decidedAt,
          reviewer,
          reason: decisionReason ?? "Revision requested from approval inbox."
        }
      },
      createdAt: decidedAt
    };

    snapshot.artifacts.push(revisionArtifact);
    if (nextArtifact) {
      for (const source of nextArtifact.sources) {
        snapshot.sources.push({
          id: createId("source"),
          taskId: snapshot.task.id,
          runId: snapshot.run.id,
          artifactId: revisionArtifact.id,
          title: source.title,
          ...(source.url ? { url: source.url } : {}),
          ...(source.note ? { note: source.note } : {}),
          ...(source.retrievedAt ? { retrievedAt: source.retrievedAt } : {}),
          trust: "agent_generated",
          createdAt: decidedAt
        });
      }
    }
    snapshot.handoffs.push(
      ...proposalResult.handoffs.map((handoff) => ({
        id: createId("handoff"),
        taskId: snapshot.task.id,
        runId: snapshot.run.id,
        type: handoff.type,
        fromAgentSlug: handoff.fromAgentSlug,
        ...(handoff.toAgentSlug ? { toAgentSlug: handoff.toAgentSlug } : {}),
        summary: handoff.summary,
        artifactIds: [revisionArtifact.id],
        requiresResponse: handoff.requiresResponse,
        createdAt: decidedAt
      }))
    );
    snapshot.costEvents.push({
      id: createId("cost"),
      taskId: snapshot.task.id,
      runId: snapshot.run.id,
      agentSlug: "proposal-drafter",
      provider: provider?.name ?? "local-runtime",
      model: provider?.model ?? "phase-1-deterministic-worker",
      inputTokens: proposalResult.cost.inputTokens,
      outputTokens: proposalResult.cost.outputTokens,
      estimatedUsd: proposalResult.cost.estimatedUsd,
      metadata: {
        mode: "revision_loop",
        reason: decisionReason
      },
      createdAt: decidedAt
    });
    snapshot.memoryRecords.push(
      ...proposalResult.memoryWrites.map((memory) => ({
        id: createId("memory"),
        taskId: snapshot.task.id,
        runId: snapshot.run.id,
        layer: memory.layer,
        trust: memory.trust,
        title: memory.title,
        content: memory.content,
        createdAt: decidedAt
      }))
    );
    snapshot.traceEvents.unshift(
      ...proposalResult.traceEvents.map((event) => ({
        id: createId("trace"),
        taskId: snapshot.task.id,
        runId: snapshot.run.id,
        ...(typeof event.agentSlug === "string" ? { agentSlug: event.agentSlug } : {}),
        ...(typeof event.promptVersion === "string" ? { promptVersion: event.promptVersion } : {}),
        eventType: typeof event.eventType === "string" ? event.eventType : "revision.runtime_event",
        message: typeof event.message === "string" ? event.message : "Revision runtime event",
        occurredAt: decidedAt
      }))
    );
    snapshot.traceEvents.unshift({
      id: createId("trace"),
      taskId: snapshot.task.id,
      runId: snapshot.run.id,
      agentSlug: "proposal-drafter",
      promptVersion: "proposal-drafter@2026-05-11.revision.v1",
      eventType: "artifact.version_created",
      message: `Revision artifact v${revisionArtifact.version} created`,
      occurredAt: decidedAt
    });
  }

  snapshot.task.state = decision;
  snapshot.task.updatedAt = decidedAt;
  snapshot.run.state = decision;
  snapshot.run.finishedAt = decidedAt;
  snapshot.traceEvents.unshift({
    id: createId("trace"),
    taskId: snapshot.task.id,
    runId: snapshot.run.id,
    agentSlug: "human-owner",
    promptVersion: "human-gate@2026-05-11.v1",
    eventType: `approval.${decision}`,
    message: decisionReason ?? `Approval marked as ${decision}`,
    occurredAt: decidedAt
  });

  await persistApprovalDecisionToPostgres(approval, snapshot);

  return approval;
}

export function getLedgerSummary() {
  const tasks = listTasks();
  const approvals = listApprovals();
  const sources = listSources();
  const handoffs = listHandoffs();
  const costEvents = listCostEvents();
  const artifactVersions = Array.from(snapshots.values()).reduce(
    (total, snapshot) => total + snapshot.artifacts.length,
    0
  );
  const totalEstimatedUsd = costEvents.reduce((total, event) => total + event.estimatedUsd, 0);

  return {
    storageMode: postgresLedgerMode(),
    tasks: tasks.length,
    runs: snapshots.size,
    pendingApprovals: approvals.filter((approval) => approval.state === "pending").length,
    decidedApprovals: approvals.filter((approval) => approval.state !== "pending").length,
    sources: sources.length,
    handoffs: handoffs.length,
    costEvents: costEvents.length,
    artifactVersions,
    totalEstimatedUsd
  };
}

export function resetLedgerStore() {
  snapshots.clear();
  approvalIndex.clear();

  return getLedgerSummary();
}
