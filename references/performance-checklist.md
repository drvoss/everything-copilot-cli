# Performance Checklist Reference

> 관련 스킬: [`sprint-workflow`](../skills/workflow/sprint-workflow/SKILL.md), [`code-review`](../skills/development/code-review/SKILL.md), [`browser-devtools`](../skills/testing/browser-devtools/SKILL.md)

---

## Core Web Vitals 목표값

| 지표 | 목표 | 주의 | 나쁨 |
|------|------|------|------|
| LCP (Largest Contentful Paint) | ≤ 2.5s | 2.5–4.0s | > 4.0s |
| INP (Interaction to Next Paint) | ≤ 200ms | 200–500ms | > 500ms |
| CLS (Cumulative Layout Shift) | ≤ 0.1 | 0.1–0.25 | > 0.25 |
| TTFB (Time to First Byte) | ≤ 800ms | — | — |

---

## 프론트엔드 최적화

### 이미지
- [ ] 적절한 포맷: WebP (사진), SVG (아이콘), AVIF (최신 브라우저)
- [ ] `width`/`height` 속성으로 레이아웃 공간 예약 (CLS 방지)
- [ ] 중요하지 않은 이미지에 `loading="lazy"`
- [ ] `srcset`으로 반응형 이미지 제공
- [ ] 이미지 CDN 사용 (최적화 자동화)

### JavaScript
- [ ] 번들 크기: 초기 JS ≤ 200KB (gzip 후)
- [ ] Code splitting으로 라우트별 번들 분리
- [ ] 사용하지 않는 패키지 제거 (`bundle-analyzer` 실행)
- [ ] Tree shaking 활성화 (ESM + production 빌드)
- [ ] 중요하지 않은 스크립트에 `defer` 또는 `async`

### CSS
- [ ] 미사용 CSS 제거 (PurgeCSS, Tailwind purge)
- [ ] Critical CSS 인라인 (above-the-fold)
- [ ] CSS 파일 minify

### 캐싱
- [ ] 정적 자산: `Cache-Control: max-age=31536000, immutable`
- [ ] API 응답: `ETag` 또는 `Last-Modified`
- [ ] Service Worker로 오프라인 캐싱 (PWA)

### 렌더링
- [ ] React: 불필요한 리렌더 방지 (`React.memo`, `useMemo`, `useCallback`)
- [ ] 긴 목록: 가상화 (react-window, TanStack Virtual)
- [ ] 애니메이션: `transform`/`opacity` 사용 (레이아웃 트리거 금지)

---

## 백엔드 최적화

### 데이터베이스
- [ ] N+1 쿼리 없음 (Eager loading 또는 DataLoader)
- [ ] 자주 쿼리하는 컬럼에 인덱스
- [ ] 대량 데이터에 페이지네이션 (cursor 기반 권장)
- [ ] 커넥션 풀링 설정 (PostgreSQL: PgBouncer, MySQL: ProxySQL)
- [ ] Slow query 로그 활성화 (≥100ms)

### API
- [ ] HTTP 응답 압축 (gzip/brotli)
- [ ] 응답 캐싱 (Redis 또는 CDN)
- [ ] Rate limiting으로 과부하 방지
- [ ] Streaming 응답 (대용량 데이터)

---

## 측정 도구

```bash
# Lighthouse (CLI)
npx lighthouse https://example.com --output html --output-path ./report.html

# Bundle 분석
npx webpack-bundle-analyzer stats.json
# 또는 Next.js
ANALYZE=true next build
```

---

## 프로파일링 체크리스트

1. [ ] Chrome DevTools Performance 탭으로 Main Thread 분석
2. [ ] "Long Tasks" (>50ms) 식별 및 분리
3. [ ] Memory 탭으로 메모리 누수 확인
4. [ ] Network 탭으로 불필요한 요청 제거
5. [ ] Lighthouse 점수 ≥80 (Performance, Accessibility, Best Practices)
