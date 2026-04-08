# Accessibility Checklist Reference

> 기준: WCAG 2.1 AA  
> 관련 스킬: [`browser-devtools`](../skills/testing/browser-devtools/SKILL.md), [`e2e-testing`](../skills/testing/e2e-testing/SKILL.md)

---

## 키보드 내비게이션

- [ ] 모든 인터랙티브 요소가 Tab으로 접근 가능
- [ ] 포커스 순서가 시각적 흐름과 일치 (좌→우, 위→아래)
- [ ] 포커스 표시자(outline)가 제거되지 않음
- [ ] Skip Navigation 링크 제공 (콘텐츠로 바로 이동)
- [ ] 모달/드롭다운 내에서 포커스 트랩
- [ ] `Esc` 키로 모달/드롭다운 닫힘

---

## 스크린 리더 호환성

- [ ] 모든 이미지에 의미있는 `alt` 속성 (장식 이미지는 `alt=""`)
- [ ] 폼 입력에 `<label>` 또는 `aria-label`
- [ ] 아이콘 버튼에 `aria-label` (예: `aria-label="Close"`)
- [ ] 동적 콘텐츠 업데이트에 `aria-live` 영역
- [ ] 모달에 `role="dialog"` 및 `aria-modal="true"`
- [ ] 에러 메시지가 입력 필드와 `aria-describedby`로 연결

### 시맨틱 HTML 사용

```html
<!-- 나쁜 예 -->
<div onclick="submit()" class="button">Submit</div>

<!-- 좋은 예 -->
<button type="submit">Submit</button>
```

주요 시맨틱 요소: `<header>`, `<nav>`, `<main>`, `<aside>`, `<footer>`, `<section>`, `<article>`

---

## 시각적 접근성

- [ ] 텍스트 대비 비율 ≥ 4.5:1 (일반 텍스트), ≥ 3:1 (큰 텍스트)
- [ ] 색상만으로 정보를 전달하지 않음 (아이콘 또는 텍스트 병행)
- [ ] 텍스트가 200%까지 확대 시 레이아웃 유지
- [ ] 애니메이션에 `prefers-reduced-motion` 미디어 쿼리 적용

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 폼 접근성

- [ ] 모든 입력 필드에 연결된 `<label>`
- [ ] 필수 필드 표시 (시각적 + `required` 속성)
- [ ] 에러 메시지가 구체적이고 해결 방법 포함
- [ ] 에러 상태에서 포커스가 에러 필드 또는 요약으로 이동

```html
<div>
  <label for="email">Email <span aria-hidden="true">*</span></label>
  <input 
    id="email" 
    type="email" 
    required
    aria-required="true"
    aria-describedby="email-error"
  />
  <span id="email-error" role="alert">유효한 이메일을 입력해주세요</span>
</div>
```

---

## 콘텐츠 구조

- [ ] 헤딩 계층이 논리적 (`h1` → `h2` → `h3`, 레벨 건너뜀 없음)
- [ ] 링크 텍스트가 목적지를 설명함 ("여기 클릭" 금지)
- [ ] 빈 상태(empty state)에 의미있는 메시지
- [ ] 터치 타겟 최소 44×44px

---

## 자동화 테스트

```typescript
// Playwright + axe-core
import { checkA11y, injectAxe } from 'axe-playwright';

test('page has no accessibility violations', async ({ page }) => {
  await page.goto('/');
  await injectAxe(page);
  await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  });
});
```

---

## 검사 도구

- **Chrome DevTools** → Lighthouse → Accessibility 점수 ≥ 90
- **axe DevTools** 브라우저 확장
- **WAVE** 브라우저 확장
- **Colour Contrast Analyser** (대비 검사)
- **NVDA** (Windows 스크린 리더 테스트)
