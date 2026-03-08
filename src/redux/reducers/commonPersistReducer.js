import { createSlice } from '@reduxjs/toolkit';

/** 영구 저장: activeDomain, selectedProfileType 등 (persist whitelist) */
const initialState = {
  activeDomain: null,
  selectedProfileType: null,
};

const commonPersist = createSlice({
  name: 'commonPersist',
  initialState,
  reducers: {
    setActiveDomain: (state, { payload }) => {
      state.activeDomain = payload;
    },
    setSelectedProfileType: (state, { payload }) => {
      state.selectedProfileType = payload;
    },
    clearCommonPersist: () => initialState,
  },
});

export const { setActiveDomain, setSelectedProfileType, clearCommonPersist } =
  commonPersist.actions;
export default commonPersist.reducer;
