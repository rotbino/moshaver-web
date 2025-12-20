// components/XScrollView.tsx
import React, { ReactNode, CSSProperties, isValidElement, cloneElement } from "react";

type XScrollViewProps = {
    children?: ReactNode;
    horizontal?: boolean;
    style?: CSSProperties;
    contentContainerStyle?: CSSProperties;
    showsVerticalScrollIndicator?: boolean;
    showsHorizontalScrollIndicator?: boolean;
    onScroll?: (e: React.UIEvent<HTMLDivElement>) => void;
    refreshControl?: ReactNode; // اینجا اضافه شد
} & React.HTMLAttributes<HTMLDivElement>;

export default function XScrollView({
                                        children,
                                        horizontal = false,
                                        style,
                                        contentContainerStyle,
                                        showsVerticalScrollIndicator = true,
                                        showsHorizontalScrollIndicator = true,
                                        onScroll,
                                        refreshControl,
                                        ...rest
                                    }: XScrollViewProps) {
    const scrollStyle: CSSProperties = {
        overflowX: horizontal ? "auto" : "hidden",
        overflowY: horizontal ? "hidden" : "auto",
        scrollbarWidth: showsVerticalScrollIndicator ? "auto" : "none",
        msOverflowStyle: showsVerticalScrollIndicator ? "auto" : "none",
        ...style,
    };

    const containerStyle: CSSProperties = {
        display: "flex",
        flexDirection: horizontal ? "row" : "column",
        ...contentContainerStyle,
    };

    return (
        <div style={scrollStyle} onScroll={onScroll} {...rest}>
            {refreshControl && isValidElement(refreshControl)
                ? cloneElement(refreshControl, {})
                : null}
            <div style={containerStyle}>{children}</div>
        </div>
    );
}
