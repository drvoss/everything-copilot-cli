---
name: actions-debugging
description: Debug GitHub Actions workflow failures using Copilot's built-in CI/CD tools
category: copilot-exclusive
copilot_feature: Built-in GitHub MCP server (actions_list, actions_get, get_job_logs)
---

# GitHub Actions Debugging

## Why This is Copilot-Exclusive

Copilot CLI provides **structured access to GitHub Actions** through its built-in MCP server.
You can list workflows, inspect run details, download job logs, and analyze failures — all via
typed tool calls that return structured data. Claude Code has no GitHub Actions integration
whatsoever; debugging CI requires manually navigating the GitHub web UI or parsing raw
`gh run view` output.

## When to Use

- A CI pipeline fails and you need to understand why — fast
- Investigating flaky tests across multiple workflow runs
- Auditing workflow run times and usage patterns
- Debugging deployment pipeline failures in staging/production
- Comparing successful vs failed runs to find regressions

## Workflow

### 1. List Workflows in a Repository

```
Tool: github-mcp-server-actions_list
  method: "list_workflows"
  owner: "my-org"
  repo: "my-app"
```

### 2. List Recent Runs for a Workflow

```
Tool: github-mcp-server-actions_list
  method: "list_workflow_runs"
  owner: "my-org"
  repo: "my-app"
  resource_id: "ci.yml"
  workflow_runs_filter: { "status": "completed", "branch": "main" }
```

### 3. Get Failed Job Logs

This is the killer feature — pull logs directly for analysis:

```
Tool: github-mcp-server-get_job_logs
  owner: "my-org"
  repo: "my-app"
  run_id: 12345678
  failed_only: true
  return_content: true
  tail_lines: 200
```

### 4. Inspect a Specific Job

```
Tool: github-mcp-server-actions_get
  method: "get_workflow_job"
  owner: "my-org"
  repo: "my-app"
  resource_id: "98765432"
```

### 5. Check Run Usage and Timing

```
Tool: github-mcp-server-actions_get
  method: "get_workflow_run_usage"
  owner: "my-org"
  repo: "my-app"
  resource_id: "12345678"
```

## Examples

### "Why Did My CI Fail?"

> "My latest push to feature/auth-refactor failed CI. Show me what went wrong."

Copilot workflow:
1. `list_workflow_runs` filtered by branch `feature/auth-refactor`
2. Takes the most recent failed run
3. `list_workflow_jobs` to find which job(s) failed
4. `get_job_logs` with `failed_only: true` to pull the error output
5. Analyzes the logs, identifies the root cause, suggests a fix

All in one conversational turn — no browser tabs needed.

### Flaky Test Investigation

> "The 'integration-tests' workflow has been flaky on main this week.
>  Show me the failure pattern."

```
Tool: github-mcp-server-actions_list
  method: "list_workflow_runs"
  owner: "my-org"
  repo: "my-app"
  resource_id: "integration-tests.yml"
  workflow_runs_filter: { "branch": "main" }
  per_page: 20
```

Copilot lists the last 20 runs, identifies which failed, pulls logs for each
failure, and looks for common error patterns (e.g., timeout, race condition,
external service unavailability).

### Deployment Pipeline Audit

> "Show me all production deployment runs this month and flag any that took
>  longer than 15 minutes."

Copilot lists runs, checks usage/timing for each, and highlights anomalies.

### Fix and Verify Loop

1. Copilot reads the failure logs
2. Identifies the broken test or build step
3. Makes the fix in your local codebase
4. You push the fix
5. Copilot monitors the new run via `list_workflow_runs`
6. Confirms the fix worked or continues debugging

## Tips

- **Use `failed_only: true`**: Skip successful job logs and go straight to the
  failures. Saves context window space.
- **Tail the logs**: Use `tail_lines: 100-300` to focus on the end of the log
  where errors typically appear.
- **Parallel job analysis**: When a run has multiple failed jobs, call
  `get_job_logs` on each in parallel.
- **Compare runs**: Pull logs from both a passing and failing run to diff them
  and isolate what changed.
- **Combine with PR tools**: After fixing a CI failure, use `pull_request_read`
  with `get_check_runs` to verify the fix passes on the PR.
- **Track flaky tests in SQL**: Store failure patterns in the session database
  to build a flakiness report over time.
