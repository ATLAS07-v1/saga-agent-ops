import { z } from "zod";
import {
  contractVersions,
  handoffTypeSchema,
  memoryLayerSchema,
  memoryTrustSchema,
  taskStateSchema,
  type EmployeeRole
} from "@saga-agent-ops/shared";

export const sourceSchema = z.object({
  title: z.string().min(1),
  url: z.string().url().optional(),
  retrievedAt: z.string().datetime().optional(),
  note: z.string().optional()
});

export const artifactSchema = z.object({
  kind: z.string().min(1),
  title: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
  sources: z.array(sourceSchema).default([])
});

export const memoryContextSchema = z.object({
  layer: memoryLayerSchema,
  trust: memoryTrustSchema,
  title: z.string(),
  content: z.string(),
  sourceId: z.string().optional()
});

export const handoffMessageSchema = z.object({
  type: handoffTypeSchema,
  fromAgentSlug: z.string().min(1),
  toAgentSlug: z.string().min(1).optional(),
  taskId: z.string().min(1),
  summary: z.string().min(1),
  artifactIds: z.array(z.string()).default([]),
  requiresResponse: z.boolean().default(false)
});

export const agentRunInputSchema = z.object({
  tenantId: z.string().min(1),
  taskId: z.string().min(1),
  runId: z.string().min(1),
  agentSlug: z.string().min(1),
  promptVersion: z.string().min(1),
  input: z.record(z.string(), z.unknown()),
  memoryContext: z.array(memoryContextSchema).default([]),
  budget: z.object({
    maxUsd: z.number().nonnegative(),
    maxSteps: z.number().int().positive()
  })
});

export const agentRunResultSchema = z.object({
  status: taskStateSchema,
  artifacts: z.array(artifactSchema).default([]),
  handoffs: z.array(handoffMessageSchema).default([]),
  memoryWrites: z.array(memoryContextSchema).default([]),
  traceEvents: z.array(z.record(z.string(), z.unknown())).default([]),
  cost: z.object({
    estimatedUsd: z.number().nonnegative(),
    inputTokens: z.number().int().nonnegative().default(0),
    outputTokens: z.number().int().nonnegative().default(0)
  }),
  notes: z.array(z.string()).default([])
});

export type Source = z.infer<typeof sourceSchema>;
export type Artifact = z.infer<typeof artifactSchema>;
export type MemoryContext = z.infer<typeof memoryContextSchema>;
export type HandoffMessage = z.infer<typeof handoffMessageSchema>;
export type AgentRunInput = z.infer<typeof agentRunInputSchema>;
export type AgentRunResult = z.infer<typeof agentRunResultSchema>;

export type AgentDefinition = {
  role: EmployeeRole;
  skills: string[];
  allowedTools: string[];
  memoryScope: string[];
  approvalBoundaries: string[];
  evalCaseIds: string[];
};

export type AgentRunner = (input: AgentRunInput) => Promise<AgentRunResult>;

export const runtimeHealth = {
  ok: true,
  runtimeContract: contractVersions.runtime,
  memoryContract: contractVersions.memory,
  handoffContract: contractVersions.handoff
} as const;

export * from "./knowledge";
export * from "./policies";
export * from "./providers";
export * from "./runner";
export * from "./phase-1";
