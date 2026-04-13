# Example: Full Multi-AI Workflow

> **Scenario:** Building a complete real-time notification system from scratch — from planning to PR — using all four AI tools in a coordinated workflow.

## The Workflow

```text
┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│ Copilot  │ ─► │  Claude  │ ─► │  Codex   │ ─► │  Claude  │ ─► │ Copilot  │
│  PLAN    │    │  DESIGN  │    │ IMPLEMENT│    │  REVIEW  │    │   SHIP   │
│          │    │          │    │          │    │          │    │          │
│ Plan Mode│    │ Architect│    │ Generate │    │ Security │    │ PR + CI  │
│ + Todos  │    │ 200K ctx │    │ GPT-5    │    │ Audit    │    │ GitHub   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘    └──────────┘
  Phase 1         Phase 2         Phase 3         Phase 4         Phase 5
```

## Phase 1: Planning (Copilot CLI — Plan Mode)

Copilot CLI enters Plan Mode to break down the feature request into actionable todos.

```text
You: "Build a real-time notification system that supports WebSocket push, 
      email digest, and in-app notifications. Use Plan Mode."

Copilot CLI creates plan.md and todos:
```

### Plan Output

```markdown
# Notification System Implementation Plan

## Approach
Build a modular notification system with three delivery channels (WebSocket, email, 
in-app) unified behind a common interface. Use an event-driven architecture with 
Redis Pub/Sub for real-time delivery.

## Components
1. Core notification service (event handling, routing)
2. WebSocket delivery channel (real-time push)
3. Email delivery channel (digest mode)
4. In-app delivery channel (database-backed)
5. User preference management
6. API endpoints for notification CRUD
```

### Todos Created

```sql
-- Copilot CLI creates structured todos:
INSERT INTO todos (id, title, description, status) VALUES
  ('notif-design', 'Design notification architecture', 
   'Create detailed architecture doc with data models, event flows, and API contracts', 'pending'),
  ('notif-core', 'Implement core notification service',
   'NotificationService class with routing logic and channel abstraction', 'pending'),
  ('notif-websocket', 'Implement WebSocket delivery channel',
   'WebSocket server with rooms, auth, and reconnection handling', 'pending'),
  ('notif-email', 'Implement email delivery channel',
   'Email digest service with templating and batching', 'pending'),
  ('notif-inapp', 'Implement in-app notification channel',
   'Database-backed notifications with read/unread status', 'pending'),
  ('notif-api', 'Create notification API endpoints',
   'REST endpoints for notification CRUD and preferences', 'pending'),
  ('notif-tests', 'Write comprehensive tests',
   'Unit and integration tests for all components', 'pending'),
  ('notif-review', 'Security and architecture review',
   'Multi-agent review of complete implementation', 'pending'),
  ('notif-ship', 'Create PR and ship',
   'Branch, commit, PR with full context', 'pending');
```

## Phase 2: Architecture Design (Claude Code)

Copilot CLI delegates the architecture design to Claude Code, which has the 200K context window needed to understand the full codebase.

```powershell
# Copilot CLI gathers codebase context
$existingCode = Get-ChildItem -Recurse src/ -Include *.ts | ForEach-Object {
    "=== $($_.FullName) ===`n$(Get-Content $_ -Raw)"
} | Out-String

# Delegate architecture design to Claude
$architecture = npx @anthropic-ai/claude-code --print @"
You are a senior architect designing a real-time notification system.

## Existing Codebase
$existingCode

## Requirements
- WebSocket push notifications (real-time)
- Email digest notifications (batched, configurable frequency)
- In-app notifications (stored in database, read/unread)
- User notification preferences (channels, frequency, muting)
- Event-driven architecture using Redis Pub/Sub
- Must integrate with existing Express app and Prisma ORM

## Deliverables
Output a detailed architecture document including:

1. **System Architecture Diagram** (ASCII)
2. **Data Models** (Prisma schema additions)
3. **Event Flow** (publisher → router → channels)
4. **API Contracts** (REST endpoints with request/response schemas)
5. **WebSocket Protocol** (connection, authentication, message format)
6. **Email Digest Logic** (batching algorithm, scheduling)
7. **File Structure** (new files to create with descriptions)
8. **Integration Points** (how this connects to existing code)

