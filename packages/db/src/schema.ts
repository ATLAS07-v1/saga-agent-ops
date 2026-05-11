import { relations, sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid
} from "drizzle-orm/pg-core";

export const taskState = pgEnum("task_state", [
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

export const stepState = pgEnum("step_state", [
  "queued",
  "running",
  "waiting_for_tool",
  "waiting_for_handoff",
  "waiting_for_approval",
  "completed",
  "failed",
  "skipped"
]);

export const approvalState = pgEnum("approval_state", [
  "pending",
  "approved",
  "rejected",
  "revision_requested",
  "blocked",
  "expired",
  "cancelled"
]);

export const handoffType = pgEnum("handoff_type", [
  "handoff",
  "request_clarification",
  "review_request",
  "blocker",
  "summary"
]);

export const memoryLayer = pgEnum("memory_layer", [
  "company",
  "agent",
  "project",
  "task_run",
  "artifact",
  "eval"
]);

export const memoryTrust = pgEnum("memory_trust", [
  "unverified",
  "agent_generated",
  "human_approved",
  "source_verified",
  "system_rule"
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull()
};

export const tenants = pgTable("tenants", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  status: text("status").notNull().default("active"),
  ...timestamps
});

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    email: text("email").notNull(),
    displayName: text("display_name").notNull(),
    role: text("role").notNull().default("owner"),
    ...timestamps
  },
  (table) => [index("users_tenant_idx").on(table.tenantId)]
);

export const agents = pgTable(
  "agents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    department: text("department").notNull(),
    status: text("status").notNull().default("draft"),
    phase: integer("phase").notNull(),
    requiresHumanApprovalForExternalAction: boolean(
      "requires_human_approval_for_external_action"
    )
      .notNull()
      .default(true),
    ...timestamps
  },
  (table) => [
    index("agents_tenant_idx").on(table.tenantId),
    index("agents_slug_idx").on(table.slug)
  ]
);

export const agentVersions = pgTable(
  "agent_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    agentId: uuid("agent_id").references(() => agents.id).notNull(),
    version: text("version").notNull(),
    roleCard: jsonb("role_card").$type<Record<string, unknown>>().notNull(),
    skillList: jsonb("skill_list").$type<string[]>().notNull(),
    outputSchemas: jsonb("output_schemas").$type<Record<string, unknown>>().notNull(),
    evalCaseIds: jsonb("eval_case_ids").$type<string[]>().notNull(),
    isActive: boolean("is_active").notNull().default(false),
    ...timestamps
  },
  (table) => [
    index("agent_versions_tenant_idx").on(table.tenantId),
    index("agent_versions_agent_idx").on(table.agentId)
  ]
);

export const promptVersions = pgTable(
  "prompt_versions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    agentId: uuid("agent_id").references(() => agents.id).notNull(),
    version: text("version").notNull(),
    promptHash: text("prompt_hash").notNull(),
    instructions: text("instructions").notNull(),
    sourceResearchNote: text("source_research_note"),
    isActive: boolean("is_active").notNull().default(false),
    ...timestamps
  },
  (table) => [
    index("prompt_versions_tenant_idx").on(table.tenantId),
    index("prompt_versions_agent_idx").on(table.agentId)
  ]
);

