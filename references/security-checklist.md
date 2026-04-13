# Security Checklist Reference

> 관련 스킬: [`security-scan`](../skills/security/security-scan/SKILL.md), [`input-validation`](../skills/security/input-validation/SKILL.md), [`secret-detection`](../skills/security/secret-detection/SKILL.md), [`security-audit`](../skills/workflow/security-audit/SKILL.md)

---

## Pre-Commit 보안 체크

```bash
# 시크릿 스캔
git diff --cached | grep -E "(?i)(api[_-]?key|password|secret|token)\s*[:=]\s*['\"][^'\"]{8,}"

# npm audit
npm audit --audit-level=high

# Python
pip-audit || safety check
```

---

## 인증 (Authentication)

- [ ] 비밀번호 해싱: bcrypt (≥12 라운드) 또는 Argon2id
- [ ] 세션 쿠키: `HttpOnly; Secure; SameSite=Strict`
- [ ] JWT: 만료 시간 설정, `exp` 클레임 서버에서 검증
- [ ] MFA 지원 (민감한 작업에 재인증)
- [ ] 로그인 시도 제한 (rate limiting)
- [ ] 비밀번호 재설정 토큰: 단일 사용, 만료 시간 ≤1시간

---

## 인가 (Authorization)

- [ ] 리소스 요청마다 소유권 검증 (`user.id === resource.ownerId`)
- [ ] RBAC: 역할 확인이 비즈니스 로직과 분리됨
- [ ] 수평적 권한 상승 차단 (다른 사용자 리소스 접근 불가)
- [ ] 수직적 권한 상승 차단 (일반 사용자가 관리자 기능 접근 불가)
- [ ] API 키/토큰에 최소 권한 원칙 적용

---

## 입력 검증

- [ ] 모든 사용자 입력에 서버 사이드 검증
- [ ] Allowlist 방식 (블랙리스트 아님)
- [ ] SQL: 파라미터화 쿼리 또는 ORM (raw string 연결 금지)
- [ ] 파일 업로드: MIME 타입, 확장자, 크기 제한
- [ ] 파일 경로: path traversal 방지 (`path.resolve()` + 기준 경로 확인)
- [ ] HTML 출력: 이스케이핑 또는 DOMPurify (XSS 방지)

---

## 보안 헤더

```text
Content-Security-Policy: default-src 'self'; script-src 'self'
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=()
```

---

## CORS

- [ ] 허용된 오리진 명시 (`*` 금지)
- [ ] Credentials 요청 시 특정 오리진만 허용
- [ ] Preflight 캐시 시간 설정

```javascript
// 나쁜 예
cors({ origin: '*', credentials: true })

// 좋은 예
cors({ origin: ['https://app.example.com'], credentials: true })
```

---

## 데이터 보호

- [ ] PII는 암호화하여 저장 (AES-256)
- [ ] 로그에 비밀번호/토큰/PII 미기록
- [ ] API 응답에 불필요한 필드 미포함 (최소 노출)
- [ ] 에러 메시지에 스택 트레이스/DB 구조 미노출

---

## 의존성 보안

```bash
# Node.js
npm audit fix
npx better-npm-audit

# Python
pip-audit
safety check -r requirements.txt

# GitHub (Dependabot 활성화)
# .github/dependabot.yml 설정
```

---

## OWASP Top 10 (2021) 체크

| # | 취약점 | 체크 항목 |
|---|--------|---------|
| A01 | Broken Access Control | 모든 API에 인가 체크 |
| A02 | Cryptographic Failures | 암호화 전송(TLS), 저장 시 암호화 |
| A03 | Injection | 파라미터화 쿼리, 입력 검증 |
| A04 | Insecure Design | 위협 모델링, 보안 설계 검토 |
| A05 | Security Misconfiguration | 기본 자격증명 변경, 불필요한 기능 비활성화 |
| A06 | Vulnerable Components | `npm audit`, Dependabot |
| A07 | Auth Failures | 강력한 인증, 세션 관리 |
| A08 | Software Integrity | 서명 검증, CI/CD 보안 |
| A09 | Logging Failures | 보안 이벤트 로깅, 로그 보호 |
| A10 | SSRF | 외부 URL 요청 시 allowlist 검증 |
