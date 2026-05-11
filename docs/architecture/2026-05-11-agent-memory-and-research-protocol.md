# Agent Memory and Research Protocol

Date: 2026-05-11

## Decision

Every Saga AI employee must have its own memory.

An employee is not complete when it has only a prompt. A complete employee has:

- role card
- skill list
- tool policy
- approval boundaries
- output schemas
- handoff rules
- eval cases
- prompt/persona version
- personal role memory
- project/customer memory access rules
- feedback and learning log

## Memory Model

Saga Agent Ops will use a hybrid memory model inspired by memory-first agent systems and the LLM OS / external knowledge-base approach.

The context window is temporary working memory. Durable memory lives outside the model and is loaded deliberately.

Memory layers:

1. Company memory: Saga standards, service packages, pricing rules, positioning, security rules.
2. Agent memory: each employee's role-specific lessons, preferences, recurring decisions, output patterns, and failure notes.
3. Project/customer memory: customer context, previous artifacts, approved decisions, tone, risks, constraints.
4. Task/run memory: short-term execution state, handoff messages, intermediate notes, blockers.
5. Artifact memory: approved proposals, reports, technical plans, security findings, source links.
6. Eval memory: accepted/rejected outputs, reviewer feedback, score changes, regression notes.

Initial storage:

- PostgreSQL for structured memory records.
- Markdown knowledge sources for human-readable durable company knowledge.
- pgvector later, when semantic retrieval is proven necessary.

Initial retrieval:

- deterministic context pack by tenant, project, task, role, and approval status
- source-filtered lookup
- recency and trust scoring
- no uncontrolled dumping of all memory into the prompt

## Per-Agent Memory Contract

Each AI employee gets:

- `agent_id`
- `agent_version`
- `memory_scope`
- `memory_read_policy`
- `memory_write_policy`
- `memory_retention_policy`
- `trusted_sources`
- `forbidden_memory`
- `context_pack_template`
- `feedback_to_memory_rule`

No agent can write permanent memory without a policy. Sensitive data, secrets, raw private messages, and unapproved customer material cannot become durable memory.

## GitHub Research Gate

Before implementing any new employee, the builder must research strong open-source examples and extract reusable patterns.

Required steps:

1. Search GitHub and official docs for current examples related to the employee's domain.
2. Review README, examples, license, security posture, issue health, and architecture style.
3. Extract patterns, not copy code blindly.
4. Create a small research note for that employee.
5. Build a hybrid role card for Saga's own runtime.
6. Define tools, handoff rules, memory policy, output schemas, and eval cases.
7. Implement only behind Saga's common runtime contract.
8. Add golden eval cases before expanding the employee's autonomy.

An employee is not accepted unless this gate is complete.

## Initial Reference Patterns

These are inspiration sources, not automatic dependencies.

| Source | Useful Pattern | Saga Decision |
|---|---|---|
| Mem0 | Universal memory layer, agent/user/run scoped memory, SDK/API options | Use as memory design reference; decide integration only after schema v0 works |
| Letta / MemGPT | Stateful agents with advanced memory and transparent state | Use as reference for long-lived employee identity and memory blocks |
| LangGraph Persistence | Checkpointed graph state across steps | Use as reference for state persistence; do not adopt before P0 vertical slice |
| CrewAI | Role and task configuration style | Use for role-card inspiration, not as main runtime |
| CAMEL | Multi-agent communication and scaling concepts | Use for inter-agent communication patterns |
| OpenAI Agents SDK | Handoffs, guardrails, sessions, tracing, human-in-the-loop | Use as design reference for typed handoffs and guardrails |
| AutoGen | Multi-agent collaboration history | Reference only; current repo status makes it unsuitable as the main base |

Primary references:

- Mem0 GitHub: https://github.com/mem0ai/mem0
- Letta GitHub: https://github.com/letta-ai/letta
- LangGraph persistence docs: https://docs.langchain.com/oss/python/langgraph/persistence
- CrewAI GitHub: https://github.com/crewAIInc/crewAI
- CAMEL GitHub: https://github.com/camel-ai/camel
- OpenAI Agents SDK GitHub: https://github.com/openai/openai-agents-python
- OpenAI Agents SDK docs: https://developers.openai.com/api/docs/guides/agents
- AutoGen GitHub: https://github.com/microsoft/autogen

## What We Will Not Do

- We will not create 30 prompt-only employees.
- We will not give agents uncontrolled shared memory.
- We will not let agents permanently remember unapproved sensitive data.
- We will not copy an open-source framework as the product core without proving it fits Saga's ledger, approval, trace, and security requirements.
- We will not add autonomous self-improvement without evals and approval gates.

## Build Rule

The first implementation must include memory schema placeholders even if only two workers run in Faz 1.

This keeps the product aligned with the real goal: a 30-employee AI company that can remember, improve, communicate, and operate under human governance.
