# Saga Agent Ops

Saga Agent Ops is a separate Saga Teknoloji product workspace for building a controlled AI employee system.

ATLAS Core is used only as the builder/operator for this repository. The project itself is independent from ATLAS Core.

## Mission

Create Saga Teknoloji's 30-employee AI company operating system for technology, software, and cybersecurity work: a managed organization of role-based AI employees that can receive business tasks, distribute work, communicate through controlled handoffs, remember through governed per-agent memory, produce artifacts, request human approvals, and return completed work with full ledger, source, cost, trace, and decision history.

The first validation slice is not the full product. It is the smallest scenario that proves the company operating engine:

- lead research
- lead-to-offer workflow
- human-approved proposal artifact
- task ledger, approval queue, cost/source/trace tracking
- structured worker handoff

## Current Status

Project folder initialized with planning documents, reference material, a working Phase 1 local runtime, Phase 1.5 hardening, and a Phase 2 8-active-employee runtime.

Implemented pieces:

- pnpm + Turborepo workspace
- `apps/api` Hono service
- `apps/web` Next.js App Router dashboard
- `packages/shared` shared contracts and 30 employee roster
- `packages/agent-runtime` runtime, artifact, handoff, memory context contracts
- `packages/db` Drizzle schema and first SQL migration
- per-agent memory tables and memory policy contract
- live company operations console preview
- Phase 1 Lead Researcher and Proposal Drafter definitions
- Phase 1 `runAgent` runtime contract
- provider adapter interface with local deterministic provider
- optional Ollama provider through `SAGA_LLM_PROVIDER=ollama`
- retry, timeout, budget cap, and tool allowlist policy
- read-only company website research tool behind `SAGA_ENABLE_WEB_RESEARCH=true`
- Phase 1 Researcher -> Drafter -> Approval runtime workflow
- local ledger records for tasks, runs, steps, artifacts, sources, handoffs, costs, traces, memory, and approvals
- optional Postgres persistence mirror through `SAGA_LEDGER_STORE=postgres`
- approval decisions: approve, reject, request revision, block
- revision re-runs Proposal Drafter and creates artifact version v2
- Phase 2 active roster and employee definitions
- Phase 2 workflows: `lead_to_offer_v2`, `weekly_ops_report`, `product_scope_draft`
- per-agent cost dashboard and memory candidate tracking
- approval feedback to governed eval/artifact memory
- company state endpoint for real UI polling
- Phase 1 knowledge base, 20-case Phase 1 eval, and 10-case Phase 2 eval

Key references copied from ATLAS planning work:

- `docs/reference/2026-05-10-yapay-zeka-ajanlari-video-raporu.md`
- `docs/reference/2026-05-10-saga-ai-calisan-sistemi-kurulum-plani.md`
- `docs/reference/2026-05-10-saga-agentic-ai-calisan-mimari-plani.md`
- `docs/reference/2026-05-10-saga-agentic-ai-calisan-sistemi-strateji-plani.md`
- `docs/reference/2026-05-11-saga-agent-ops-v2-degerlendirme.md`
- `docs/reference/2026-05-11-external-agent-consensus.md`

Current product direction:

- `docs/product/2026-05-11-north-star-ai-company-requirements.md`
- `docs/product/2026-05-11-saga-30-ai-calisan-gorev-dagilimi.md`
- `docs/operations/2026-05-11-30-calisan-faz-plani.md`
- `docs/architecture/2026-05-11-agent-memory-and-research-protocol.md`
- `docs/product/2026-05-11-live-company-ops-ui-requirement.md`

## Initial Structure

```text
apps/                  Application entrypoints
packages/              Shared packages and agent runtime
tools/                 Local scripts and developer tools
docs/product/          Product vision and requirements
docs/architecture/     Architecture decisions and system design
docs/operations/       Approval policy, rollout, runbooks
docs/backlog/          MVP backlog and sprint plans
docs/reference/        Imported planning references
```

## Next Build Slice

Phase 2 is now implemented. The next build slice is Phase 3: customer package, technical delivery planning, product/delivery engineering roles, and read-only customer workspace.

Phase 2 report: `docs/operations/2026-05-11-phase-2-completion-report.md`

## Local Endpoints

- Web console: `http://localhost:3000`
- API health: `http://localhost:3001/health`
- Full roster: `http://localhost:3001/agents`
- Phase 1 agents: `http://localhost:3001/agents/phase-1`
- Phase 2 agents: `http://localhost:3001/agents/phase-2`
- Phase 2 plans: `http://localhost:3001/workflows/phase-2/plans`
- Phase 1 preview workflow: `POST http://localhost:3001/workflows/lead-to-offer/preview`
- Phase 1 runtime workflow: `POST http://localhost:3001/workflows/lead-to-offer/run`
- Phase 2 workflow run: `POST http://localhost:3001/workflows/phase-2/:workflowType/run`
- Phase 1 demo seed: `POST http://localhost:3001/demo/phase-1/seed`
- Phase 2 demo seed: `POST http://localhost:3001/demo/phase-2/seed`
- Company state: `http://localhost:3001/company/state`
- Ledger summary: `http://localhost:3001/ledger/summary`
- Ledger tasks: `http://localhost:3001/ledger/tasks`
- Ledger runs: `http://localhost:3001/ledger/runs`
- Ledger artifacts: `http://localhost:3001/ledger/artifacts`
- Ledger sources: `http://localhost:3001/ledger/sources`
- Ledger handoffs: `http://localhost:3001/ledger/handoffs`
- Ledger costs: `http://localhost:3001/ledger/costs`
- Ledger cost dashboard: `http://localhost:3001/ledger/cost-dashboard`
- Ledger memory: `http://localhost:3001/ledger/memory`
- Approval inbox: `http://localhost:3001/approvals`
- Approval decision: `POST http://localhost:3001/approvals/:approvalId/decision`
- Local development ledger reset: `POST http://localhost:3001/ledger/reset`
- Knowledge sources: `http://localhost:3001/knowledge/sources`

## Validation

- `pnpm.cmd typecheck`
- `pnpm.cmd test`
- `pnpm.cmd build`
- Browser check on `http://localhost:3000`

Current root eval coverage:

- `Phase 1 eval passed: 20/20`
- `Phase 2 eval passed: 10/10`
