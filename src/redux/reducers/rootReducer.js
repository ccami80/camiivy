import { combineReducers } from '@reduxjs/toolkit';
import commonPersist from './commonPersistReducer';
import auth from './authReducer';
import wishlist from './wishlistReducer';
import recentlyViewed from './recentlyViewedReducer';
import cart from './cartReducer';
import product from './productReducer';
import vendor from './vendorReducer';

export default combineReducers({
  commonPersist,
  auth,
  wishlist,
  recentlyViewed,
  cart,
  product,
  vendor,
});
