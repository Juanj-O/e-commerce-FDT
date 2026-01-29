import { configureStore, combineReducers } from '@reduxjs/toolkit';
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import productsReducer from '../features/products/productsSlice';
import checkoutReducer from '../features/checkout/checkoutSlice';
import transactionReducer from '../features/transaction/transactionSlice';
import cartReducer from '../features/cart/cartSlice';
import notificationsReducer from '../features/notifications/notificationSlice';

const persistConfig = {
  key: 'ecommerce-root',
  version: 1,
  storage,
  whitelist: ['checkout', 'transaction', 'cart'], // Persist checkout, transaction and cart state
};

const rootReducer = combineReducers({
  products: productsReducer,
  checkout: checkoutReducer,
  transaction: transactionReducer,
  cart: cartReducer,
  notifications: notificationsReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
