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

const liveWorkflows = [
  {
    name: "Lead -> Araştırma -> Teklif",
    owner: "Lead Araştırmacısı",
    status: "running",
    step: "Kaynaklı firma profili hazırlanıyor",
    progress: 62,
    agents: ["lead-researcher", "market-intelligence-analyst", "proposal-drafter"]
  },
  {
    name: "Siber Güvenlik Ön İnceleme",
    owner: "Uygulama Güvenliği Uzmanı",
    status: "review",
    step: "Bulgular insan onayı bekliyor",
    progress: 78,
    agents: ["security-kvkk-reviewer", "application-security-specialist", "compliance-risk-controller"]
  },
  {
    name: "Yazılım Teslimat Planı",
    owner: "Çözüm Mimarı",
    status: "running",
    step: "Backend ve DevOps handoff hazırlanıyor",
    progress: 45,
    agents: ["solution-architect", "backend-engineer", "devops-platform-engineer", "qa-test-automation-specialist"]
  },
  {
    name: "SEO Tam Denetim",
    owner: "SEO Stratejisti",
    status: "queued",
    step: "Site denetleyici sıraya alındı",
    progress: 24,
    agents: ["seo-strategist", "content-planner", "reporting-analyst"]
  }
];

const graphAgents = [
  { slug: "ai-ceo-chief-of-staff", x: 50, y: 47 },
  { slug: "lead-researcher", x: 24, y: 24 },
  { slug: "proposal-drafter", x: 20, y: 66 },
  { slug: "solution-architect", x: 41, y: 18 },
  { slug: "backend-engineer", x: 72, y: 22 },
  { slug: "devops-platform-engineer", x: 80, y: 50 },
  { slug: "application-security-specialist", x: 67, y: 74 },
  { slug: "compliance-risk-controller", x: 45, y: 82 },
  { slug: "seo-strategist", x: 16, y: 44 },
  { slug: "knowledge-manager", x: 55, y: 17 },
  { slug: "project-manager", x: 34, y: 76 },
  { slug: "qa-test-automation-specialist", x: 85, y: 72 }
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

function statusFor(slug: string, tick: number) {
  const active = liveWorkflows.some((workflow) => workflow.agents.includes(slug));
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

    async function loadPreviewRun() {
      const response = await fetch("http://localhost:3001/workflows/lead-to-offer/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyUrl: "https://sagateknoloji.com",
          companyName: "Saga Teknoloji",
          targetService: "AI çalışanlı şirket işletim sistemi"
        }),
        signal: controller.signal
      });

      if (!response.ok) return;
      const data = (await response.json()) as { run: Phase1PreviewRun };
      setPhase1Run(data.run);
      await loadApprovals(controller.signal);
    }

    void loadPreviewRun().catch(() => {
      if (!controller.signal.aborted) setPhase1Run(null);
    });

    return () => controller.abort();
  }, []);

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

    const approvalsResponse = await fetch("http://localhost:3001/approvals");
    if (!approvalsResponse.ok) return;

    const approvalsData = (await approvalsResponse.json()) as { approvals: LedgerApproval[] };
    setApprovalInbox(approvalsData.approvals);
  }

  const selectedAgent =
    sagaEmployeeRoster.find((agent) => agent.slug === selectedSlug) ?? sagaEmployeeRoster[0]!;

  const roster = useMemo(
    () =>
      sagaEmployeeRoster.map((agent) => ({
        ...agent,
        title: displayNames[agent.slug] ?? agent.title,
        status: statusFor(agent.slug, tick)
      })),
    [tick]
  );

  const runtimeEvents =
    phase1Run?.traceEvents.map((event) => event.message ?? event.eventType ?? "runtime event") ?? handoffEvents;
  const activeEvent = runtimeEvents[tick % runtimeEvents.length] ?? runtimeEvents[0]!;
  const activeWorkflow = liveWorkflows[tick % liveWorkflows.length] ?? liveWorkflows[0]!;
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
    phase1Run?.artifacts.reduce((total, artifact) => total + (artifact.sources?.length ?? 0), 0) ?? 0;
  const costText = phase1Run ? `$${phase1Run.cost.estimatedUsd.toFixed(4)}` : "$0.0000";

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
            <span>30 çalışan</span>
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
              {liveWorkflows.map((workflow, index) => (
                <article className={`workflow-card ${workflow.status}`} key={workflow.name}>
                  <div>
                    <strong>{workflow.name}</strong>
                    <small>{workflow.owner}</small>
                  </div>
                  <p>{workflow.step}</p>
                  <div className="progress-track">
                    <span style={{ width: `${Math.min(workflow.progress + (tick + index) % 8, 96)}%` }} />
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
            <span className={`status-dot ${statusFor(selectedAgent.slug, tick)}`} />
            <strong>{statusFor(selectedAgent.slug, tick)}</strong>
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
