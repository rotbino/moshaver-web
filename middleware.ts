// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { provinces } from '@/lib/data-service/mockData';
// برای قاطی نکردن دو تا مسیر صفحه شخصی و فیلتر وکلا نوشته شده
export function middleware(request: NextRequest) {
    const url = request.nextUrl;
    const pathname = url.pathname;

    // اگر مسیر با /lawyers/ شروع شود
    if (pathname.startsWith('/lawyers/')) {
        const segments = pathname.split('/').filter(Boolean); // حذف segmentهای خالی

        // اگر فقط یک segment بعد از lawyers وجود دارد (مثل /lawyers/tehran)
        if (segments.length === 2) {
            const provinceSlug = segments[1];

            // بررسی اینکه آیا این segment نام یک استان معتبر است
            const provinceNames = provinces.map(p => p.name.replace(/\s+/g, '-').toLowerCase());

            if (provinceNames.includes(provinceSlug)) {
                // این یک مسیر لیست وکلا با استان است
                return NextResponse.rewrite(new URL(`/lawyers/${provinceSlug}`, request.url));
            }
        }
        // اگر دو segment بعد از lawyers وجود دارد (مثل /lawyers/tehran/tehran)
        else if (segments.length === 3) {
            const provinceSlug = segments[1];
            const citySlug = segments[2];

            // بررسی اینکه آیا اولین segment نام یک استان معتبر است
            const provinceNames = provinces.map(p => p.name.replace(/\s+/g, '-').toLowerCase());

            if (provinceNames.includes(provinceSlug)) {
                // این یک مسیر لیست وکلا با استان و شهر است
                return NextResponse.rewrite(new URL(`/lawyers/${provinceSlug}/${citySlug}`, request.url));
            }
        }
        // اگر سه segment بعد از lawyers وجود دارد (مثل /lawyers/tehran/tehran/family)
        else if (segments.length === 4) {
            const provinceSlug = segments[1];
            const citySlug = segments[2];
            const specialtySlug = segments[3];

            // بررسی اینکه آیا اولین segment نام یک استان معتبر است
            const provinceNames = provinces.map(p => p.name.replace(/\s+/g, '-').toLowerCase());

            if (provinceNames.includes(provinceSlug)) {
                // این یک مسیر لیست وکلا با استان، شهر و تخصص است
                return NextResponse.rewrite(new URL(`/lawyers/${provinceSlug}/${citySlug}/${specialtySlug}`, request.url));
            }
        }
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/lawyers/:path*'],
};