export const toolGrants = pgTable(
  "tool_grants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    agentId: uuid("agent_id").references(() => agents.id).notNull(),
    toolName: text("tool_name").notNull(),
    grantLevel: text("grant_level").notNull().default("read"),
    policy: jsonb("policy").$type<Record<string, unknown>>().notNull(),
    approved: boolean("approved").notNull().default(false),
    ...timestamps
  },
  (table) => [
    index("tool_grants_tenant_idx").on(table.tenantId),
    index("tool_grants_agent_idx").on(table.agentId)
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    createdByUserId: uuid("created_by_user_id").references(() => users.id),
    title: text("title").notNull(),
    description: text("description").notNull(),
    state: taskState("state").notNull().default("created"),
    priority: text("priority").notNull().default("normal"),
    budgetCapUsd: numeric("budget_cap_usd", { precision: 12, scale: 6 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps
  },
  (table) => [
    index("tasks_tenant_idx").on(table.tenantId),
    index("tasks_state_idx").on(table.state)
  ]
);

export const taskRuns = pgTable(
  "task_runs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    taskId: uuid("task_id").references(() => tasks.id).notNull(),
    state: taskState("state").notNull().default("planned"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    runSummary: text("run_summary"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps
  },
  (table) => [
    index("task_runs_tenant_idx").on(table.tenantId),
    index("task_runs_task_idx").on(table.taskId)
  ]
);

export const taskSteps = pgTable(
  "task_steps",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    taskRunId: uuid("task_run_id").references(() => taskRuns.id).notNull(),
    agentId: uuid("agent_id").references(() => agents.id),
    orderIndex: integer("order_index").notNull(),
    state: stepState("state").notNull().default("queued"),
    name: text("name").notNull(),
    input: jsonb("input").$type<Record<string, unknown>>(),
    output: jsonb("output").$type<Record<string, unknown>>(),
    error: text("error"),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [
    index("task_steps_tenant_idx").on(table.tenantId),
    index("task_steps_run_idx").on(table.taskRunId),
    index("task_steps_agent_idx").on(table.agentId)
  ]
);

export const artifacts = pgTable(
  "artifacts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    taskId: uuid("task_id").references(() => tasks.id).notNull(),
    taskRunId: uuid("task_run_id").references(() => taskRuns.id),
    producedByAgentId: uuid("produced_by_agent_id").references(() => agents.id),
    kind: text("kind").notNull(),
    title: text("title").notNull(),
    version: integer("version").notNull().default(1),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    sourceRefs: jsonb("source_refs").$type<Array<Record<string, unknown>>>(),
    approvalState: approvalState("approval_state").notNull().default("pending"),
    ...timestamps
  },
  (table) => [
    index("artifacts_tenant_idx").on(table.tenantId),
    index("artifacts_task_idx").on(table.taskId),
    index("artifacts_agent_idx").on(table.producedByAgentId)
  ]
);

export const approvals = pgTable(
  "approvals",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    taskId: uuid("task_id").references(() => tasks.id).notNull(),
    artifactId: uuid("artifact_id").references(() => artifacts.id),
    requestedByAgentId: uuid("requested_by_agent_id").references(() => agents.id),
    reviewerUserId: uuid("reviewer_user_id").references(() => users.id),
    state: approvalState("state").notNull().default("pending"),
    reason: text("reason"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    ...timestamps
  },
  (table) => [
    index("approvals_tenant_idx").on(table.tenantId),
    index("approvals_task_idx").on(table.taskId),
    index("approvals_state_idx").on(table.state)
  ]
);

export const handoffMessages = pgTable(
  "handoff_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    taskId: uuid("task_id").references(() => tasks.id).notNull(),
    taskRunId: uuid("task_run_id").references(() => taskRuns.id),
    fromAgentId: uuid("from_agent_id").references(() => agents.id),
    toAgentId: uuid("to_agent_id").references(() => agents.id),
    type: handoffType("type").notNull(),
    summary: text("summary").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    requiresResponse: boolean("requires_response").notNull().default(false),
    ...timestamps
  },
  (table) => [
    index("handoff_tenant_idx").on(table.tenantId),
    index("handoff_task_idx").on(table.taskId)
  ]
);

export const costEvents = pgTable(
  "cost_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    taskId: uuid("task_id").references(() => tasks.id).notNull(),
    taskRunId: uuid("task_run_id").references(() => taskRuns.id),
    agentId: uuid("agent_id").references(() => agents.id),
    provider: text("provider").notNull(),
    model: text("model").notNull(),
    inputTokens: integer("input_tokens").notNull().default(0),
    outputTokens: integer("output_tokens").notNull().default(0),
    estimatedUsd: numeric("estimated_usd", { precision: 12, scale: 6 }).notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps
  },
  (table) => [
    index("cost_events_tenant_idx").on(table.tenantId),
    index("cost_events_task_idx").on(table.taskId)
  ]
);

