// components/XRefreshControl.tsx
import React, { useState, useEffect } from "react";


type XRefreshControlProps = {
    refreshing: boolean;
    onRefresh: () => void;
    title?: string;
    color?: string;
};

export default function XRefreshControl({
                                            refreshing,
                                            onRefresh,
                                            title = "در حال بروزرسانی...",
                                            color = "#333",
                                        }: XRefreshControlProps) {


    // نسخه وب
    const [pulling, setPulling] = useState(false);

    useEffect(() => {
        if (refreshing) setPulling(false);
    }, [refreshing]);

    // لیسنر کشیدن صفحه
    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY <= -50 && !refreshing && !pulling) {
                setPulling(true);
                onRefresh();
            }
        };

        // مرورگرها اجازه scrollY منفی نمی‌دن → باید touchstart/end شبیه‌سازی کنیم
        let startY = 0;
        const handleTouchStart = (e: TouchEvent) => {
            startY = e.touches[0].clientY;
        };
        const handleTouchEnd = (e: TouchEvent) => {
            const endY = e.changedTouches[0].clientY;
            if (endY - startY > 80 && !refreshing) {
                setPulling(true);
                onRefresh();
            }
        };

        window.addEventListener("touchstart", handleTouchStart);
        window.addEventListener("touchend", handleTouchEnd);
        window.addEventListener("scroll", handleScroll);

        return () => {
            window.removeEventListener("touchstart", handleTouchStart);
            window.removeEventListener("touchend", handleTouchEnd);
            window.removeEventListener("scroll", handleScroll);
        };
    }, [refreshing, pulling, onRefresh]);

    return (
        <div
            style={{
                textAlign: "center",
                padding: "10px",
                fontSize: "14px",
                color,
                display: refreshing || pulling ? "block" : "none",
            }}
        >
            {title}
        </div>
    );
}
