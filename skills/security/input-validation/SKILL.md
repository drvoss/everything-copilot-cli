---
name: input-validation
description: Input validation patterns to prevent injection attacks (SQL, XSS, CSRF)
metadata:
  category: security
  agent_type: general-purpose
---

# Input Validation

## When to Use
- Building or reviewing API endpoints that accept user input
- Working with database queries, HTML rendering, or form handling
- Auditing an existing application for injection vulnerabilities
- Adding validation middleware to a web framework
- Handling file uploads, URL parameters, or header values

## Prerequisites
- Understanding of the application's input surfaces (APIs, forms, file uploads)
- Access to the codebase's request handlers and data layer
- A validation library available (zod, joi, express-validator, etc.)

## Workflow

### 1. Map Input Surfaces
Identify everywhere user input enters the application:
```powershell
# Find route handlers / API endpoints
grep -rn "app\.\(get\|post\|put\|delete\|patch\)\|router\." src/ --include="*.ts"

# Find request body/query/param access
grep -rn "req\.body\|req\.query\|req\.params\|request\.json" src/ --include="*.ts"

# Find file upload handlers
grep -rn "multer\|upload\|formidable\|busboy" src/ --include="*.ts"
```

### 2. SQL Injection Prevention
```powershell
# Find raw SQL queries — these are high risk
grep -rn "query\s*(\|execute\s*(\|raw\s*(" src/ --include="*.ts" -A 2
```

```typescript
// ❌ VULNERABLE — string concatenation
const result = await db.query(`SELECT * FROM users WHERE id = '${userId}'`);

// ✅ SAFE — parameterized query
const result = await db.query('SELECT * FROM users WHERE id = $1', [userId]);

// ✅ SAFE — ORM with built-in parameterization
const user = await User.findOne({ where: { id: userId } });
```

### 3. XSS Prevention
```powershell
# Find direct HTML rendering with user data
grep -rn "innerHTML\|dangerouslySetInnerHTML\|document\.write\|v-html" src/ --include="*.ts" --include="*.tsx" --include="*.vue"

# Find template rendering without escaping
grep -rn "res\.send\|res\.write" src/ --include="*.ts" -A 3
```

```typescript
// ❌ VULNERABLE — raw HTML insertion
element.innerHTML = userComment;

// ✅ SAFE — text content (auto-escaped)
element.textContent = userComment;

// ✅ SAFE — sanitize before rendering
import DOMPurify from 'dompurify';
element.innerHTML = DOMPurify.sanitize(userComment);
```

### 4. CSRF Prevention
```powershell
# Check for CSRF middleware
grep -rn "csrf\|csurf\|csrfToken" src/ --include="*.ts"

# Find state-changing endpoints without protection
grep -rn "app\.post\|app\.put\|app\.delete" src/ --include="*.ts"
```

```typescript
// Add CSRF protection middleware
import csrf from 'csurf';
app.use(csrf({ cookie: true }));

// Include token in forms
app.get('/form', (req, res) => {
  res.render('form', { csrfToken: req.csrfToken() });
});
```

### 5. Schema Validation at the Boundary
Validate all input at the entry point using a schema library:

```typescript
import { z } from 'zod';

const CreateUserSchema = z.object({
  email: z.string().email().max(254),
  name: z.string().min(1).max(100).trim(),
  age: z.number().int().min(0).max(150),
});

app.post('/users', (req, res) => {
  const result = CreateUserSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(400).json({ errors: result.error.issues });
  }
  // result.data is now typed and validated
  createUser(result.data);
});
```

### 6. Additional Validation Patterns
```typescript
// Path traversal prevention
import path from 'path';
function safePath(userInput: string): string {
  const resolved = path.resolve('/allowed/base', userInput);
  if (!resolved.startsWith('/allowed/base')) {
    throw new Error('Path traversal detected');
  }
  return resolved;
}

// URL validation
function safeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch { return false; }
}
```

## Examples

### Audit Existing Endpoints
```powershell
# Find unvalidated endpoints — routes without validation middleware
grep -rn "router\.\(post\|put\|patch\)" src/routes/ --include="*.ts" -A 5 | grep -v "validate\|schema\|zod\|joi"
```

### Add Validation to an Express Route
```typescript
// middleware/validate.ts
import { ZodSchema } from 'zod';
export function validate(schema: ZodSchema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json({ errors: result.error.issues });
    req.body = result.data;
    next();
  };
}
```

## Tips
- **Validate at the boundary, trust internally** — validate once where input enters your system
- Use allowlists over denylists — define what's allowed rather than what's blocked
- Always validate type, length, format, and range
- Use parameterized queries for **all** database access, no exceptions
- Set `Content-Security-Policy` headers to prevent XSS at the browser level
- Never trust client-side validation alone — always validate server-side
- Use `explore` agent to trace how user input flows through the application
