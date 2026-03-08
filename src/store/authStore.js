import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  list: null,
  detail: null,
  loading: false,
  error: null,

  setLoading: (loading) => set({ loading, error: loading ? null : undefined }),
  setError: (error) => set({ error, loading: false }),
  setDetail: (detail) => set({ detail, error: null }),
  reset: () => set({ list: null, detail: null, loading: false, error: null }),
}));
