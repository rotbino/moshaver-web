'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/radix/card';
import { Button } from '@/components/radix/button';
import { Badge } from '@/components/radix/badge';
import {CheckCircle, X, DollarSign, Plus, Search, Filter, Edit, Trash2, XCircle, FileText, Activity, ListTodo, AlertCircle} from 'lucide-react';
import { useAuth } from '@/lib/data-transfer/api-hooks';
import {
    useLawyerProducts,
    useAllLawyerProducts,
    useActiveProductsCount,
    useDeactivateProduct,
    useActivateProduct,
    useDeleteProduct
} from '@/lib/data-transfer/api-hooks';
import { toast } from '@/lib/hooks/app-toast';
import { ServiceType, ServiceCategory, SERVICES_LIST, SERVICE_CATEGORY_NAMES } from '@/lib/data-transfer/data-types';
import { useQueryClient } from '@tanstack/react-query';

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/radix/dialog';

import ServiceFormModal from "@/app/lawyer-dashboard/my-services/ServiceFormModal";

export default function LawyerMyServicesPage() {
    const queryClient = useQueryClient();
    const { useLawyerProfile } = useAuth();
    const { data: lawyerProfile, isLoading: profileLoading } = useLawyerProfile();

    const { data: allProducts, isLoading: productsLoading } = useAllLawyerProducts();
    const { data: activeCount } = useActiveProductsCount();

    const { mutate: deactivateProduct, isPending: isDeactivating } = useDeactivateProduct();
    const { mutate: activateProduct, isPending: isActivating } = useActivateProduct();
    const { mutate: deleteProduct, isPending: isDeleting } = useDeleteProduct();

    const [showAddModal, setShowAddModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<{ id: string; price: number; description?: string; title?: string, serviceType?:string } | null>(null);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [confirmAction, setConfirmAction] = useState<{ type: 'deactivate' | 'delete' | 'activate'; serviceId: string } | null>(null);

    // تابع برای رفرش لیست
    const refreshServicesList = () => {
        console.log('Refreshing queries...');
        queryClient.invalidateQueries({ queryKey: ['all-lawyer-products'] });
        queryClient.invalidateQueries({ queryKey: ['active-products-count'] });
    };

    // تابع برای مدیریت موفقیت آمیز بودن عملیات
    const handleMutationSuccess = (message: string) => {
        refreshServicesList();
        toast.success(message);
    };

    const handleDeactivate = (serviceId: string) => {
        setConfirmAction({ type: 'deactivate', serviceId });
        setShowConfirmDialog(true);
    };

    const handleActivate = (serviceId: string) => {
        setConfirmAction({ type: 'activate', serviceId });
        setShowConfirmDialog(true);
    };

    const handleDelete = (serviceId: string) => {
        setConfirmAction({ type: 'delete', serviceId });
        setShowConfirmDialog(true);
    };

    const confirmActionHandler = () => {
        if (!confirmAction) return;

        const { type, serviceId } = confirmAction;

        console.log('Executing action:', type, 'for service:', serviceId);

        if (type === 'deactivate') {
            deactivateProduct(serviceId, {
                onSuccess: () => handleMutationSuccess('خدمت با موفقیت غیرفعال شد'),
                onError: (error: any) => {
                    console.error('Deactivate error:', error);
                    toast.error('خطا در غیرفعال کردن خدمت: ' + (error.message || 'خطای نامشخص'));
                }
            });
        } else if (type === 'activate') {
            activateProduct(serviceId, {
                onSuccess: () => handleMutationSuccess('خدمت با موفقیت فعال شد'),
                onError: (error: any) => {
                    console.error('Activate error:', error);
                    toast.error('خطا در فعال کردن خدمت: ' + (error.message || 'خطای نامشخص'));
                }
            });
        } else if (type === 'delete') {
            deleteProduct(serviceId, {
                onSuccess: () => handleMutationSuccess('خدمت با موفقیت حذف شد'),
                onError: (error: any) => {
                    console.error('Delete error:', error);
                    toast.error('خطا در حذف خدمت: ' + (error.message || 'خطای نامشخص'));
                }
            });
        }

        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const cancelActionHandler = () => {
        setShowConfirmDialog(false);
        setConfirmAction(null);
    };

    const activeServices = allProducts?.filter(product => product.isActive) || [];
    const inactiveServices = allProducts?.filter(product => !product.isActive) || [];

    if (profileLoading || productsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">خدمات من</h1>
                    <p className="text-sm text-gray-500 mt-1">مدیریت خدمات و قیمت‌گذاری</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={() => setShowAddModal(true)}
                        className="bg-orange-600 hover:bg-orange-700"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        افزودن خدمت جدید
                    </Button>
                </div>
            </div>

            {/* کارت خدمات فعال */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>خدمات فعال</CardTitle>
                        <p className="text-sm text-gray-500">تعداد: {activeCount?.count || 0}</p>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeServices.length === 0 ? (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                                <CheckCircle className="w-full h-full" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">هیچ خدمتی فعال نیست</h3>
                            <p className="text-gray-500 mb-4">برای شروع، روی دکمه "افزودن خدمت جدید" کلیک کنید</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {activeServices.map(product => {
                                const serviceInfo = SERVICES_LIST.find(s => s.id === product.serviceType);

                                return (
                                    <div
                                        key={product.serviceType}
                                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-all border-gray-200"
                                    >
                                        <div className="flex-1 mb-3 md:mb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-[#fef2f2] flex items-center justify-center">
                                                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm md:text-base">{serviceInfo?.title || product.serviceType}</div>
                                                    <div className="text-xs md:text-sm text-gray-600">
                                                        {product.description || 'بدون توضیحات'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                                            <div className="text-right mb-2 md:mb-0">
                                                <div className="font-medium text-sm md:text-base">
                                                    {product.price.toLocaleString()} تومان
                                                </div>
                                                <div className="text-xs md:text-sm text-gray-500">
                                                    {SERVICE_CATEGORY_NAMES[product.category as ServiceCategory]}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 md:gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="hidden md:flex"
                                                    onClick={() => {
                                                        setEditingProduct({
                                                            id: product.id,
                                                            serviceType: product.serviceType,
                                                            price: product.price,
                                                            description: product.description,
                                                            title: serviceInfo?.title
                                                        });
                                                        setShowAddModal(true);
                                                    }}
                                                >
                                                    <Edit className="w-3 h-3 md:w-4 md:h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="md:hidden"
                                                    onClick={() => {
                                                        setEditingProduct({
                                                            id: product.id,
                                                            serviceType: product.serviceType,
                                                            price: product.price,
                                                            description: product.description,
                                                            title: serviceInfo?.title
                                                        });
                                                        setShowAddModal(true);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-orange-500 border-orange-500 hover:bg-orange-50"
                                                    onClick={() => handleDeactivate(product.id)}
                                                    disabled={isDeactivating}
                                                >
                                                    <XCircle className="w-3 h-3 md:w-4 md:h-4" />
                                                    {isDeactivating && <span className="ml-1">...</span>}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500 border-red-500 hover:bg-red-50"
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                                    {isDeleting && <span className="ml-1">...</span>}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* کارت خدمات غیرفعال */}
            {inactiveServices.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div>
                            <CardTitle>خدمات غیرفعال</CardTitle>
                            <p className="text-sm text-gray-500">تعداد: {inactiveServices.length}</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {inactiveServices.map(product => {
                                const serviceInfo = SERVICES_LIST.find(s => s.id === product.serviceType);

                                return (
                                    <div
                                        key={product.serviceType}
                                        className="flex flex-col md:flex-row items-start md:items-center justify-between p-3 md:p-4 border rounded-lg hover:bg-gray-50 transition-all border-gray-200 bg-gray-50"
                                    >
                                        <div className="flex-1 mb-3 md:mb-0">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                                    <FileText className="w-4 h-4 md:w-5 md:h-5 text-gray-400" />
                                                </div>
                                                <div>
                                                    <div className="font-medium text-sm md:text-base text-gray-500">{serviceInfo?.title || product.serviceType}</div>
                                                    <div className="text-xs md:text-sm text-gray-500">
                                                        {product.description || 'بدون توضیحات'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 md:gap-4 flex-wrap">
                                            <div className="text-right mb-2 md:mb-0">
                                                <div className="font-medium text-sm md:text-base text-gray-500">
                                                    {product.price.toLocaleString()} تومان
                                                </div>
                                                <div className="text-xs md:text-sm text-gray-500">
                                                    {SERVICE_CATEGORY_NAMES[product.category as ServiceCategory]}
                                                </div>
                                            </div>
                                            <div className="flex gap-1 md:gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="hidden md:flex"
                                                    onClick={() => {
                                                        setEditingProduct({
                                                            id: product.id,
                                                            serviceType: product.serviceType,
                                                            price: product.price,
                                                            description: product.description,
                                                            title: serviceInfo?.title
                                                        });
                                                        setShowAddModal(true);
                                                    }}
                                                >
                                                    <Edit className="w-3 h-3 md:w-4 md:h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="md:hidden"
                                                    onClick={() => {
                                                        setEditingProduct({
                                                            id: product.id,
                                                            serviceType: product.serviceType,
                                                            price: product.price,
                                                            description: product.description,
                                                            title: serviceInfo?.title
                                                        });
                                                        setShowAddModal(true);
                                                    }}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-green-500 border-green-500 hover:bg-green-50"
                                                    onClick={() => handleActivate(product.id)}
                                                    disabled={isActivating}
                                                >
                                                    <Activity className="w-3 h-3 md:w-4 md:h-4" />
                                                    {isActivating && <span className="ml-1">...</span>}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    className="text-red-500 border-red-500 hover:bg-red-50"
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={isDeleting}
                                                >
                                                    <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                                                    {isDeleting && <span className="ml-1">...</span>}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* مدال تاییدیه */}
            <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-orange-500" />
                            تایید عملیات
                        </DialogTitle>
                        <DialogDescription>
                            آیا از این عملیات مطمئن هستید؟
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        {confirmAction?.type === 'deactivate' && (
                            <p>آیا می‌خواهید این خدمت را غیرفعال کنید؟</p>
                        )}
                        {confirmAction?.type === 'activate' && (
                            <p>آیا می‌خواهید این خدمت را فعال کنید؟</p>
                        )}
                        {confirmAction?.type === 'delete' && (
                            <p>آیا می‌خواهید این خدمت را حذف کنید؟ این عملیات غیرقابل بازگشت است.</p>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={cancelActionHandler}>
                            انصراف
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={confirmActionHandler}
                            disabled={isDeactivating || isActivating || isDeleting}
                        >
                            {confirmAction?.type === 'deactivate' ? 'غیرفعال کردن' :
                                confirmAction?.type === 'activate' ? 'فعال کردن' : 'حذف کردن'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <ServiceFormModal
                isOpen={showAddModal}
                onClose={() => {
                    setShowAddModal(false);
                    setEditingProduct(null);
                }}
                editingProduct={editingProduct || undefined}
                allProducts={allProducts || []}
            />
        </div>
    );
}