# Phase 1.5 Hardening Report

Date: 2026-05-11

## Why

External agent review accepted Phase 1 as complete, but flagged four blockers before Phase 2:

- in-memory ledger risk
- deterministic-only provider risk
- no real read-only research tool
- eval set too narrow for failure and revision behavior

## Implemented

- Added optional Postgres persistence mirror behind `SAGA_LEDGER_STORE=postgres`.
- Switched local ledger IDs to UUIDs so records can be mirrored into the Drizzle schema.
- Added optional Ollama provider behind `SAGA_LLM_PROVIDER=ollama`.
- Added `finishReason` to provider results.
- Added read-only company website research tool behind `enableWebResearch` / `SAGA_ENABLE_WEB_RESEARCH=true`.
- Added real revision loop: `revision_requested` re-runs Proposal Drafter with owner feedback and creates artifact v2, trace, handoff, memory, and cost records.
- Expanded root eval set from 10 to 20 cases.

## Validation

- `pnpm.cmd typecheck` passed.
- `pnpm.cmd test` passed.
- Root eval result: `Phase 1 eval passed: 20/20`.

## Still Explicitly Not Done

- Postgres mode is optional and expects a running migrated database.
- Ollama mode is optional and expects a local Ollama server/model.
- OpenAI/Anthropic paid provider calls remain intentionally disabled until explicit approval.
- UI still contains some animated company-status presentation; backend-backed trace/cost/source primitives now exist for replacing those in Phase 2.

## Phase 2 Gate

Phase 2 can start after one live local run is verified with either:

```text
SAGA_LEDGER_STORE=postgres
```

or:

```text
SAGA_LLM_PROVIDER=ollama
SAGA_ENABLE_WEB_RESEARCH=true
```

The safest Phase 2 order remains: persistence first, then live research/provider, then additional agents.
