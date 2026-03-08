import { createSlice } from '@reduxjs/toolkit';

/** 상품 목록/상세 (관리자·입점업체용 휘발성 상태) */
const initialState = {
  list: [],
  detail: null,
  loading: false,
  error: null,
};

const product = createSlice({
  name: 'product',
  initialState,
  reducers: {
    setList: (state, { payload }) => {
      state.list = Array.isArray(payload) ? payload : [];
      state.error = null;
    },
    setDetail: (state, { payload }) => {
      state.detail = payload ?? null;
      state.error = null;
    },
    setLoading: (state, { payload }) => {
      state.loading = payload === true;
      if (payload) state.error = null;
    },
    setError: (state, { payload }) => {
      state.error = payload ?? null;
      state.loading = false;
    },
    updateApprovalById: (state, { payload }) => {
      const { id, approvalStatus, rejectionReason } = payload || {};
      const item = state.list.find((p) => p.id === id);
      if (item) {
        item.approvalStatus = approvalStatus;
        if (rejectionReason !== undefined) item.rejectionReason = rejectionReason;
      }
    },
    updateDisplayById: (state, { payload }) => {
      const { id, ...patch } = payload || {};
      const item = state.list.find((p) => p.id === id);
      if (item) Object.assign(item, patch);
    },
    setDisplayOrderByProductIds: (state, { payload }) => {
      const productIds = Array.isArray(payload) ? payload : [];
      const orderMap = {};
      productIds.forEach((id, index) => {
        orderMap[id] = index;
      });
      state.list.forEach((p) => {
        if (orderMap[p.id] !== undefined) p.displayOrder = orderMap[p.id];
      });
    },
    resetProduct: () => initialState,
  },
});

export const {
  setList,
  setDetail,
  setLoading,
  setError,
  updateApprovalById,
  updateDisplayById,
  setDisplayOrderByProductIds,
  resetProduct,
} = product.actions;
export default product.reducer;
