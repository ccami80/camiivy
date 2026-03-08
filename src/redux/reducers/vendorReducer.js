import { createSlice } from '@reduxjs/toolkit';

/** 입점업체(파트너) 목록/상세 휘발성 상태 */
const initialState = {
  list: [],
  detail: null,
  loading: false,
  error: null,
};

const vendor = createSlice({
  name: 'vendor',
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
    updateItemById: (state, { payload }) => {
      const { id, ...patch } = payload || {};
      const item = state.list.find((p) => p.id === id);
      if (item) Object.assign(item, patch);
    },
    resetVendor: () => initialState,
  },
});

export const {
  setList,
  setDetail,
  setLoading,
  setError,
  updateItemById,
  resetVendor,
} = vendor.actions;
export default vendor.reducer;
