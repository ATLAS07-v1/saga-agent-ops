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

Project folder initialized with planning documents, reference material, and a working Phase 1 local runtime.

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
- retry, timeout, budget cap, and tool allowlist policy
- Phase 1 Researcher -> Drafter -> Approval runtime workflow
- local ledger records for tasks, runs, steps, artifacts, sources, handoffs, costs, traces, memory, and approvals
- approval decisions: approve, reject, request revision, block
- revision creates artifact version v2
- Phase 1 knowledge base and 10-case eval runner

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

Detailed sprint plan: `docs/backlog/2026-05-11-two-week-build-sprint.md`

1. Scaffold the TypeScript monorepo.
2. Create PostgreSQL schema v0 for ledger, approvals, artifacts, costs, traces, agents, and knowledge.
3. Implement the orchestration engine contract and agent runtime contract.
4. Build structured handoff/message records between workers.
5. Build the first validation workflow: `Engine -> Research -> Offer Draft -> Approval -> Weekly Report`.
6. Run a two-week demo: URL in, research + offer draft in approval inbox, state/cost/source/trace visible.

## Local Endpoints

- Web console: `http://localhost:3000`
- API health: `http://localhost:3001/health`
- Full roster: `http://localhost:3001/agents`
- Phase 1 agents: `http://localhost:3001/agents/phase-1`
- Phase 1 preview workflow: `POST http://localhost:3001/workflows/lead-to-offer/preview`
- Phase 1 runtime workflow: `POST http://localhost:3001/workflows/lead-to-offer/run`
- Demo seed: `POST http://localhost:3001/demo/phase-1/seed`
- Ledger summary: `http://localhost:3001/ledger/summary`
- Ledger tasks: `http://localhost:3001/ledger/tasks`
- Ledger runs: `http://localhost:3001/ledger/runs`
- Ledger sources: `http://localhost:3001/ledger/sources`
- Ledger handoffs: `http://localhost:3001/ledger/handoffs`
- Ledger costs: `http://localhost:3001/ledger/costs`
- Approval inbox: `http://localhost:3001/approvals`
- Approval decision: `POST http://localhost:3001/approvals/:approvalId/decision`
- Local development ledger reset: `POST http://localhost:3001/ledger/reset`
- Knowledge sources: `http://localhost:3001/knowledge/sources`

## Validation

- `pnpm.cmd typecheck`
- `pnpm.cmd test`
- `pnpm.cmd build`
- Browser check on `http://localhost:3000`
