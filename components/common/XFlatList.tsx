import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader } from "@/components/radix/card";
import { Skeleton } from "@/components/radix/skeleton";

const XFlatList = ({
                       data = [],
                       renderItem,
                       keyExtractor,
                       ListEmptyComponent,
                       ListHeaderComponent,
                       ListFooterComponent,
                       loading = false,
                       error = null,
                       hasMore = false,
                       onLoadMore,
                       infiniteScroll = true,
                       showLoadMoreButton = true,
                       maxPages,
                       className = '',
                       itemClassName = '',
                       loaderClassName = '',
                       errorClassName = '',
                       loadMoreButtonClassName = '',
                       contentContainerStyle = {},
                       skeletonCount = 10, // تعداد اسکلتون‌ها در زمان لودینگ
                   }) => {
    const observer = useRef();

    // محاسبه اینکه آیا باید موارد بیشتری لود شود یا نه
    const shouldLoadMore = useCallback(() => {
        // اگر maxPages تنظیم شده باشه و به اون حد رسیده باشیم، دیگه لود نکن
        if (maxPages !== undefined && data.length > 0) {
            // فرض می‌کنیم هر صفحه 10 آیتم داره
            const currentPage = Math.ceil(data.length / 10);
            if (currentPage >= maxPages) {
                return false;
            }
        }
        return hasMore;
    }, [hasMore, data.length, maxPages]);

    const lastItemRef = useCallback(
        (node) => {
            if (loading || !shouldLoadMore()) return;
            if (observer.current) observer.current.disconnect();

            observer.current = new IntersectionObserver((entries) => {
                if (entries[0].isIntersecting && shouldLoadMore() && infiniteScroll) {
                    onLoadMore();
                }
            });

            if (node) observer.current.observe(node);
        },
        [loading, shouldLoadMore, infiniteScroll, onLoadMore]
    );

    // Render empty state
    const renderEmpty = () => {
        if (loading) return null;
        if (error) return null;
        if (data.length === 0) {
            return ListEmptyComponent || (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-bold text-gray-800 mb-2">موردی یافت نشد</h3>
                    <p className="text-gray-600 max-w-md">هیچ آیتمی برای نمایش وجود ندارد.</p>
                </div>
            );
        }
        return null;
    };

    // Render loading state با استفاده از اسکلتون
    const renderLoading = () => {
        if (!loading) return null;

        return (
            <div className={`space-y-3 ${loaderClassName}`}>
                {Array.from({ length: skeletonCount }).map((_, index) => (
                    <Card key={index} className={`border border-gray-200 ${itemClassName}`}>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>

                            <div className="flex items-center justify-between mb-2">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-6 w-20" />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1">
                                    <Skeleton className="h-3 w-3" />
                                    <Skeleton className="h-3 w-40" />
                                </div>
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    };

    // Render error state
    const renderError = () => {
        if (!error) return null;
        return (
            <Card className={`border border-red-200 bg-red-50 ${errorClassName}`}>
                <CardContent className="text-center py-6">
                    <div className="flex justify-center mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <p className="font-medium text-red-700">خطا در بارگذاری داده‌ها</p>
                    <p className="text-sm mt-1 text-red-600">{error.message || error}</p>
                    <button
                        onClick={onLoadMore}
                        className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition"
                    >
                        تلاش مجدد
                    </button>
                </CardContent>
            </Card>
        );
    };

    // Render load more button
    const renderLoadMoreButton = () => {
        // اصلاح شرط نمایش دکمه
        if (
            !showLoadMoreButton ||
            !shouldLoadMore() ||
            loading ||
            error ||
            data.length === 0
        ) {
            return null;
        }

        // حذف پیام "نمایش موارد تا صفحه X" و فقط نمایش دکمه
        return (
            <div className="flex justify-center py-4">
                <button
                    onClick={onLoadMore}
                    className={`px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition ${loadMoreButtonClassName}`}
                >
                    نمایش بیشتر
                </button>
            </div>
        );
    };

    return (
        <div className={`w-full ${className}`} style={contentContainerStyle}>
            {ListHeaderComponent}

            {renderEmpty()}
            {renderLoading()}
            {renderError()}

            {data.length > 0 && (
                <div className="space-y-3">
                    {data.map((item, index) => (
                        <Card
                            key={keyExtractor ? keyExtractor(item, index) : index}
                            ref={index === data.length - 1 ? lastItemRef : null}
                            className={`border border-gray-200 px-4 ${itemClassName}`}
                        >
                            {renderItem(item, index)}
                        </Card>
                    ))}
                </div>
            )}

            {ListFooterComponent}
            {renderLoadMoreButton()}
        </div>
    );
};

export default XFlatList;