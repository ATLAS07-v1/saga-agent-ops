# 90 Day Roadmap

## Days 1-15: Internal Foundation

- Scaffold `apps/api`, `apps/web`, `packages/shared`, and `packages/agent-runtime`.
- Define agent registry schema.
- Define task ledger schema.
- Define PostgreSQL schema v0: tenants, agents, tasks, steps, approvals, artifacts, cost events, trace events, knowledge sources.
- Create first two LLM worker role cards: Researcher and Drafter.
- Create orchestration engine contract: state machine, routing, policy, retry, timeout, and resume.
- Create approval policy and action tiers.
- Define cost, trace, source, and artifact records.
- Add hard budget caps: task token cap, maximum steps, tenant daily cost cap.
- Add agent tool registry.
- Add knowledge base v0 with 5-10 Markdown sources.
- Build the first ledger-backed workflow: Lead -> Research -> Offer Draft -> Approval -> Weekly Report.

## Days 16-30: Internal Pilots

- Run 50 real or realistic internal tasks.
- Produce lead research and offer drafts.
- Track time, cost, revision rate, and approval status.
- Track rejection reasons and revision notes for prompt refinement.
- Select one CRM target for integration research.
- Keep CRM writes manual or read-only until approval, idempotency, and audit rules are proven.
- Show the working slice to 1-2 trusted external reviewers by day 30.

## Days 31-60: Commercial MVP

- Build CRM/pipeline revenue-ops flow.
- Add read-only CRM connector first.
- Add approval queue for CRM writes and outbound drafts.
- Create tourism/hotel and local services demo packages.

## Days 61-90: Paid Pilot Readiness

- Prepare Audit Sprint package.
- Prepare 30-day pilot SOW.
- Build customer-facing weekly report template.
- Run two external pilot conversations after owner approval.
- Convert validated pilot into managed AI workforce package.
