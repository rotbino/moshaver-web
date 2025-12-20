'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import {FloatingLabel, NumberInput} from '@/components/common';
import { CheckCircle, X, DollarSign, Plus, Search, Filter, Edit, Trash2, XCircle } from 'lucide-react';
import { useAuth } from '@/lib/data-transfer/api-hooks';
import {
    useCreateProduct,
    useUpdateProduct
} from '@/lib/data-transfer/api-hooks';
import { toast } from '@/lib/hooks/app-toast';
import { ServiceType, ServiceCategory, SERVICES_LIST } from '@/lib/data-transfer/data-types';
import { useQueryClient } from '@tanstack/react-query';

interface ServiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingProduct?: { id: string; price: number; description?: string; title?: string };
    allProducts: any[]; // دریافت لیست محصولات از props
}

export default function ServiceFormModal({ isOpen, onClose, editingProduct, allProducts }: ServiceFormModalProps) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        serviceType: '' as ServiceType,
        price: 0,
        description: ''
    });
    const [errors, setErrors] = useState<{ serviceType?: string; price?: string }>({});

    React.useEffect(() => {
        if (editingProduct) {
            setFormData({
                serviceType: editingProduct.serviceType,
                price: editingProduct.price,
                description: editingProduct.description || ''
            });
            setErrors({});
        } else {
            setFormData({
                serviceType: '' as ServiceType,
                price: 0,
                description: ''
            });
            setErrors({});
        }
    }, [editingProduct]);

    const { mutate: createProduct } = useCreateProduct();
    const { mutate: updateProduct } = useUpdateProduct();

    // فیلتر کردن SERVICES_LIST برای حذف خدمات موجود
    const availableServices = React.useMemo(() => {
        if (!allProducts) return SERVICES_LIST;

        const existingServiceIds = new Set(allProducts.map(product => product.serviceType));
        return SERVICES_LIST.filter(service => !existingServiceIds.has(service.id));
    }, [allProducts]);

    // تابع اعتبارسنجی فرم
    const validateForm = () => {
        const newErrors: { serviceType?: string; price?: string } = {};

        if (!formData.serviceType) {
            newErrors.serviceType = 'نوع خدمت را انتخاب کنید';
        }

        if (formData.price <= 0) {
            newErrors.price = 'قیمت را وارد کنید';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSaveProduct = () => {
        if (!validateForm()) {
            return;
        }

        const productData = {
            serviceType: formData.serviceType,
            price: formData.price,
            description: formData.description
        };

        if (editingProduct) {
            updateProduct(
                {
                    serviceId: editingProduct.id,
                    data: productData
                },
                {
                    onSuccess: () => {
                        // رفرش تمام کوئری‌های مرتبط
                        queryClient.invalidateQueries({ queryKey: ['all-lawyer-products'] });
                        queryClient.invalidateQueries({ queryKey: ['active-products-count'] });

                        toast.success('خدمت با موفقیت بروزرسانی شد');
                        onClose();
                    },
                    onError: (error: any) => {
                        toast.error('خطا در بروزرسانی خدمت: ' + (error.message || 'خطای نامشخص'));
                        console.error('Error updating product:', error);
                    }
                }
            );
        } else {
            createProduct(
                productData,
                {
                    onSuccess: () => {
                        // رفرش تمام کوئری‌های مرتبط
                        queryClient.invalidateQueries({ queryKey: ['all-lawyer-products'] });
                        queryClient.invalidateQueries({ queryKey: ['active-products-count'] });

                        toast.success('خدمت با موفقیت ایجاد شد');
                        onClose();
                    },
                    onError: (error: any) => {
                        toast.error('خطا در ایجاد خدمت: ' + (error.message || 'خطای نامشخص'));
                        console.error('Error creating product:', error);
                    }
                }
            );
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md mx-4">
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>
                        {editingProduct ? 'ویرایش خدمت' : 'افزودن خدمت جدید'}
                    </CardTitle>
                    <Button variant="ghost" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            نوع خدمت
                        </label>
                        {editingProduct ? (
                            <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                                <div className="font-medium">{editingProduct.title}</div>
                                <div className="text-sm text-gray-500">نوع خدمت قابل تغییر نیست</div>
                            </div>
                        ) : (
                            <select
                                value={formData.serviceType}
                                onChange={(e) => setFormData(prev => ({
                                    ...prev,
                                    serviceType: e.target.value as ServiceType
                                }))}
                                className={`w-full px-3 py-3 border rounded-md focus:outline-none focus:ring-2 ${
                                    errors.serviceType ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-[#ca2a30]'
                                }`}
                            >
                                <option value="">نوع خدمت را انتخاب کنید</option>
                                {availableServices.map(service => (
                                    <option key={service.id} value={service.id}>
                                        {service.title}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.serviceType && (
                            <p className="text-red-500 text-sm mt-1">{errors.serviceType}</p>
                        )}
                    </div>

                    <div>
                        <FloatingLabel
                            id="mobile"
                            label="قیمت پایه"
                        >
                            <NumberInput
                                value={formData.price}
                                onChange={(value) => setFormData(prev => ({
                                    ...prev,
                                    price: value
                                }))}
                                unit="تومان"
                                className={errors.price ? 'border-red-500 focus:ring-red-500' : ''}
                            />
                        </FloatingLabel>
                        {errors.price && (
                            <p className="text-red-500 text-sm mt-1">{errors.price}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            توضیحات (اختیاری)
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                description: e.target.value
                            }))}
                            className="w-full p-3 border border-gray-300 rounded-md"
                            rows={3}
                            placeholder="توضیحات مربوط به خدمت را وارد کنید"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={onClose}
                        >
                            انصراف
                        </Button>
                        <Button
                            onClick={handleSaveProduct}
                            className="bg-orange-600 hover:bg-orange-700"
                            disabled={!!editingProduct && (errors.serviceType || errors.price)}
                        >
                            {editingProduct ? 'بروزرسانی' : 'ذخیره'} خدمت
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}