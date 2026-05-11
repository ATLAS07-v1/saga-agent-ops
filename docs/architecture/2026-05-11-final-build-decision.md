# Final Build Decision

Date: 2026-05-11

## Decision

Start building.

The plan is approved with one important clarification:

**The product goal is not the lead/proposal workflow. The product goal is Saga Teknoloji's 30-employee AI company operating system for technology, software, and cybersecurity work.**

The lead/proposal workflow is only the first validation scenario for the company operating engine.

Second correction:

**The orchestration layer starts as an operating engine. The AI CEO / Özel Kalem worker is added later on top of that engine.**

P0 will have:

- Orchestration engine: deterministic runtime, state machine, routing, policy, retry, timeout, resume.
- Worker 1: Lead Researcher.
- Worker 2: Offer Drafter.
- Human reviewer: approval queue.

The 30 AI employee company is the target organization. Employees are role configurations with skills, tools, personal memory, handoff rules, output schemas, approval boundaries, and eval criteria on one runtime, not 30 separate services.

Third correction:

**Every employee gets its own governed memory. No memory, no employee.**

Before any new employee is implemented, we research current GitHub/open-source examples for that employee's domain, extract patterns, and convert them into a Saga-native hybrid role card. The official protocol is `docs/architecture/2026-05-11-agent-memory-and-research-protocol.md`.

## Final Product Target

```text
User gives a business task
  -> orchestration layer interprets and plans the work
  -> relevant AI employees are selected
  -> employees communicate through structured handoffs/messages
  -> each employee produces artifacts
  -> risky actions go to approval
  -> final result returns to the user
  -> ledger records state, source, artifact version, cost, trace, prompt version, and decisions
```

## First Validation Slice

```text
Lead URL or company input
  -> Orchestration engine creates task and run
  -> Lead Researcher creates sourced research artifact
  -> Offer Drafter creates proposal artifact
  -> Approval inbox receives the artifact
  -> Human approves, rejects, revises, or blocks
  -> Ledger records state, source, artifact version, cost, trace, prompt version, and decision
```

## P0 Must-Haves

- TypeScript monorepo.
- `apps/api`.
- `apps/web`.
- `packages/shared`.
- `packages/agent-runtime`.
- PostgreSQL schema v0.
- Drizzle migrations.
- Task state machine.
- Structured handoff/message records.
- Approval queue.
- Artifact versioning.
- Source tracking.
- Cost events.
- Trace events.
- Agent role registry.
- Agent capability/tool registry.
- Agent skill registry.
- Per-agent memory profile.
- Memory read/write policy.
- Agent creation research protocol.
- Handoff rules between roles.
- Provider abstraction.
- Prompt versioning.
- Hard budget caps.
- Retry, timeout, and failed-step handling.
- Tenant-aware schema from day one.
- Knowledge base v0 with Markdown sources.
- Minimum eval set.

## P0 Non-Goals

- Org chart UI.
- CRM write.
- Autonomous email.
- Marketplace.
- Running all 30 employees.
- Uncontrolled agent-to-agent free chat.
- Complex RAG.
- Fully autonomous self-learning memory.
- Full Temporal or LangGraph adoption.
- Production deployment automation.

## Stack Decision

Default stack:

- Monorepo: pnpm + Turborepo.
- Web: Next.js App Router.
- API: Hono.
- Shared contracts: Zod + TypeScript.
- DB: PostgreSQL.
- ORM/migrations: Drizzle.
- Agent calls: provider abstraction, Vercel AI SDK compatible.
- Observability: local trace tables first; Langfuse/OpenTelemetry integration after first real model loop.
- Workflow: DB-backed state machine for the first walking skeleton. BullMQ can be added before parallel task load or the 50-task pilot if async execution pressure appears.

Reasoning:

- Avoid heavy framework lock-in before the first vertical slice.
- Keep replay, approval, audit, and policy inside our own business ledger.
- Do not build 30 separate agent services; agents are role configs with prompt/tool/policy/version.

## First Two-Week Demo

By the end of the first build sprint:

```text
Input a company URL
  -> task appears in ledger
  -> Researcher artifact appears
  -> Drafter proposal appears
  -> approval inbox shows proposal
  -> approve/reject/revise works
  -> cost, source, trace, state, and prompt version are visible
```

If this does not work, no new agents are added.

## Live Company Interface

The localhost experience must show the company operating in real time, not only a static agent directory.

The UI target is:

- left employee roster with live status
- central company/workflow graph
- active task run timeline
- right employee profile and memory panel
- handoff stream
- approval, cost, source, trace, and memory indicators

Faz 0 can use deterministic preview data. Faz 1 must connect this interface to real task, step, handoff, artifact, approval, trace, cost, and memory events.

## Final Principle

The product is not "a lead proposal bot."

The product is a human-governed AI company operating system for Saga Teknoloji. The first slice proves the operating core; it does not define the product boundary.
