// app/no-arm/page.tsx
'use client';

import React from 'react';
import { AppHeader, AppFooter } from '@/app/components';
import { Link } from 'lucide-react';

export default function NoArmPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">



            <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-24 pb-24 flex flex-col items-center justify-center">
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-primary-container/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Link className="w-10 h-10 text-primary" strokeWidth={1.5} />
                    </div>



                    <p className=" text-on-surface-variant max-w-md leading-7">
                        ورود به سرنخ در حال حاضر تنها از طریق لینک دعوت امکان‌پذیر است.
                        <br />
                        اگر لینک دعوت دارید، روی آن کلیک کنید و یا آنرا در نوار مرورگر کپی کنید و وارد شوید.
                    </p>
                </div>
            </main>


        </div>
    );
}