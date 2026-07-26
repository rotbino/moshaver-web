// app/admin/arm/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Plus, Edit, Trash2, Eye, Search, Store, Users, Package, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api/apiService';

export default function AdminArmsPage() {
    const router = useRouter();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    const [arms, setArms] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

    const fetchArms = async () => {
        setLoading(true);
        try {
            const data = await apiService.admin.arms.getAll({
                page: pagination.page,
                limit: pagination.limit,
                search: search || undefined,
                status: statusFilter || undefined,
            });
            setArms(data.items);
            setPagination(data.pagination);
        } catch (error: any) {
            console.error('Error fetching arms:', error);
            toast.error(error?.message || 'خطا در دریافت لیست بازارها');
        } finally {
            setLoading(false);
        }
    };

    // ✅ وابسته کردن به isAuthenticated
    useEffect(() => {
        if (isAuthenticated) {
            fetchArms();
        }
    }, [isAuthenticated, pagination.page, search, statusFilter]);

    // ✅ اگر صفحه بارگذاری اولیه است و isAuthenticated true است، داده را واکشی کن
    useEffect(() => {
        if (isAuthenticated && arms.length === 0 && !loading) {
            fetchArms();
        }
    }, [isAuthenticated]);

    const handleDelete = async (id: string, name: string) => {
        if (!confirm(`آیا از حذف بازار"${name}" مطمئن هستید؟`)) return;
        try {
            await apiService.admin.arms.delete(id);
            toast.success('بازار با موفقیت حذف شد');
            fetchArms();
        } catch (error: any) {
            toast.error(error?.message || 'خطا در حذف بازار');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            active: 'bg-green-500/10 text-green-500',
            draft: 'bg-yellow-500/10 text-yellow-500',
            archived: 'bg-gray-500/10 text-gray-500',
        };
        const labels: Record<string, string> = {
            active: 'فعال',
            draft: 'پیش‌نویس',
            archived: 'بایگانی',
        };
        return (
            <span className={`px-2 py-0.5 text-xs rounded-full ${styles[status] || 'bg-gray-500/10 text-gray-500'}`}>
                {labels[status] || status}
            </span>
        );
    };

    // ============================================================
    // ✅ در حال بارگذاری
    // ============================================================
    if (loading && arms.length === 0) {
        return (
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-on-surface">مدیریت بازارها</h1>
                        <p className="text-sm text-on-surface-variant">لیست و مدیریت بازارهای سیستم</p>
                    </div>
                    <Link
                        href="/admin/arm/create"
                        className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 hover:bg-primary/90 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        بازارجدید
                    </Link>
                </div>
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-on-surface-variant">در حال بارگذاری...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* هدر */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-on-surface">مدیریت بازارها</h1>
                    <p className="text-sm text-on-surface-variant">لیست و مدیریت بازارهای سیستم</p>
                </div>
                <Link
                    href="/admin/arm/create"
                    className="flex items-center gap-2 bg-primary text-on-primary px-4 py-2 hover:bg-primary/90 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    بازارجدید
                </Link>
            </div>

            {/* فیلترها */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="جستجوی بازار..."
                        className="w-full bg-surface-container-lowest border border-outline h-11 px-4 pr-10 font-body-md text-right focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-surface-container-lowest border border-outline h-11 px-4 font-body-md text-right appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                >
                    <option value="">همه وضعیت‌ها</option>
                    <option value="active">فعال</option>
                    <option value="draft">پیش‌نویس</option>
                    <option value="archived">بایگانی</option>
                </select>
                <button
                    onClick={fetchArms}
                    className="bg-surface-container border border-outline px-4 h-11 hover:bg-surface-container-low transition-colors"
                >
                    اعمال فیلتر
                </button>
            </div>

            {/* لیست بازارها */}
            {loading ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
                    <p className="mt-4 text-on-surface-variant">در حال بارگذاری...</p>
                </div>
            ) : arms.length === 0 ? (
                <div className="text-center py-12 bg-surface-container-low border border-outline-variant">
                    <Store className="w-16 h-16 text-on-surface-variant/30 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-on-surface">هیچ بازاری یافت نشد</h3>
                    <p className="text-sm text-on-surface-variant">اولین بازارخود را ایجاد کنید</p>
                    <Link
                        href="/admin/arm/create"
                        className="inline-block mt-4 bg-primary text-on-primary px-6 py-2 hover:bg-primary/90 transition-colors"
                    >
                        ایجاد بازارجدید
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                        <tr className="border-b border-outline-variant">
                            <th className="text-right py-3 px-4 text-sm font-semibold text-on-surface-variant">نام</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-on-surface-variant">شناسه</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-on-surface-variant">وضعیت</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-on-surface-variant">اعضا</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-on-surface-variant">آگهی‌ها</th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-on-surface-variant">تاریخ ایجاد</th>
                            <th className="text-center py-3 px-4 text-sm font-semibold text-on-surface-variant">عملیات</th>
                        </tr>
                        </thead>
                        <tbody>
                        {arms.map((arm) => (
                            <tr key={arm.id} className="border-b border-outline-variant hover:bg-surface-container-low transition-colors">
                                <td className="py-3 px-4">
                                    <div>
                                        <div className="font-medium text-on-surface">{arm.name}</div>
                                        <div className="text-xs text-on-surface-variant">{arm.slogan}</div>
                                    </div>
                                </td>
                                <td className="py-3 px-4 text-sm text-on-surface-variant font-mono">{arm.slug}</td>
                                <td className="py-3 px-4">{getStatusBadge(arm.status)}</td>
                                <td className="py-3 px-4 text-sm text-on-surface">{arm._count?.memberships || 0}</td>
                                <td className="py-3 px-4 text-sm text-on-surface">{arm._count?.ads || 0}</td>
                                <td className="py-3 px-4 text-sm text-on-surface-variant">
                                    {new Date(arm.createdAt).toLocaleDateString('fa-IR')}
                                </td>
                                <td className="py-3 px-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <Link
                                            href={`/arm/${arm.slug}`}
                                            className="p-1.5 hover:bg-surface-container-low rounded transition-colors"
                                            title="مشاهده"
                                        >
                                            <Eye className="w-4 h-4 text-on-surface-variant" />
                                        </Link>
                                        <Link
                                            href={`/admin/arm/${arm.id}/edit`}
                                            className="p-1.5 hover:bg-primary/10 rounded transition-colors"
                                            title="ویرایش"
                                        >
                                            <Edit className="w-4 h-4 text-primary" />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(arm.id, arm.name)}
                                            className="p-1.5 hover:bg-error/10 rounded transition-colors"
                                            title="حذف"
                                        >
                                            <Trash2 className="w-4 h-4 text-error" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* صفحه‌بندی */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <span className="text-sm text-on-surface-variant">
                        نمایش {((pagination.page - 1) * pagination.limit) + 1} تا {Math.min(pagination.page * pagination.limit, pagination.total)} از {pagination.total}
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                            disabled={pagination.page === 1}
                            className="px-3 py-1 border border-outline hover:bg-surface-container-low transition-colors disabled:opacity-50"
                        >
                            قبلی
                        </button>
                        <span className="px-3 py-1 bg-primary/10 text-primary">
                            {pagination.page}
                        </span>
                        <button
                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.totalPages, prev.page + 1) }))}
                            disabled={pagination.page === pagination.totalPages}
                            className="px-3 py-1 border border-outline hover:bg-surface-container-low transition-colors disabled:opacity-50"
                        >
                            بعدی
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}