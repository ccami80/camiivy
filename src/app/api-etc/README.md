# api-etc

타사(외부) API 연동용 Next.js API Routes가 들어가는 폴더입니다.

- **용도**: 외부 서비스 프록시, 웹훅 수신, 타사 API 래퍼 등
- **경로**: `/api-etc/...` 형태로 노출
- **예**: 결제·배송 조회·SNS·메일 등 외부 API를 서버에서 호출해 클라이언트에 제공할 때 여기 구현

자사 백엔드 API는 `src/app/api/`, 프론트 자체해결 API는 `src/app/api-local/`, 목업은 `src/app/api-mock/`를 사용하세요.
