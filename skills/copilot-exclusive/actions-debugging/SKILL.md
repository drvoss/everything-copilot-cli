---
name: actions-debugging
license: MIT
description: Use when a GitHub Actions workflow fails — diagnose the run log, identify the root cause, and apply a targeted fix
metadata:
  category: copilot-exclusive
  copilot_feature: "Built-in GitHub MCP server (actions_list, actions_get, get_job_logs)"
---

# GitHub Actions Debugging

## Why This is Copilot-Exclusive

GitHub access is built into Copilot CLI with no extra setup: the built-in GitHub MCP server (full
tool set when `gh` is absent, or when restored with the flags in the note below) or `gh`, which
the model is expected to use when it is installed. Either way you can list workflows, inspect run details, download job logs,
and analyze failures in one conversation.
What is exclusive is the built-in GitHub MCP server, which needs no token or extension setup; when `gh` is installed, the model mostly uses `gh`, which any agent with a shell can also run.

> **Note:** When `gh` is on PATH, Copilot CLI omits the Actions MCP tools (`actions_list`, `actions_get`, `get_job_logs`) and the model is expected to use `gh` instead,
> e.g. `gh run list --workflow <file>`, `gh run view <run-id> --log-failed`, `gh run view --job <job-id> --log`. To call the MCP tools,
> start the session with `--add-github-mcp-tool=<name>` for every GitHub MCP tool you need (it replaces the default set, so include default ones you still use), or `--enable-all-github-mcp-tools`, which also enables write tools.

## When to Use

- A CI pipeline fails and you need to understand why — fast
- Investigating flaky tests across multiple workflow runs
- Auditing workflow run times and usage patterns
- Debugging deployment pipeline failures in staging/production
- Comparing successful vs failed runs to find regressions

## Workflow

### 1. List Workflows in a Repository

With `gh` on PATH (default), e.g. `gh workflow list --repo my-org/my-app`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-actions_list
  method: "list_workflows"
  owner: "my-org"
  repo: "my-app"
```

### 2. List Recent Runs for a Workflow

With `gh` on PATH (default), e.g. `gh run list --repo my-org/my-app --workflow ci.yml --branch main --status completed`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-actions_list
  method: "list_workflow_runs"
  owner: "my-org"
  repo: "my-app"
  resource_id: "ci.yml"
  workflow_runs_filter: { "status": "completed", "branch": "main" }
```

### 3. Get Failed Job Logs

This is the killer feature — pull logs directly for analysis.
With `gh` on PATH (default), e.g. `gh run view 12345678 --repo my-org/my-app --log-failed`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-get_job_logs
  owner: "my-org"
  repo: "my-app"
  run_id: 12345678
  failed_only: true
  return_content: true
  tail_lines: 200
```

### 4. Inspect a Specific Job

With `gh` on PATH (default), e.g. `gh run view --job 98765432 --repo my-org/my-app`. When the MCP tools are exposed:

```text
Tool: github-mcp-server-actions_get
  method: "get_workflow_job"
  owner: "my-org"
  repo: "my-app"
  resource_id: "98765432"
```

### 5. Check Run Usage and Timing

With `gh` on PATH (default), e.g. `gh api repos/my-org/my-app/actions/runs/12345678/timing`. When the MCP tools are exposed:

```text
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

1. `gh run list --branch feature/auth-refactor` (when exposed: `list_workflow_runs` filtered by that branch)
2. Takes the most recent failed run
3. `gh run view <run-id>` to find which job(s) failed (when exposed: `list_workflow_jobs`)
4. `gh run view <run-id> --log-failed` to pull the error output (when exposed: `get_job_logs` with `failed_only: true`)
5. Analyzes the logs, identifies the root cause, suggests a fix

All in one conversational turn — no browser tabs needed.

### Flaky Test Investigation

> "The 'integration-tests' workflow has been flaky on main this week.
> Show me the failure pattern."

With `gh` on PATH (default), e.g. `gh run list --repo my-org/my-app --workflow integration-tests.yml --branch main --limit 20`. When the MCP tools are exposed:

```text
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
> longer than 15 minutes."

Copilot lists runs, checks usage/timing for each, and highlights anomalies.

### Fix and Verify Loop

1. Copilot reads the failure logs
2. Identifies the broken test or build step
3. Makes the fix in your local codebase
4. You push the fix
5. Copilot monitors the new run via `gh run list` / `gh run watch <run-id>` (when exposed: `list_workflow_runs`)
6. Confirms the fix worked or continues debugging

## Tips

- **Use `failed_only: true`** (with `gh`: `--log-failed`): Skip successful job logs and go straight to the
  failures. Saves context window space.
- **Tail the logs** (MCP only): Use `tail_lines: 100-300` to focus on the end of the log
  where errors typically appear. With `gh`, `gh run view <run-id> --log-failed` already limits
  output to the failed steps.
- **Parallel job analysis**: When a run has multiple failed jobs, call
  `get_job_logs` (with `gh`: `gh run view --job <job-id> --log`) on each in parallel.
- **Compare runs**: Pull logs from both a passing and failing run to diff them
  and isolate what changed.
- **Combine with PR tools**: After fixing a CI failure, use `pull_request_read`
  with `get_check_runs` (with `gh`: `gh pr checks <n>`) to verify the fix passes on the PR.
- **Track flaky tests in SQL**: Store failure patterns in the session database
  to build a flakiness report over time.
