---
name: browser-devtools
description: Use when verifying frontend behavior at runtime — DOM validation, network inspection, performance profiling with browser DevTools
metadata:
  category: testing
  agent_type: general-purpose
---

# Browser DevTools Testing

## When to Use
- E2E 테스트 실패의 근본 원인을 찾을 때
- API 호출이 예상대로 이루어지는지 검증할 때
- Core Web Vitals와 성능 지표를 측정할 때
- 접근성 문제를 런타임에서 확인할 때
- Playwright 테스트 작성 전 동작을 수동으로 탐색할 때

## Workflow

### 1. DOM 상태 검증

```javascript
// Console에서 실행
// 요소 존재 확인
document.querySelector('[data-testid="submit-button"]') !== null

// 요소 상태 확인
const btn = document.querySelector('button[type="submit"]');
console.log({
  disabled: btn.disabled,
  'aria-label': btn.getAttribute('aria-label'),
  visible: btn.offsetParent !== null
});

// 폼 데이터 확인
new FormData(document.querySelector('form')).entries().next()
```

### 2. 네트워크 탭으로 API 검증

확인 항목:
- 요청 URL과 메서드 (GET/POST/PUT)
- 요청 헤더 (Authorization, Content-Type)
- 요청 바디 (정확한 payload 형식)
- 응답 상태 코드와 바디
- CORS 헤더 존재 여부

```javascript
// fetch를 인터셉트해서 로깅
const originalFetch = window.fetch;
window.fetch = function(...args) {
  console.log('fetch:', args[0], args[1]);
  return originalFetch.apply(this, args);
};
```

### 3. Performance 탭 — Core Web Vitals 측정

```javascript
// Console에서 실시간 측정
new PerformanceObserver((list) => {
  list.getEntries().forEach(entry => {
    console.log(entry.entryType, entry.name, entry.value || entry.duration);
  });
}).observe({ entryTypes: ['largest-contentful-paint', 'layout-shift', 'longtask'] });
```

목표치:
- LCP ≤ 2.5s
- INP ≤ 200ms
- CLS ≤ 0.1

### 4. Accessibility 탭

```javascript
// axe-core를 콘솔에서 실행
// (axe-core CDN 주입 후)
axe.run().then(results => {
  results.violations.forEach(v => {
    console.error(v.id, v.description, v.nodes.map(n => n.html));
  });
});
```

### 5. Playwright 테스트로 전환

DevTools에서 검증한 선택자를 Playwright 테스트로 변환:

```typescript
// DevTools에서 확인한 선택자로 테스트 작성
test('submit button is accessible', async ({ page }) => {
  await page.goto('/form');
  
  const btn = page.getByRole('button', { name: 'Submit' });
  await expect(btn).toBeVisible();
  await expect(btn).toBeEnabled();
  await expect(btn).toHaveAttribute('type', 'submit');
});
```

## Common Rationalizations

| Rationalization | Reality |
|----------------|---------|
| "유닛 테스트가 통과했으니 브라우저에서도 된다" | 렌더링, 레이아웃, 네트워크 타이밍은 유닛 테스트로 잡을 수 없다. |
| "로컬에서 잘 되면 됐다" | 성능 문제는 실제 네트워크 조건에서 나타난다. DevTools의 throttling을 사용한다. |
| "스크린샷으로 충분하다" | 스크린샷은 DOM 상태, 접근성, 성능을 보여주지 않는다. |

## Red Flags
- 네트워크 탭을 열지 않고 API 통합 버그를 수정하려 함
- Core Web Vitals를 측정하지 않고 "빠르다"고 주장
- 접근성 오류를 브라우저에서 확인 안 함

## Verification
- [ ] 핵심 사용자 플로우에서 Network 탭으로 API 호출 확인
- [ ] Lighthouse 점수: Performance ≥80, Accessibility ≥90
- [ ] Console에 오류 없음
- [ ] `e2e-testing` 스킬로 검증된 플로우를 자동화 테스트로 전환

## Tips
- `e2e-testing` 스킬 이전 단계로 사용: DevTools로 먼저 탐색한 후 Playwright로 자동화한다
- `references/performance-checklist.md`와 `references/accessibility-checklist.md`를 함께 참조한다
- Chrome DevTools의 Recorder 기능으로 인터랙션을 기록하면 Playwright 코드 생성이 쉬워진다
