import { createSlice } from '@reduxjs/toolkit';
import { REHYDRATE } from 'redux-persist';

/** 인증 상태. user는 persist whitelist로 저장 */
const initialState = {
  user: null, // { email, role }
  isReady: false,
};

const auth = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, { payload }) => {
      state.user = payload;
      if (payload == null) state.isReady = true;
    },
    setAuthReady: (state, { payload }) => {
      state.isReady = payload !== false;
    },
    clearAuth: () => ({ ...initialState, isReady: true }),
  },
  extraReducers: (builder) => {
    builder.addCase(REHYDRATE, (state, action) => {
      if (action.payload?.auth != null) {
        state.user = action.payload.auth.user;
      }
      state.isReady = true;
    });
  },
});

export const { setUser, setAuthReady, clearAuth } = auth.actions;
export default auth.reducer;
