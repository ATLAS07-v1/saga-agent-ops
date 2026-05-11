# Two Week Build Sprint

Date: 2026-05-11

## Sprint Goal

Build the first working validation slice for the Saga AI company operating engine:

```text
Company URL or lead input
  -> Orchestration engine creates task/run/steps
  -> Researcher creates sourced research artifact
  -> Structured handoff passes research artifact to Drafter
  -> Drafter creates offer draft
  -> Approval inbox receives draft
  -> User approves, rejects, or requests changes
  -> System records state, source, cost, duration, trace, prompt version, approval, and artifact version
```

This is not the final product boundary. It is the smallest scenario that proves the 30-employee target AI company engine can assign work, pass work between employees, request approval, and record the process.

No org chart UI, CRM write, marketplace, complex RAG, or extra worker agents until this works.

## Week 1: Engine

### Day 1: Monorepo Scaffold

Done criteria:

- `pnpm install` works.
- `apps/api` exists.
- `apps/web` exists.
- `packages/shared` exists.
- `packages/agent-runtime` exists.
- `pnpm dev` starts placeholder API and web targets or clearly documented placeholders.

### Day 2: Database Schema v0

Done criteria:

- Migration runs locally.
- Tables exist:
  - tenants
  - users
  - agents
  - tasks
  - task_runs
  - task_steps
  - approvals
  - artifacts
  - handoff_messages
  - cost_events
  - trace_events
  - knowledge_sources
  - agent_versions
  - prompt_versions
  - tool_grants
- Every business table has `tenant_id` or a documented reason not to.
- Task and step states are explicit.

### Day 3: Agent Runtime Contract

Done criteria:

- `runAgent(task, context)` exists in `packages/agent-runtime`.
- Agent result returns:
  - status
  - artifact payload
  - trace events
  - cost estimate
  - sources
- prompt version
- Provider adapter is behind an interface.
- Retry and timeout policy shape exists.
- Handoff message contract exists.

### Day 4: Researcher Agent

Done criteria:

- Input: company URL or lead description.
- Output: sourced research artifact.
- Result is stored in `artifacts`.
- Run creates trace and cost events.

### Day 5: Budget Caps and Tool Registry

Done criteria:

- Task-level token or cost cap exists.
- Max step count exists.
- Tenant daily budget placeholder exists.
- Agent tool allowlist exists.
- Blocked tool call fails safely and is logged.
- Failed step can be marked failed and resumed or skipped by policy.

## Week 2: Workflow and Human Loop

### Day 6: Engine -> Researcher -> Drafter

Done criteria:

- Orchestration engine creates task plan without an LLM call.
- Researcher runs first.
- Researcher output is recorded as a handoff to Drafter.
- Drafter consumes research artifact.
- Offer draft artifact is created.

### Day 7: Drafter Agent

Done criteria:

- Drafter uses knowledge base content.
- Draft includes scope, problem hypothesis, proposed package, assumptions, and next step.
- Draft is marked `needs_review`.

### Day 8: Approval Gateway

Done criteria:

- Approve, reject, request changes, and block actions exist.
- Approval records approver, timestamp, decision, and reason.
- Request changes creates a new artifact version or revision task.

### Day 9: Web UI v0

Done criteria:

- Task list page.
- Approval inbox page.
- Artifact preview.
- Cost/source/trace summary visible.

### Day 10: Knowledge Base and Demo Hardening

Done criteria:

- 5 Markdown knowledge sources exist:
  - Saga service packages
  - pricing logic
  - ICP and target customer notes
  - offer style guide
  - approval and risk rules
- Demo path works end to end.
- At least 5 test tasks completed.
- Minimum eval file exists with 10 golden cases.

## Minimum Eval Set

Create 10 golden tasks covering:

- good lead with URL
- weak lead with little information
- Turkish local business
- B2B SaaS lead
- tourism/hotel lead
- missing source
- unsafe action attempt
- budget cap hit
- reject and revise
- duplicate/resume case

## Explicit Non-Goals

- No CRM write.
- No autonomous email.
- No org chart UI.
- No agent marketplace.
- No more than 2 LLM worker agents.
- Orchestrator is engine code, not a worker agent.
- No customer-facing paid pilot until 50 internal tasks are logged.
