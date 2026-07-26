// app/admin/arm/components/PaymentSection.tsx
'use client';

import React from 'react';
import { UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Control, useFieldArray } from 'react-hook-form';
import { Plus, Trash2 } from 'lucide-react';

interface PaymentSectionProps {
    register: UseFormRegister<any>;
    errors: FieldErrors<any>;
    watch: UseFormWatch<any>;
    setValue: UseFormSetValue<any>;
    control: Control<any>; // ✅ حتماً control باید اینجا باشد
}

export function PaymentSection({ register, errors, watch, setValue, control }: PaymentSectionProps) {
    const { fields, append, remove } = useFieldArray({
        control, // ✅ control از props گرفته می‌شود
        name: 'config.payment.gateways',
    });

    const paymentMode = watch('config.payment.paymentMode');
    const manualEnabled = watch('config.payment.manual.enabled');

    return (
        <div className="space-y-4 bg-surface-container-low p-6 border border-outline-variant">
            <h3 className="text-lg font-semibold">تنظیمات پرداخت</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="font-label-md text-label-md text-on-surface-variant block">
                        حالت پرداخت
                    </label>
                    <select
                        {...register('config.payment.paymentMode')}
                        className="w-full bg-surface-container-lowest border border-outline h-12 px-4 font-body-md text-right appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                    >
                        <option value="online_only">فقط آنلاین</option>
                        <option value="manual_only">فقط کارت به کارت (فیشی)</option>
                        <option value="both">هر دو</option>
                    </select>
                </div>

                {(paymentMode === 'online_only' || paymentMode === 'both') && (
                    <div className="space-y-2">
                        <label className="font-label-md text-label-md text-on-surface-variant block">
                            درگاه پیش‌فرض
                        </label>
                        <select
                            {...register('config.payment.defaultGateway')}
                            className="w-full bg-surface-container-lowest border border-outline h-12 px-4 font-body-md text-right appearance-none focus:ring-1 focus:ring-primary focus:border-primary outline-none transition-all"
                        >
                            <option value="pec">پارسیان</option>
                            <option value="zarinpal">زرین‌پال</option>
                            <option value="rayanpay">رایان‌پی</option>
                        </select>
                    </div>
                )}
            </div>

            {/* درگاه‌های آنلاین */}
            {(paymentMode === 'online_only' || paymentMode === 'both') && (
                <div className="space-y-3">
                    <h4 className="font-semibold text-sm text-on-surface-variant">درگاه‌های آنلاین</h4>
                    <div className="space-y-2">
                        {fields.map((field, index) => (
                            <div key={field.id} className="flex items-center gap-2 p-3 border border-outline-variant bg-surface-container-lowest">
                                <button
                                    type="button"
                                    onClick={() => remove(index)}
                                    className="text-error hover:bg-error/10 p-1 rounded"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                                    <input
                                        {...register(`config.payment.gateways.${index}.name`)}
                                        placeholder="نام درگاه"
                                        className="bg-surface-container-lowest border border-outline px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    />
                                    <input
                                        {...register(`config.payment.gateways.${index}.pin`)}
                                        placeholder="PIN یا Merchant ID"
                                        className="bg-surface-container-lowest border border-outline px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    />
                                    <input
                                        {...register(`config.payment.gateways.${index}.callbackUrl`)}
                                        placeholder="آدرس بازگشت"
                                        className="bg-surface-container-lowest border border-outline px-2 py-1 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                    />
                                    <label className="flex items-center gap-1 text-sm">
                                        <input
                                            type="checkbox"
                                            {...register(`config.payment.gateways.${index}.sandbox`)}
                                            className="w-4 h-4"
                                        />
                                        حالت تست
                                    </label>
                                </div>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => append({ name: '', pin: '', callbackUrl: '', sandbox: true })}
                            className="flex items-center gap-2 text-primary hover:bg-primary/10 px-3 py-2 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            افزودن درگاه
                        </button>
                    </div>
                </div>
            )}

            {/* پرداخت دستی (فیشی) */}
            {(paymentMode === 'manual_only' || paymentMode === 'both') && (
                <div className="space-y-3 border-t border-outline-variant pt-4">
                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            {...register('config.payment.manual.enabled')}
                            id="manualEnabled"
                            className="w-4 h-4"
                        />
                        <label htmlFor="manualEnabled" className="font-semibold text-sm">
                            فعال بودن پرداخت کارت به کارت (فیشی)
                        </label>
                    </div>

                    {manualEnabled && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                {...register('config.payment.manual.cardNumber')}
                                placeholder="شماره کارت"
                                className="bg-surface-container-lowest border border-outline px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            />
                            <input
                                {...register('config.payment.manual.shebaNumber')}
                                placeholder="شماره شبا"
                                className="bg-surface-container-lowest border border-outline px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            />
                            <input
                                {...register('config.payment.manual.accountOwner')}
                                placeholder="نام صاحب حساب"
                                className="bg-surface-container-lowest border border-outline px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            />
                            <input
                                {...register('config.payment.manual.bankName')}
                                placeholder="نام بانک"
                                className="bg-surface-container-lowest border border-outline px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                            />
                            <div className="md:col-span-2">
                                <textarea
                                    {...register('config.payment.manual.instructions')}
                                    placeholder="توضیحات برای کاربر (متن راهنما)"
                                    rows={2}
                                    className="w-full bg-surface-container-lowest border border-outline px-3 py-2 text-sm focus:ring-1 focus:ring-primary focus:border-primary outline-none"
                                />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}