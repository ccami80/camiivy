import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  // API 통신 규칙: fetch/axios 직접 사용 금지 → @/utils/apis + @/utils/apiPaths 사용
  {
    files: ['src/**/*.js'],
    rules: {
      'no-restricted-syntax': [
        'error',
        {
          selector: "CallExpression[callee.name='fetch']",
          message:
            'fetch 사용 금지. API 호출은 @/utils/apis 의 api.get/post/patch/delete 와 @/utils/apiPaths 를 사용하세요. (.cursor/rules/api-communication.mdc)',
        },
      ],
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'axios',
              message:
                'axios 직접 사용 금지. @/utils/apis 의 api 객체를 사용하세요. (.cursor/rules/api-communication.mdc)',
            },
          ],
        },
      ],
    },
  },
  // axiosInstance.js 만 axios 사용 허용 (api 래퍼 내부)
  {
    files: ['src/lib/api/axiosInstance.js'],
    rules: {
      'no-restricted-imports': 'off',
    },
  },
]);

export default eslintConfig;
