// app/providers.tsx

'use client';

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from '@/lib/store/store';
import {ReactQueryProvider} from "@/lib/provider/QueryClientProvider";
import {Toaster} from "@/components/radix/toaster";
import {AuthProvider} from "@/lib/provider/auth-provider";



export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <PersistGate loading={null} persistor={persistor}>
                <ReactQueryProvider>
                    <AuthProvider>
                        {children}
                        <Toaster/>
                    </AuthProvider>
                </ReactQueryProvider>
            </PersistGate>
        </Provider>
    );
}