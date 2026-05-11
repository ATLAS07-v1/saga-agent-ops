import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  getPhase1KnowledgeBase,
  phase1AgentDefinitions,
  phase2AgentDefinitions,
  phase2ActiveRoster,
  phase2WorkflowPlans,
  runtimeHealth
} from "@saga-agent-ops/agent-runtime";
import { contractVersions, sagaEmployeeRoster } from "@saga-agent-ops/shared";
import {
  createPhase1LedgerRun,
  createPhase2LedgerRun,
  decideApproval,
  getCompanyState,
  getCostDashboard,
  getLedgerSummary,
  getRun,
  listArtifacts,
  listApprovals,
  listCostEvents,
  listHandoffs,
  listMemoryRecords,
  listRuns,
  listSources,
  listTasks,
  resetLedgerStore
} from "./ledger-store";

const app = new Hono();

app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "http://127.0.0.1:3000"],
    allowMethods: ["GET", "POST", "OPTIONS"],
    allowHeaders: ["Content-Type"]
  })
);

function parseWorkflowInput(body: Record<string, unknown>) {
  return {
    companyUrl:
      typeof body.companyUrl === "string" && body.companyUrl.length > 0
        ? body.companyUrl
        : "https://sagateknoloji.com",
    companyName: typeof body.companyName === "string" ? body.companyName : "Saga Teknoloji",
    targetService:
      typeof body.targetService === "string"
        ? body.targetService
        : "AI calisanli sirket isletim sistemi",
    ...(typeof body.notes === "string" ? { notes: body.notes } : {}),
    ...(body.enableWebResearch === true || process.env.SAGA_ENABLE_WEB_RESEARCH === "true"
      ? { enableWebResearch: true }
      : {})
  };
}

app.get("/health", (c) =>
  c.json({
    ok: true,
    service: "saga-agent-ops-api",
    contracts: contractVersions,
    runtime: runtimeHealth,
    ledger: getLedgerSummary()
  })
);

app.get("/agents", (c) =>
  c.json({
    count: sagaEmployeeRoster.length,
    agents: sagaEmployeeRoster
  })
);

app.get("/agents/phase-1", (c) =>
  c.json({
    count: phase1AgentDefinitions.length,
    agents: phase1AgentDefinitions
  })
);

app.get("/agents/phase-2", (c) =>
  c.json({
    count: phase2AgentDefinitions.length,
    activeRoster: phase2ActiveRoster,
    agents: phase2AgentDefinitions
  })
);

app.get("/workflows/phase-2/plans", (c) =>
  c.json({
    count: Object.keys(phase2WorkflowPlans).length,
    plans: phase2WorkflowPlans
  })
);

app.post("/workflows/lead-to-offer/preview", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createPhase1LedgerRun(parseWorkflowInput(body));

  return c.json(result);
});

app.post("/workflows/lead-to-offer/run", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createPhase1LedgerRun(parseWorkflowInput(body));

  return c.json(result);
});

function parsePhase2WorkflowInput(workflowType: string, body: Record<string, unknown>) {
  const safeWorkflowType = ["lead_to_offer_v2", "weekly_ops_report", "product_scope_draft"].includes(workflowType)
    ? (workflowType as "lead_to_offer_v2" | "weekly_ops_report" | "product_scope_draft")
    : "lead_to_offer_v2";

  return {
    workflowType: safeWorkflowType,
    companyUrl:
      typeof body.companyUrl === "string" && body.companyUrl.length > 0
        ? body.companyUrl
        : "https://sagateknoloji.com",
    companyName: typeof body.companyName === "string" ? body.companyName : "Saga Teknoloji",
    targetService:
      typeof body.targetService === "string"
        ? body.targetService
        : safeWorkflowType === "weekly_ops_report"
          ? "Saga haftalik operasyon raporu"
          : safeWorkflowType === "product_scope_draft"
            ? "AI calisanli urun kapsam taslagi"
            : "AI calisanli sirket isletim sistemi",
    ...(typeof body.notes === "string" ? { notes: body.notes } : {}),
    ...(typeof body.period === "string" ? { period: body.period } : {}),
    ...(Array.isArray(body.completedWork)
      ? { completedWork: body.completedWork.filter((item): item is string => typeof item === "string") }
      : {}),
    ...(Array.isArray(body.openApprovals)
      ? { openApprovals: body.openApprovals.filter((item): item is string => typeof item === "string") }
      : {}),
    ...(Array.isArray(body.blockers)
      ? { blockers: body.blockers.filter((item): item is string => typeof item === "string") }
      : {}),
    ...(body.enableWebResearch === true || process.env.SAGA_ENABLE_WEB_RESEARCH === "true"
      ? { enableWebResearch: true }
      : {})
  };
}

app.post("/workflows/phase-2/:workflowType/run", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const result = await createPhase2LedgerRun(parsePhase2WorkflowInput(c.req.param("workflowType"), body));

  return c.json(result);
});

