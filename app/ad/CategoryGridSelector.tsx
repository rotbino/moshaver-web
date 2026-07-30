// components/ad/CategoryGridSelector.tsx
'use client';

import React, { useState, useMemo } from 'react';
import { Search, ChevronLeft, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryNode {
    id: string;
    title: string;
    slug: string;
    path: string;
    level: number;
    isSelected: boolean;
    customLabel: string | null;
    defaultUnitId: string | null;
    unitTitle: string;
    unitShortCode: string;
    defaultMinQuantity: number | null;
    example: string;
    children: CategoryNode[];
}

interface CategoryGridSelectorProps {
    categoryTree: CategoryNode[];
    selectedCategoryId: string;
    onSelect: (categoryId: string) => void;
    error?: string;
}

export function CategoryGridSelector({
                                         categoryTree,
                                         selectedCategoryId,
                                         onSelect,
                                         error,
                                     }: CategoryGridSelectorProps) {
    const [searchQuery, setSearchQuery] = useState('');
    // سطح فعلی که نشان می‌دهیم (برای حالت درختی)
    const [currentLevel, setCurrentLevel] = useState<CategoryNode[]>([]);
    // مسیر طی‌شده برای breadcrumb
    const [breadcrumb, setBreadcrumb] = useState<CategoryNode[]>([]);

    // آیا اصلاً درختی هست؟ (وجود children در هر گره‌ای)
    const isTree = useMemo(() => {
        return categoryTree.some(node => node.children && node.children.length > 0);
    }, [categoryTree]);

    // تمام برگ‌های قابل انتخاب (برای جستجو و حالت لیست)
    const allLeaves = useMemo(() => {
        const flatten = (nodes: CategoryNode[]): CategoryNode[] => {
            let result: CategoryNode[] = [];
            for (const node of nodes) {
                if (node.isSelected) {
                    result.push(node);
                }
                if (node.children?.length) {
                    result = result.concat(flatten(node.children));
                }
            }
            return result;
        };
        return flatten(categoryTree);
    }, [categoryTree]);

    // وقتی categoryTree تغییر کند، به ریشه برگرد
    React.useEffect(() => {
        setCurrentLevel(categoryTree);
        setBreadcrumb([]);
    }, [categoryTree]);

    // گره‌هایی که در این سطح نشان می‌دهیم (با توجه به جستجو یا حالت عادی)
    const displayNodes = useMemo(() => {
        if (searchQuery.trim()) {
            return allLeaves.filter(node => node.title.includes(searchQuery.trim()));
        }
        return currentLevel;
    }, [searchQuery, allLeaves, currentLevel]);

    // پیمایش به داخل یک گره (در حالت درختی و بدون جستجو)
    const drillDown = (node: CategoryNode) => {
        if (node.children && node.children.length > 0 && !searchQuery.trim()) {
            setBreadcrumb(prev => [...prev, node]);
            setCurrentLevel(node.children);
        } else {
            // برگ یا در حالت جستجو: انتخاب نهایی
            onSelect(node.id);
        }
    };

    // بازگشت به سطح قبلی
    const goBack = () => {
        if (breadcrumb.length === 0) return;
        const newBreadcrumb = [...breadcrumb];
        newBreadcrumb.pop();
        setBreadcrumb(newBreadcrumb);

        if (newBreadcrumb.length === 0) {
            setCurrentLevel(categoryTree);
        } else {
            setCurrentLevel(newBreadcrumb[newBreadcrumb.length - 1].children || []);
        }
    };

    return (
        <div className="space-y-3">
            {/* نوار جستجو */}
            <div className="relative">
                <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="جستجوی دسته‌بندی..."
                    className="w-full h-10 bg-surface-container-lowest border border-outline px-4 pr-10 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none rounded-lg"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant pointer-events-none" />
            </div>

            {/* Breadcrumb (فقط در حالت درختی و بدون جستجو) */}
            {isTree && !searchQuery.trim() && breadcrumb.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-on-surface-variant overflow-x-auto py-1">
                    <button
                        type="button"
                        onClick={() => {
                            setBreadcrumb([]);
                            setCurrentLevel(categoryTree);
                        }}
                        className="text-primary hover:underline whitespace-nowrap"
                    >
                        همه دسته‌ها
                    </button>
                    {breadcrumb.map((node, idx) => (
                        <React.Fragment key={node.id}>
                            <ChevronLeft className="w-3 h-3 flex-shrink-0" />
                            <button
                                type="button"
                                onClick={() => {
                                    const newBreadcrumb = breadcrumb.slice(0, idx + 1);
                                    setBreadcrumb(newBreadcrumb);
                                    setCurrentLevel(node.children || []);
                                }}
                                className={cn(
                                    "hover:underline whitespace-nowrap",
                                    idx === breadcrumb.length - 1 ? "text-on-surface font-medium" : "text-on-surface-variant"
                                )}
                            >
                                {node.title}
                            </button>
                        </React.Fragment>
                    ))}
                </div>
            )}

            {/* دکمه بازگشت (درخت، بدون جستجو) */}
            {isTree && !searchQuery.trim() && breadcrumb.length > 0 && (
                <button
                    type="button"
                    onClick={goBack}
                    className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                    <ArrowLeft className="w-3 h-3" />
                    بازگشت به {breadcrumb[breadcrumb.length - 1]?.title || 'قبلی'}
                </button>
            )}

            {/* شبکه انتخاب */}
            <div className="max-h-[280px] sm:max-h-[500px] overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                {displayNodes.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {displayNodes.map((node) => {
                            const isCurrent = selectedCategoryId === node.id;
                            const hasChildren = node.children && node.children.length > 0;
                            const isDrillable = isTree && hasChildren && !searchQuery.trim();

                            return (
                                <button
                                    key={node.id}
                                    type="button"
                                    onClick={() => drillDown(node)}
                                    className={cn(
                                        "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all text-center relative",
                                        isCurrent
                                            ? "border-primary bg-primary/5 shadow-sm"
                                            : "border-outline-variant/50 hover:border-primary/30 hover:bg-surface-container-low"
                                    )}
                                >
                                    <span className={cn(
                                        "text-sm font-bold leading-tight",
                                        isCurrent ? "text-primary" : "text-on-surface"
                                    )}>
                                        {node.title}
                                    </span>
                                    {/* نمایش واحد فقط برای برگ‌های قابل انتخاب */}
                                    {node.isSelected && (
                                        <span className="text-[10px] text-on-surface-variant mt-1">
                                            واحد: {node.unitTitle}
                                        </span>
                                    )}
                                    {/* اگر گره غیرقابل انتخاب ولی دارای فرزند باشد */}
                                    {isDrillable && !node.isSelected && (
                                        <span className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-1">
                                            زیرشاخه‌ها <ArrowLeft className="w-3 h-3" />
                                        </span>
                                    )}
                                    {/* اگر گره قابل انتخاب و دارای فرزند (نادر ولی ممکن) */}
                                    {isDrillable && node.isSelected && (
                                        <span className="text-[10px] text-on-surface-variant mt-1 flex items-center gap-1">
                                            زیرشاخه‌ها <ArrowLeft className="w-3 h-3" />
                                        </span>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6 text-sm text-on-surface-variant">
                        {searchQuery ? `دسته‌بندی با نام "${searchQuery}" یافت نشد` : 'دسته‌بندی وجود ندارد'}
                    </div>
                )}
            </div>

            {error && <p className="text-error text-xs mt-2">{error}</p>}
        </div>
    );
}