import { create } from 'zustand';

export const useProductStore = create((set, get) => ({
  list: [],
  detail: null,
  loading: false,
  error: null,

  setList: (list) => set({ list, error: null }),
  setDetail: (detail) => set({ detail, error: null }),
  setLoading: (loading) => set({ loading, error: loading ? null : undefined }),
  setError: (error) => set({ error, loading: false }),

  /** Optimistic: 목록에서 한 건 승인상태 변경 */
  updateApprovalById: (id, approvalStatus, rejectionReason) =>
    set((state) => ({
      list: state.list.map((p) =>
        p.id === id
          ? { ...p, approvalStatus, rejectionReason: rejectionReason ?? p.rejectionReason }
          : p
      ),
    })),

  /** Optimistic: 목록에서 한 건 노출/순서 변경 */
  updateDisplayById: (id, patch) =>
    set((state) => ({
      list: state.list.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    })),

  /** Optimistic: 여러 건 순서 일괄 반영 (productIds 순서대로 displayOrder 0,1,2...) */
  setDisplayOrderByProductIds: (productIds) =>
    set((state) => {
      const orderMap = {};
      productIds.forEach((id, index) => {
        orderMap[id] = index;
      });
      return {
        list: state.list.map((p) =>
          orderMap[p.id] !== undefined ? { ...p, displayOrder: orderMap[p.id] } : p
        ),
      };
    }),

  reset: () => set({ list: [], detail: null, loading: false, error: null }),
}));
