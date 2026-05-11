# Live Company Ops UI Requirement

Date: 2026-05-11

## Decision

Saga Agent Ops must not feel like a static agent directory.

When the user opens localhost, the product should feel like a live AI company is operating in real time:

- employees are visible as a working organization
- the orchestrator is visibly routing work
- agents have live states such as idle, working, waiting for approval, blocked, completed
- handoffs move between employees
- active workflows show current step and responsible employee
- every visible action links back to ledger, trace, source, cost, artifact, memory, and approval records

## Screenshots Reviewed

The latest 13 screenshots from `C:\Users\akadi\Pictures\Screenshots` show these product patterns:

1. Left sidebar with many employees and per-employee state.
2. Employee profile drawer with role, skills, reference tools, work process, output format, and example prompts.
3. Team directory view with dispatcher/leader and worker cards.
4. Network graph view where departments/agents are represented as nodes.
5. Workflow/agent kit view where a task package expands into assigned agents.
6. Running step indicators on workflow nodes.
7. Add/select employee interface with avatar cards.
8. Search and quick navigation across employees.

## Saga Interpretation

Saga's version should be more production-oriented:

- dark real-time operations console
- 30 employee roster
- live company graph centered on Orchestration Engine / AI CEO
- department lanes for Revenue, Delivery, Engineering, Cybersecurity, Growth, Support, Governance
- task run timeline
- employee profile panel
- memory status per employee
- handoff stream
- approval inbox state
- cost/source/trace indicators

## Real-Time Architecture Target

Phase 0 UI can use deterministic preview data.

Phase 1 must connect the same UI to real runtime events:

```text
task created
  -> task_run created
  -> task_step queued/running/completed
  -> handoff_message created
  -> artifact created
  -> approval requested
  -> approval decided
  -> memory_event created
  -> trace_event created
```

Preferred transport:

1. Server-Sent Events for first live event stream.
2. WebSocket only when bidirectional live controls are needed.

## Non-Negotiable UX Rules

- The product must show a company working, not just a list of agents.
- The user must always see who is doing what now.
- Real-time visuals must be backed by real state events once Faz 1 begins.
- Animated activity cannot hide missing trace, cost, source, approval, or memory records.
- Security and external actions must visibly wait for human approval.
