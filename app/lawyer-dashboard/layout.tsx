// app/lawyer-dashboard/DashboardLayout.tsx

"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/radix/button";
import { Menu, User, ArrowLeft, Home } from "lucide-react";
import { useAuth } from "@/lib/data-transfer/api-hooks";
import LawyerSidebar from "@/app/lawyer-dashboard/LawyerSidebar";
import Link from "next/link";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { useCurrentUser } = useAuth();
    const currentUser = useCurrentUser();

    if (!currentUser || currentUser.role !== "LAWYER") {
        router.push('/login');
        return null;
    }

    const handleBackToUserPanel = () => {
        router.push('/user-dashboard');
    };

    return (
        <div className="min-h-screen flex">
            {/* Sidebar برای وکلا */}
            <LawyerSidebar
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top Bar */}
                <div className="bg-white shadow-sm sticky top-0 z-30">
                    <div className="px-4 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="sm"
                                className="lg:hidden"
                                onClick={() => setIsSidebarOpen(true)}
                            >
                                <Menu className="w-5 h-5" />
                            </Button>

                            <div className="hidden sm:block text-sm text-gray-600">
                                {new Date().toLocaleDateString('fa-IR', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </div>
                            <div className="block sm:hidden text-sm text-gray-600 font-bold">
                                پنل وکالت
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <Link href="/user-dashboard">
                                <div
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                    <User className="w-4 h-4 text-orange-600" />
                                </div>
                            </Link>
                            <Link href="/">
                                <div
                                    className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors">
                                    <Home className="w-4 h-4 text-orange-600" />
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-gray-50">
                    {children}
                </main>
            </div>
        </div>
    );
}