# Phase 2 Golden Eval Set

Date: 2026-05-11

Runtime eval file: `tools/phase2-eval.ts`

## Current Automated Cases

1. `phase2.active-roster-is-eight`
   - Active Phase 2 roster must contain exactly 8 employees.
   - Future employees cannot leak into Phase 2 active execution.

2. `phase2.agent-definitions-cover-new-workers`
   - Phase 2 workers must have role definitions, memory policies, and output schemas.

3. `phase2.lead-to-offer-v2-produces-multi-agent-artifacts`
   - The workflow must produce task plan, research, market intelligence, sales strategy, proposal draft, and cost control artifacts.
   - It must create a handoff chain and per-agent cost events.

4. `phase2.weekly-report-produces-report-artifact`
   - Weekly ops report workflow must create `weekly_ops_report` and `cost_control_report` artifacts.
   - It must request approval.

5. `phase2.product-scope-produces-scope-and-proposal`
   - Product scope workflow must create `product_scope_brief` and `proposal_draft`.
   - It must write agent memory candidates.

6. `phase2.ledger-persists-plan-derived-steps`
   - Ledger steps must be derived from the task plan.
   - Cost and memory records must be per-agent.

7. `phase2.cost-dashboard-aggregates-by-agent`
   - Cost dashboard must group by agent and preserve token counts.

8. `phase2.company-state-is-backed-by-ledger`
   - Company state must expose active employee count, workflows, events, and pending approvals from ledger data.

9. `phase2.approval-feedback-becomes-memory`
   - Rejection/revision feedback must create governed eval memory.

10. `phase2.summary-counts-artifacts-memory-and-cost`
   - Ledger summary must show artifacts, handoffs, and cost events for the Phase 2 workflow.

## Manual Review Prompts

Use these after running `POST /demo/phase-2/seed`:

- Does the UI show 8 active workers and 22 planned workers?
- Does a Lead v2 run show the CEO, Researcher, Market, Sales, Proposal, and Finance workers?
- Does weekly report produce an approval-ready artifact?
- Does rejecting an approval create eval memory?
- Does the cost dashboard show per-agent cost?
- Are external actions still gated?
