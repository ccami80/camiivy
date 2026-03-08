# api-mock — 목 API

**목업 전용** API입니다. `src/mocks/data.js` 등 고정 데이터를 반환하며, DB를 사용하지 않습니다.

- **경로**: `/api-mock/...`
- **실제 연동 시**: 동일 기능의 자사 API는 `src/app/api/` 아래 경로로 전환해 사용하세요.

---

## 목 API 목록 (자사 API와 매핑)

| 목 API (Mock) | 자사 API (실제) | 비고 |
|---------------|-----------------|------|
| `GET /api-mock/brands` | `GET /api/brands` | 브랜드 목록 |
| `GET /api-mock/categories` | `GET /api/categories` | 카테고리 목록 |
| `GET /api-mock/products` | `GET /api/products` | 상품 목록 |
| `GET /api-mock/products/[id]` | `GET /api/products/[id]` | 상품 상세 |
| `GET /api-mock/banners` | `GET /api/banners` | 배너 목록 |
| `GET /api-mock/home-sections` | `GET /api/home-sections` | 홈 섹션 |
| `GET /api-mock/curation` | `GET /api/curation` | 큐레이션 |

---

## 사용 시점

- **개발/스토리북**: 백엔드 없이 화면·플로우 검증 시 `/api-mock/...` 호출
- **운영/실서비스**: `/api/...` (자사 API) 사용

클라이언트에서 base path만 바꾸면 됩니다 (예: 환경 변수로 `NEXT_PUBLIC_USE_MOCK_API` 등).

---

- **자사 API 전체 목록**: `src/app/api/README.md`
- **타사 API**: `src/app/api-etc/`
- **프론트 자체해결 API**: `src/app/api-local/`
