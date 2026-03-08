/**
 * 단일 API 클라이언트. 클라이언트에서는 axios를 직접 쓰지 말고 이 래퍼만 사용한다.
 * 메서드: api.get(), api.post(), api.patch(), api.delete()
 * 인자: { uri?, path, params?, data? }, 두 번째 인자로 옵션(timeout, headers 등)
 */
import axiosInstance from '@/lib/api/axiosInstance';

function handleError(err) {
  const status = err.response?.status;
  const message =
    err.response?.data?.error ||
    err.response?.data?.message ||
    err.message ||
    '요청 처리 중 오류가 발생했습니다.';
  if (status === 401) {
    // 필요 시 로그인 페이지로 리다이렉트 등
  }
  if (status === 403) {
    // 필요 시 권한 없음 처리
  }
  if (status === 404) {
    // 필요 시 not found 처리
  }
  if (status >= 500) {
    // 필요 시 서버 에러 안내
  }
  return Promise.reject(new Error(message));
}

const defaultConfig = {
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
};

function request(method, { uri, path, params, data }, options = {}) {
  const url =
    uri != null && uri !== ''
      ? `${String(uri).replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
      : path;
  const config = {
    method,
    url,
    params: params ?? undefined,
    data: data ?? undefined,
    ...defaultConfig,
    ...options,
    headers: { ...defaultConfig.headers, ...options.headers },
  };
  return axiosInstance.request(config).then((res) => res.data).catch(handleError);
}

export const api = {
  get(payload, options) {
    return request('GET', payload, options);
  },
  post(payload, options) {
    return request('POST', payload, options);
  },
  patch(payload, options) {
    return request('PATCH', payload, options);
  },
  delete(payload, options) {
    return request('DELETE', payload, options);
  },
};

export default api;