Be specific — include TypeScript interfaces, Prisma models, and Redis key patterns.
"@

$architecture | Out-File .workflow/02-architecture.md -Encoding utf8
Write-Host "✅ Phase 2 complete: Architecture designed by Claude Code"
```

### Claude's Architecture Output (Summary)

````markdown
# Notification System Architecture

## System Diagram
```text

                     ┌─────────────────────────────┐
                     │       Event Publishers       │
                     │  (any service can publish)    │
                     └──────────────┬──────────────┘
                                    │
                           Redis Pub/Sub
                                    │
                     ┌──────────────▼──────────────┐
                     │    NotificationRouter         │
                     │  (routes to delivery channels)│
                     └──┬───────────┬──────────┬───┘
                        │           │          │
              ┌─────────▼──┐ ┌─────▼─────┐ ┌──▼──────────┐
              │ WebSocket   │ │ Email     │ │ In-App      │
              │ Channel     │ │ Channel   │ │ Channel     │
              │ (immediate) │ │ (batched) │ │ (stored)    │
              └─────────────┘ └───────────┘ └─────────────┘

```

## Data Models (Prisma)
```prisma
model Notification {
  id          String   @id @default(cuid())
  userId      String
  type        String
  title       String
  body        String
  data        Json?
  channel     String[] // ["websocket", "email", "inapp"]
  read        Boolean  @default(false)
  readAt      DateTime?
  createdAt   DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])
}

model NotificationPreference {
  id             String  @id @default(cuid())
  userId         String  @unique
  emailEnabled   Boolean @default(true)
  emailDigest    String  @default("daily") // immediate, hourly, daily, weekly
  wsEnabled      Boolean @default(true)
  inAppEnabled   Boolean @default(true)
  mutedTypes     String[] @default([])
  user           User    @relation(fields: [userId], references: [id])
}
```

## File Structure

- src/services/notificationService.ts (core router)
- src/services/channels/websocketChannel.ts
- src/services/channels/emailChannel.ts
- src/services/channels/inAppChannel.ts
- src/routes/notifications.ts (REST API)
- src/ws/notificationServer.ts (WebSocket server)
- src/types/notification.ts (TypeScript types)
- src/jobs/emailDigest.ts (cron job)

````

## Phase 3: Implementation (Codex CLI)

Copilot CLI delegates implementation to Codex CLI, feeding it Claude's architecture document:

```powershell
# Read Claude's architecture
$arch = Get-Content .workflow/02-architecture.md -Raw

# Codex implements the full design in full-auto mode
codex --quiet --approval-mode full-auto @"
Implement the notification system based on this architecture document.

## Architecture
$arch

## Instructions
1. Create ALL files listed in the File Structure section
2. Follow the data models exactly as specified
3. Implement the event flow as designed
4. Use proper TypeScript types throughout
5. Include error handling for all failure modes
6. Follow the coding patterns in the existing codebase

Create complete, production-ready code for every file.
"@

Write-Host "✅ Phase 3 complete: Code implemented by Codex CLI"

# Verify compilation
npx tsc --noEmit
Write-Host "✅ TypeScript compilation passed"
```

### Codex Creates These Files

```text
src/
├── types/notification.ts              (TypeScript interfaces)
├── services/
│   ├── notificationService.ts         (Core router + event handling)
│   └── channels/
│       ├── websocketChannel.ts        (WebSocket push)
│       ├── emailChannel.ts            (Email digest)
│       └── inAppChannel.ts            (Database storage)
├── routes/notifications.ts            (REST API endpoints)
├── ws/notificationServer.ts           (WebSocket server)
└── jobs/emailDigest.ts                (Cron job for digests)
```

## Phase 4: Security Review (Claude Code)

Copilot CLI sends the implementation back to Claude for security review:

```powershell
# Gather all new files for review
$newFiles = @(
    "src/types/notification.ts",
    "src/services/notificationService.ts",
    "src/services/channels/websocketChannel.ts",
    "src/services/channels/emailChannel.ts",
    "src/services/channels/inAppChannel.ts",
    "src/routes/notifications.ts",
    "src/ws/notificationServer.ts",
    "src/jobs/emailDigest.ts"
) | ForEach-Object { 
    if (Test-Path $_) { "=== $_ ===`n$(Get-Content $_ -Raw)" }
} | Out-String

