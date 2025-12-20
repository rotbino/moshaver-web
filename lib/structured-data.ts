// lib/structured-data.ts

export function generateLawyersStructuredData(
    province: string,
    city: string | string[],
    specialty?: string,
    skills: string[] = []
) {
    const baseUrl = 'https://vakilyab.com';

    // تبدیل city به رشته برای نمایش
    const cityString = Array.isArray(city) ? city.join(' و ') : city || '';

    // برای URL، اگر city آرایه باشد، آن را با کاما جدا می‌کنیم
    const cityUrlPart = Array.isArray(city)
        ? city.map(c => c.replace(/\s+/g, '-').toLowerCase()).join(',')
        : city ? city.replace(/\s+/g, '-').toLowerCase() : '';

    return {
        '@context': 'https://schema.org',
        '@type': 'LegalService',
        name: specialty
            ? `وکیل ${specialty} در ${province}${cityString ? ` - ${cityString}` : ''}`
            : `وکیل در ${province}${cityString ? ` - ${cityString}` : ''}`,
        description: specialty
            ? `مشاوره با وکلای متخصص${specialty ? ` ${specialty}` : ''}${skills && skills.length > 0 ? ` با مهارت ${skills.join(' و ')}` : ''} در ${province}${cityString ? ` - ${cityString}` : ''}`
            : `مشاوره با وکلای متخصص${specialty ? ` ${specialty}` : ''}${skills && skills.length > 0 ? ` با مهارت ${skills.join(' و ')}` : ''} در سراسر ایران`,
        url: `${baseUrl}/lawyers${province ? `/${province.replace(/\s+/g, '-').toLowerCase()}` : ''}${cityUrlPart ? `?city=${cityUrlPart}` : ''}${specialty ? `${cityUrlPart ? '&' : '?'}specialty=${specialty.replace(/\s+/g, '-').toLowerCase()}` : ''}${skills && skills.length > 0 ? `${specialty || cityUrlPart ? '&' : '?'}skills=${skills.map(s => s.replace(/\s+/g, '-').toLowerCase()).join(',')}` : ''}`,
        telephone: '+982188776655',
        address: {
            '@type': 'PostalAddress',
            addressLocality: province,
            addressRegion: cityString || province,
        },
        openingHours: 'Mo-Fr 09:00-18:00',
        serviceType: specialty ? [`وکیل ${specialty}`] : ['مشاوره حقوقی'],
        areaServed: province,
    };
}