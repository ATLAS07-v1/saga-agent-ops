"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { sagaEmployeeRoster } from "@saga-agent-ops/shared";

type Phase1PreviewRun = {
  taskId: string;
  runId: string;
  state: string;
  activeAgents: string[];
  artifacts: Array<{
    kind: string;
    title: string;
    sources?: Array<{ title: string; url?: string; note?: string }>;
  }>;
  handoffs: Array<{ type: string; fromAgentSlug: string; toAgentSlug?: string; summary: string }>;
  traceEvents: Array<{ eventType?: string; message?: string; agentSlug?: string }>;
  approvals: Array<{ id: string; artifactTitle: string; state: string; reason: string }>;
  cost: {
    estimatedUsd: number;
    inputTokens: number;
    outputTokens: number;
  };
};

type LedgerApproval = {
  id: string;
  taskId: string;
  runId: string;
  artifactTitle: string;
  state: string;
  reason: string;
  createdAt: string;
  decidedAt?: string;
  decisionReason?: string;
};

type CompanyState = {
  activePhase: number;
  activeEmployeeCount: number;
  totalEmployeeCount: number;
  agentStatuses: Array<{ slug: string; status: string; memoryRecords: number }>;
  workflows: Array<{
    taskId: string;
    runId: string;
    name: string;
    workflowType: string;
    state: string;
    owner: string;
    step: string;
    progress: number;
    agents: string[];
    approvalState: string;
  }>;
  events: Array<{ eventType?: string; message?: string; agentSlug?: string; occurredAt?: string }>;
  summary: {
    sources: number;
    handoffs: number;
    pendingApprovals: number;
    artifactVersions: number;
    totalEstimatedUsd: number;
  };
  costDashboard: {
    totalEstimatedUsd: number;
    byAgent: Array<{ agentSlug: string; estimatedUsd: number; inputTokens: number; outputTokens: number }>;
  };
};

const departmentNames: Record<string, string> = {
  executive: "Executive",
  revenue_strategy: "Revenue & Strategy",
  product_delivery: "Product & Delivery",
  software_engineering: "Software Engineering",
  cybersecurity: "Cybersecurity",
  automation_growth_content: "Automation, Growth & Content",
  support_governance_finance: "Support, Governance & Finance"
};

const displayNames: Record<string, string> = {
  "ai-ceo-chief-of-staff": "AI CEO / Özel Kalem",
  "lead-researcher": "Lead Araştırmacısı",
  "market-intelligence-analyst": "Pazar İstihbarat Analisti",
  "sales-strategist": "Satış Stratejisti",
  "proposal-drafter": "Teklif ve Kapsam Hazırlayıcı",
  "product-manager": "Ürün Yöneticisi",
  "solution-architect": "Çözüm Mimarı",
  "project-manager": "Proje Yöneticisi",
  "customer-success-manager": "Müşteri Başarı Yöneticisi",
  "reporting-analyst": "Raporlama Analisti",
  "backend-engineer": "Backend Mühendisi",
  "frontend-engineer": "Frontend Mühendisi",
  "mobile-engineer": "Mobil Uygulama Mühendisi",
  "devops-platform-engineer": "DevOps / Platform Mühendisi",
  "data-integration-engineer": "Veri ve Entegrasyon Mühendisi",
  "qa-test-automation-specialist": "QA ve Test Otomasyon Uzmanı",
  "security-kvkk-reviewer": "Güvenlik ve KVKK İnceleyici",
  "application-security-specialist": "Uygulama Güvenliği Uzmanı",
  "cloud-security-specialist": "Cloud / Altyapı Güvenliği Uzmanı",
  "pentest-vulnerability-analyst": "Pentest ve Zafiyet Analisti",
  "threat-intelligence-analyst": "Threat Intelligence Analisti",
  "incident-response-security-ops": "Incident Response ve Güvenlik Operasyon Uzmanı",
  "automation-engineer": "Otomasyon Mühendisi",
  "seo-strategist": "SEO Stratejisti",
  "content-planner": "İçerik Planlayıcı",
  "campaign-copywriter": "Kampanya Metin Yazarı",
  "support-triage-specialist": "Destek ve Talep Sınıflandırma Uzmanı",
  "finance-cost-controller": "Finans ve Maliyet Kontrol Uzmanı",
  "knowledge-manager": "Bilgi Küratörü / Knowledge Manager",
  "compliance-risk-controller": "Compliance ve Risk Kontrol Uzmanı"
};

