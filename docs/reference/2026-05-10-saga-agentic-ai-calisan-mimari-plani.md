# Saga Teknoloji Agentic AI Calisan Mimari Plani

Tarih: 2026-05-10

## Karar Ozeti

Saga Teknoloji icin onerilen urun, "tek bir akilli ajan" degil; musteri basina kontrollu, izlenebilir ve onayli is yapan AI calisan filolari icin bir SaaS kontrol duzlemidir. ATLAS Core'daki mevcut `profiller/`, `yetenekler/`, `hafiza/`, `bilgi-beyni/`, `paketler/` ve `Calisma Alani/` ayrimi bu urunde dogrudan urun kavramlarina donusmelidir:

- `profiller` -> agent roles/personas
- `yetenekler` -> versioned agent capabilities/playbooks
- `hafiza` -> durable tenant/project memory
- `bilgi-beyni` -> sourced knowledge base/RAG
- `paketler` -> industry or function-specific agent packs
- `Calisma Alani` -> customer-visible deliverables, reports, approvals and work artifacts

Ana mimari karari: control-plane ve execution-plane ayrilsin. Control-plane policy, tenant, registry, ledger, approval, billing, CRM ve observability'yi yonetir. Execution-plane ajan run'larini, tool cagri izolasyonunu, workflow resume/retry davranisini ve sandbox calismayi yonetir.

## Moduler Mimari

### 1. Control Plane

Control plane musteri, ajan, gorev ve guvenlik sozlesmelerinin otoritesidir.

- Tenant service: organization, workspace, user, role, plan, quota, data residency, customer environment mapping.
- Agent registry: agent template, role, model policy, tool allowlist, memory scope, approval policy, eval gate, version.
- Task ledger: her is icin append-only niyet, plan, step, tool call, approval, result, artifact ve cost kaydi.
- Policy service: RBAC/ABAC, tool permission, tenant boundary, data classification, spending/action limit.
- Approval service: HITL approval queue, approval SLA, approver role, escalation, signed decision log.
- Integration control: CRM/pipeline mappings, webhook subscriptions, external OAuth connections, connector health.
- Admin console: tenant setup, agent enable/disable, tool grants, approval rules, eval status, incident view.

### 2. Execution Plane

Execution plane ajan calistirma ve tool izolasyon katmanidir.

- Orchestrator API: task intake, run creation, state resume, event streaming, cancellation, retry.
- Workflow engine: long-running/durable steps, retries, timers, human wait states, idempotent activity execution.
- Agent runtime: planner, specialist handoff, guarded tool use, structured outputs, context assembly.
- Tool gateway: CRM, email, calendar, browser, code, document, database and custom MCP/tool adapters.
- Sandbox workers: risky file/command/browser/tool work for each tenant/run in isolated containers.
- Memory/RAG pipeline: ingestion, chunking, embedding, retrieval, citation, freshness and deletion handling.
- Artifact service: reports, files, exported tables, task evidence, redacted previews.

### 3. Data Plane

Data plane musteri verisini, vector arama ve ledger kayitlarini ayirir.

- OLTP: Postgres as system of record.
- Vector/RAG: MVP'de pgvector; buyuk olcekte Qdrant/Weaviate/Pinecone opsiyonel.
- Object storage: S3-compatible bucket for artifacts, uploaded docs and render outputs.
- Event stream: NATS/Redis Streams/Kafka for async task and integration events.
- Analytics: ClickHouse/BigQuery/Snowflake later for telemetry, cost and customer usage analytics.

### 4. Security And Deployment Plane

- Identity: OIDC/SAML for customer SSO; internal service identity with workload identity, not static keys.
- Secrets: cloud secret manager; per-tenant connector tokens encrypted and scoped.
- Network: private subnets, egress allowlists for tools, deny-by-default worker network policies.
- Runtime isolation: per-run container sandbox, no shared writable filesystem, time/resource budgets.
- Audit: immutable tool-call, approval and admin-action trail.
- Deployment: Docker images, Kubernetes or ECS/Fargate, separate dev/stage/prod, IaC with Terraform/Pulumi.

