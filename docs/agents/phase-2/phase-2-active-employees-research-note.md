# Phase 2 Active Employees - Open Source Research Note

Date: 2026-05-11
Scope: 8 active employees for Saga Agent Ops Phase 2.

## Employees Covered

- AI CEO / Ozel Kalem
- Lead Arastirmacisi
- Pazar Istihbarat Analisti
- Satis Stratejisti
- Teklif ve Kapsam Hazirlayici
- Urun Yoneticisi
- Proje Yoneticisi
- Finans ve Maliyet Kontrol Uzmani

## Sources Reviewed

1. Mem0 GitHub
   - Source: https://github.com/mem0ai/mem0
   - Pattern: user/session/agent/run scoped persistent memory.
   - Saga decision: every employee writes governed memory candidates with agent, task_run, artifact, and eval layers.

2. Letta Docs and GitHub
   - Sources:
     - https://docs.letta.com/guides/core-concepts/stateful-agents/
     - https://github.com/letta-ai/letta
   - Pattern: stateful agents have system prompt, memory blocks, messages, tools, runs, and steps.
   - Saga decision: employee identity is not only a prompt; Phase 2 definitions include goal, backstory, tool policy, memory policy, output schema, and handoff rule.

3. LangGraph Persistence Docs
   - Source: https://docs.langchain.com/oss/python/langgraph/persistence
   - Pattern: checkpoint graph state at each step for human-in-the-loop, resume, debugging, and fault tolerance.
   - Saga decision: keep the ledger as the source of truth. Every Phase 2 workflow writes task plan, step records, artifacts, handoffs, costs, traces, approvals, and memory candidates.

4. CrewAI Agent Docs
   - Source: https://docs.crewai.com/en/concepts/agents
   - Pattern: agent behavior is shaped by role, goal, backstory, tools, memory, execution controls, and knowledge sources.
   - Saga decision: use role/goal/backstory as role-card structure, but do not adopt CrewAI as the runtime core.

5. OpenAI Agents SDK Docs
   - Sources:
     - https://platform.openai.com/docs/guides/agents-sdk/
     - https://openai.github.io/openai-agents-python/guardrails/
     - https://openai.github.io/openai-agents-python/running_agents/
   - Pattern: handoffs, guardrails, tracing, human-in-the-loop, and full run traces are first-class agent primitives.
   - Saga decision: Phase 2 uses typed handoff records, approval gates, trace events, and guardrail-style approval boundaries.

6. AutoGen and CAMEL
   - Sources:
     - https://github.com/microsoft/autogen
     - https://github.com/camel-ai/camel
   - Pattern: multi-agent collaboration and role-separated conversations.
   - Saga decision: agents communicate through ledger-backed structured handoffs instead of uncontrolled free-form group chat.

## Extracted Hybrid Pattern

Saga Phase 2 employees follow this contract:

```text
role + goal + backstory
  -> allowed tools
  -> memory read/write/forbidden policy
  -> output schema
  -> handoff rule
  -> approval boundary
  -> eval case ids
  -> common runAgent runtime
  -> ledger-backed task plan and trace
```

## Rejected Patterns

- Prompt-only employees.
- Shared uncontrolled memory.
- Framework-owned state as the product core.
- Agent-to-agent conversation without ledger handoff records.
- Autonomous external action without approval.
- Final price, outreach, contract, deployment, or security testing without owner approval.

## Phase 2 Acceptance

An active Phase 2 employee is accepted only if:

- it appears in the active roster,
- it has an `AgentDefinition`,
- `runAgent` can produce a deterministic artifact for the role,
- the artifact is written to the ledger,
- cost is recorded per agent,
- memory candidate is written per agent,
- handoff or review request is recorded,
- eval coverage includes the role or workflow.
