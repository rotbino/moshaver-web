// app/lawyer-dashboard/clients/page.tsx
'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/radix/card";
import { Button } from "@/components/radix/button";
import { Badge } from "@/components/radix/badge";
import {
    User, Search, Filter, Plus, Edit, Trash2, Eye, Clock, CheckCircle,
    AlertCircle, BarChart3, FileText, Calendar, MessageSquare, X
} from "lucide-react";
import { useAuth } from '@/lib/data-transfer/api-hooks';
import { useCRM} from '@/lib/data-transfer/api-hooks';
import { toast } from '@/lib/hooks/app-toast';
import {CreateClientDto, InviteClientDto} from "@/lib/data-transfer/data-types";

interface Client {
    id: string;
    lawyerId: string;
    clientId: string;
    source: string;
    isVerified: boolean;
    isActive: boolean;
    addedAt: Date;
    verifiedAt?: Date;
    consultationCount: number;
    totalSpent: number;
    notes?: string;
    tags?: string[];
    client: {
        id: string;
        name: string;
        lastName: string;
        mobile: string;
        email?: string;
        profileImage?: string;
    };
}

export default function LawyerClientsPage() {
    const { useLawyerProfile } = useAuth();
    const { useClients, useClientStats, useAddExistingClient, useRegisterNewClient,
        useCreateInvitationLink, useBookConsultationForClient, useUpdateClient,
        useRemoveClient}=useCRM();
    const { data: lawyerProfile, isLoading: profileLoading } = useLawyerProfile();

    const { data: clients, isLoading: clientsLoading } = useClients();
    const { data: stats, isLoading: statsLoading } = useClientStats();

    const { mutate: addExistingClient } = useAddExistingClient();
    const { mutate: registerNewClient } = useRegisterNewClient();
    const { mutate: createInvitationLink } = useCreateInvitationLink();
    const { mutate: bookConsultationForClient } = useBookConsultationForClient();
    const { mutate: updateClient } = useUpdateClient();
    const { mutate: removeClient } = useRemoveClient();

    const [searchTerm, setSearchTerm] = useState<string>("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showAddClientModal, setShowAddClientModal] = useState<boolean>(false);
    const [showInviteModal, setShowInviteModal] = useState<boolean>(false);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);

    const [newClientData, setNewClientData] = useState<CreateClientDto>({
        name: "",
        lastName: "",
        mobile: "",
        email: "",
        notes: "",
        source: "MANUAL_ADD"
    });

    const [inviteData, setInviteData] = useState<InviteClientDto>({
        name: "",
        lastName: "",
        mobile: "",
        email: ""
    });

    useEffect(() => {
        if (clients) {
            setFilteredClients(clients);
        }
    }, [clients]);

    const filteredClients = clients?.filter(client => {
        let result = true;

        if (statusFilter !== "all") {
            if (statusFilter === "active") result = client.isActive;
            if (statusFilter === "inactive") result = !client.isActive;
            if (statusFilter === "verified") result = client.isVerified;
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result && (
                client.client.name.toLowerCase().includes(term) ||
                client.client.lastName.toLowerCase().includes(term) ||
                client.client.mobile.includes(term) ||
                (client.client.email && client.client.email.toLowerCase().includes(term))
            );
        }

        return result;
    });

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-100 text-green-800">فعال</Badge>;
            case "inactive":
                return <Badge className="bg-gray-100 text-gray-800">غیرفعال</Badge>;
            case "verified":
                return <Badge className="bg-orange-100 text-orange-800">تایید شده</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const handleAddExistingClient = () => {
        addExistingClient(
            { clientId: newClientData.mobile, notes: newClientData.notes },
            {
                onSuccess: () => {
                    toast.success("مشتری با موفقیت اضافه شد");
                    setShowAddClientModal(false);
                    setNewClientData({ name: "", lastName: "", mobile: "", email: "", notes: "", source: "MANUAL_ADD" });
                },
                onError: (error) => toast.error("خطا در افزودن مشتری")
            }
        );
    };

    const handleRegisterNewClient = () => {
        registerNewClient(
            newClientData,
            {
                onSuccess: () => {
                    toast.success("مشتری با موفقیت ثبت‌نام شد");
                    setShowAddClientModal(false);
                    setNewClientData({ name: "", lastName: "", mobile: "", email: "", notes: "", source: "MANUAL_ADD" });
                },
                onError: (error) => toast.error("خطا در ثبت‌نام مشتری")
            }
        );
    };

    const handleCreateInvitationLink = () => {
        createInvitationLink(
            inviteData,
            {
                onSuccess: (data) => {
                    toast.success("لینک دعوت با موفقیت ایجاد شد");
                    setShowInviteModal(false);
                    setInviteData({ name: "", lastName: "", mobile: "", email: "" });
                },
                onError: (error) => toast.error("خطا در ایجاد لینک دعوت")
            }
        );
    };

    if (profileLoading || clientsLoading || statsLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">مدیریت مشتریان</h1>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => setShowAddClientModal(true)}
                            className="bg-orange-500 hover:bg-orange-600"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        افزودن مشتری
                    </Button>
                    <Button variant="outline" onClick={() => setShowInviteModal(true)}>
                        <MessageSquare className="w-4 h-4 mr-2" />
                        ارسال لینک دعوت
                    </Button>
                </div>
            </div>

            {/* آمار مشتریان */}
            {stats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">کل مشتریان</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalClients}</p>
                                </div>
                                <User className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">مشتریان فعال</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.activeClients}</p>
                                </div>
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">تایید شده</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.verifiedClients}</p>
                                </div>
                                <FileText className="w-8 h-8 text-orange-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">مشاوره‌های کل</p>
                                    <p className="text-2xl font-bold text-gray-900">{stats.totalConsultations}</p>
                                </div>
                                <Calendar className="w-8 h-8 text-purple-600" />
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">درآمد کل</p>
                                    <p className="text-2xl font-bold text-gray-900">
                                        {stats.totalRevenue.toLocaleString()} تومان
                                    </p>
                                </div>
                                <BarChart3 className="w-8 h-8 text-yellow-600" />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* کنترل‌های فیلتر */}
            <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-2 flex-1">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="جستجو در مشتریان..."
                            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600 w-full"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <select
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">همه وضعیت‌ها</option>
                        <option value="active">فعال</option>
                        <option value="inactive">غیرفعال</option>
                        <option value="verified">تایید شده</option>
                    </select>
                </div>
            </div>

            {/* لیست مشتریان */}
            {filteredClients?.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">مشتری یافت نشد</h3>
                        <p className="text-gray-500 mb-4">
                            {statusFilter !== "all" || searchTerm
                                ? "با تغییر فیلترها یا جستجوی عبارت دیگر، دوباره تلاش کنید"
                                : "شما هنوز هیچ مشتری‌ای ندارید"}
                        </p>
                        <Button
                            onClick={() => {
                                setStatusFilter("all");
                                setSearchTerm("");
                            }}
                            variant="outline"
                        >
                            حذف فیلترها
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filteredClients?.map((client) => (
                        <Card key={client.id}>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-12 h-12 rounded-full bg-[#fef2f2] flex items-center justify-center">
                                                <User className="w-6 h-6 text-orange-600" />
                                            </div>
                                            <div>
                                                <div className="font-medium text-lg">
                                                    {client.client.name} {client.client.lastName}
                                                </div>
                                                <div className="text-sm text-gray-600">
                                                    {client.client.mobile}
                                                    {client.client.email && ` • ${client.client.email}`}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4 mb-2">
                                            {getStatusBadge(client.isActive ? "active" : "inactive")}
                                            {client.isVerified && (
                                                <Badge className="bg-orange-100 text-orange-800">تایید شده</Badge>
                                            )}
                                            <div className="text-sm text-gray-600">
                                                عضو از: {new Date(client.addedAt).toLocaleDateString('fa-IR')}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-sm">
                                                <span className="font-medium">مشاوره‌ها:</span> {client.consultationCount}
                                            </div>
                                            <div className="text-sm">
                                                <span className="font-medium">مجموع هزینه:</span> {client.totalSpent.toLocaleString()} تومان
                                            </div>
                                        </div>

                                        {client.notes && (
                                            <div className="text-sm text-gray-600 mt-2">
                                                {client.notes}
                                            </div>
                                        )}

                                        {client.tags && client.tags.length > 0 && (
                                            <div className="flex gap-2 mt-2">
                                                {client.tags.map((tag, index) => (
                                                    <Badge key={index} className="bg-gray-100 text-gray-800">
                                                        {tag}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-2">
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => setSelectedClient(client)}
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            جزئیات
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => {
                                                setSelectedClient(client);
                                                setShowAddClientModal(true);
                                            }}
                                        >
                                            <Edit className="w-4 h-4 mr-1" />
                                            ویرایش
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="text-red-500 border-red-500 hover:bg-red-50"
                                            onClick={() => {
                                                if (window.confirm("آیا از حذف این مشتری اطمینان دارید؟")) {
                                                    removeClient(client.id, {
                                                        onSuccess: () => toast.success("مشتری با موفقیت حذف شد"),
                                                        onError: () => toast.error("خطا در حذف مشتری")
                                                    });
                                                }
                                            }}
                                        >
                                            <Trash2 className="w-4 h-4 mr-1" />
                                            حذف
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* مودال افزودن مشتری */}
            {showAddClientModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowAddClientModal(false)}></div>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md z-50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">افزودن مشتری</h2>
                            <button  onClick={() => setShowAddClientModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    value={newClientData.name}
                                    onChange={(e) => setNewClientData({...newClientData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    value={newClientData.lastName}
                                    onChange={(e) => setNewClientData({...newClientData, lastName: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    value={newClientData.mobile}
                                    onChange={(e) => setNewClientData({...newClientData, mobile: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل (اختیاری)</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    value={newClientData.email}
                                    onChange={(e) => setNewClientData({...newClientData, email: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">یادداشت (اختیاری)</label>
                                <textarea
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    rows={3}
                                    value={newClientData.notes}
                                    onChange={(e) => setNewClientData({...newClientData, notes: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button
                                onClick={handleAddExistingClient}
                                className="flex-1 bg-orange-500 hover:bg-orange-600"
                            >
                                افزودن مشتری موجود
                            </Button>
                            <Button
                                onClick={handleRegisterNewClient}
                                className="flex-1 bg-orange-500 hover:bg-orange-600"
                            >
                                ثبت‌نام جدید
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* مودال ارسال لینک دعوت */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setShowInviteModal(false)}></div>
                    <div className="bg-white rounded-lg p-6 w-full max-w-md z-50">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold">ارسال لینک دعوت</h2>
                            <button onClick={() => setShowInviteModal(false)}>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نام</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    value={inviteData.name}
                                    onChange={(e) => setInviteData({...inviteData, name: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">نام خانوادگی</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    value={inviteData.lastName}
                                    onChange={(e) => setInviteData({...inviteData, lastName: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">شماره موبایل</label>
                                <input
                                    type="text"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    value={inviteData.mobile}
                                    onChange={(e) => setInviteData({...inviteData, mobile: e.target.value})}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">ایمیل (اختیاری)</label>
                                <input
                                    type="email"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-600"
                                    value={inviteData.email}
                                    onChange={(e) => setInviteData({...inviteData, email: e.target.value})}
                                />
                            </div>
                        </div>

                        <Button
                            onClick={handleCreateInvitationLink}
                            className="w-full mt-6"
                        >
                            ایجاد لینک دعوت
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}