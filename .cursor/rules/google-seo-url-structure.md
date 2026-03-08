# Google 검색을 위한 URL 구조 권장사항

> 출처: [Google 검색 센터 - URL 구조](https://developers.google.com/search/docs/crawling-indexing/url-structure?hl=ko)
>
> Google 검색에서 사이트를 효과적으로 크롤링·색인하려면 아래 규칙을 따르는 것이 좋습니다.

---

## 1. 크롤링 가능한 URL 구조 요구사항

다음 기준을 충족하지 않으면 Google이 사이트를 비효율적으로 크롤링하거나 크롤링하지 않을 수 있습니다.

- **IETF STD 66 준수** — [IETF STD 66](https://datatracker.ietf.org/doc/std66/)에 정의된 URL 규격을 따릅니다. 예약 문자는 [퍼센트 인코딩](https://developer.mozilla.org/docs/Glossary/Percent-encoding)해야 합니다.
- **프래그먼트로 콘텐츠 변경 금지** — URL 프래그먼트(`#` 이후)로 페이지 콘텐츠를 바꾸지 마세요. 예: `https://example.com/#/potatoes` — JavaScript로 콘텐츠를 바꾼다면 [History API](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics?hl=ko#use-history-api)를 사용하세요.
- **표준적인 URL 매개변수 인코딩** — 키-값 구분은 등호(`=`), 매개변수 구분은 앰퍼샌드(`&`). 같은 키에 여러 값은 쉼표(`,`) 등 IETF STD 66과 충돌하지 않는 문자 사용.

**권장 예시**

- `https://example.com/category?category=dresses&sort=low-to-high&sid=789`
- `https://example.com/category?category=dresses&color=purple,pink,salmon&sort=low-to-high`

**권장하지 않음**

- `https://example.com/category?[category:dresses][sort:price-low-to-high][sid:789]` (콜론·각괄호 사용)
- `https://example.com/category?category,dresses,,sort,lowtohigh,,sid,789` (쉼표만으로 구분)

---

## 2. URL을 이해하기 쉽게 만들기

Google과 사용자가 URL을 쉽게 이해할 수 있도록 아래를 적용하는 것이 좋습니다.

### 2.1 설명이 있는 URL 사용

**권장:** 읽을 수 있는 단어 사용 — `https://example.com/wiki/Aviation`

**비권장:** 읽기 어려운 긴 ID 번호 — `https://example.com/index.php?topic=42&area=3a5ebc944f41daa6f849f730f1`

### 2.2 잠재고객의 언어 사용

- URL에 **타깃 언어**의 단어(필요 시 음역)를 사용합니다.
- 예: 독일어 타깃 → `https://example.com/lebensmittel/pfefferminz`
- 예: 일본어 타깃 → `https://example.com/ペパーミント`

### 2.3 퍼센트 인코딩

- ASCII가 아닌 문자는 **퍼센트 인코딩**합니다.
- 링크의 `href`에 필요한 경우 인코딩된 형식을 사용하세요.

**권장 (인코딩):** `https://example.com/%D9%86%D8%B9%D9%86%D8%A7%D8%B9/...`, `https://example.com/gem%C3%BCse`

**비권장 (비인코딩):** `https://example.com/نعناع/...`, `https://example.com/gemüse`

### 2.4 단어 구분: 하이픈 사용

- 단어 구분에는 **하이픈(`-`)** 사용을 권장합니다.
- **밑줄(`_`)** 은 권장하지 않습니다. (다른 문맥에서 이미 널리 쓰이므로 구분이 어렵습니다.)

**권장:** 하이픈으로 구분 — `https://example.com/summer-clothing/filter?color-profile=dark-grey`

**비권장:** 밑줄로 구분 — `https://example.com/summer_clothing/filter?color_profile=dark_grey`  
**비권장:** 단어 연결만 — `https://example.com/greendress`

### 2.5 매개변수 최소화

- **콘텐츠를 바꾸지 않는** 불필요한 매개변수는 제거해 URL 길이를 줄이세요.

### 2.6 대소문자 일관성

- URL은 **대소문자를 구분**합니다. `/APPLE`과 `/apple`은 서로 다른 URL로 취급됩니다.
- 웹 서버가 대소문자를 구분하지 않는다면, **사이트 전체에서 대소문자를 동일하게** 사용해 Google이 동일 페이지로 인식하기 쉽게 하세요.

### 2.7 다지역 사이트

- 지역 타겟팅이 쉬운 URL 구조를 사용하세요.
- 예: 국가별 도메인 `https://example.de`, 또는 gTLD + 국가 하위 디렉터리 `https://example.com/de/`

---

## 3. 자주 발생하는 URL 문제와 방지

지나치게 복잡하거나 중복이 많은 URL은 크롤러 부담을 늘리거나 색인을 불완전하게 만들 수 있습니다.

- **항목 모음 + 필터** — 같은 항목/검색 결과를 필터 조합마다 다른 URL로 만들면 URL 수가 폭발합니다. Googlebot은 대표적인 목록만 크롤링하면 되므로, 약간씩 다른 목록 URL을 과도하게 만들지 마세요.
- **관련 없는 매개변수** — 추천 ID, 세션 ID, 정렬/카테고리 등 불필요한 매개변수가 URL에 포함되면 동일·유사 콘텐츠를 가리키는 URL이 불필요하게 많아집니다. **세션 ID는 URL 대신 쿠키** 사용을 권장합니다.
- **캘린더/무한 URL** — 시작·종료 제한 없이 과거·미래 날짜로 링크를 계속 만들면 무한대의 URL이 생깁니다. 동적 캘린더 링크에는 필요 시 [nofollow](https://developers.google.com/search/docs/crawling-indexing/qualify-outbound-links?hl=ko#nofollow) 적용을 고려하세요.
- **깨진 상대 경로** — 존재하지 않는 페이지로 가는 상대 링크(`../category/stuff` 등)가 잘못 배치되면 잘못된 URL이 무한히 생성될 수 있습니다. **상위 상대 URL 대신 루트 상대 URL**을 사용하세요.

---

## 4. 크롤링·색인 문제 대응

URL 구조 때문에 크롤링에 문제가 있다면:

1. **robots.txt** 로 문제가 되는 URL(동적 검색 결과, 정렬/필터, 무한 캘린더 등)에 대한 Googlebot 접근을 제한합니다.
2. Search Console 등에서 **속성 탐색·크롤링 설정**을 확인해 필요 시 URL 크롤링을 조정합니다.

---

## 5. 요약 체크리스트

- [ ] URL이 IETF STD 66을 준수하는가?
- [ ] 프래그먼트(`#`)로 콘텐츠를 바꾸지 않았는가? (SPA는 History API 사용)
- [ ] 매개변수는 `key=value&key2=value2` 형태로, 같은 키의 다중 값은 `,` 등으로 구분하는가?
- [ ] 읽기 쉬운 단어를 사용하는가? (긴 ID만 있는 URL 지양)
- [ ] 단어 구분에 하이픈(`-`)을 쓰는가? (밑줄 지양)
- [ ] 불필요한 매개변수·세션 ID를 줄였는가?
- [ ] 대소문자를 사이트 전반에서 일관되게 쓰는가?
- [ ] 다지역 사이트면 지역별 URL 구조가 명확한가?
- [ ] 문제되는 동적·무한 URL은 robots.txt로 차단했는가?

---

이 문서는 Google 검색 센터의 URL 구조 권장사항을 정리한 것입니다. 최신 내용은 [공식 문서](https://developers.google.com/search/docs/crawling-indexing/url-structure?hl=ko)를 참고하세요.