const fallbackWorkflows = [
  {
    name: "Lead -> Research -> Offer v2",
    owner: "ai-ceo-chief-of-staff",
    state: "ready",
    step: "Faz 2 workflow baslatilmaya hazir",
    progress: 0,
    agents: [
      "ai-ceo-chief-of-staff",
      "lead-researcher",
      "market-intelligence-analyst",
      "sales-strategist",
      "proposal-drafter",
      "finance-cost-controller"
    ]
  },
  {
    name: "Weekly Saga Ops Report",
    owner: "project-manager",
    state: "ready",
    step: "Haftalik rapor workflow'u hazir",
    progress: 0,
    agents: ["ai-ceo-chief-of-staff", "project-manager", "finance-cost-controller"]
  },
  {
    name: "Product Scope Draft",
    owner: "product-manager",
    state: "ready",
    step: "Urun kapsam workflow'u hazir",
    progress: 0,
    agents: ["ai-ceo-chief-of-staff", "product-manager", "proposal-drafter", "finance-cost-controller"]
  }
];

const graphAgents = [
  { slug: "ai-ceo-chief-of-staff", x: 50, y: 47 },
  { slug: "lead-researcher", x: 24, y: 24 },
  { slug: "market-intelligence-analyst", x: 26, y: 47 },
  { slug: "sales-strategist", x: 24, y: 70 },
  { slug: "proposal-drafter", x: 45, y: 78 },
  { slug: "product-manager", x: 68, y: 24 },
  { slug: "project-manager", x: 76, y: 55 },
  { slug: "finance-cost-controller", x: 60, y: 78 }
];

const handoffEvents = [
  "Orchestration Engine görevi parçaladı",
  "Lead Araştırmacısı 4 kaynak buldu",
  "Pazar İstihbarat Analisti ICP notu ekledi",
  "Teklif Hazırlayıcı taslak kapsamı oluşturdu",
  "Uygulama Güvenliği Uzmanı risk etiketledi",
  "Compliance ve Risk Kontrol Uzmanı onay kapısı açtı",
  "Bilgi Küratörü memory adayını işaretledi"
];

const skillsByDepartment: Record<string, string[]> = {
  executive: ["routing", "risk", "summary"],
  revenue_strategy: ["research", "positioning", "proposal"],
  product_delivery: ["scope", "delivery", "reporting"],
  software_engineering: ["architecture", "implementation", "release"],
  cybersecurity: ["appsec", "threat", "approval"],
  automation_growth_content: ["automation", "seo", "content"],
  support_governance_finance: ["triage", "cost", "memory"]
};

