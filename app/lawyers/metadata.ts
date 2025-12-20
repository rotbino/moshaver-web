// app/lawyers/metadata.ts

import { Metadata } from 'next';
import { useSearchParams } from 'next/navigation';
import { provincesData, specialtyTitles, skillTitles } from '@/lib/data-service/mockData';

// تابع برای تولید متا تگ‌های داینامیک
export function generateMetadata(): Metadata {
    const searchParams = useSearchParams();

    const provinceParam = searchParams.get('province') as string || '';
    const cityParam = searchParams.get('city') as string || '';
    const specialtyParam = searchParams.get('specialty') as string || '';
    const skillsParam = searchParams.get('skills') as string || '';
    const searchQuery = searchParams.get('search') as string || '';

    // تبدیل پارامترها به نام‌های واقعی
    const provinceName = provinceParam ? provinceParam.replace(/-/g, ' ') : '';

    // تبدیل پارامتر شهر به نام‌های واقعی (پشتیبانی از چند شهر)
    let cityNames: string[] = [];
    if (cityParam) {
        cityNames = cityParam.split(',').map(name => name.trim().replace(/-/g, ' '));
    }

    const specialtyName = specialtyParam ? specialtyParam.replace(/-/g, ' ') : '';
    const skillName = skillsParam ? skillsParam.replace(/-/g, ' ') : '';

    // تولید عنوان صفحه
    let title = 'وکیل یاب - پلتفرم ارتباط با بهترین وکلا';
    if (specialtyName && provinceName) {
        title = `وکیل ${specialtyName} ${provinceName}${cityNames.length > 0 ? ` - ${cityNames.join(' و ')}` : ''} | وکیل یاب`;
    } else if (provinceName) {
        title = `وکیل ${provinceName}${cityNames.length > 0 ? ` - ${cityNames.join(' و ')}` : ''} | وکیل یاب`;
    } else if (specialtyName) {
        title = `وکیل ${specialtyName} در ایران | وکیل یاب`;
    } else if (skillName) {
        title = `وکیل با مهارت ${skillName} | وکیل یاب`;
    } else if (cityNames.length > 0) {
        title = `وکیل ${cityNames.join(' و ')} | وکیل یاب`;
    }

    // تولید توضیحات متا
    let description = 'پلتفرم جامع معرفی و ارتباط با وکلای متخصص در سراسر ایران';
    if (specialtyName && provinceName) {
        description = `جستجو و انتخاب بهترین وکلای ${specialtyName} در ${provinceName}${cityNames.length > 0 ? ` - ${cityNames.join(' و ')}` : ''}. مشاهده رزومه، تخصص‌ها و نظرات کاربران. رزرو آنلاین مشاوره حقوقی.`;
    } else if (provinceName) {
        description = `جستجو و انتخاب بهترین وکلای ${provinceName}${cityNames.length > 0 ? ` - ${cityNames.join(' و ')}` : ''}. مشاهده رزومه، تخصص‌ها و نظرات کاربران. رزرو آنلاین مشاوره حقوقی.`;
    } else if (specialtyName) {
        description = `جستجو و انتخاب بهترین وکلای ${specialtyName} در سراسر ایران. مشاهده رزومه، تخصص‌ها و نظرات کاربران. رزرو آنلاین مشاوره حقوقی.`;
    } else if (skillName) {
        description = `جستجو و انتخاب وکلای با مهارت ${skillName} در سراسر ایران. مشاهده رزومه، تخصص‌ها و نظرات کاربران. رزرو آنلاین مشاوره حقوقی.`;
    } else if (cityNames.length > 0) {
        description = `جستجو و انتخاب بهترین وکلای ${cityNames.join(' و ')}. مشاهده رزومه، تخصص‌ها و نظرات کاربران. رزرو آنلاین مشاوره حقوقی.`;
    }

    // تولید کلمات کلیدی
    let keywords = 'وکیل, وکیل پایه یک, وکیل متخصص, مشاوره حقوقی, بهترین وکیل, رزرو وکیل, وکیل آنلاین';
    if (specialtyName && provinceName) {
        keywords = `وکیل ${specialtyName} ${provinceName}, وکیل پایه یک ${specialtyName} ${provinceName}, وکیل ${specialtyName} ${cityNames.join(' و ')}, وکیل پایه یک ${specialtyName} ${cityNames.join(' و ')}, وکیل متخصص ${specialtyName} ${provinceName}, مشاوره حقوقی ${specialtyName} ${provinceName}, رزرو وکیل ${specialtyName} ${provinceName}`;
    } else if (provinceName) {
        keywords = `وکیل ${provinceName}, وکیل پایه یک ${provinceName}, وکیل ${cityNames.join(' و ')}, وکیل پایه یک ${cityNames.join(' و ')}, وکیل متخصص ${provinceName}, مشاوره حقوقی ${provinceName}, رزرو وکیل ${provinceName}`;
    } else if (specialtyName) {
        keywords = `وکیل ${specialtyName}, وکیل پایه یک ${specialtyName}, وکیل متخصص ${specialtyName}, مشاوره حقوقی ${specialtyName}, رزرو وکیل ${specialtyName}`;
    } else if (skillName) {
        keywords = `وکیل با مهارت ${skillName}, وکیل متخصص ${skillName}, مشاوره حقوقی ${skillName}, رزرو وکیل ${skillName}`;
    } else if (cityNames.length > 0) {
        keywords = `وکیل ${cityNames.join(' و ')}, وکیل پایه یک ${cityNames.join(' و ')}, وکیل متخصص ${cityNames.join(' و ')}, مشاوره حقوقی ${cityNames.join(' و ')}, رزرو وکیل ${cityNames.join(' و ')}`;
    }

    // تولید URL کانونیکال
    const params = new URLSearchParams();
    if (provinceParam) params.set('province', provinceParam);
    if (cityParam) params.set('city', cityParam);
    if (specialtyParam) params.set('specialty', specialtyParam);
    if (skillsParam) params.set('skills', skillsParam);

    const queryString = params.toString();
    const canonicalUrl = `https://vakilyab.com/lawyers${queryString ? `?${queryString}` : ''}`;

    return {
        title,
        description,
        keywords,
        authors: [{ name: 'وکیل یاب' }],
        creator: 'وکیل یاب',
        publisher: 'وکیل یاب',
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-video-preview': -1,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
        openGraph: {
            title,
            description,
            url: canonicalUrl,
            siteName: 'وکیل یاب',
            locale: 'fa_IR',
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
        },
        alternates: {
            canonical: canonicalUrl,
        },
        other: {
            'twitter:image': 'https://vakilyab.com/images/og-image.jpg',
            'og:image': 'https://vakilyab.com/images/og-image.jpg',
            'og:image:width': '1200',
            'og:image:height': '630',
            'og:image:alt': title,
        },
    };
}