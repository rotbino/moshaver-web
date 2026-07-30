// app/credit/purchase/page.tsx
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { FormHeader } from '@/app/components';
import { useCreditBalance, usePurchaseCredit } from '@/lib/api/apiHooks';
import { toast } from 'sonner';
import { CreditCard, Banknote, Loader2, Shield, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NumberInput } from "@/components/common";
import { FileUploader } from '@/components/common/FileUploader';
import { apiService } from '@/lib/api/apiService';

export default function PurchaseCreditPage() {
    const router = useRouter();
    const { currentArm } = useSelector((state: RootState) => state.arm);
    const { data: balance, refetch: refetchBalance } = useCreditBalance();
    const purchaseCredit = usePurchaseCredit();

    // ============================================================
    // ✅ State
    // ============================================================
    const [creditCount, setCreditCount] = useState(10);
    const [paymentMethod, setPaymentMethod] = useState<'online' | 'manual'>('online');
    const [selectedGateway, setSelectedGateway] = useState<string | null>(null);
    const [receiptFileId, setReceiptFileId] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    // ============================================================
    // ✅ خواندن تنظیمات از config بازو
    // ============================================================
    const armConfig = currentArm?.config as any || {};
    const paymentConfig = armConfig.payment || {};
    const economyConfig = armConfig.economy || {};

    const currency = economyConfig.currency || 'IRR';
    const currencySymbol = {
        'IRR': 'تومان',
        'IRR1': 'ریال',
        'USD': 'دلار',
        'EUR': 'یورو',
        'BTC': 'بیت‌کوین',
    }[currency] || 'تومان';

    const creditPrice = economyConfig.creditPrice || 2000;
    const totalAmount = creditCount * creditPrice;

    // ✅ درگاه‌های فعال
    const enabledGateways = useMemo(() => {
        const gateways = paymentConfig.gateways || [];
        return gateways.filter((g: any) => g.enabled === true);
    }, [paymentConfig.gateways]);

    const onlineAvailable = paymentConfig.paymentMode !== 'manual_only' && enabledGateways.length > 0;
    const manualAvailable = paymentConfig.paymentMode !== 'online_only' && paymentConfig.manual?.enabled === true;

    const quickCredits = [10, 20, 50, 100, 500, 1000];

    const gatewayNameMap: Record<string, string> = {
        'pec': 'پارسیان',
        'zarinpal': 'زرین‌پال',
        'rayanpay': 'رایان‌پی',
    };

    // ✅ تنظیم پیش‌فرض روش پرداخت و درگاه
    useEffect(() => {
        if (!onlineAvailable && manualAvailable) {
            setPaymentMethod('manual');
        } else if (onlineAvailable && !manualAvailable) {
            setPaymentMethod('online');
        }

        // ✅ اگر فقط یک درگاه فعال هست، همان انتخاب شود
        if (enabledGateways.length === 1) {
            setSelectedGateway(enabledGateways[0].name);
        }
    }, [onlineAvailable, manualAvailable, enabledGateways]);

    // ============================================================
    // ✅ آپلود فیش
    // ============================================================
    const handleReceiptUpload = async (file: File) => {
        setIsUploading(true);
        setUploadError(null);

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('model', 'Credit');
            formData.append('modelId', 'temp');
            formData.append('fieldKey', 'receipt');

            const result = await apiService.file.upload(formData);
            setReceiptFileId(result.id);
            setSelectedFile(file);
            toast.success('تصویر رسید با موفقیت آپلود شد');
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadError(error?.message || 'خطا در آپلود تصویر');
            toast.error(error?.message || 'خطا در آپلود تصویر');
        } finally {
            setIsUploading(false);
        }
    };

    // ============================================================
    // ✅ حذف فیش
    // ============================================================
    const handleRemoveReceipt = () => {
        setReceiptFileId(null);
        setSelectedFile(null);
        setUploadError(null);
    };

    // ============================================================
    // ✅ پرداخت
    // ============================================================
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (creditCount <= 0) {
            toast.error('لطفاً تعداد اعتبار معتبر وارد کنید');
            return;
        }

        if (totalAmount < 1000) {
            toast.error('حداقل مبلغ خرید ۱۰۰۰ تومان است');
            return;
        }

        if (paymentMethod === 'manual' && !receiptFileId) {
            toast.error('لطفاً تصویر رسید را آپلود کنید');
            return;
        }

        setIsSubmitting(true);
        try {
            const result = await purchaseCredit.mutateAsync({
                amount: totalAmount,
                paymentMethod,
                armId: currentArm?.id,
                gateway: paymentMethod === 'online' ? selectedGateway || undefined : undefined,
                ...(paymentMethod === 'manual' && {
                    receiptImage: receiptFileId || undefined,
                }),
                description: `خرید ${creditCount} اعتبار (${creditPrice} تومان هر اعتبار)`,
                creditCount,
            });

            // ✅ اگر پرداخت آنلاین و آدرس پرداخت وجود داشت، هدایت کن
            if (paymentMethod === 'online' && result.payment_url) {
                debugger
                window.location.href = result.payment_url;
            } else {
                toast.success('درخواست خرید ثبت شد');
                await refetchBalance();
                router.push('/profile');
            }
        } catch (error: any) {
            console.error('Purchase error:', error);
            toast.error(error?.message || 'خطا در پرداخت');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-surface pb-24">
            <FormHeader title="خرید اعتبار" backUrl="/" />

            <main className="flex-1 w-full max-w-lg mx-auto px-4 pt-20">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* موجودی فعلی */}
                    <div className="bg-white p-5 rounded-2xl border border-outline-variant/50 shadow-sm text-center">
                        <p className="text-sm text-on-surface-variant">موجودی اعتبار شما</p>
                        <p className="text-3xl font-bold text-primary mt-1">
                            {balance?.balance?.toLocaleString() || 0} <span className="text-base font-normal text-on-surface-variant">اعتبار</span>
                        </p>
                    </div>

                    {/* انتخاب تعداد اعتبار */}
                    <div className="bg-white p-5 rounded-2xl border border-outline-variant/50 shadow-sm space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-on-surface">
                                تعداد اعتبار
                            </label>
                            <span className="text-xs text-on-surface-variant">
                                هر اعتبار = {creditPrice.toLocaleString()} {currencySymbol}
                            </span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            {quickCredits.map((q) => (
                                <button
                                    key={q}
                                    type="button"
                                    onClick={() => setCreditCount(q)}
                                    className={cn(
                                        "px-4 py-2 rounded-lg text-sm font-medium border-2 transition-all",
                                        creditCount === q
                                            ? "border-primary bg-primary/5 text-primary"
                                            : "border-outline-variant hover:border-primary/30"
                                    )}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>

                        <NumberInput
                            value={creditCount}
                            onChange={(val) => setCreditCount(Math.max(1, val || 1))}
                            unit="اعتبار"
                            textAlign="center"
                            className="w-full h-12 bg-surface-container-lowest border border-outline text-center font-mono text-lg focus:ring-1 focus:ring-primary focus:border-primary outline-none rounded-lg"
                        />

                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 flex items-center justify-between">
                            <span className="text-sm text-on-surface-variant">مبلغ قابل پرداخت:</span>
                            <span className="text-xl font-bold text-primary">
                                {totalAmount.toLocaleString()} {currencySymbol}
                            </span>
                        </div>
                    </div>

                    {/* انتخاب روش پرداخت */}
                    <div className="bg-white p-5 rounded-2xl border border-outline-variant/50 shadow-sm space-y-4">
                        <label className="text-sm font-semibold text-on-surface block">
                            روش پرداخت
                        </label>

                        <div className="space-y-3">
                            {/* پرداخت آنلاین */}
                            {onlineAvailable && (
                                <div className="space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('online')}
                                        className={cn(
                                            "w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all text-right",
                                            paymentMethod === 'online'
                                                ? "border-primary bg-primary/5"
                                                : "border-outline-variant hover:border-primary/30"
                                        )}
                                    >
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <CreditCard className="w-5 h-5 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium text-on-surface">پرداخت آنلاین</p>
                                            <p className="text-xs text-on-surface-variant">اتصال به درگاه بانکی</p>
                                        </div>
                                        {paymentMethod === 'online' && (
                                            <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                                <Check className="w-3 h-3 text-white" />
                                            </div>
                                        )}
                                    </button>

                                    {/* ✅ انتخاب درگاه (اگر بیش از یک درگاه فعال باشد) */}
                                    {/* انتخاب درگاه پرداخت آنلاین */}
                                    {paymentMethod === 'online' && enabledGateways.length > 0 && (
                                        <div className="space-y-3">
                                            <label className="text-sm font-semibold text-on-surface block">
                                                انتخاب درگاه پرداخت
                                            </label>
                                            <div className="grid grid-cols-2 gap-3">
                                                {enabledGateways.map((gateway: any) => {
                                                    const isSelected = selectedGateway === gateway.name;
                                                    const gatewayInfo: Record<string, { label: string; icon: string; color: string }> = {
                                                        'pec': {
                                                            label: 'پارسیان',
                                                            icon: '🏦',
                                                            color: '#8B0000'
                                                        },
                                                        'zarinpal': {
                                                            label: 'زرین‌پال',
                                                            icon: '🟣',
                                                            color: '#9B59B6'
                                                        },
                                                        'rayanpay': {
                                                            label: 'رایان‌پی',
                                                            icon: '🔵',
                                                            color: '#2196F3'
                                                        },
                                                    };
                                                    const info = gatewayInfo[gateway.name] || {
                                                        label: gateway.name,
                                                        icon: '💳',
                                                        color: '#666'
                                                    };

                                                    return (
                                                        <button
                                                            key={gateway.name}
                                                            type="button"
                                                            onClick={() => setSelectedGateway(gateway.name)}
                                                            className={cn(
                                                                "flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all duration-200",
                                                                isSelected
                                                                    ? "border-primary bg-primary/5 shadow-md"
                                                                    : "border-outline-variant hover:border-primary/30 hover:bg-surface-container-low"
                                                            )}
                                                            style={{
                                                                borderColor: isSelected ? info.color : undefined,
                                                                backgroundColor: isSelected ? `${info.color}10` : undefined,
                                                            }}
                                                        >
                                                            <div className="text-3xl mb-1">{info.icon}</div>
                                                            <span className={cn(
                                                                "text-sm font-medium",
                                                                isSelected ? "text-primary" : "text-on-surface"
                                                            )}>
                            {info.label}
                        </span>
                                                            {isSelected && (
                                                                <span className="text-[10px] text-primary mt-0.5">✓ انتخاب شده</span>
                                                            )}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                            <p className="text-[10px] text-on-surface-variant/60 text-center">
                                                با انتخاب درگاه، به صفحه پرداخت آن هدایت می‌شوید
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* پرداخت کارت به کارت */}
                            {manualAvailable && (
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('manual')}
                                    className={cn(
                                        "w-full flex items-center gap-4 p-4 border-2 rounded-xl transition-all text-right",
                                        paymentMethod === 'manual'
                                            ? "border-primary bg-primary/5"
                                            : "border-outline-variant hover:border-primary/30"
                                    )}
                                >
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                        <Banknote className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium text-on-surface">کارت به کارت (فیش)</p>
                                        <p className="text-xs text-on-surface-variant">واریز و ارسال تصویر رسید</p>
                                    </div>
                                    {paymentMethod === 'manual' && (
                                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                                            <Check className="w-3 h-3 text-white" />
                                        </div>
                                    )}
                                </button>
                            )}
                        </div>

                        {!onlineAvailable && !manualAvailable && (
                            <div className="bg-warning/10 border border-warning/20 p-3 rounded-lg flex items-start gap-2 text-sm text-warning">
                                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <p>هیچ روش پرداختی برای این بازار فعال نیست. لطفاً با مالک بازار تماس بگیرید.</p>
                            </div>
                        )}
                    </div>

                    {/* اطلاعات کارت به کارت */}
                    {paymentMethod === 'manual' && manualAvailable && (
                        <div id="manual-payment-section"  className="bg-warning/5 border border-warning/20 p-4 rounded-xl space-y-3">
                            <div className="flex items-center gap-2 text-warning">
                                <Shield className="w-4 h-4" />
                                <span className="text-sm font-medium">اطلاعات واریز</span>
                            </div>

                            {paymentConfig.manual?.cardNumber && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">شماره کارت</span>
                                    <span className="font-mono font-bold">{paymentConfig.manual.cardNumber}</span>
                                </div>
                            )}
                            {paymentConfig.manual?.accountOwner && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">نام صاحب حساب</span>
                                    <span className="font-bold">{paymentConfig.manual.accountOwner}</span>
                                </div>
                            )}
                            {paymentConfig.manual?.bankName && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">بانک</span>
                                    <span className="font-bold">{paymentConfig.manual.bankName}</span>
                                </div>
                            )}
                            {paymentConfig.manual?.shebaNumber && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-on-surface-variant">شماره شبا</span>
                                    <span className="font-mono font-bold">{paymentConfig.manual.shebaNumber}</span>
                                </div>
                            )}
                            {paymentConfig.manual?.instructions && (
                                <p className="text-xs text-on-surface-variant bg-white/50 p-2 rounded-lg">
                                    {paymentConfig.manual.instructions}
                                </p>
                            )}

                            <div className="border-t border-warning/20 pt-3">
                                <label className="text-sm font-medium text-on-surface block mb-2">
                                    تصویر رسید
                                </label>

                                <FileUploader
                                    model="Credit"
                                    modelId="temp"
                                    fieldKey="receipt"
                                    value={receiptFileId}
                                    onFileSelect={handleReceiptUpload}
                                    onRemove={handleRemoveReceipt}
                                    onSuccess={(fileId) => {
                                        setReceiptFileId(fileId);
                                        toast.success('تصویر رسید آپلود شد');
                                    }}
                                    onError={(error) => {
                                        setUploadError(error);
                                        toast.error(error);
                                    }}
                                    rounded={false}
                                    width={300}
                                    height={400}
                                    disabled={isUploading || isSubmitting}
                                    label="آپلود رسید"
                                    error={uploadError || undefined}
                                />

                                {isUploading && (
                                    <p className="text-xs text-on-surface-variant mt-1">در حال آپلود...</p>
                                )}
                                {receiptFileId && !isUploading && (
                                    <p className="text-xs text-green-600 mt-1">✅ تصویر رسید آپلود شد</p>
                                )}
                                <p className="text-[10px] text-on-surface-variant mt-1">
                                    * لطفاً تصویر رسید واریز را آپلود کنید تا درخواست شما تأیید شود
                                </p>
                            </div>
                        </div>
                    )}

                    {/* دکمه پرداخت */}
                    <button
                        type="submit"
                        disabled={isSubmitting || isUploading || (!onlineAvailable && !manualAvailable) || (paymentMethod === 'manual' && !receiptFileId)}
                        className="w-full h-14 bg-primary text-on-primary text-base font-bold flex items-center justify-center gap-2 rounded-xl disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                خرید {creditCount} اعتبار
                                <span className="text-sm font-normal opacity-80">
                                    ({totalAmount.toLocaleString()} {currencySymbol})
                                </span>
                            </>
                        )}
                    </button>

                    <div className="text-center text-xs text-on-surface-variant/60 space-y-1">
                        <p>پس از پرداخت، اعتبار به کیف پول شما اضافه می‌شود</p>
                        <p>در صورت بروز مشکل، با پشتیبانی تماس بگیرید</p>
                    </div>
                </form>
            </main>
        </div>
    );
}