function initials(title: string) {
  return title
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

function statusFor(slug: string, tick: number, companyState?: CompanyState | null) {
  const backendStatus = companyState?.agentStatuses.find((agent) => agent.slug === slug)?.status;
  if (backendStatus) return backendStatus;

  const active = fallbackWorkflows.some((workflow) => workflow.agents.includes(slug));
  if (slug === "ai-ceo-chief-of-staff") return "routing";
  if (!active) return tick % 7 === 0 ? "syncing" : "idle";
  if (tick % 5 === 0) return "handoff";
  if (tick % 4 === 0) return "review";
  return "working";
}

export default function CompanyOpsConsole() {
  const [tick, setTick] = useState(0);
  const [selectedSlug, setSelectedSlug] = useState("ai-ceo-chief-of-staff");
  const [phase1Run, setPhase1Run] = useState<Phase1PreviewRun | null>(null);
  const [approvalInbox, setApprovalInbox] = useState<LedgerApproval[]>([]);
  const [companyState, setCompanyState] = useState<CompanyState | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setTick((value) => value + 1), 1500);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    async function loadApprovals(signal?: AbortSignal) {
      const approvalsResponse = await fetch(
        "http://localhost:3001/approvals",
        signal ? { signal } : undefined
      );
      if (!approvalsResponse.ok) return;
      const approvalsData = (await approvalsResponse.json()) as { approvals: LedgerApproval[] };
      setApprovalInbox(approvalsData.approvals);
    }

    async function loadCompanyState(signal?: AbortSignal) {
      const response = await fetch("http://localhost:3001/company/state", signal ? { signal } : undefined);
      if (!response.ok) return;
      const data = (await response.json()) as CompanyState;
      setCompanyState(data);
    }

    async function loadAll(signal?: AbortSignal) {
      await Promise.all([loadCompanyState(signal), loadApprovals(signal)]);
    }

    void loadAll(controller.signal).catch(() => undefined);
    const poll = window.setInterval(() => {
      void loadAll().catch(() => undefined);
    }, 1500);

    return () => {
      controller.abort();
      window.clearInterval(poll);
    };
  }, []);

  async function refreshCompanyState() {
    const [stateResponse, approvalsResponse] = await Promise.all([
      fetch("http://localhost:3001/company/state"),
      fetch("http://localhost:3001/approvals")
    ]);

    if (stateResponse.ok) {
      setCompanyState((await stateResponse.json()) as CompanyState);
    }
    if (approvalsResponse.ok) {
      const approvalsData = (await approvalsResponse.json()) as { approvals: LedgerApproval[] };
      setApprovalInbox(approvalsData.approvals);
    }
  }

  async function runPhase2Workflow(workflowType: "lead_to_offer_v2" | "weekly_ops_report" | "product_scope_draft") {
    const response = await fetch(`http://localhost:3001/workflows/phase-2/${workflowType}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyUrl: "https://sagateknoloji.com",
        companyName: "Saga Teknoloji",
        targetService:
          workflowType === "weekly_ops_report"
            ? "Saga haftalik operasyon raporu"
            : workflowType === "product_scope_draft"
              ? "30 calisanli AI sirket operasyon konsolu"
              : "AI calisanli sirket isletim sistemi",
        completedWork: ["Phase 1 runtime", "Phase 1.5 hardening", "Phase 2 plan runner"],
        openApprovals: ["Faz 2 final artifact"],
        blockers: ["Gercek provider ve Postgres local env ile opsiyonel calisir"]
      })
    });

    if (!response.ok) return;
    const data = (await response.json()) as { run: Phase1PreviewRun };
    setPhase1Run(data.run);
    await refreshCompanyState();
  }

  async function seedPhase2Demo() {
    const response = await fetch("http://localhost:3001/demo/phase-2/seed", { method: "POST" });
    if (!response.ok) return;
    await refreshCompanyState();
  }

  async function decideApproval(
    approvalId: string,
    decision: "approved" | "rejected" | "revision_requested" | "blocked"
  ) {
    const response = await fetch(`http://localhost:3001/approvals/${approvalId}/decision`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        decision,
        reason:
          decision === "approved"
            ? "Owner approved from local ops console."
            : decision === "revision_requested"
              ? "Owner requested revision from local ops console."
              : decision === "blocked"
                ? "Owner blocked this action from local ops console."
                : "Owner rejected from local ops console."
      })
    });

    if (!response.ok) return;

    await refreshCompanyState();
  }

  const selectedAgent =
    sagaEmployeeRoster.find((agent) => agent.slug === selectedSlug) ?? sagaEmployeeRoster[0]!;
  const activeRoster = sagaEmployeeRoster.filter((agent) => agent.phase <= 2);

  const roster = useMemo(
    () =>
      activeRoster.map((agent) => ({
        ...agent,
        title: displayNames[agent.slug] ?? agent.title,
        status: statusFor(agent.slug, tick, companyState)
      })),
    [activeRoster, companyState, tick]
  );

  const runtimeEvents =
    companyState?.events.map((event) => event.message ?? event.eventType ?? "runtime event") ??
    phase1Run?.traceEvents.map((event) => event.message ?? event.eventType ?? "runtime event") ??
    handoffEvents;
  const activeEvent = runtimeEvents[tick % runtimeEvents.length] ?? runtimeEvents[0]!;
  const workflows = companyState?.workflows.length ? companyState.workflows : fallbackWorkflows;
  const activeWorkflow = workflows[tick % workflows.length] ?? workflows[0]!;
  const currentRunApproval = phase1Run
    ? approvalInbox.find((item) => item.runId === phase1Run.runId)
    : undefined;
  const approval =
    currentRunApproval ??
    approvalInbox.find((item) => item.state === "pending") ??
    approvalInbox[0] ??
    phase1Run?.approvals[0];
  const approvalStatusText =
    approval?.state === "pending"
      ? "onay bekliyor"
      : approval
        ? approval.state
        : "";
  const sourceCount =
    companyState?.summary.sources ??
    phase1Run?.artifacts.reduce((total, artifact) => total + (artifact.sources?.length ?? 0), 0) ??
    0;
  const costText = `$${(companyState?.costDashboard.totalEstimatedUsd ?? phase1Run?.cost.estimatedUsd ?? 0).toFixed(4)}`;

  return (
    <main className="ops-shell">
      <aside className="ops-sidebar" aria-label="Çalışan listesi">
        <div className="brand">
          <span className="brand-mark">S</span>
          <div>
            <strong>Saga Agent Ops</strong>
            <small>localhost canlı operasyon</small>
          </div>
        </div>
        <div className="sidebar-search">Ara: çalışan, görev, departman</div>
        <div className="employee-list">
          {roster.map((agent) => (
            <button
              className={`employee-row ${selectedSlug === agent.slug ? "selected" : ""}`}
              key={agent.slug}
              onClick={() => setSelectedSlug(agent.slug)}
              type="button"
            >
              <span className={`status-dot ${agent.status}`} />
              <span className="mini-avatar">{initials(agent.title)}</span>
              <span className="employee-copy">
                <strong>{agent.title}</strong>
                <small>{agent.status}</small>
              </span>
            </button>
          ))}
        </div>
      </aside>

      <section className="ops-main">
        <header className="ops-header">
          <div>
            <p className="eyebrow">Canlı Şirket Operasyonu</p>
            <h1>Saga Teknoloji AI şirketi çalışıyor</h1>
          </div>
          <div className="run-stats">
            <span>{companyState?.activeEmployeeCount ?? 8} aktif çalışan</span>
            <span>{(companyState?.totalEmployeeCount ?? 30) - (companyState?.activeEmployeeCount ?? 8)} planlı çalışan</span>
            <span>6 memory katmanı</span>
            <span>{sourceCount} kaynak</span>
            <span>{costText} maliyet</span>
            <span>0 kontrolsüz dış aksiyon</span>
          </div>
        </header>

        <section className="command-strip" aria-label="Aktif iş">
          <div>
            <small>Aktif run</small>
            <strong>{phase1Run ? `${phase1Run.taskId} / ${phase1Run.state}` : activeWorkflow.name}</strong>
          </div>
          <div>
            <small>Şu an</small>
            <strong>{approval ? `${approval.artifactTitle} ${approvalStatusText}` : activeWorkflow.step}</strong>
          </div>
          <div>
            <small>Son event</small>
            <strong>{activeEvent}</strong>
          </div>
        </section>

        <section className="workflow-actions" aria-label="Faz 2 workflow kontrolleri">
          <button type="button" onClick={() => void runPhase2Workflow("lead_to_offer_v2")}>
            Lead v2 Çalıştır
          </button>
          <button type="button" onClick={() => void runPhase2Workflow("weekly_ops_report")}>
            Haftalık Rapor
          </button>
          <button type="button" onClick={() => void runPhase2Workflow("product_scope_draft")}>
            Ürün Kapsamı
          </button>
          <button type="button" onClick={() => void seedPhase2Demo()}>
            Faz 2 Demo Seed
          </button>
        </section>

        <section className="workspace">
          <div className="graph-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Company Graph</p>
                <h2>Orkestratör işi çalışanlara dağıtıyor</h2>
              </div>
              <span className="live-pill">eş zamanlı</span>
            </div>
            <div className="company-graph" aria-label="Canlı şirket grafiği">
              <svg className="graph-lines" viewBox="0 0 100 100" preserveAspectRatio="none">
                {graphAgents
                  .filter((agent) => agent.slug !== "ai-ceo-chief-of-staff")
                  .map((agent, index) => (
                    <line
                      className={index % 3 === tick % 3 ? "active-line" : ""}
                      key={agent.slug}
                      x1="50"
                      x2={agent.x}
                      y1="47"
                      y2={agent.y}
                    />
                  ))}
              </svg>
              {graphAgents.map((node, index) => {
                const agent = roster.find((item) => item.slug === node.slug);
                if (!agent) return null;

                const style = {
                  "--x": `${node.x}%`,
                  "--y": `${node.y}%`,
                  "--delay": `${index * 120}ms`
                } as CSSProperties;

                return (
                  <button
                    className={`graph-node ${agent.status} ${selectedSlug === agent.slug ? "selected" : ""}`}
                    key={node.slug}
                    aria-label={agent.title}
                    onClick={() => setSelectedSlug(node.slug)}
                    style={style}
                    title={agent.title}
                    type="button"
                  >
                    <span>{initials(agent.title)}</span>
                    <small>{agent.title}</small>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="workflows-panel">
            <div className="section-head">
              <div>
                <p className="eyebrow">Workflows</p>
                <h2>Aktif iş akışları</h2>
              </div>
            </div>
            <section className="approval-inbox" aria-label="Approval inbox">
              <div>
                <p className="eyebrow">Approval Inbox</p>
                <h3>{approval ? approval.artifactTitle : "Bekleyen onay yok"}</h3>
                <small>{approval ? `${approval.state} · ${approval.reason}` : "Yeni run geldiğinde burada görünecek."}</small>
              </div>
              {approval && approval.state === "pending" ? (
                <div className="approval-actions">
                  <button type="button" onClick={() => void decideApproval(approval.id, "approved")}>
                    Onayla
                  </button>
                  <button type="button" onClick={() => void decideApproval(approval.id, "revision_requested")}>
                    Revize
                  </button>
                  <button type="button" onClick={() => void decideApproval(approval.id, "rejected")}>
                    Reddet
                  </button>
                  <button type="button" onClick={() => void decideApproval(approval.id, "blocked")}>
                    Bloke Et
                  </button>
                </div>
              ) : null}
            </section>
            <div className="workflow-list">
              {workflows.map((workflow, index) => (
                <article className={`workflow-card ${workflow.state}`} key={`${workflow.name}-${index}`}>
                  <div>
                    <strong>{workflow.name}</strong>
                    <small>{workflow.owner}</small>
                  </div>
                  <p>{workflow.step}</p>
                  <div className="progress-track">
                    <span style={{ width: `${Math.min(workflow.progress + (workflow.progress > 0 ? 0 : (tick + index) % 8), 100)}%` }} />
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="event-stream" aria-label="Canlı olay akışı">
          <div className="section-head">
            <div>
              <p className="eyebrow">Trace Stream</p>
              <h2>Handoff, kaynak, maliyet ve memory olayları</h2>
            </div>
          </div>
          <div className="events">
            {runtimeEvents.map((event, index) => (
              <div className={index === tick % runtimeEvents.length ? "event active" : "event"} key={`${index}-${event}`}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{event}</p>
                <small>{index % 2 === 0 ? "trace" : "memory"}</small>
              </div>
            ))}
          </div>
        </section>
      </section>

      <aside className="profile-panel" aria-label="Çalışan profili">
        <div className="profile-card">
          <button className="close-button" type="button" aria-label="Profili kapat">
            ×
          </button>
          <span className="profile-avatar">{initials(displayNames[selectedAgent.slug] ?? selectedAgent.title)}</span>
          <p className="eyebrow">Çalışan Profili</p>
          <h2>{displayNames[selectedAgent.slug] ?? selectedAgent.title}</h2>
          <p className="profile-subtitle">{departmentNames[selectedAgent.department]}</p>
          <div className="status-banner">
            <span className={`status-dot ${statusFor(selectedAgent.slug, tick, companyState)}`} />
            <strong>{statusFor(selectedAgent.slug, tick, companyState)}</strong>
            <small>Faz {selectedAgent.phase}</small>
          </div>
          <div className="profile-section">
            <h3>Skiller</h3>
            <div className="chips">
              {(skillsByDepartment[selectedAgent.department] ?? []).map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
          <div className="profile-section">
            <h3>Hafıza</h3>
            <ul className="memory-list">
              <li>agent memory: aktif</li>
              <li>project memory: filtreli</li>
              <li>feedback log: beklemede</li>
              <li>kalıcı yazım: policy kontrollü</li>
            </ul>
          </div>
          <div className="profile-section">
            <h3>Çalışma Akışı</h3>
            <ol className="work-steps">
              <li>Görevi alır</li>
              <li>Memory context pack yükler</li>
              <li>Kaynaklı çıktı üretir</li>
              <li>Handoff veya approval açar</li>
            </ol>
          </div>
        </div>
      </aside>
    </main>
  );
}
