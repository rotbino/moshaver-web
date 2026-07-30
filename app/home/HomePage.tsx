// app/home/HomePage.tsx
'use client';
import { FiltersProvider } from '@/lib/hooks/useFilters';
import HomeContent from './HomeContent';

export default function HomePage() {
    return (
        <FiltersProvider>
            <HomeContent />
        </FiltersProvider>
    );
}