## Request Flow

1. Customer/user/API creates a task: "follow up dormant leads", "prepare hotel partner report", "audit CRM pipeline".
2. Orchestrator resolves tenant, agent version, policy, tool grants and memory scope.
3. Agent creates a typed plan and writes it to task ledger.
4. Policy service classifies steps: safe auto-run, needs approval, blocked, or needs elevated connection.
5. Execution workers run allowed steps through tool gateway and sandbox.
6. RAG layer supplies sourced tenant/project context; raw private data is not copied into long-term memory by default.
7. Risky actions pause at HITL approval: send email, update CRM stage, spend money, delete records, publish output.
8. Ledger records every state transition, tool input/output summary, approval and artifact.
9. Telemetry/evals score quality, safety, latency, cost, tool success and customer feedback.
10. CRM/pipeline integration updates task outcomes, opportunities, next actions and customer health.

## MVP Scope

MVP should sell a narrow, high-value AI employee rather than a general agent platform.

Recommended beachhead: "AI Revenue/Operations Employee for B2B pipeline hygiene and follow-up" because it naturally uses CRM/pipeline data, approvals, measurable outcomes and repeatable playbooks.

Must include:

- 2-3 agent templates: CRM Researcher, Pipeline Operator, Executive Briefing Agent.
- One CRM integration first: HubSpot or Pipedrive; Salesforce later due enterprise complexity.
- Task ledger with run, step, tool call, approval, artifact and cost records.
- Agent registry with versioned prompt/capability/tool policies.
- Tenant isolation in Postgres with org/workspace/project/user boundaries.
- RAG over uploaded docs, CRM notes and approved knowledge pages.
- HITL approvals for outbound email, CRM write, status change and external publishing.
- Telemetry dashboard: runs, success, blocked approvals, cost, latency, tool failures.
- Offline eval dataset of 50-100 golden tasks plus production feedback scoring.
- Admin UI for tenants, agents, tools, approvals, memory sources and integration health.

Defer from MVP:

- Fully autonomous external outreach.
- Multi-agent marketplace.
- Customer-built custom tools without review.
- Self-modifying agents.
- Complex cross-tenant analytics.
- Enterprise SSO unless a paid pilot requires it.

## Baseline Data Model

Core tenancy:

- `organizations`: tenant root, plan, billing, region, status.
- `workspaces`: business unit/project boundary under organization.
- `users`: identity, email, status.
- `memberships`: user, organization/workspace, role.
- `api_keys`: scoped machine access, hashed key, expiry.

Agents:

- `agent_templates`: canonical agent type.
- `agent_versions`: prompt, model policy, tools, memory policy, eval policy, status.
- `agent_instances`: tenant-enabled agent bound to workspace and config.
- `capabilities`: reusable skill/playbook definitions.
- `agent_capabilities`: versioned mapping of agents to capabilities.

Tasks and ledger:

- `tasks`: tenant task, requester, agent, status, priority, objective.
- `task_runs`: run attempt, model, started/ended, cost, outcome.
- `task_steps`: planned/executed steps, status, dependencies.
- `tool_invocations`: tool name, scope, request summary, response summary, redaction status, latency, cost.
- `approvals`: decision, approver, requested action, policy reason, expiry, signed record.
- `artifacts`: generated files, reports, exports, links, checksums.
- `events`: append-only operational events for replay/audit.

Memory/RAG:

- `knowledge_sources`: CRM, upload, wiki, URL, internal note, integration.
- `documents`: source metadata, tenant scope, classification, freshness.
- `document_chunks`: chunk text pointer, embedding id, citation metadata.
- `memories`: concise durable facts, source, confidence, TTL, sensitivity.
- `retrieval_logs`: query, selected chunks, agent/run, relevance score.

Permissions:

