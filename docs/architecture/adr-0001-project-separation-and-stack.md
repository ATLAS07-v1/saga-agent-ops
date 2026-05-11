# ADR 0001: Project Separation And Initial Stack

Date: 2026-05-10

## Status

Accepted for initial workspace.

## Decision

Saga Agent Ops will live in a separate folder and future repository outside ATLAS Core.

ATLAS Core will be used as the builder/operator, but the product code, product docs, tests, schemas, and release decisions belong to this project.

## Initial Stack Direction

Default direction:

- TypeScript monorepo.
- `apps/web` for control panel, likely Next.js App Router.
- `apps/api` for backend API, initially Hono rather than NestJS.
- `packages/agent-runtime` for orchestration adapters, Vercel AI SDK integration, and agent execution contracts.
- `packages/shared` for shared schemas and types.
- PostgreSQL as system of record with tenant-aware tables from day one.
- Drizzle or equivalent typed schema/migration layer.
- pgvector deferred until retrieval pressure exists; first knowledge version can be Markdown plus prompt injection.
- DB-backed state machine for the first walking skeleton; BullMQ added when async/parallel execution pressure appears.
- Temporal/LangGraph deferred until human-in-loop and durable resume complexity justify it.
- Local trace tables first; Langfuse/OpenTelemetry integration after the first real model loop.
- Orchestrator is runtime engine code, not a P0 LLM agent.

## Rationale

The product needs a control plane, not just prompts:

- tenant/project boundaries
- agent registry
- task ledger
- approval queue
- tool permission gateway
- cost tracking
- trace and eval records
- hard budget caps
- tenant knowledge base
- idempotent, resumable task steps
- prompt and agent versioning
- retry, timeout, and failure recovery
- provider abstraction
- tool policy and capability registry

Keeping the product separate prevents ATLAS Core from becoming the product runtime and keeps future deployment, ownership, and commercial packaging clean.

## Consequences

- ATLAS reference plans are copied into `docs/reference/`.
- New implementation work should happen here, not under `atlas-core`.
- If ATLAS learns reusable lessons while building this project, those lessons can later be summarized back into ATLAS memory only when explicitly requested.
