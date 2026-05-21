---
name: gha-security-review
description: >
  Use when reviewing GitHub Actions workflows for exploitable vulnerabilities — finds
  pwn-request patterns, expression injection, credential escalation, config poisoning,
  and supply chain risks, and reports only HIGH and MEDIUM confidence findings with
  concrete attack paths.
metadata:
  category: security
  agent_type: general-purpose
  origin: adapted from sickn33/antigravity-awesome-skills gha-security-review (MIT)
---

# GHA Security Review

Review GitHub Actions workflows like an attacker would. Only report issues that can be
reached from a realistic external trigger.

## When to Use

- Reviewing `.github/workflows/*.yml` changes before merge
- Auditing a repository that runs PR, issue comment, or reusable workflow automation
- Checking whether workflow files expose secrets, write tokens, or command execution
- Investigating CI/CD compromise paths involving fork PRs or untrusted workflow inputs

## When NOT to Use

| Instead of gha-security-review | Use |
|--------------------------------|-----|
| Broad application security review | `security-scan` |
| General repository trust scorecard | `evaluate-repository` |
| Threat modeling a system architecture | `threat-model-analyst` |

## Threat Model

Assume an attacker **does not** have repository write access.

They **can**:

- open pull requests from forks
- create issues
- comment on issues or PRs
- control PR titles, branch names, commit content in forked code, and comment bodies

They **cannot**:

- push to protected branches
- trigger `workflow_dispatch` manually
- modify repository secrets directly

If exploitation requires write access, do not report it as an in-scope finding.

## Workflow

### 1. Map the workflow attack surface

Review:

- `.github/workflows/*.yml`
- `action.yml` or `action.yaml`
- local reusable actions under `.github/actions/`
- config or scripts loaded by workflows such as `AGENTS.md`, `CLAUDE.md`, `Makefile`, and shell scripts

Start by listing relevant files:

```powershell
git ls-files ".github/workflows/*" ".github/actions/*" "action.yml" "action.yaml" "Makefile" "AGENTS.md" "CLAUDE.md"
```

### 2. Classify triggers first

For each workflow, identify which external triggers matter:

- `pull_request_target`
- `pull_request`
- `issue_comment`
- `workflow_call`
- `push`
- `schedule`
- `workflow_dispatch`

Only continue down exploit paths that fit the threat model above.

### 3. Check the high-signal vulnerability classes

#### 3-A. Pwn Request

Look for `pull_request_target` combined with checkout or execution of fork-controlled code.

```powershell
git --no-pager grep -n "pull_request_target|actions/checkout|github.event.pull_request.head" -- ".github/workflows/*.yml"
```

Report when all three are true:

1. external fork PR can trigger the workflow
2. the workflow checks out fork content or local actions from that content
3. a `run:` step or action executes attacker-controlled code

#### 3-B. Expression Injection

Look for attacker-controlled `${{ ... }}` expressions inside `run:` blocks.

```powershell
git --no-pager grep -n "\${{.*}}" -- ".github/workflows/*.yml"
```

Safe patterns to **not** report:

- numeric-only values like PR numbers
- `${{ }}` in `if:` conditions
- `${{ }}` in `with:` inputs
- `${{ secrets.* }}` by itself

#### 3-C. Unauthorized Command Execution

Review `issue_comment` workflows that parse slash commands or bot commands.

Check:

- whether `author_association` is validated
- whether any GitHub user can trigger the command
- whether the command body or arguments land in a `run:` block unsafely

#### 3-D. Credential Escalation

Look for elevated credentials exposed to untrusted execution contexts:

- PATs
- deploy keys
- repo write tokens
- secrets passed into fork-reachable jobs

#### 3-E. Config Poisoning

Flag workflows that load attacker-controlled config from PR code:

- `AGENTS.md`
- `CLAUDE.md`
- `.cursorrules`
- `Makefile`
- shell scripts or helper config checked out from the PR

#### 3-F. Supply Chain and Permissions

Check for:

- unpinned third-party actions
- broad `permissions:` blocks
- self-hosted runner exposure
- unsafe cache or artifact reuse

### 4. Validate each finding before reporting

Every HIGH-confidence report should include:

1. **Entry point** - how the external attacker triggers it
2. **Payload** - what the attacker controls
3. **Execution mechanism** - where the payload becomes code or a privileged action
4. **Impact** - what the attacker gains
5. **PoC sketch** - a concise attack path

If any link in that chain is weak, downgrade to MEDIUM or drop the finding.

### 5. Report only what survives the threat model

Use this structure:

```markdown
## GHA Security Review

### HIGH
- **Pwn request** in `.github/workflows/release.yml`
  - Entry point: fork PR triggers `pull_request_target`
  - Payload: attacker modifies local action in PR branch
  - Execution: workflow checks out PR head and runs local action
  - Impact: repository write token theft
  - PoC sketch: ...

### MEDIUM
- **Expression injection** in `.github/workflows/comment.yml`
  - Needs verification: attacker-controlled comment body appears in `run:`

### No finding
- Workflow uses `pull_request` only and actions are pinned to full SHA
```

## Confidence Rules

| Confidence | Meaning | Action |
|------------|---------|--------|
| HIGH | Full attack path confirmed | Report with all five elements |
| MEDIUM | Meaningful path but one link still needs proof | Report as needs verification |
| LOW | Theoretical, mitigated, or outside the threat model | Do not report |

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "It only runs in CI, not production." | CI often holds the credentials that production trusts. |
| "The workflow uses `pull_request_target`, but that's normal." | It is only safe when fork-controlled code never becomes executable. |
| "Expressions are everywhere in Actions YAML." | Expressions are dangerous specifically when attacker-controlled data reaches `run:` shell context. |

## Red Flags

- `pull_request_target` plus fork checkout
- attacker-controlled `${{ }}` inside `run:`
- issue comment commands with no authorization check
- long-lived secrets reachable from untrusted code paths
- third-party actions pinned by tag instead of full SHA
- PR-controlled config files used as workflow instructions

## Verification

- [ ] The workflow trigger and trust boundary were confirmed from actual YAML
- [ ] Every finding fits the "external attacker without write access" model
- [ ] HIGH findings include entry point, payload, execution mechanism, impact, and PoC sketch
- [ ] Safe patterns were filtered out instead of over-reported

## See Also

- [`agent-owasp-check`](../agent-owasp-check/SKILL.md) - audit broader agent trust-boundary and tool-governance risks
- [`agent-supply-chain`](../agent-supply-chain/SKILL.md) - verify integrity and pinning for build or plugin artifacts
- [`pr-security-review`](../pr-security-review/SKILL.md) - review application-code diffs for classic security issues
