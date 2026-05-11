# External Agent Consensus

Date: 2026-05-11

Sources: Grok Agents, Kimi Agents, Sonnet Agents, Bonus Agents, Opus v2 evaluation.

## Consensus

All reviewers agree: start building.

The plan is strategically sound if the first build focuses on a working governed operations runtime instead of a large agent roster or impressive org chart demo.

## Decisions Accepted

- Keep the phased plan.
- Start with a small working slice.
- Make task ledger, approval queue, source/cost/trace tracking P0.
- Do not start with the full employee roster.
- Do not make org chart UI a P0 feature.
- Do not allow autonomous external actions.
- Use TypeScript monorepo and PostgreSQL.
- Treat the employee organization as a target organization, not initial implementation.

## Plan Changes From Feedback

1. Orchestrator is not a P0 LLM agent.
   It is engine code: state machine, routing, policy, retry, timeout, and resume.

2. P0 workers are two LLM roles:
   - Lead Researcher
   - Offer Drafter

3. Add missing P0 primitives:
   - state machine
   - retry and timeout policy
   - provider abstraction
   - prompt versioning
   - tool/capability registry
   - hard budget caps
   - failure handling
   - replayable trace/artifact chain
   - minimum eval set

4. Keep stack pragmatic:
   - pnpm + Turborepo
   - Next.js App Router
   - Hono API
   - PostgreSQL + Drizzle
   - custom runtime contract
   - DB-backed state machine first
   - BullMQ if async/parallel execution pressure appears

5. Build one vertical slice first:

```text
Company URL
  -> engine creates task/run/steps
  -> Researcher creates sourced research artifact
  -> Drafter creates proposal artifact
  -> approval inbox
  -> approve/reject/revise/block
  -> source/cost/trace/prompt version/artifact version visible
```

## Risks Repeated By Multiple Reviewers

- Documentation without code.
- Agent fantasy: mistaking role names for product value.
- Reliability failure: loops, hallucination, timeout, provider/tool failure.
- Eval being treated as optional.
- Org chart UI becoming a distraction.
- Knowledge/memory quality being too weak for useful proposals.
- Workflow state and retry being underspecified.

## Final Verdict

Start now.

This is the final planning pass. The next work should be implementation of the first vertical slice.
