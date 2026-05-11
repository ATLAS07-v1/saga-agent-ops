import { eq } from "drizzle-orm";
import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import {
  agents,
  approvals,
  artifacts,
  costEvents,
  handoffMessages,
  knowledgeSources,
  memoryRecords,
  taskRuns,
  taskSteps,
  tasks,
  tenants,
  traceEvents,
  users
} from "@saga-agent-ops/db";
import { sagaEmployeeRoster } from "@saga-agent-ops/shared";
import type { LedgerApprovalRecord, LedgerSnapshot } from "./ledger-store";

type Db = PostgresJsDatabase<Record<string, never>>;
type ApprovalStateValue =
  | "pending"
  | "approved"
  | "rejected"
  | "revision_requested"
  | "blocked"
  | "expired"
  | "cancelled";
type TrustValue = "unverified" | "agent_generated" | "human_approved" | "source_verified" | "system_rule";

let db: Db | null = null;
let seeded = false;

const tenantId = "11111111-1111-4111-8111-111111111111";
const ownerUserId = "22222222-2222-4222-8222-222222222222";

const agentIds = new Map(
  sagaEmployeeRoster.map((agent) => [
    agent.slug,
    `33333333-3333-4333-8${agent.id.toString().padStart(3, "0")}-333333333333`
  ])
);

function postgresEnabled() {
  return process.env.SAGA_LEDGER_STORE === "postgres" && Boolean(process.env.DATABASE_URL);
}

function getDb() {
  if (!postgresEnabled()) return null;
  if (db) return db;

  const client = postgres(process.env.DATABASE_URL!, { max: 1 });
  db = drizzle(client);
  return db;
}

function agentIdFor(slug?: string) {
  return slug ? agentIds.get(slug) : undefined;
}

function toApprovalStateValue(state: LedgerSnapshot["artifacts"][number]["state"]): ApprovalStateValue {
  return state === "draft" || state === "needs_review" ? "pending" : state;
}

function toTrustValue(trust: LedgerSnapshot["sources"][number]["trust"]): TrustValue {
  if (trust === "human_supplied") return "human_approved";
  if (trust === "system_preview") return "system_rule";
  if (trust === "unverified") return "unverified";
  return "agent_generated";
}

async function ensureSeedData(database: Db) {
  if (seeded) return;

  await database
    .insert(tenants)
    .values({
      id: tenantId,
      name: "Saga Teknoloji",
      slug: "saga-teknoloji"
    })
    .onConflictDoNothing();

  await database
    .insert(users)
    .values({
      id: ownerUserId,
      tenantId,
      email: "owner@sagateknoloji.local",
      displayName: "Local Owner",
      role: "owner"
    })
    .onConflictDoNothing();

  await database
    .insert(agents)
    .values(
      sagaEmployeeRoster.map((agent) => ({
        id: agentIdFor(agent.slug)!,
        tenantId,
        slug: agent.slug,
        name: agent.title,
        department: agent.department,
        status: agent.phase <= 2 ? "active" : "planned",
        phase: agent.phase,
        requiresHumanApprovalForExternalAction: agent.requiresHumanApprovalForExternalAction
      }))
    )
    .onConflictDoNothing();

  seeded = true;
}

export function postgresLedgerMode() {
  return postgresEnabled() ? "postgres" : "local-memory";
}

