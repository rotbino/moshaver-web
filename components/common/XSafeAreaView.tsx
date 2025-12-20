// components/XSafeAreaView.tsx
import React, { ReactNode } from "react";

type XSafeAreaViewProps = {
    children?: ReactNode;
    style?: React.CSSProperties;
};

export default function XSafeAreaView({ children, style }: XSafeAreaViewProps) {
    return (
        <div
            style={{
                paddingTop: "env(safe-area-inset-top)",
                paddingBottom: "env(safe-area-inset-bottom)",
                paddingLeft: "env(safe-area-inset-left)",
                paddingRight: "env(safe-area-inset-right)",
                ...style,
            }}
        >
            {children}
        </div>
    );
}
