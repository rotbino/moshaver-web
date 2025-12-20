// app/sitemap.ts
import { MetadataRoute } from 'next';
import { provinces, specialties, skills } from '@/lib/data-service/mockData';

export default function sitemap(): MetadataRoute.Sitemap {
        const baseUrl = 'https://vakilyab.com';

        const urls = [
                {
                        url: baseUrl,
                        lastModified: new Date(),
                        changeFrequency: 'yearly' as const,
                        priority: 1,
                },
                {
                        url: `${baseUrl}/lawyers`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly' as const,
                        priority: 0.8,
                },
        ];

        // اضافه کردن URLهای استان‌ها
        provinces.forEach(province => {
                urls.push({
                        url: `${baseUrl}/lawyers?province=${province.name.replace(/\s+/g, '-').toLowerCase()}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly' as const,
                        priority: 0.7,
                });

                // اضافه کردن URLهای شهرها
                province.cities.forEach(city => {
                        urls.push({
                                url: `${baseUrl}/lawyers?province=${province.name.replace(/\s+/g, '-').toLowerCase()}&city=${city.name.replace(/\s+/g, '-').toLowerCase()}`,
                                lastModified: new Date(),
                                changeFrequency: 'weekly' as const,
                                priority: 0.6,
                        });
                });
        });

        // اضافه کردن URLهای تخصص‌ها
        specialties.forEach(specialty => {
                urls.push({
                        url: `${baseUrl}/lawyers?specialty=${specialty.title.replace(/\s+/g, '-').toLowerCase()}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly' as const,
                        priority: 0.5,
                });

                // ترکیب تخصص با استان‌ها
                provinces.forEach(province => {
                        urls.push({
                                url: `${baseUrl}/lawyers?province=${province.name.replace(/\s+/g, '-').toLowerCase()}&specialty=${specialty.title.replace(/\s+/g, '-').toLowerCase()}`,
                                lastModified: new Date(),
                                changeFrequency: 'weekly' as const,
                                priority: 0.4,
                        });
                });
        });

        // اضافه کردن URLهای مهارت‌ها
        skills.forEach(skill => {
                urls.push({
                        url: `${baseUrl}/lawyers?skills=${skill.title.replace(/\s+/g, '-').toLowerCase()}`,
                        lastModified: new Date(),
                        changeFrequency: 'weekly' as const,
                        priority: 0.4,
                });
        });

        return urls;
}