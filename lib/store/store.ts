// lib/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import storage from './storage';
import authReducer from './slices/authSlice';
import locationReducer from './slices/locationSlice'; // افزودن اسلایس مکان

// پیکربندی persist برای auth slice
const authPersistConfig = {
    key: 'auth',
    storage,
    whitelist: ['user', 'isAuthenticated', 'accessToken','refreshToken'],
};

// پیکربندی persist برای location slice
const locationPersistConfig = {
    key: 'location',
    storage,
    whitelist: ['province', 'city'],
};

// ایجاد reducer با قابلیت persist
const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);
const persistedLocationReducer = persistReducer(locationPersistConfig, locationReducer);

export const store = configureStore({
    reducer: {
        auth: persistedAuthReducer,
        location: persistedLocationReducer, // افزودن اسلایس مکان
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
            },
        }),
});

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;