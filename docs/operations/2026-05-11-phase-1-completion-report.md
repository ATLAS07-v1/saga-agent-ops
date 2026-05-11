# Phase 1 Completion Report

Date: 2026-05-11

## Scope

Phase 1 proves the first working Saga AI company workflow:

```text
Lead or company URL
  -> Orchestration engine creates task/run/steps
  -> Lead Researcher creates sourced research artifact
  -> structured handoff goes to Proposal Drafter
  -> Proposal Drafter creates offer draft
  -> approval inbox receives the artifact
  -> owner approves, rejects, requests revision, or blocks
  -> ledger records state, source, handoff, cost, duration, trace, prompt version, approval, and artifact version
```

The orchestrator remains engine code, not a Phase 1 LLM worker.

## Completed

- `runAgent` runtime contract exists in `packages/agent-runtime`.
- Provider adapter interface exists with a local deterministic provider.
- Retry and timeout policy exists.
- Budget cap enforcement exists.
- Tool allowlist enforcement exists and blocked tool calls are recorded.
- Lead Researcher and Proposal Drafter run through the shared runtime.
- Researcher creates a sourced research artifact.
- Drafter consumes the research artifact and Phase 1 knowledge base.
- Drafter creates an approval-ready proposal draft.
- Handoff records are stored in the local ledger.
- Approval gateway supports approve, reject, revision request, and block.
- Revision request creates artifact version 2.
- Approver, timestamp, reason, task state, run state, trace, source, cost, and artifact version are recorded.
- Five Phase 1 Markdown knowledge sources exist.
- Ten golden Phase 1 eval cases run through `pnpm test`.
- Localhost UI calls the runtime workflow and supports block/revision decisions.

## Validation Evidence

- `pnpm.cmd typecheck` passed.
- `pnpm.cmd test` passed with `Phase 1 eval passed: 10/10`.
- `pnpm.cmd build` passed.
- `POST /demo/phase-1/seed` created 10 demo runs.
- Live ledger after verification recorded:
  - 11 tasks
  - 11 runs
  - 44 source records
  - 22 handoff records
  - 11 cost events
  - 24 artifact versions
  - 6 approval decisions
- Browser verification confirmed the UI shows Approval Inbox, source/cost signals, and `Bloke Et` removes action buttons after decision.

## Remaining After Phase 1

- API still uses local in-memory ledger when Postgres is not available.
- External paid LLM provider calls are intentionally disabled until explicit spending approval.
- Web search/scraping is represented by tool policy and sourced input records; live browsing tools are not yet connected to workers.
- Weekly report workflow is not part of the closed Phase 1 runtime and belongs to the next slice.
- Package-level tests still echo placeholders; the real Phase 1 eval currently lives at root `tools/phase1-eval.ts`.

## Decision

Phase 1 is complete as a local, approval-gated AI company runtime slice. The next phase can start by either:

1. connecting the ledger to Postgres, or
2. adding real read-only research tools behind the existing tool gateway.
