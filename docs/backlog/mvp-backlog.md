# MVP Backlog

## P0

- Monorepo scaffold: `apps/web`, `apps/api`, `packages/shared`, `packages/agent-runtime`.
- DB-backed task state machine: created, planned, running, waiting_approval, approved, rejected, blocked, failed, completed.
- Agent registry schema.
- Agent role/capability/tool registry.
- Agent skill registry.
- Structured handoff/message schema.
- Prompt versioning.
- Provider abstraction.
- Task ledger schema.
- Approval queue model.
- Retry, timeout, and failed-step handling.
- Cost event tracking.
- Trace event tracking.
- Source tracking.
- Artifact storage convention.
- Tenant knowledge base v0: 5-10 Markdown sources plus prompt injection.
- Hard budget caps: task token cap, step cap, tenant daily cost cap.
- First two LLM worker roles:
  - Lead Researcher
  - Offer Drafting Agent
- Orchestrator is a runtime engine, not a P0 LLM agent.
- Human QA through approval queue, not a separate QA agent.
- Lead -> Research -> Offer Draft -> Approval -> Weekly Report workflow.
- Handoff record from Researcher artifact to Drafter input.
- Approval queue with approve, reject, request changes, block, reason, approver, and timestamp.
- Minimum eval set: 10 golden tasks, acceptance rubric, unsafe action test, budget cap test, retry/failure test.

## P1

- BullMQ if async/parallel execution pressure appears before the 50-task pilot.
- Read-only CRM connector spike.
- Daily Saga briefing prototype.
- Cost and trace dashboard view.
- Pipeline Operator agent after read-only CRM is proven.
- QA/Risk Reviewer agent after approval feedback data exists.
- Agent presence/status UI.

## P2

- Web control panel scaffold.
- API scaffold.
- pgvector memory spike.
- Org chart and department UI.
- Tourism/hotel demo package.
- Local services demo package.

## Deferred

- Autonomous outreach.
- Agent marketplace.
- Customer self-serve tool builder.
- Enterprise SSO.
- Fully automated CRM writes.
