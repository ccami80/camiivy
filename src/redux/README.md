# Redux 구조

규칙: `.cursor/rules/redux.mdc` 참고.

- **store**: `src/redux/store.js` — configureStore, redux-persist
- **reducers**: `src/redux/reducers/` — createSlice 기반

## Persist whitelist

다음 slice만 localStorage에 저장됨: `commonPersist`, `auth`, `wishlist`, `recentlyViewed`.

## Slice 요약

| 파일 | name | 용도 |
|------|------|------|
| commonPersistReducer.js | commonPersist | activeDomain, selectedProfileType (persist) |
| authReducer.js | auth | user, isReady (persist) |
| wishlistReducer.js | wishlist | items (persist) |
| recentlyViewedReducer.js | recentlyViewed | items (persist) |
| cartReducer.js | cart | cartItems, orderItems, lastOrder |
| productReducer.js | product | list, detail, loading, error (관리자·입점업체) |
| vendorReducer.js | vendor | list, detail, loading, error (입점업체) |

## 사용

```javascript
import { useSelector, useDispatch } from 'react-redux';
import { setUser, clearAuth } from '@/redux/reducers/authReducer';

// 읽기
const user = useSelector((state) => state.auth.user);
// 쓰기
const dispatch = useDispatch();
dispatch(setUser({ email: 'a@b.com', role: 'user' }));
dispatch(clearAuth());
```

기존 Context/Zustand는 유지되어 있으며, 점진적으로 Redux로 이전 가능.