app.post("/demo/phase-1/seed", async (c) => {
  resetLedgerStore();

  const inputs = [
    ["Saga Teknoloji", "https://sagateknoloji.com", "AI calisanli sirket isletim sistemi"],
    ["B2B SaaS Panel", "https://example-saas.com", "software delivery plan"],
    ["Turizm Otel", "https://example-hotel.com", "hotel automation audit"],
    ["Dental Klinik", "https://example-dental.com", "clinic automation"],
    ["E-ticaret Operasyonu", "https://example-commerce.com", "AI operations audit"],
    ["Siber Guvenlik Lead", "https://example-appsec.com", "application security review"],
    ["Ajans Operasyonu", "https://example-agency.com", "managed AI workforce pilot"],
    ["Yerel Servis", "https://example-service.com", "automation opportunity analysis"],
    ["Mobil Uygulama Sirketi", "https://example-mobile.com", "mobile delivery planning"],
    ["Zayif Kaynak Lead", "https://unknown-company.invalid", "AI automation audit"]
  ] as const;

  const runs = [];
  for (const [companyName, companyUrl, targetService] of inputs) {
    runs.push(
      await createPhase1LedgerRun({
        companyName,
        companyUrl,
        targetService
      })
    );
  }

  return c.json({
    seeded: runs.length,
    summary: getLedgerSummary(),
    runIds: runs.map((item) => item.run.runId)
  });
});

app.post("/demo/phase-2/seed", async (c) => {
  resetLedgerStore();

  const runs = [];
  runs.push(
    await createPhase2LedgerRun({
      workflowType: "lead_to_offer_v2",
      companyName: "Saga Teknoloji",
      companyUrl: "https://sagateknoloji.com",
      targetService: "AI calisanli sirket isletim sistemi"
    })
  );
  runs.push(
    await createPhase2LedgerRun({
      workflowType: "weekly_ops_report",
      companyName: "Saga Teknoloji",
      period: "2026-W20",
      completedWork: ["Faz 1 runtime", "Faz 1.5 hardening", "Phase 2 active roster"],
      openApprovals: ["lead_to_offer_v2 final artifact"],
      blockers: ["Postgres/Ollama opsiyonel olarak local env bekliyor"]
    })
  );
  runs.push(
    await createPhase2LedgerRun({
      workflowType: "product_scope_draft",
      companyName: "Saga Teknoloji",
      targetService: "30 calisanli AI sirket operasyon konsolu",
      notes: "Owner local UI'da gercek sirket gibi es zamanli calisan sistem istiyor."
    })
  );

  return c.json({
    seeded: runs.length,
    summary: getLedgerSummary(),
    runIds: runs.map((item) => item.run.runId)
  });
});

app.get("/ledger/summary", (c) => c.json(getLedgerSummary()));

app.get("/company/state", (c) => c.json(getCompanyState()));

app.post("/ledger/reset", (c) => c.json(resetLedgerStore()));

app.get("/ledger/tasks", (c) =>
  c.json({
    count: listTasks().length,
    tasks: listTasks()
  })
);

app.get("/ledger/runs", (c) =>
  c.json({
    count: listRuns().length,
    runs: listRuns()
  })
);

app.get("/ledger/runs/:runId", (c) => {
  const run = getRun(c.req.param("runId"));
  if (!run) {
    return c.json({ error: "run_not_found" }, 404);
  }

  return c.json(run);
});

app.get("/ledger/sources", (c) =>
  c.json({
    count: listSources().length,
    sources: listSources()
  })
);

app.get("/ledger/handoffs", (c) =>
  c.json({
    count: listHandoffs().length,
    handoffs: listHandoffs()
  })
);

app.get("/ledger/artifacts", (c) =>
  c.json({
    count: listArtifacts().length,
    artifacts: listArtifacts()
  })
);

app.get("/ledger/costs", (c) =>
  c.json({
    count: listCostEvents().length,
    costs: listCostEvents()
  })
);

app.get("/ledger/cost-dashboard", (c) => c.json(getCostDashboard()));

app.get("/ledger/memory", (c) =>
  c.json({
    count: listMemoryRecords().length,
    memory: listMemoryRecords()
  })
);

app.get("/approvals", (c) =>
  c.json({
    count: listApprovals().length,
    approvals: listApprovals()
  })
);

app.post("/approvals/:approvalId/decision", async (c) => {
  const body = (await c.req.json().catch(() => ({}))) as Record<string, unknown>;
  const decision = typeof body.decision === "string" ? body.decision : "";

  if (!["approved", "rejected", "revision_requested", "blocked"].includes(decision)) {
    return c.json({ error: "invalid_decision" }, 400);
  }

  const approval = await decideApproval(
    c.req.param("approvalId"),
    decision as "approved" | "rejected" | "revision_requested" | "blocked",
    typeof body.reason === "string" ? body.reason : undefined,
    typeof body.reviewer === "string" ? body.reviewer : "local-owner"
  );

  if (!approval) {
    return c.json({ error: "approval_not_found" }, 404);
  }

  return c.json(approval);
});

app.get("/memory-contract", (c) =>
  c.json({
    version: contractVersions.memory,
    rule: "No memory, no employee.",
    layers: ["company", "agent", "project", "task_run", "artifact", "eval"]
  })
);

app.get("/knowledge/sources", (c) =>
  c.json({
    count: getPhase1KnowledgeBase().length,
    sources: getPhase1KnowledgeBase()
  })
);

const port = Number(process.env.PORT ?? 3001);

serve({ fetch: app.fetch, port });

console.log(`Saga Agent Ops API listening on http://localhost:${port}`);
