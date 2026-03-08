# MSW (Mock Service Worker) — 목업 API

테스트·개발 보조용으로 API 요청을 가로채 mock 응답을 반환합니다.

## 사용 방법

### 브라우저 (개발 시)

1. `.env.local`에 다음 추가:
   ```
   NEXT_PUBLIC_USE_MSW=true
   ```
2. `npm run dev` 실행 시 MSW가 자동으로 켜지고, `/api/products`, `/api/categories`, `/api/banners` 등이 mock 데이터로 응답합니다.
3. 목업을 쓰지 않으려면 `NEXT_PUBLIC_USE_MSW`를 제거하거나 `false`로 두면 됩니다.

### Node (테스트)

Jest/Vitest 등 테스트 러너를 쓰는 경우, setup 파일에서:

```javascript
import { server } from '@/mocks/server';

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

## 파일 구성

- `data.js` — 목업용 공통 데이터. **api-mock**(`src/app/api-mock/`) 라우트와 MSW handlers에서 공유.
- `handlers.js` — 경로별 mock 핸들러. `data.js` 사용. 필요 시 엔드포인트/응답 추가.
- `server.js` — Node용 `setupServer` (테스트에서 사용).
- `browser.js` — 브라우저용 `setupWorker` (MswProvider에서 사용).

목업 API 라우트(DB 없이 고정 응답)는 `src/app/api-mock/`에 두고, 동일 데이터는 `data.js`에서 가져와 사용한다.  
Worker 스크립트는 `public/mockServiceWorker.js`에 있으며, `npx msw init public/ --save`로 갱신할 수 있다.
