'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/redux/store';
import { AuthTokenSync } from '@/components/helper/AuthTokenSync';

/** Redux Provider + PersistGate. layout에서 최상위에 한 번만 사용 */
export function ReduxProvider({ children }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AuthTokenSync />
        {children}
      </PersistGate>
    </Provider>
  );
}
