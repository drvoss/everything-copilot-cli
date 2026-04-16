---
name: api-documentation
description: "Parses endpoint handlers, extracts request/response schemas, and generates accurate API reference documentation from implementation. Use when source code has changed and API docs are stale, a new endpoint lacks documentation, generating OpenAPI/Swagger specs, creating REST API references, or synchronizing docs with code."
metadata:
  version: 1.0.0
  category: documentation
  agent_type: general-purpose
---

# API Documentation

## When to Use

- Building or updating REST/GraphQL API documentation
- Onboarding new developers who need to understand available endpoints
- Preparing API reference docs for external consumers
- Ensuring API docs stay synchronized with implementation
- Creating OpenAPI/Swagger specifications from existing code

## Workflow

### 1. Discover All Endpoints

```powershell
# Express / Node.js
grep -rn "router\.\(get\|post\|put\|delete\|patch\)\|app\.\(get\|post\|put\|delete\|patch\)" src/ --include="*.ts" --include="*.js"

# FastAPI / Python
grep -rn "@app\.\(get\|post\|put\|delete\)\|@router\." src/ --include="*.py"

# Go / Gin
grep -rn "\.GET\|\.POST\|\.PUT\|\.DELETE" . --include="*.go"
```

Use `explore` agent for a comprehensive map:

```text
task agent_type: "explore"
prompt: "Map all API endpoints in this project. For each endpoint list: HTTP method, path, handler function name, file location, and any middleware applied."
```

**Checkpoint**: Cross-reference discovered routes against route registration files to confirm all endpoints are captured before proceeding.

### 2. Document Each Endpoint

For each endpoint, capture:

```markdown
## POST /api/users

Create a new user account.

**Authentication:** Bearer token required

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | Valid email address |
| name | string | Yes | Display name (1-100 chars) |
| role | string | No | User role (default: "viewer") |

**Response 201:**
```json
{
  "id": "usr_abc123",
  "email": "user@example.com",
  "name": "Jane Doe",
  "role": "viewer",
  "createdAt": "2024-01-15T10:30:00Z"
}
```

**Error Responses:**

| Status | Description |
|--------|-------------|
| 400 | Invalid request body |
| 409 | Email already exists |
| 401 | Missing or invalid auth token |

```text

### 3. Extract Types and Schemas
```powershell
# Find request/response type definitions
grep -rn "interface.*Request\|interface.*Response\|type.*Payload" src/ --include="*.ts" -A 10

# Find validation schemas (Zod, Joi, etc.)
grep -rn "z\.object\|Joi\.object\|Schema" src/ --include="*.ts" -A 10
```

### 4. Document Authentication

```powershell
# Find auth middleware and configuration
grep -rn "auth\|jwt\|bearer\|apiKey\|passport" src/middleware/ --include="*.ts" -A 5
```

```markdown
## Authentication

All endpoints except `POST /auth/login` require a Bearer token.

```bash
curl -H "Authorization: Bearer <token>" https://api.example.com/users
```

### Obtaining a Token

```bash
curl -X POST https://api.example.com/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "secret"}'
```

```text

### 5. Add Working Examples
```powershell
# Test each documented example against a running server
# Start the dev server
npm run dev  # mode: async, detach: true

# Verify an endpoint
curl -s http://localhost:3000/api/health | python -m json.tool
```

### 6. Generate OpenAPI Spec (Optional)

```powershell
# If using a framework that supports auto-generation
npx swagger-jsdoc -d src/swagger-config.js -o docs/openapi.json

# Or generate from TypeScript types
npx ts-to-openapi --input src/types/ --output docs/openapi.yaml
```

## Examples

### Documenting a CRUD API

```powershell
# 1. Find all route files
glob pattern="src/routes/**/*.ts"

# 2. For each route file, extract endpoints and their handlers
grep -rn "router\." src/routes/users.ts -A 3

# 3. Find the handler implementation for request/response details
grep -rn "export.*function\|export.*const.*=" src/controllers/users.ts -A 15
```

### Quick API Reference Table

```markdown
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| GET | /api/users | List all users | Yes |
| POST | /api/users | Create user | Yes |
| GET | /api/users/:id | Get user by ID | Yes |
| PUT | /api/users/:id | Update user | Yes |
| DELETE | /api/users/:id | Delete user | Admin |
```

## Verification

- [ ] All discovered endpoints have corresponding documentation
- [ ] Each documented endpoint includes request/response schemas and error codes
- [ ] curl examples have been tested against a running server
- [ ] Generated OpenAPI spec (if applicable) validates without errors
- [ ] Documentation matches the current implementation, not stale behavior
