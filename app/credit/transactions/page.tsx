// app/credit/transactions/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { FormHeader } from '@/app/components';
import { apiService } from '@/lib/api/apiService';
import { toast } from 'sonner';
import { Loader2, Phone, CheckCircle, XCircle, Clock, CreditCard, Banknote, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';

type Transaction = {
    id: string;
    amount: number;
    creditCount: number;
    status: 'pending' | 'success' | 'failed' | 'approved' | 'rejected';
    transactionType: 'purchase' | 'credit_request';
    description: string;
    createdAt: string;
    metadata: any;
    armId: string;
    paymentMethod: 'online' | 'manual';
    isRequest: boolean;
};

export default function TransactionsPage() {
    const { currentArm } = useSelector((state: RootState) => state.arm);
    const supportConfig = (currentArm?.config as any)?.support || {};
    const supportPhone = supportConfig.mobile || supportConfig.phone || null;
    const supportName = supportConfig.name || 'پشتیبانی';

    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'online' | 'manual'>('all');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('all');
    const [pagination, setPagination] = useState({ limit: 20, offset: 0, total: 0 });

    useEffect(() => {
        fetchTransactions();
    }, [filter, statusFilter]); // بازآوری با تغییر فیلترها

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const params: any = {
                limit: pagination.limit,
                offset: pagination.offset,
            };
            if (filter !== 'all') params.paymentMethod = filter;
            if (statusFilter !== 'all') params.status = statusFilter;

            const response = await apiService.credit.getCombinedTransactions(params);
            setTransactions(response.transactions || []);
            setPagination(response.pagination || { limit: 20, offset: 0, total: 0 });
        } catch (error: any) {
            toast.error(error?.message || 'خطا در دریافت تراکنش‌ها');
            setTransactions([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (tx: Transaction) => {
        const status = tx.status;
        const isRequest = tx.isRequest;

        if (status === 'success' || status === 'approved') {
            return (
                <span className="text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" />
                    {isRequest ? 'تایید شده' : 'موفق'}
                </span>
            );
        }
        if (status === 'pending') {
            return (
                <span className="text-yellow-600 bg-yellow-50 px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    در انتظار
                </span>
            );
        }
        if (status === 'failed' || status === 'rejected') {
            return (
                <span className="text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full text-xs flex items-center gap-1">
                    <XCircle className="w-3 h-3" />
                    {isRequest ? 'رد شده' : 'ناموفق'}
                </span>
            );
        }
        return <span className="text-xs">{status}</span>;
    };

    const getMethodIcon = (tx: Transaction) => {
        if (tx.paymentMethod === 'online') {
            return <CreditCard className="w-3.5 h-3.5 text-blue-500" />;
        }
        return <Banknote className="w-3.5 h-3.5 text-amber-500" />;
    };

    const getAmountIcon = (tx: Transaction) => {
        if (tx.creditCount > 0) {
            return <ArrowUpRight className="w-3.5 h-3.5 text-green-500" />;
        } else if (tx.creditCount < 0) {
            return <ArrowDownRight className="w-3.5 h-3.5 text-red-500" />;
        }
        return null;
    };

    return (
        <div className="min-h-screen bg-surface pb-24">
            <FormHeader title="پرداخت‌های من" backUrl="/" />
            <main className="max-w-lg mx-auto px-4 pt-20">

                {/* فیلترها */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-outline-variant/30 mb-4">
                    <div className="flex gap-2 mb-3">
                        {(['all', 'online', 'manual'] as const).map(m => (
                            <button
                                key={m}
                                onClick={() => setFilter(m)}
                                className={cn(
                                    "px-4 py-1.5 rounded-full text-xs font-medium border transition-all",
                                    filter === m
                                        ? "bg-primary text-white border-primary"
                                        : "border-outline-variant/50 hover:border-primary/30 text-on-surface-variant"
                                )}
                            >
                                {m === 'all' ? 'همه' : m === 'online' ? 'آنلاین' : 'کارت به کارت'}
                            </button>
                        ))}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {(['all', 'pending', 'success', 'failed'] as const).map(s => (
                            <button
                                key={s}
                                onClick={() => setStatusFilter(s)}
                                className={cn(
                                    "px-3 py-1 rounded-full text-[10px] font-medium border transition-all",
                                    statusFilter === s
                                        ? "bg-gray-200 border-gray-300 text-on-surface"
                                        : "border-outline-variant/30 text-on-surface-variant/60 hover:border-outline-variant"
                                )}
                            >
                                {s === 'all' ? 'همه وضعیت‌ها' :
                                    s === 'pending' ? 'در انتظار' :
                                        s === 'success' ? 'موفق' : 'ناموفق'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* لیست تراکنش‌ها */}
                {loading ? (
                    <div className="flex justify-center py-16">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    </div>
                ) : transactions.length === 0 ? (
                    <div className="text-center py-16 text-on-surface-variant/60">
                        <p className="text-sm">هیچ تراکنشی یافت نشد</p>
                        <p className="text-xs mt-1">با خرید اعتبار، اولین تراکنش خود را ثبت کنید</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map(tx => (
                            <div
                                key={tx.id}
                                className="bg-white p-4 rounded-2xl border border-outline-variant/30 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            {getMethodIcon(tx)}
                                            <p className="font-medium text-sm text-on-surface truncate">
                                                {tx.description}
                                            </p>
                                            {tx.isRequest && (
                                                <span className="text-[9px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">فیش</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                            <span className="text-[10px] text-on-surface-variant/60">
                                                {new Date(tx.createdAt).toLocaleDateString('fa-IR', {
                                                    year: 'numeric',
                                                    month: '2-digit',
                                                    day: '2-digit',
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                            {getStatusBadge(tx)}
                                            {tx.creditCount !== 0 && (
                                                <span className="text-[10px] text-on-surface-variant/50">
                                                    {tx.creditCount > 0 ? '+' : ''}{tx.creditCount} اعتبار
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right flex-shrink-0 mr-2">
                                        <div className="flex items-center gap-1 justify-end">
                                            {getAmountIcon(tx)}
                                            <p className={cn(
                                                "font-bold text-sm",
                                                tx.creditCount > 0 ? "text-green-600" :
                                                    tx.creditCount < 0 ? "text-red-600" :
                                                        "text-on-surface-variant"
                                            )}>
                                                {tx.creditCount > 0 ? '+' : ''}{tx.creditCount}
                                            </p>
                                        </div>
                                        <p className="text-[10px] text-on-surface-variant/50">
                                            {tx.amount.toLocaleString()} تومان
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* دکمه تماس با پشتیبان */}
                {supportPhone && (
                    <div className="mt-6 flex justify-center border-t border-outline-variant/20 pt-6">
                        <button
                            type="button"
                            onClick={() => window.location.href = `tel:${supportPhone}`}
                            className="flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors"
                        >
                            <Phone className="w-4 h-4" />
                            <span>
                                {supportName && `${supportName} - `}
                                سوال در مورد پرداخت و اعتبار؟ با پشتیبان تماس بگیرید
                            </span>
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}