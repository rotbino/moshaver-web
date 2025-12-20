// app/home/MobileFooter.tsx

import {useAuth, useUserQuestionStats} from "@/lib/api/useApi";
import {Home, MessageSquare,ShieldQuestion  , User} from "lucide-react";
import Link from "next/link";
import {usePathname} from "next/navigation";

export default function MobileFooter() {
    const pathname = usePathname();
    const { user: currentUser } = useAuth();
    const { data: userStats } = useUserQuestionStats(currentUser?.id);

    const navItems = [
        { href: "/", label: "خانه", icon: <Home className="w-5 h-5" /> },
        {
            href: "/questions",
            label: "سوالات",
            icon: (
                <div className="relative">
                    <ShieldQuestion  className="w-5 h-5" />
                    {userStats?.newAnswersCount && userStats.newAnswersCount > 0 ? (
                        <span className="absolute -top-3 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
              {userStats.newAnswersCount > 9 ? '+9' : 5}
            </span>
                    ):null}
                </div>
            )
        },
        { href: '/question', label: "پیامها", icon: <MessageSquare className="w-5 h-5" /> },
        { href:currentUser?.role==='user'? '/lawyer-dashboard':'/user-dashboard', label: "پنل", icon: <User className="w-5 h-5" /> },
    ];

    return (
        <footer className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50">
            <div className="flex justify-around py-2">
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`flex flex-col items-center justify-center w-16 py-1 text-xs transition-colors ${
                            pathname === item.href
                                ? "text-[#ca2a30]"
                                : "text-gray-500 hover:text-[#ca2a30]"
                        }`}
                    >
                        {item.icon}
                        <span className="mt-1">{item.label}</span>
                    </Link>
                ))}
            </div>
        </footer>
    );
}