import axios from 'axios';

const baseURL =
  typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL
    : '';

const instance = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  if (typeof window === 'undefined') return config;
  const adminToken = localStorage.getItem('adminToken');
  const partnerToken = localStorage.getItem('partnerToken');
  const userToken = localStorage.getItem('userToken');
  const token = config.headers?.Authorization ? null : adminToken || partnerToken || userToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.error ||
      err.response?.data?.message ||
      err.message ||
      '요청 처리 중 오류가 발생했습니다.';
    return Promise.reject(new Error(message));
  }
);

export default instance;
