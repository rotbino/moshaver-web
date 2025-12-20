// app/components/LocalStorageInitializer.tsx
'use client';

import { useEffect } from 'react';
import {initializeLocalStorage} from "@/lib/api/mockData";


export const LocalStorageInitializer = () => {
    useEffect(() => {
        // فقط در محیط توسعه، لاگ‌های بیشتری نمایش داده می‌شود
        if (process.env.NODE_ENV === 'development') {
            console.log('Initializing localStorage...');
        }

        initializeLocalStorage();

        if (process.env.NODE_ENV === 'development') {
            console.log('LocalStorage initialized successfully');
            console.log('Users:', JSON.parse(localStorage.getItem('users') || '[]'));
        }
    }, []);

    return null;
};