export const traceEvents = pgTable(
  "trace_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    taskId: uuid("task_id").references(() => tasks.id),
    taskRunId: uuid("task_run_id").references(() => taskRuns.id),
    taskStepId: uuid("task_step_id").references(() => taskSteps.id),
    agentId: uuid("agent_id").references(() => agents.id),
    eventType: text("event_type").notNull(),
    message: text("message").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("trace_events_tenant_idx").on(table.tenantId),
    index("trace_events_task_idx").on(table.taskId),
    index("trace_events_agent_idx").on(table.agentId)
  ]
);

export const knowledgeSources = pgTable(
  "knowledge_sources",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    title: text("title").notNull(),
    sourceType: text("source_type").notNull().default("markdown"),
    sourceUri: text("source_uri").notNull(),
    trust: memoryTrust("trust").notNull().default("unverified"),
    checksum: text("checksum"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps
  },
  (table) => [
    index("knowledge_sources_tenant_idx").on(table.tenantId),
    index("knowledge_sources_trust_idx").on(table.trust)
  ]
);

export const agentMemoryProfiles = pgTable(
  "agent_memory_profiles",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    agentId: uuid("agent_id").references(() => agents.id).notNull(),
    version: text("version").notNull(),
    memoryScope: jsonb("memory_scope").$type<Record<string, unknown>>().notNull(),
    readPolicy: jsonb("read_policy").$type<Record<string, unknown>>().notNull(),
    writePolicy: jsonb("write_policy").$type<Record<string, unknown>>().notNull(),
    retentionPolicy: jsonb("retention_policy").$type<Record<string, unknown>>().notNull(),
    contextPackTemplate: jsonb("context_pack_template")
      .$type<Record<string, unknown>>()
      .notNull(),
    isActive: boolean("is_active").notNull().default(false),
    ...timestamps
  },
  (table) => [
    index("agent_memory_profiles_tenant_idx").on(table.tenantId),
    index("agent_memory_profiles_agent_idx").on(table.agentId)
  ]
);

export const memoryRecords = pgTable(
  "memory_records",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    agentId: uuid("agent_id").references(() => agents.id),
    knowledgeSourceId: uuid("knowledge_source_id").references(() => knowledgeSources.id),
    artifactId: uuid("artifact_id").references(() => artifacts.id),
    projectKey: text("project_key"),
    layer: memoryLayer("layer").notNull(),
    trust: memoryTrust("trust").notNull().default("unverified"),
    title: text("title").notNull(),
    content: text("content").notNull(),
    tags: jsonb("tags").$type<string[]>(),
    lastAccessedAt: timestamp("last_accessed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    ...timestamps
  },
  (table) => [
    index("memory_records_tenant_idx").on(table.tenantId),
    index("memory_records_agent_idx").on(table.agentId),
    index("memory_records_layer_idx").on(table.layer),
    index("memory_records_trust_idx").on(table.trust)
  ]
);

export const memoryEvents = pgTable(
  "memory_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    tenantId: uuid("tenant_id").references(() => tenants.id).notNull(),
    memoryRecordId: uuid("memory_record_id").references(() => memoryRecords.id),
    agentId: uuid("agent_id").references(() => agents.id),
    taskRunId: uuid("task_run_id").references(() => taskRuns.id),
    eventType: text("event_type").notNull(),
    reason: text("reason").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>(),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .defaultNow()
      .notNull()
  },
  (table) => [
    index("memory_events_tenant_idx").on(table.tenantId),
    index("memory_events_record_idx").on(table.memoryRecordId),
    index("memory_events_agent_idx").on(table.agentId)
  ]
);

export const tenantRelations = relations(tenants, ({ many }) => ({
  users: many(users),
  agents: many(agents),
  tasks: many(tasks),
  memoryRecords: many(memoryRecords)
}));

export const taskRelations = relations(tasks, ({ many }) => ({
  runs: many(taskRuns),
  artifacts: many(artifacts),
  approvals: many(approvals),
  handoffs: many(handoffMessages)
}));

export const agentRelations = relations(agents, ({ many }) => ({
  versions: many(agentVersions),
  prompts: many(promptVersions),
  toolGrants: many(toolGrants),
  memoryProfiles: many(agentMemoryProfiles),
  memoryRecords: many(memoryRecords)
}));

export const schemaHealthCheck = sql`select 1`;
