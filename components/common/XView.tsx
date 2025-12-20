// components/View.tsx
import React, { type ReactNode, type CSSProperties } from "react";

type XViewProps = {
    children?: ReactNode;
    style?: CSSProperties;
    className?: string;
};

export default function XView({ children, style, className }: XViewProps) {
    return (
        <div style={style} className={className}>
            {children}
        </div>
    );
}
