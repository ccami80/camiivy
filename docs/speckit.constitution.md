# 스펙·아키텍처 기준

프로젝트의 기술 스택, 디렉터리 구조, 라우팅·API·상태 관리 설계는 **Cursor 규칙**에 정의되어 있습니다.

- **기술 스택·UI·테스트·환경**: `.cursor/rules/tech-stack.mdc`
- **디렉터리·라우팅·API·상태 관리**: `.cursor/rules/architecture.mdc`
- **구현 방식 제약(JS only, Prisma, API 동반 구현 등)**: `.cursor/rules/implementation.mdc`

신규 개발·리팩터 시 위 규칙을 따릅니다. 클라이언트 API 호출은 `src/utils/apis.js` 래퍼를 사용하고, axios는 직접 사용하지 않습니다.

### api 사용 예시

```javascript
import { api } from '@/utils/apis';

const products = await api.get({ path: '/api/products', params: { sort: 'latest' } });
await api.post({ path: '/api/auth/login', data: { email, password } });
await api.patch({ path: `/api/admin/products/${id}`, data: { approvalStatus: 'APPROVED' } });
await api.delete({ path: `/api/cart/items/${itemId}` });
```
