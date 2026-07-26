import Link from 'next/link';
import { Button } from '@/components/radix/button';
import { Card, CardContent } from '@/components/radix/card';
import { Home } from 'lucide-react';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center py-8 px-4">
            <Card className="w-full max-w-md">
                <CardContent className="p-8 text-center">
                    <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">صفحه یافت نشد</h2>
                    <p className="text-gray-600 mb-6">
                        متأسفانه صفحه‌ای که به دنبال آن بودید وجود ندارد.
                    </p>

                </CardContent>
            </Card>
        </div>
    );
}