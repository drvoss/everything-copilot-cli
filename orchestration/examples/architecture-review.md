# Example: Architecture Review with Claude Code

> **Scenario:** Your team is evaluating whether a monolithic Express API should be decomposed into microservices. You use Copilot CLI to orchestrate Claude Code for deep architectural analysis.

## The Setup

You have a monolithic Node.js API at `src/` with:

- 15 route files
- 8 service files
- 5 database models
- Shared middleware, utilities, and config

You want Claude Code to analyze the full codebase (which fits in its 200K context window) and produce actionable recommendations.

## Step 1: Gather Context (Copilot CLI)

First, Copilot CLI maps the codebase structure:

```powershell
# Copilot CLI maps the project
Get-ChildItem -Recurse src/ -Include *.ts | Select-Object FullName, Length | Format-Table

# Output:
# src/routes/users.ts          (2.4KB)
# src/routes/products.ts       (3.1KB)
# src/routes/orders.ts         (4.2KB)
# src/routes/payments.ts       (5.8KB)
# src/services/userService.ts  (3.6KB)
# src/services/orderService.ts (6.1KB)
# ... (28 files, ~95KB total)
```

Total codebase: ~95KB — well within Claude's 200K context window.

## Step 2: Delegate Architecture Analysis (Claude Code)

Copilot CLI delegates the deep analysis to Claude Code:

```powershell
# Prepare the prompt with full codebase context
$codebase = Get-ChildItem -Recurse src/ -Include *.ts | ForEach-Object {
    "=== FILE: $($_.FullName) ===`n$(Get-Content $_ -Raw)`n"
} | Out-String

$prompt = @"
You are a senior software architect. Analyze this complete codebase and evaluate 
whether it should be decomposed into microservices.

## Codebase
$codebase

## Analysis Requirements

1. **Service Boundaries**: Identify natural service boundaries based on domain concepts, 
   data ownership, and coupling patterns. Create a table of proposed services.

2. **Coupling Analysis**: Rate coupling between components (1-10). Identify tightly coupled 
   pairs that would be difficult to separate.

3. **Data Ownership**: Map which database tables/models belong to which proposed service. 
   Flag shared tables that would need resolution.

4. **Migration Risk Assessment**: For each proposed service boundary, rate the migration 
   risk (low/medium/high) and estimate effort.

5. **Recommendation**: Should this project move to microservices? Consider team size, 
   deployment frequency, and scaling needs.

Output a structured analysis with clear sections and actionable recommendations.
"@

$analysis = claude -p $prompt
$analysis | Out-File .review/architecture-analysis.md -Encoding utf8

Write-Host "✅ Architecture analysis complete — saved to .review/architecture-analysis.md"
```

## Step 3: Claude's Analysis (Expected Output)

Claude Code produces a detailed analysis like:

```markdown
# Architecture Analysis: Monolith → Microservices Evaluation

## 1. Proposed Service Boundaries

| Service | Files | Domain | Database Tables |
|---------|-------|--------|----------------|
| User Service | routes/users.ts, services/userService.ts | Authentication, profiles | users, sessions |
| Product Service | routes/products.ts, services/productService.ts | Catalog, inventory | products, categories |
| Order Service | routes/orders.ts, services/orderService.ts | Order lifecycle | orders, order_items |
| Payment Service | routes/payments.ts, services/paymentService.ts | Payment processing | payments, refunds |
| Notification Service | services/notificationService.ts | Email, SMS, push | notification_log |

## 2. Coupling Analysis

| Component A | Component B | Coupling (1-10) | Type | Issue |
|-------------|-------------|:----------------:|------|-------|
| orderService | userService | 8 | Data | Direct DB queries to users table |
| paymentService | orderService | 7 | Control | Synchronous calls, shared transactions |
| productService | orderService | 5 | Data | Product lookup during order creation |
| notificationService | * | 3 | Event | Loosely coupled, event-driven |

**Critical Finding:** orderService and paymentService share database transactions 
(lines 45-72 of orderService.ts). This MUST be resolved before separation.

## 3. Recommendation

**Recommendation: Incremental Strangler Fig pattern, NOT big-bang decomposition.**

Reasons:
- Team size (4 developers) is too small for full microservices
- Coupling between orders and payments requires careful decoupling first
- Notification service is the easiest to extract (low coupling)

Suggested order:
1. Extract Notification Service (2 weeks, low risk)
2. Introduce event bus for order → payment communication (3 weeks, medium risk)
3. Extract Payment Service behind the event bus (4 weeks, medium risk)
4. Evaluate further decomposition based on scaling needs
```

## Step 4: Create Action Items (Copilot CLI)

Copilot CLI processes Claude's analysis and creates GitHub Issues:

```powershell
# Create GitHub Issues from the analysis

# Issue 1: High-coupling investigation
gh issue create `
  --title "Investigate order-payment coupling for microservice extraction" `
  --body "Claude Code architecture analysis identified tight coupling (8/10) between 
orderService and paymentService. They share database transactions in orderService.ts 
lines 45-72.

**Action:** Introduce an event bus pattern to decouple synchronous calls before 
attempting service extraction.

**Risk:** Medium — requires careful transaction boundary redesign.

**Reference:** See .review/architecture-analysis.md for full analysis." `
  --label "architecture,tech-debt"

# Issue 2: First extraction target
gh issue create `
  --title "Extract Notification Service as first microservice" `
  --body "Architecture analysis recommends starting microservice extraction with 
the Notification Service due to low coupling (3/10).

**Effort:** ~2 weeks
**Risk:** Low
**Dependencies:** None

**Reference:** See .review/architecture-analysis.md" `
  --label "architecture,enhancement"

Write-Host "✅ Created GitHub Issues from architecture analysis"
```

## Step 5: Follow-Up Deep Dive (Optional)

If you need more detail on a specific finding, delegate again:

```powershell
# Deep dive into the coupling issue
$deepDive = claude -p @"
In the previous architecture analysis, you identified tight coupling between 
orderService and paymentService through shared database transactions.

$(Get-Content src/services/orderService.ts -Raw)
$(Get-Content src/services/paymentService.ts -Raw)

Provide:
1. A specific refactoring plan to introduce the Saga pattern
2. Code examples showing before/after
3. A test strategy to verify behavior is preserved
"@

$deepDive | Out-File .review/coupling-deep-dive.md -Encoding utf8
```

## Key Takeaways

1. **Claude Code excels at architecture analysis** — its 200K context lets it understand the full codebase at once
2. **Copilot CLI orchestrates the flow** — gathering context, delegating to Claude, creating GitHub artifacts
3. **The combination is powerful** — Claude reasons deeply, Copilot acts on GitHub
4. **Iterative refinement** — start with a broad analysis, then deep-dive into specific findings

## See Also

- [Delegate to Claude](../skills/delegate-to-claude.md) — Claude delegation skill
- [Full Workflow Example](full-workflow.md) — Complete multi-AI workflow
- [Agent Council Pattern](../patterns/agent-council.md) — Getting multiple AI perspectives