- `tools`: global tool registry.
- `tool_connections`: tenant OAuth/API connection metadata.
- `tool_grants`: agent/user/workspace permission to tool capability.
- `policy_rules`: allow/deny/approval rules.
- `audit_logs`: admin, policy, approval and integration changes.

CRM:

- `crm_connections`: provider, tenant, OAuth metadata, health.
- `crm_objects`: normalized lead/contact/company/deal/task ids.
- `pipeline_mappings`: local pipeline stages to provider stages.
- `sync_jobs`: last cursor, status, errors.
- `crm_events`: inbound webhooks and outbound mutations.

Evals/telemetry:

- `traces`: run/span ids, agent, tool, token/cost, latency.
- `eval_datasets`: golden tasks and expected rubrics.
- `eval_runs`: agent version, dataset, scores, regressions.
- `feedback`: user thumbs, corrections, manual labels, outcome tags.

## Technology Options

Recommended MVP stack:

- Backend: TypeScript/NestJS or Python/FastAPI. Choose TypeScript if CRM/admin SaaS speed matters; Python if agent runtime experimentation dominates.
- Workflow: Temporal for durable, business-critical long-running work; LangGraph for agent graph state when the agent control flow itself is complex. MVP can start with one, but production should avoid ad hoc queues for approvals/resume.
- Agent SDK: OpenAI Agents SDK, LangGraph, or provider-neutral internal runtime around tool gateway. Keep model calls behind a provider adapter.
- Database: Postgres + pgvector for MVP; graduate vector-heavy workloads to Qdrant/Weaviate/Pinecone only after recall/latency data demands it.
- Queue/events: Redis Streams or NATS for MVP; Kafka only when event volume and replay needs justify it.
- Observability/evals: OpenTelemetry for standard traces/metrics/logs; Langfuse or OpenAI evals for LLM/agent quality loops.
- Frontend: Next.js admin console with dense ops UI.
- Auth: Auth0/Clerk/Supabase Auth for speed, or Keycloak for self-hosted control.
- Deployment: AWS ECS/Fargate for fastest secure MVP; EKS/Kubernetes when sandbox, network policy and scale complexity grow.

## Biggest Technical Risks

1. Tenant data leakage through RAG, traces, prompts or tool outputs. Mitigation: tenant-scoped retrieval filters, RLS, redaction, prompt/context tests, no raw secret logging.
2. Irreversible tool actions. Mitigation: policy engine, approval gates, dry-run previews, idempotency keys, rollback playbooks.
3. Non-durable agent execution. Mitigation: Temporal/LangGraph checkpoints, idempotent activities, task ledger as source of truth.
4. CRM write drift and sync conflicts. Mitigation: provider object mapping, webhook cursoring, optimistic concurrency, mutation audit and manual reconciliation.
5. Eval illusion. Mitigation: golden tasks, production feedback, tool-call assertions, cost/latency budgets, regression gates per agent version.
6. Prompt/tool injection. Mitigation: tool output sanitization, instruction hierarchy, least-privilege tools, untrusted-content labeling, allowlisted actions.
7. Cost spikes. Mitigation: per-tenant quotas, per-run budgets, model routing, caching, retrieval limits, approval for expensive jobs.
8. Over-general MVP. Mitigation: one paid workflow, one CRM, few agents, measurable business metric before platform expansion.

## Source Notes

- LangGraph durable execution docs: https://langchain-5e9cc07a.mintlify.app/oss/python/langgraph/durable-execution
- Temporal platform docs: https://docs.temporal.io/
- MCP authorization docs: https://modelcontextprotocol.io/docs/tutorials/security/authorization
- OpenAI Agents SDK guide: https://developers.openai.com/api/docs/guides/agents
- Langfuse docs: https://langfuse.com/docs
- pgvector README: https://github.com/pgvector/pgvector
- PostgreSQL row security docs: https://www.postgresql.org/docs/17/ddl-rowsecurity.html
- Kubernetes NetworkPolicy docs: https://kubernetes.io/docs/concepts/services-networking/network-policies/
