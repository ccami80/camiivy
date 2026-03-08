import { create } from 'zustand';

export const useVendorStore = create((set, get) => ({
  list: [],
  detail: null,
  loading: false,
  error: null,

  setList: (list) => set({ list, error: null }),
  setDetail: (detail) => set({ detail, error: null }),
  setLoading: (loading) => set({ loading, error: loading ? null : undefined }),
  setError: (error) => set({ error, loading: false }),

  /** Optimistic: 목록에서 한 건 상태 변경 (API 호출 전 UI 반영) */
  updateItemById: (id, patch) =>
    set((state) => ({
      list: state.list.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  reset: () => set({ list: [], detail: null, loading: false, error: null }),
}));
