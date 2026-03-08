import { createSlice } from '@reduxjs/toolkit';

/** 장바구니 (휘발성. 필요 시 persist 추가) */
const initialState = {
  cartItems: [],
  orderItems: [],
  lastOrder: null,
};

const cart = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartItems: (state, { payload }) => {
      state.cartItems = Array.isArray(payload) ? payload : [];
    },
    setOrderItems: (state, { payload }) => {
      state.orderItems = Array.isArray(payload) ? payload : [];
    },
    setLastOrder: (state, { payload }) => {
      state.lastOrder = payload ?? null;
    },
    clearCart: () => initialState,
  },
});

export const { setCartItems, setOrderItems, setLastOrder, clearCart } = cart.actions;
export default cart.reducer;
