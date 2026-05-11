import {
  phase2ActiveRoster,
  phase2AgentDefinitions,
  runPhase2Workflow
} from "@saga-agent-ops/agent-runtime";
import {
  createPhase2LedgerRun,
  decideApproval,
  getCompanyState,
  getCostDashboard,
  getLedgerSummary,
  getRun,
  listApprovals,
  listMemoryRecords,
  resetLedgerStore
} from "../apps/api/src/ledger-store";

type EvalCase = {
  id: string;
  run: () => Promise<void> | void;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message);
}

function hasArtifact(run: { artifacts: Array<{ kind: string }> }, kind: string) {
  return run.artifacts.some((artifact) => artifact.kind === kind);
}

const cases: EvalCase[] = [
  {
    id: "phase2.active-roster-is-eight",
    run() {
      assert(phase2ActiveRoster.length === 8, `expected 8 active employees, got ${phase2ActiveRoster.length}`);
      assert(phase2ActiveRoster.some((agent) => agent.slug === "ai-ceo-chief-of-staff"), "AI CEO missing");
      assert(phase2ActiveRoster.every((agent) => agent.phase <= 2), "future employee leaked into Phase 2 active roster");
    }
  },
  {
    id: "phase2.agent-definitions-cover-new-workers",
    run() {
      const slugs = phase2AgentDefinitions.map((agent) => agent.role.slug);
      for (const slug of [
        "ai-ceo-chief-of-staff",
        "market-intelligence-analyst",
        "sales-strategist",
        "product-manager",
        "project-manager",
        "finance-cost-controller"
      ]) {
        assert(slugs.includes(slug), `${slug} definition missing`);
      }
      assert(
        phase2AgentDefinitions.every((agent) => agent.memoryPolicy && agent.outputSchemas?.length),
        "each Phase 2 definition needs memory policy and output schema"
      );
    }
  },
  {
    id: "phase2.lead-to-offer-v2-produces-multi-agent-artifacts",
    async run() {
      const run = await runPhase2Workflow({
        workflowType: "lead_to_offer_v2",
        companyName: "Saga Teknoloji",
        companyUrl: "https://sagateknoloji.com",
        targetService: "AI company operating system"
      });

      assert(run.state === "waiting_for_approval", "lead_to_offer_v2 should wait for approval");
      assert(run.activeAgents.length === 6, "lead_to_offer_v2 should use six active workers");
      assert(hasArtifact(run, "task_plan"), "task plan missing");
      assert(hasArtifact(run, "lead_research"), "lead research missing");
      assert(hasArtifact(run, "market_intelligence_brief"), "market intelligence missing");
      assert(hasArtifact(run, "sales_strategy_brief"), "sales strategy missing");
      assert(hasArtifact(run, "proposal_draft"), "proposal draft missing");
      assert(hasArtifact(run, "cost_control_report"), "cost control missing");
      assert(run.handoffs.length >= 5, "handoff chain incomplete");
      assert(run.agentCosts.length === run.activeAgents.length, "agent costs must be per active worker");
    }
  },
  {
    id: "phase2.weekly-report-produces-report-artifact",
    async run() {
      const run = await runPhase2Workflow({
        workflowType: "weekly_ops_report",
        period: "2026-W20",
        completedWork: ["Phase 1", "Phase 1.5"],
        blockers: ["none"]
      });

      assert(hasArtifact(run, "weekly_ops_report"), "weekly report artifact missing");
      assert(hasArtifact(run, "cost_control_report"), "weekly report cost control missing");
      assert(run.approvals[0]?.state === "pending", "weekly report should request approval");
    }
  },
  {
    id: "phase2.product-scope-produces-scope-and-proposal",
    async run() {
      const run = await runPhase2Workflow({
        workflowType: "product_scope_draft",
        companyName: "Saga Teknoloji",
        targetService: "30 employee AI company console"
      });

      assert(hasArtifact(run, "product_scope_brief"), "product scope brief missing");
      assert(hasArtifact(run, "proposal_draft"), "proposal draft missing");
      assert(run.memoryWrites.some((memory) => memory.layer === "agent"), "agent memory candidate missing");
    }
  },
  {
    id: "phase2.ledger-persists-plan-derived-steps",
    async run() {
      resetLedgerStore();
      const result = await createPhase2LedgerRun({
        workflowType: "lead_to_offer_v2",
        companyName: "Saga Teknoloji",
        companyUrl: "https://sagateknoloji.com"
      });
      const snapshot = getRun(result.run.runId);

      assert(snapshot, "ledger snapshot missing");
      assert(snapshot.run.workflowType === "lead_to_offer_v2", "workflow type missing in ledger");
      assert(snapshot.steps.length === result.run.taskPlan.length + 1, "plan-derived steps missing");
      assert(snapshot.costEvents.length === result.run.activeAgents.length, "per-agent cost events missing");
      assert(snapshot.memoryRecords.some((memory) => memory.agentSlug), "per-agent memory missing");
    }
  },
  {
    id: "phase2.cost-dashboard-aggregates-by-agent",
    async run() {
      resetLedgerStore();
      await createPhase2LedgerRun({
        workflowType: "weekly_ops_report",
        companyName: "Saga Teknoloji"
      });
      const dashboard = getCostDashboard();

      assert(dashboard.byAgent.length >= 3, "cost dashboard should group by agent");
      assert(dashboard.totalInputTokens > 0, "input tokens should be tracked");
      assert(dashboard.totalEstimatedUsd >= 0, "estimated cost should be non-negative");
    }
  },
  {
    id: "phase2.company-state-is-backed-by-ledger",
    async run() {
      resetLedgerStore();
      await createPhase2LedgerRun({
        workflowType: "product_scope_draft",
        companyName: "Saga Teknoloji"
      });
      const state = getCompanyState();

      assert(state.activeEmployeeCount === 8, "company state should expose 8 active employees");
      assert(state.workflows.length >= 1, "company state workflows missing");
      assert(state.events.length >= 1, "company state events missing");
      assert(state.summary.pendingApprovals >= 1, "pending approvals should be visible");
    }
  },
  {
    id: "phase2.approval-feedback-becomes-memory",
    async run() {
      resetLedgerStore();
      await createPhase2LedgerRun({
        workflowType: "lead_to_offer_v2",
        companyName: "Saga Teknoloji"
      });
      const approval = listApprovals().find((item) => item.state === "pending");
      assert(approval, "pending approval missing");

      await decideApproval(approval.id, "rejected", "Scope is too broad for first pilot.");
      const memories = listMemoryRecords();
      assert(
        memories.some((memory) => memory.layer === "eval" && memory.trust === "human_approved"),
        "approval feedback should create eval memory"
      );
    }
  },
  {
    id: "phase2.summary-counts-artifacts-memory-and-cost",
    async run() {
      resetLedgerStore();
      await createPhase2LedgerRun({
        workflowType: "lead_to_offer_v2",
        companyName: "Saga Teknoloji"
      });
      const summary = getLedgerSummary();

      assert(summary.artifactVersions >= 6, "artifact versions should include all Phase 2 workers");
      assert(summary.costEvents >= 6, "cost events should include all active worker calls");
      assert(summary.handoffs >= 5, "handoff count should show inter-agent communication");
    }
  }
];

async function main() {
  for (const item of cases) {
    await item.run();
    console.log(`PASS ${item.id}`);
  }

  console.log(`Phase 2 eval passed: ${cases.length}/${cases.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