$securityReview = npx @anthropic-ai/claude-code --print @"
Perform a comprehensive security review of this notification system.

## Code
$newFiles

## Security Checklist
1. **Authentication**: Is WebSocket auth properly implemented? Token validation?
2. **Authorization**: Can users see others' notifications? Preference tampering?
3. **Input Validation**: Are all inputs validated? Any injection vectors?
4. **Rate Limiting**: Can a malicious user flood the notification system?
5. **Data Exposure**: Are sensitive fields leaked in API responses?
6. **WebSocket Security**: Origin validation? Connection limits? Message size limits?
7. **Email Security**: Template injection? Header injection? Unsubscribe?
8. **Redis Security**: Key collision? Pub/Sub channel hijacking?

## Output Format
{
  "overallRisk": "low|medium|high|critical",
  "approved": true/false,
  "findings": [
    {
      "severity": "critical|high|medium|low",
      "category": "auth|authz|injection|exposure|dos|config",
      "file": "path",
      "line": "~line number",
      "issue": "description",
      "fix": "how to fix",
      "cwe": "CWE-XXX if applicable"
    }
  ],
  "strengths": ["what's done well"],
  "summary": "overall assessment"
}
"@

$securityReview | Out-File .workflow/04-security-review.json -Encoding utf8

# Check results
$review = $securityReview | ConvertFrom-Json

