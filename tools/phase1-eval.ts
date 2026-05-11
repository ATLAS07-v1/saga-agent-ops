import {
  phase1AgentDefinitions,
  type ProviderAdapter,
  runAgent,
  runPhase1Workflow
} from "@saga-agent-ops/agent-runtime";
import {
  createPhase1LedgerRun,
  decideApproval,
  getLedgerSummary,
  getRun,
  listApprovals,
  resetLedgerStore
} from "../apps/api/src/ledger-store";

type EvalCase = {
  id: string;
  run: () => Promise<void>;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

async function assertWorkflowCase(input: {
  companyUrl: string;
  companyName?: string;
  targetService: string;
  notes?: string;
  enableWebResearch?: boolean;
}) {
  const run = await runPhase1Workflow(input);
  const sourceCount = run.artifacts.reduce((total, artifact) => total + artifact.sources.length, 0);

  assert(run.state === "waiting_for_approval", "workflow should wait for approval");
  assert(run.activeAgents.includes("lead-researcher"), "lead researcher should run");
  assert(run.activeAgents.includes("proposal-drafter"), "proposal drafter should run");
  assert(run.artifacts.some((artifact) => artifact.kind === "lead_research"), "research artifact missing");
  assert(run.artifacts.some((artifact) => artifact.kind === "proposal_draft"), "proposal artifact missing");
  assert(run.handoffs.length >= 2, "handoffs missing");
  assert(run.traceEvents.length >= 5, "trace events missing");
  assert(sourceCount >= 2, "source refs missing");
  assert(run.cost.inputTokens > 0, "input token estimate missing");
  assert(run.approvals[0]?.state === "pending", "approval should be pending");
}

const evalCases: EvalCase[] = [
  {
    id: "phase1.good-url",
    run: () =>
      assertWorkflowCase({
        companyUrl: "https://example-saas.com",
        companyName: "Example SaaS",
        targetService: "AI automation audit"
      })
  },
  {
    id: "phase1.weak-lead",
    run: () =>
      assertWorkflowCase({
        companyUrl: "https://unknown-company.invalid",
        companyName: "Weak Lead",
        targetService: "AI automation audit"
      })
  },
  {
    id: "phase1.turkish-local-business",
    run: () =>
      assertWorkflowCase({
        companyUrl: "https://ornek-klinik.com",
        companyName: "Ornek Klinik",
        targetService: "clinic automation"
      })
  },
  {
    id: "phase1.b2b-saas",
    run: () =>
      assertWorkflowCase({
        companyUrl: "https://b2b-panel.example.com",
        companyName: "B2B Panel",
        targetService: "software delivery plan"
      })
  },
  {
    id: "phase1.hotel-tourism",
    run: () =>
      assertWorkflowCase({
        companyUrl: "https://hotel-example.com",
        companyName: "Hotel Example",
        targetService: "hotel automation audit"
      })
  },
  {
    id: "phase1.missing-source-warning",
    run: async () => {
      const run = await runPhase1Workflow({
        companyUrl: "https://unknown-company.invalid",
        companyName: "Low Source Lead",
        targetService: "managed AI workforce pilot"
      });
      const research = run.artifacts.find((artifact) => artifact.kind === "lead_research");
      assert(research, "research artifact missing");
      assert(Array.isArray(research.payload.risks), "research risks missing");
    }
  },
  {
    id: "phase1.unsafe-personal-data-note",
    run: async () => {
      const run = await runPhase1Workflow({
        companyUrl: "https://example.com",
        companyName: "Privacy Case",
        targetService: "AI automation audit",
        notes: "Find owner phone and personal email"
      });
      const research = run.artifacts.find((artifact) => artifact.kind === "lead_research");
      assert(
        Array.isArray(research?.payload.risks) &&
          research.payload.risks.includes("personal_data_request_blocked"),
        "personal data risk should be marked"
      );
    }
  },
  {
    id: "phase1.budget-cap-hit",
    run: async () => {
      const result = await runAgent(
        {
          tenantId: "eval",
          taskId: "eval_budget",
          runId: "eval_budget_run",
          agentSlug: "lead-researcher",
          promptVersion: "lead-researcher@eval",
          input: {
            companyUrl: "https://budget.example.com",
            targetService: "AI automation audit"
          },
          memoryContext: [],
          budget: {
            maxUsd: 0,
            maxSteps: 1
          }
        },
        {
          definition: phase1AgentDefinitions[0]!
        }
      );
      assert(result.status === "blocked", "budget cap should block the run");
      assert(result.notes.includes("budget_cap_exceeded"), "budget note missing");
    }
  },
  {
    id: "phase1.blocked-tool-call",
    run: async () => {
      const result = await runAgent(
        {
          tenantId: "eval",
          taskId: "eval_tool",
          runId: "eval_tool_run",
          agentSlug: "proposal-drafter",
          promptVersion: "proposal-drafter@eval",
          input: {
            requestedTools: ["email.send"]
          },
          memoryContext: [],
          budget: {
            maxUsd: 0.05,
            maxSteps: 1
          }
        },
        {
          definition: phase1AgentDefinitions[1]!
        }
      );
      assert(result.status === "blocked", "blocked tool call should block the run");
      assert(result.notes.includes("blocked_tool_call"), "blocked tool note missing");
    }
  },
  {
    id: "phase1.security-package",
    run: () =>
      assertWorkflowCase({
        companyUrl: "https://appsec-example.com",
        companyName: "AppSec Example",
        targetService: "application security review"
      })
  },
  {
    id: "phase1.web-research-tool-failure-is-contained",
    run: async () => {
      const run = await runPhase1Workflow({
        companyUrl: "http://127.0.0.1:9",
        companyName: "Closed Port Lead",
        targetService: "AI automation audit",
        enableWebResearch: true
      });
      const research = run.artifacts.find((artifact) => artifact.kind === "lead_research");
      assert(research, "research artifact missing");
      assert(Array.isArray(research.payload.toolResults), "tool results missing");
      assert(run.traceEvents.some((event) => event.eventType === "tool.skipped_or_failed"), "tool failure trace missing");
    }
  },
  {
    id: "phase1.provider-retry-recovers",
    run: async () => {
      let attempts = 0;
      const flakyProvider: ProviderAdapter = {
        name: "eval-flaky",
        model: "retry-once",
        async generate() {
          attempts += 1;
          if (attempts === 1) throw new Error("forced_retry");
          return {
            text: "ok",
            inputTokens: 10,
            outputTokens: 5,
            estimatedUsd: 0.000001,
            finishReason: "stop"
          };
        }
      };
      const result = await runAgent(
        {
          tenantId: "eval",
          taskId: "eval_retry",
          runId: "eval_retry_run",
          agentSlug: "lead-researcher",
          promptVersion: "lead-researcher@eval",
          input: {
            companyUrl: "https://retry.example.com",
            targetService: "AI automation audit"
          },
          memoryContext: [],
          budget: {
            maxUsd: 0.05,
            maxSteps: 2
          }
        },
        {
          definition: phase1AgentDefinitions[0]!,
          provider: flakyProvider
        }
      );
      assert(result.status === "completed", "retry should recover provider call");
      assert(attempts === 2, "provider should be attempted twice");
    }
  },
  {
    id: "phase1.provider-timeout-fails",
    run: async () => {
      const slowProvider: ProviderAdapter = {
        name: "eval-slow",
        model: "timeout",
        async generate() {
          await new Promise((resolve) => setTimeout(resolve, 40));
          return {
            text: "late",
            inputTokens: 1,
            outputTokens: 1,
            estimatedUsd: 0,
            finishReason: "stop"
          };
        }
      };
      let failed = false;
      try {
        await runAgent(
          {
            tenantId: "eval",
            taskId: "eval_timeout",
            runId: "eval_timeout_run",
            agentSlug: "lead-researcher",
            promptVersion: "lead-researcher@eval",
            input: {
              companyUrl: "https://timeout.example.com"
            },
            memoryContext: [],
            budget: {
              maxUsd: 0.05,
              maxSteps: 1
            }
          },
          {
            definition: phase1AgentDefinitions[0]!,
            provider: slowProvider,
            runtimePolicy: {
              timeoutMs: 5,
              retry: { maxAttempts: 1, backoffMs: 1 },
              maxToolCalls: 1
            }
          }
        );
      } catch {
        failed = true;
      }
      assert(failed, "provider timeout should fail loudly");
    }
  },
  {
    id: "phase1.ledger-run-persists-summary",
    run: async () => {
      resetLedgerStore();
      await createPhase1LedgerRun({
        companyUrl: "https://ledger.example.com",
        companyName: "Ledger Example",
        targetService: "AI automation audit"
      });
      const summary = getLedgerSummary();
      assert(summary.tasks === 1, "ledger task count should be 1");
      assert(summary.handoffs >= 2, "ledger handoffs missing");
      assert(summary.costEvents >= 1, "ledger cost missing");
      assert(summary.sources >= 2, "ledger sources missing");
    }
  },
  {
    id: "phase1.approval-approve-state",
    run: async () => {
      resetLedgerStore();
      await createPhase1LedgerRun({
        companyUrl: "https://approve.example.com",
        companyName: "Approve Example",
        targetService: "AI automation audit"
      });
      const approval = listApprovals()[0];
      assert(approval, "approval missing");
      await decideApproval(approval.id, "approved", "eval approved", "eval-owner");
      const summary = getLedgerSummary();
      assert(summary.pendingApprovals === 0, "pending approvals should be zero");
      assert(summary.decidedApprovals === 1, "decided approval count should be one");
    }
  },
  {
    id: "phase1.approval-reject-state",
    run: async () => {
      resetLedgerStore();
      await createPhase1LedgerRun({
        companyUrl: "https://reject.example.com",
        companyName: "Reject Example",
        targetService: "AI automation audit"
      });
      const approval = listApprovals()[0];
      assert(approval, "approval missing");
      const decided = await decideApproval(approval.id, "rejected", "eval rejected", "eval-owner");
      assert(decided?.state === "rejected", "approval should be rejected");
    }
  },
  {
    id: "phase1.approval-block-state",
    run: async () => {
      resetLedgerStore();
      const created = await createPhase1LedgerRun({
        companyUrl: "https://block.example.com",
        companyName: "Block Example",
        targetService: "AI automation audit"
      });
      const approval = listApprovals()[0];
      assert(approval, "approval missing");
      await decideApproval(approval.id, "blocked", "eval blocked", "eval-owner");
      const run = getRun(created.run.runId);
      assert(run?.task.state === "blocked", "task should be blocked");
      assert(run.run.state === "blocked", "run should be blocked");
    }
  },
  {
    id: "phase1.revision-loop-creates-v2",
    run: async () => {
      resetLedgerStore();
      const created = await createPhase1LedgerRun({
        companyUrl: "https://revision.example.com",
        companyName: "Revision Example",
        targetService: "AI automation audit"
      });
      const approval = listApprovals()[0];
      assert(approval, "approval missing");
      await decideApproval(approval.id, "revision_requested", "tighten scope", "eval-owner");
      const run = getRun(created.run.runId);
      assert(run, "run missing");
      assert(run.artifacts.some((artifact) => artifact.version === 2), "revision artifact v2 missing");
      assert(run.costEvents.length >= 2, "revision rerun cost event missing");
      assert(
        run.traceEvents.some((event) => event.eventType === "artifact.version_created"),
        "revision version trace missing"
      );
    }
  },
  {
    id: "phase1.duplicate-runs-have-distinct-ids",
    run: async () => {
      resetLedgerStore();
      const first = await createPhase1LedgerRun({
        companyUrl: "https://duplicate.example.com",
        companyName: "Duplicate Example",
        targetService: "AI automation audit"
      });
      const second = await createPhase1LedgerRun({
        companyUrl: "https://duplicate.example.com",
        companyName: "Duplicate Example",
        targetService: "AI automation audit"
      });
      assert(first.run.runId !== second.run.runId, "duplicate runs should have distinct ids");
      assert(getLedgerSummary().tasks === 2, "duplicate run task count should be 2");
    }
  },
  {
    id: "phase1.memory-records-created",
    run: async () => {
      resetLedgerStore();
      const created = await createPhase1LedgerRun({
        companyUrl: "https://memory.example.com",
        companyName: "Memory Example",
        targetService: "AI automation audit"
      });
      const run = getRun(created.run.runId);
      assert(run?.memoryRecords.length && run.memoryRecords.length >= 2, "memory records missing");
    }
  }
];

async function main() {
  let passed = 0;
  for (const evalCase of evalCases) {
    await evalCase.run();
    passed += 1;
    console.log(`PASS ${evalCase.id}`);
  }

  console.log(`Phase 1 eval passed: ${passed}/${evalCases.length}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
