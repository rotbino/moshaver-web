// app/lawyer/[id]/components/ReviewsSection.tsx
'use client';

import { Star } from 'lucide-react';
import { Review } from '@/lib/api/types';

interface ReviewsSectionProps {
    reviews: Review[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
    return (
        <div className="space-y-4 sm:space-y-6">
            {reviews?.map(review => (
                <div key={review.id} className="border-b pb-4 sm:pb-6 last:border-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                        <div className="flex items-center gap-2">
                            <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                    <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} />
                                ))}
                            </div>
                            <span className="font-medium text-sm sm:text-base">{review.userName}</span>
                        </div>
                        <span className="text-xs sm:text-sm text-gray-500">
              {new Date(review.createdAt).toLocaleDateString('fa-IR')}
            </span>
                    </div>
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed">
                        {review.comment}
                    </p>
                </div>
            ))}
            {(!reviews || reviews.length === 0) && (
                <div className="text-center py-8 sm:py-12">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <Star className="w-8 h-8 text-gray-400" />
                    </div>
                    <p className="text-gray-500 text-sm sm:text-base">هنوز نظری ثبت نشده است</p>
                </div>
            )}
        </div>
    );
}