# Testing Patterns Reference

> 관련 스킬: [`tdd-workflow`](../skills/development/tdd-workflow/SKILL.md), [`test-coverage`](../skills/testing/test-coverage/SKILL.md), [`e2e-testing`](../skills/testing/e2e-testing/SKILL.md)

---

## Arrange-Act-Assert (AAA) 구조

모든 테스트는 세 단계로 구분한다:

```typescript
test('calculateTotal returns sum with tax', () => {
  // Arrange — 테스트 데이터와 사전 조건 준비
  const items = [{ price: 100 }, { price: 200 }];
  const taxRate = 0.1;

  // Act — 테스트 대상 실행
  const total = calculateTotal(items, taxRate);

  // Assert — 결과 검증
  expect(total).toBe(330);
});
```

---

## Assertion 메서드

### 동등성

```typescript
expect(result).toBe(42);              // 원시값 (===)
expect(result).toEqual({ a: 1 });     // 객체 심층 비교
expect(result).toStrictEqual({ a: 1 }); // undefined 프로퍼티 포함
```

### 진위값

```typescript
expect(value).toBeTruthy();
expect(value).toBeFalsy();
expect(value).toBeNull();
expect(value).toBeUndefined();
expect(value).toBeDefined();
```

### 숫자

```typescript
expect(result).toBeGreaterThan(0);
expect(result).toBeLessThanOrEqual(100);
expect(result).toBeCloseTo(3.14159, 2);  // 소수점 2자리까지
```

### 문자열/배열

```typescript
expect(str).toContain('expected');
expect(str).toMatch(/pattern/);
expect(arr).toHaveLength(3);
expect(arr).toContain(item);
expect(arr).toEqual(expect.arrayContaining([1, 2]));
```

### 오류

```typescript
expect(() => fn()).toThrow();
expect(() => fn()).toThrow(TypeError);
expect(() => fn()).toThrow('specific message');
await expect(asyncFn()).rejects.toThrow('async error');
```

---

## Mock 전략

### 원칙: 외부 경계만 Mock

**Mock 해야 하는 것:**

- 외부 HTTP API 호출
- 데이터베이스 쿼리 (통합 테스트 제외)
- 파일 시스템 (외부 파일 읽기)
- 시간 (`Date.now()`, `setTimeout`)
- 환경 변수

**Mock 하지 말아야 하는 것:**

- 내부 비즈니스 로직 함수
- 순수 함수 (부작용 없는 함수)
- 테스트 중인 모듈의 내부 구현

### Jest/Vitest Mock 예시

```typescript
// 모듈 전체 mock
jest.mock('./emailService');
const mockSend = jest.mocked(emailService.send);
mockSend.mockResolvedValue({ id: 'mock-id' });

// 특정 메서드만 mock
jest.spyOn(logger, 'error').mockImplementation(() => {});

// Date mock
jest.setSystemTime(new Date('2024-01-15'));

// 복원
afterEach(() => jest.restoreAllMocks());
```

---

## 컴포넌트 테스팅 (React + Testing Library)

```typescript
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

test('form submits with correct data', async () => {
  const onSubmit = jest.fn();
  render(<LoginForm onSubmit={onSubmit} />);

  await userEvent.type(screen.getByLabelText('Email'), 'user@example.com');
  await userEvent.type(screen.getByLabelText('Password'), 'password123');
  await userEvent.click(screen.getByRole('button', { name: 'Log in' }));

  expect(onSubmit).toHaveBeenCalledWith({
    email: 'user@example.com',
    password: 'password123'
  });
});
```

### 쿼리 우선순위 (Testing Library)

1. `getByRole` — 접근성 역할로 (최우선)
2. `getByLabelText` — 레이블과 연결된 입력
3. `getByPlaceholderText` — placeholder 텍스트
4. `getByText` — 텍스트 내용
5. `getByTestId` — `data-testid` (최후 수단)

---

## API 테스팅 (supertest / httpx)

```typescript
// Node.js (supertest)
import request from 'supertest';

test('POST /users creates a user', async () => {
  const res = await request(app)
    .post('/users')
    .send({ name: 'Alice', email: 'alice@example.com' })
    .expect(201);

  expect(res.body).toMatchObject({ name: 'Alice' });
  expect(res.body.id).toBeDefined();
});
```

```python
# Python (httpx + pytest)
async def test_create_user(client: AsyncClient):
    response = await client.post('/users', json={'name': 'Alice'})
    assert response.status_code == 201
    assert response.json()['name'] == 'Alice'
```

---

## E2E 테스팅 (Playwright)

```typescript
test('user can log in and see dashboard', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page).toHaveURL('/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
});
```

---

## 피해야 할 안티패턴

| 패턴 | 문제 | 대안 |
|------|------|------|
| `expect(true).toBe(true)` | assertion이 없는 것과 같음 | 실제 비즈니스 값을 검증 |
| `setTimeout(done, 1000)` | 불안정한 타이밍 의존 | `waitFor()`, `findBy*()` 사용 |
| 테스트 간 shared state | 순서 의존성 발생 | 각 테스트에서 독립적으로 setup |
| `describe` 없는 수백 줄 파일 | 관리 불가 | 기능별로 `describe` 블록 분리 |
| 내부 구현 테스트 | 리팩터에 취약 | public interface만 테스트 |
