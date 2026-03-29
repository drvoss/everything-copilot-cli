# Multi-AI Handoff Protocol

> A standardized way to pass work from one AI agent to another while preserving context,
> intent, and progress state. Use when a task requires capabilities that span multiple AI tools.

## When to Use

- A task started in Copilot CLI needs Claude Code's 200K token context
- Codex has generated code that needs Copilot CLI's GitHub integration to ship
- Gemini has analyzed a diagram/image and the result needs implementation in Copilot
- You want a structured record of what each AI did and decided

## Handoff Envelope Format

Every handoff uses a standard JSON envelope:

```json
{
  "handoff_version": "1.0",
  "from": "copilot-cli",
  "to": "claude-code",
  "task": {
    "original_intent": "Refactor the auth module for testability",
    "status": "partial",
    "completed_steps": [
      "Read all files in src/auth/",
      "Identified 3 classes with direct database calls",
      "Created implementation plan"
    ],
    "next_step": "Extract database calls into IAuthRepository interface",
    "constraints": [
      "Do not change public API signatures",
      "All existing tests must continue to pass",
      "Use constructor injection only"
    ]
  },
  "context": {
    "relevant_files": ["src/auth/AuthService.ts", "src/auth/SessionManager.ts"],
    "key_decisions": [
      "Use Repository pattern, not Active Record",
      "Keep AuthService stateless"
    ],
    "blockers": []
  },
  "return_to": "copilot-cli",
  "return_action": "Create PR with the refactored auth module"
}
```

## PowerShell Handoff Implementation

### Copilot CLI → Claude Code

```powershell
# 1. Prepare context in Copilot CLI
$plan = @"
Refactor src/auth/ for testability:
- Extract IAuthRepository interface
- Inject via constructor
- Keep public API intact
- All tests must pass
"@

$context = Get-ChildItem src/auth/ -Filter "*.ts" |
    ForEach-Object { "=== $($_.Name) ===`n$(Get-Content $_.FullName -Raw)" } |
    Out-String

# 2. Build handoff envelope
$handoff = @{
    from = "copilot-cli"
    to = "claude-code"
    task = $plan
    context = $context
    return_to = "copilot-cli"
    return_action = "Review result and create PR"
} | ConvertTo-Json -Depth 3

# 3. Save handoff state
$handoff | Set-Content ".handoff/auth-refactor.json"

# 4. Invoke Claude Code with handoff
$prompt = @"
You are receiving a handoff from Copilot CLI.

TASK: $plan

CONTEXT (existing files):
$context

Complete the task. Output:
1. Each modified file with === FILE: path === header
2. A summary of what you changed and why
"@

$result = npx @anthropic-ai/claude-code --print $prompt

# 5. Save result for return handoff
$result | Set-Content ".handoff/auth-refactor-result.txt"
Write-Host "✅ Claude Code handoff complete. Result in .handoff/auth-refactor-result.txt"
```

### Claude Code → Copilot CLI (Return Handoff)

After Claude Code completes, Copilot CLI picks up the result:

```powershell
# Read Claude Code's output
$claudeResult = Get-Content ".handoff/auth-refactor-result.txt" -Raw

# Apply files from Claude Code output
# Claude uses === FILE: path === headers
$files = $claudeResult -split '=== FILE: ([^\s]+) ===' |
    Where-Object { $_ -match '\S' }

# Create branch, commit, and open PR via Copilot CLI
git checkout -b refactor/auth-testability

# Let Copilot CLI synthesize the PR
$prPrompt = @"
Claude Code refactored src/auth/ for testability. Here is the result:

$claudeResult

Apply these changes, run the tests to verify they pass, then create a PR:
- Title: 'refactor(auth): extract IAuthRepository for testability'
- Description: summarize the changes made by Claude Code
- Link to the original issue if one exists
"@

# Copilot handles the GitHub integration natively
```

### Codex → Copilot CLI

After Codex generates implementation:

```powershell
# Codex generates the implementation
$spec = Get-Content "specs/api-contract.json" -Raw
$implementation = codex --quiet @"
Implement this API contract. Output each file with === FILE: path === headers.

$spec
"@

# Copilot CLI reviews, tests, and ships
$reviewAndShip = @"
Codex generated the following implementation for the API contract.
Review it, run the test suite, fix any issues, then create a PR.

Implementation:
$implementation
"@

# Copilot handles: review → test → fix → commit → PR
```

## Handoff State Tracking

Track handoffs in the session SQL database:

```sql
CREATE TABLE IF NOT EXISTS handoffs (
    id TEXT PRIMARY KEY,
    from_agent TEXT NOT NULL,
    to_agent TEXT NOT NULL,
    task TEXT NOT NULL,
    status TEXT DEFAULT 'pending',  -- pending | in_progress | returned | done
    result_path TEXT,
    created_at TEXT DEFAULT (datetime('now'))
);

-- Log a new handoff
INSERT INTO handoffs (id, from_agent, to_agent, task)
VALUES ('auth-refactor', 'copilot-cli', 'claude-code', 'Refactor auth module for testability');

-- Update when result arrives
UPDATE handoffs SET status = 'returned', result_path = '.handoff/auth-refactor-result.txt'
WHERE id = 'auth-refactor';
```

## Choosing Which AI to Delegate To

| Capability Needed | Delegate To | Why |
|-------------------|-------------|-----|
| 200K context (full codebase) | Claude Code | Largest context window |
| Fast code generation / boilerplate | Codex CLI | GPT-5 speed, full-auto mode |
| Image/diagram analysis | Gemini CLI | Multimodal input |
| Performance profiling | Gemini CLI | Strong analytical reasoning |
| GitHub PR / Issue / Actions | Stay in Copilot CLI | Native integration |
| Multi-model comparison | Fan-out pattern | Run all, compare results |

## Tips

- **Always save handoff state** — write to `.handoff/` before delegating. If the delegate fails, you have the context to retry.
- **Include constraints explicitly** — "Do not change public API signatures" prevents breaking changes during delegation.
- **Return via Copilot CLI** — even if Claude Code generates code, route the final PR creation through Copilot CLI for GitHub-native integration.
- **Clean up `.handoff/`** — add to `.gitignore`; these are session artifacts, not source code.

## See Also

- [Pattern: Pipeline](../patterns/pipeline.md) — Sequential AI chaining
- [Pattern: Fan-Out Parallel](../patterns/fan-out-parallel.md) — Parallel delegation
- [Pattern: Agent Council](../patterns/agent-council.md) — Multi-AI consensus
- [Skill: delegate-to-claude](delegate-to-claude.md) — Claude Code delegation wrapper
- [Skill: delegate-to-codex](delegate-to-codex.md) — Codex CLI delegation wrapper