if ($review.approved) {
    Write-Host "✅ Phase 4 complete: Security review PASSED (risk: $($review.overallRisk))"
} else {
    Write-Host "❌ Phase 4: Security issues found — sending fixes to Codex"
    
    # Feed security findings back to Codex for fixes
    $findings = $review.findings | ConvertTo-Json
    codex --quiet --approval-mode auto-edit `
      "Fix these security issues in the notification system: $findings"
    
    Write-Host "✅ Security fixes applied by Codex"
}
```

### Example Security Findings

```json
{
  "overallRisk": "medium",
  "approved": false,
  "findings": [
    {
      "severity": "high",
      "category": "auth",
      "file": "src/ws/notificationServer.ts",
      "line": "~23",
      "issue": "WebSocket connection accepts token from query string, which gets logged in server access logs",
      "fix": "Move token to first WebSocket message or use Sec-WebSocket-Protocol header",
      "cwe": "CWE-598"
    },
    {
      "severity": "medium",
      "category": "dos",
      "file": "src/routes/notifications.ts",
      "line": "~45",
      "issue": "No rate limiting on POST /notifications endpoint",
      "fix": "Add rate limiting middleware: max 100 notifications per user per minute",
      "cwe": "CWE-770"
    }
  ],
  "strengths": [
    "Proper input validation with Zod on all endpoints",
    "User can only access own notifications (userId from JWT)",
    "Email templates properly escaped"
  ]
}
```

## Phase 5: Ship (Copilot CLI)

Copilot CLI creates the branch, commits, runs CI, and opens a PR:

```powershell
# Generate tests first
codex --quiet --approval-mode full-auto `
  "Generate comprehensive Jest tests for the notification system. 
   Cover: notificationService, all channels, routes, WebSocket server.
   Mock Redis and Prisma. Include edge cases."

# Verify everything passes
npm run build && npm test

# Create branch and commit
git checkout -b feat/notification-system

git add src/types/notification.ts `
       src/services/notificationService.ts `
       src/services/channels/ `
       src/routes/notifications.ts `
       src/ws/notificationServer.ts `
       src/jobs/emailDigest.ts `
       tests/

git commit -m "feat: add real-time notification system

Implements a complete notification system with three delivery channels:
- WebSocket push notifications (real-time)
- Email digest notifications (configurable batching)
- In-app notifications (database-backed, read/unread)

Architecture:
- Event-driven with Redis Pub/Sub
- Channel abstraction for extensibility
- User preference management
- Comprehensive security review passed

Multi-AI Workflow:
- Architecture: Claude Code (200K context analysis)
- Implementation: Codex CLI (GPT-5 generation)
- Security Review: Claude Code (vulnerability audit)
- Shipping: Copilot CLI (PR management)

Co-authored-by: Codex <codex@openai.com>
Co-authored-by: Copilot <223556219+Copilot@users.noreply.github.com>"

# Create PR with full context
$archDoc = Get-Content .workflow/02-architecture.md -Raw | Select-Object -First 50
$secReview = Get-Content .workflow/04-security-review.json -Raw

gh pr create `
  --title "feat: real-time notification system (WebSocket + Email + In-App)" `
  --body @"
## 🔔 Real-Time Notification System

### Overview
Complete notification system with three delivery channels, built using multi-AI orchestration.

### Features
- **WebSocket Push** — Real-time notifications via persistent connections
- **Email Digest** — Batched email notifications (immediate/hourly/daily/weekly)
- **In-App** — Database-backed notifications with read/unread tracking
- **User Preferences** — Per-channel configuration and type muting
- **Event-Driven** — Redis Pub/Sub for decoupled event routing

### Architecture
<details>
<summary>Click to expand architecture document</summary>

$archDoc
...

</details>

### Security Review
<details>
<summary>Click to expand security review</summary>

\`\`\`json
$secReview
\`\`\`

</details>

### Multi-AI Workflow
| Phase | Agent | Task | Status |
|-------|-------|------|:------:|
| 1. Plan | Copilot CLI | Created todos and plan | ✅ |
| 2. Design | Claude Code | Architecture document | ✅ |
| 3. Implement | Codex CLI | Generated all code | ✅ |
| 4. Review | Claude Code | Security audit | ✅ |
| 5. Ship | Copilot CLI | This PR | ✅ |

### Files Changed
- \`src/types/notification.ts\` — TypeScript interfaces
- \`src/services/notificationService.ts\` — Core notification router
- \`src/services/channels/\` — WebSocket, Email, In-App channels
- \`src/routes/notifications.ts\` — REST API endpoints
- \`src/ws/notificationServer.ts\` — WebSocket server
- \`src/jobs/emailDigest.ts\` — Email digest cron job
- \`tests/\` — Comprehensive test suite
"@

Write-Host "✅ Phase 5 complete: PR created!"
Write-Host ""
Write-Host "📊 Workflow Summary:"
Write-Host "   Phases completed: 5/5"
Write-Host "   AI agents used: 3 (Copilot, Claude, Codex)"
Write-Host "   Files created: 8 source + tests"
Write-Host "   Security issues fixed: 2"
Write-Host "   Total time: ~12 minutes"
```

## Timeline Summary

| Phase | Agent | Duration | Output |
|-------|-------|:--------:|--------|
| 1. Plan | Copilot CLI | ~2 min | Plan + 9 todos |
| 2. Design | Claude Code | ~90 sec | Architecture doc |
| 3. Implement | Codex CLI | ~2 min | 8 source files |
| 4. Review | Claude Code | ~90 sec | Security audit |
| 5. Ship | Copilot CLI | ~3 min | Tests + PR |
| **Total** | **Multi-AI** | **~12 min** | **Complete feature** |

Estimated manual implementation time: **8-16 hours** (1-2 developer days).

## Key Principles Demonstrated

1. **Right tool for the right job** — Each AI tool handles what it's best at
2. **Copilot as the hub** — Plans, coordinates, and ships through GitHub
3. **Claude for depth** — Architecture design and security review
4. **Codex for speed** — Rapid implementation of well-defined specs
5. **Iterative refinement** — Security issues caught and fixed before shipping
6. **Full audit trail** — Every phase produces artifacts for the PR

## See Also

- [Orchestration Overview](../README.md) — All orchestration patterns
- [Architecture Review Example](architecture-review.md) — Deep dive into Phase 2
- [Fast Implementation Example](fast-implementation.md) — Deep dive into Phase 3
- [Agent Review Chain](../skills/agent-review-chain.md) — The review pipeline skill
- [Agent Council Pattern](../patterns/agent-council.md) — Alternative: parallel agents
