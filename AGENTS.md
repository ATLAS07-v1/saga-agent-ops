# Saga Agent Ops Project Instructions

## Identity

This repository is not ATLAS Core. It is a separate Saga Teknoloji product workspace for building Saga Agent Ops: a controlled AI employee operating system for internal Saga operations first, and managed customer deployments later.

ATLAS Core may be used as the manufacturing operator for this project, but ATLAS system files, memory, doctrine, and internal package structure must not be copied into this repo unless explicitly requested. This repo owns its own product decisions, docs, code, tests, and release gates.

## Product Goal

Build Saga Teknoloji's AI company operating system with:

- agent registry
- task ledger
- human approval queue
- tenant/project memory
- tool permission gateway
- cost and trace monitoring
- structured inter-agent handoff/message records
- role-specific skills and output contracts
- orchestration engine and later AI CEO / Özel Kalem planning layer
- first validation slice for lead/research/proposal
- later sector packages for tourism/hotel, local services, and managed AI workforce delivery

## Default MVP

The first validation slice is B2B revenue and operations support. It validates the company engine; it is not the product boundary:

1. Lead research and qualification.
2. Offer draft generation.
3. Human approval and revision loop.
4. Weekly report artifact.
5. Cost, source, and trace logging.
6. Structured handoff from Researcher to Drafter.

Do not start with a general agent marketplace or 100+ agents. Start with a small, measurable worker set.

Current P0 worker set is two LLM workers only:

- Researcher
- Drafter

The orchestrator is engine code: state machine, routing, policy, retry, timeout, and resume. It is not a P0 LLM worker.

Human review through the approval queue replaces a QA agent in P0. CRM and pipeline agents come after the first workflow proves itself.

## Proposed Structure

```text
apps/
  web/
  api/
packages/
  agent-runtime/
  shared/
tools/
docs/
  product/
  architecture/
  operations/
  backlog/
  reference/
```

## Engineering Rules

- Read local docs before changing code.
- Prefer small, reversible increments.
- Keep the product separate from ATLAS Core.
- Do not store secrets in files.
- Add tests or validation notes for non-trivial changes.
- Keep customer-facing artifacts separate from internal implementation notes.
- Use structured data for agent registry, permissions, tasks, and run events.

## Approval Boundaries

Explicit user approval is required before:

- contacting third parties
- sending emails or social posts
- spending money
- accepting or signing agreements
- using private credentials outside the stated task
- deploying to production
- deleting data
- changing git history destructively
- processing sensitive customer data outside a defined policy

## Done Criteria

For implementation work, report:

- what changed
- where it lives
- what was validated
- what remains blocked or risky
