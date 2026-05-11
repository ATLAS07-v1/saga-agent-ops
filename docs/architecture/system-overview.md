# System Overview

## Core Plan

Saga Agent Ops has three layers:

1. Control plane: users, tenants, agents, tasks, approvals, artifacts, costs, traces.
2. Execution plane: agent runtime, workflow execution, tool gateway, sandboxed workers.
3. Knowledge plane: project memory, customer context, sourced documents, retrieval logs.

## Main Objects

- Organization
- Workspace
- User
- Agent template
- Agent version
- Agent instance
- Capability
- Tool
- Tool grant
- Task
- Task run
- Task step
- Approval
- Artifact
- Memory
- Knowledge source
- Cost event
- Trace event
- Eval case

## First Runtime Rule

No irreversible or external action runs automatically. The MVP may draft and recommend, but human approval is required for sending, publishing, spending, deleting, deploying, or changing CRM data.

