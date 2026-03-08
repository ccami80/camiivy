import { createSlice } from '@reduxjs/toolkit';

const MAX_ITEMS = 10;

/** 최근 본 상품. items는 persist whitelist로 저장 */
const initialState = {
  items: [], // [{ id, name, imageUrl }]
};

const recentlyViewed = createSlice({
  name: 'recentlyViewed',
  initialState,
  reducers: {
    setRecentlyViewedItems: (state, { payload }) => {
      state.items = (Array.isArray(payload) ? payload : []).slice(0, MAX_ITEMS);
    },
    addRecentlyViewedItem: (state, { payload }) => {
      if (!payload?.id) return;
      const entry = {
        id: String(payload.id),
        name: payload.name || '',
        imageUrl: payload.imageUrl ?? null,
      };
      const filtered = state.items.filter((p) => p.id !== entry.id);
      state.items = [entry, ...filtered].slice(0, MAX_ITEMS);
    },
    removeRecentlyViewedItem: (state, { payload }) => {
      const id = String(payload);
      state.items = state.items.filter((p) => p.id !== id);
    },
    removeRecentlyViewedItems: (state, { payload }) => {
      const ids = new Set((Array.isArray(payload) ? payload : []).map((id) => String(id)));
      state.items = state.items.filter((p) => !ids.has(p.id));
    },
    clearRecentlyViewed: () => initialState,
  },
});

export const {
  setRecentlyViewedItems,
  addRecentlyViewedItem,
  removeRecentlyViewedItem,
  removeRecentlyViewedItems,
  clearRecentlyViewed,
} = recentlyViewed.actions;
export default recentlyViewed.reducer;