export async function persistSnapshotToPostgres(snapshot: LedgerSnapshot) {
  const database = getDb();
  if (!database) return { ok: true, skipped: true };

  await ensureSeedData(database);

  await database.transaction(async (tx) => {
    await tx.insert(tasks).values({
      id: snapshot.task.id,
      tenantId,
      createdByUserId: ownerUserId,
      title: snapshot.task.title,
      description: snapshot.task.description,
      state: snapshot.task.state,
      metadata: { source: "saga-agent-runtime", workflowType: snapshot.run.workflowType ?? "phase-1" }
    });

    await tx.insert(taskRuns).values({
      id: snapshot.run.id,
      tenantId,
      taskId: snapshot.task.id,
      state: snapshot.run.state,
      startedAt: new Date(snapshot.run.startedAt),
      ...(snapshot.run.finishedAt ? { finishedAt: new Date(snapshot.run.finishedAt) } : {}),
      metadata: { activeAgents: snapshot.run.activeAgents, workflowType: snapshot.run.workflowType ?? "phase-1" }
    });

    await tx.insert(taskSteps).values(
      snapshot.steps.map((step) => ({
        id: step.id,
        tenantId,
        taskRunId: snapshot.run.id,
        agentId: agentIdFor(step.agentSlug),
        orderIndex: step.orderIndex,
        state: step.state,
        name: step.name,
        input: { promptVersion: step.promptVersion },
        ...(step.startedAt ? { startedAt: new Date(step.startedAt) } : {}),
        ...(step.finishedAt ? { finishedAt: new Date(step.finishedAt) } : {}),
        output: typeof step.durationMs === "number" ? { durationMs: step.durationMs } : undefined
      }))
    );

    await tx.insert(artifacts).values(
      snapshot.artifacts.map((artifact) => ({
        id: artifact.id,
        tenantId,
        taskId: snapshot.task.id,
        taskRunId: snapshot.run.id,
        producedByAgentId: agentIdFor(
          typeof artifact.payload.agentSlug === "string"
            ? artifact.payload.agentSlug
            : artifact.kind === "lead_research"
              ? "lead-researcher"
              : "proposal-drafter"
        ),
        kind: artifact.kind,
        title: artifact.title,
        version: artifact.version,
        payload: artifact.payload,
        sourceRefs: snapshot.sources
          .filter((source) => source.artifactId === artifact.id)
          .map((source) => ({ title: source.title, url: source.url, note: source.note })),
        approvalState: toApprovalStateValue(artifact.state)
      }))
    );

    if (snapshot.approvals.length > 0) {
      await tx.insert(approvals).values(
        snapshot.approvals.map((approval) => ({
          id: approval.id,
          tenantId,
          taskId: snapshot.task.id,
          artifactId: approval.artifactId,
          requestedByAgentId: agentIdFor(
            typeof snapshot.artifacts.find((artifact) => artifact.id === approval.artifactId)?.payload.agentSlug === "string"
              ? (snapshot.artifacts.find((artifact) => artifact.id === approval.artifactId)?.payload.agentSlug as string)
              : "proposal-drafter"
          ),
          reviewerUserId: ownerUserId,
          state: approval.state,
          reason: approval.reason,
          ...(approval.decidedAt ? { decidedAt: new Date(approval.decidedAt) } : {})
        }))
      );
    }

    if (snapshot.handoffs.length > 0) {
      await tx.insert(handoffMessages).values(
        snapshot.handoffs.map((handoff) => ({
          id: handoff.id,
          tenantId,
          taskId: snapshot.task.id,
          taskRunId: snapshot.run.id,
          fromAgentId: agentIdFor(handoff.fromAgentSlug),
          toAgentId: agentIdFor(handoff.toAgentSlug),
          type: handoff.type as "handoff" | "request_clarification" | "review_request" | "blocker" | "summary",
          summary: handoff.summary,
          payload: { artifactIds: handoff.artifactIds },
          requiresResponse: handoff.requiresResponse
        }))
      );
    }

    await tx.insert(costEvents).values(
      snapshot.costEvents.map((event) => ({
        id: event.id,
        tenantId,
        taskId: snapshot.task.id,
        taskRunId: snapshot.run.id,
        agentId: agentIdFor(event.agentSlug),
        provider: event.provider,
        model: event.model,
        inputTokens: event.inputTokens,
        outputTokens: event.outputTokens,
        estimatedUsd: event.estimatedUsd.toString(),
        metadata: event.metadata
      }))
    );

    await tx.insert(traceEvents).values(
      snapshot.traceEvents.map((event) => ({
        id: event.id,
        tenantId,
        taskId: snapshot.task.id,
        taskRunId: snapshot.run.id,
        agentId: agentIdFor(event.agentSlug),
        eventType: event.eventType,
        message: event.message,
        payload: event.promptVersion ? { promptVersion: event.promptVersion } : undefined,
        occurredAt: new Date(event.occurredAt)
      }))
    );

    await tx.insert(knowledgeSources).values(
      snapshot.sources.map((source) => ({
        id: source.id,
        tenantId,
        title: source.title,
        sourceType: source.url ? "url" : "artifact",
        sourceUri: source.url ?? source.note ?? source.title,
        trust: toTrustValue(source.trust),
        metadata: { artifactId: source.artifactId, note: source.note }
      }))
    );

    if (snapshot.memoryRecords.length > 0) {
      await tx.insert(memoryRecords).values(
        snapshot.memoryRecords.map((memory) => ({
          id: memory.id,
          tenantId,
          agentId: agentIdFor(memory.agentSlug ?? "proposal-drafter"),
          projectKey: snapshot.run.workflowType ?? "phase-1",
          layer: memory.layer as "company" | "agent" | "project" | "task_run" | "artifact" | "eval",
          trust: memory.trust as "unverified" | "agent_generated" | "human_approved" | "source_verified" | "system_rule",
          title: memory.title,
          content: memory.content,
          tags: [snapshot.run.workflowType ?? "phase-1"]
        }))
      );
    }
  });

  return { ok: true, skipped: false };
}

export async function persistApprovalDecisionToPostgres(
  approval: LedgerApprovalRecord,
  snapshot: LedgerSnapshot
) {
  const database = getDb();
  if (!database) return { ok: true, skipped: true };

  await ensureSeedData(database);

  await database.transaction(async (tx) => {
    await tx
      .update(approvals)
      .set({
        state: approval.state,
        reviewerUserId: ownerUserId,
        ...(approval.decidedAt ? { decidedAt: new Date(approval.decidedAt) } : {})
      })
      .where(eq(approvals.id, approval.id));

    await tx
      .update(tasks)
      .set({ state: snapshot.task.state })
      .where(eq(tasks.id, snapshot.task.id));

    await tx
      .update(taskRuns)
      .set({
        state: snapshot.run.state,
        ...(snapshot.run.finishedAt ? { finishedAt: new Date(snapshot.run.finishedAt) } : {})
      })
      .where(eq(taskRuns.id, snapshot.run.id));

    const latestTrace = snapshot.traceEvents[0];
    if (latestTrace) {
      await tx.insert(traceEvents).values({
        id: latestTrace.id,
        tenantId,
        taskId: snapshot.task.id,
        taskRunId: snapshot.run.id,
        agentId: agentIdFor(latestTrace.agentSlug),
        eventType: latestTrace.eventType,
        message: latestTrace.message,
        payload: latestTrace.promptVersion ? { promptVersion: latestTrace.promptVersion } : undefined,
        occurredAt: new Date(latestTrace.occurredAt)
      });
    }
  });

  return { ok: true, skipped: false };
}
