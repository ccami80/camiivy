import { createSlice } from '@reduxjs/toolkit';

/** 찜 목록. items는 persist whitelist로 저장 */
const initialState = {
  items: [], // [{ id, name, imageUrl, basePrice? }]
};

const wishlist = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlistItems: (state, { payload }) => {
      state.items = Array.isArray(payload) ? payload : [];
    },
    addWishlistItem: (state, { payload }) => {
      if (!payload?.id) return;
      const id = String(payload.id);
      if (state.items.some((p) => p.id === id)) return;
      state.items.push({
        id,
        name: payload.name || '',
        imageUrl: payload.imageUrl ?? null,
        basePrice: payload.basePrice,
      });
    },
    removeWishlistItem: (state, { payload }) => {
      const id = String(payload);
      state.items = state.items.filter((p) => p.id !== id);
    },
    removeWishlistItems: (state, { payload }) => {
      const ids = new Set((Array.isArray(payload) ? payload : []).map((id) => String(id)));
      state.items = state.items.filter((p) => !ids.has(p.id));
    },
    toggleWishlistItem: (state, { payload }) => {
      if (!payload?.id) return;
      const id = String(payload.id);
      const idx = state.items.findIndex((p) => p.id === id);
      if (idx >= 0) {
        state.items.splice(idx, 1);
      } else {
        state.items.push({
          id,
          name: payload.name || '',
          imageUrl: payload.imageUrl ?? null,
          basePrice: payload.basePrice,
        });
      }
    },
    clearWishlist: () => initialState,
  },
});

export const {
  setWishlistItems,
  addWishlistItem,
  removeWishlistItem,
  removeWishlistItems,
  toggleWishlistItem,
  clearWishlist,
} = wishlist.actions;
export default wishlist.reducer;
