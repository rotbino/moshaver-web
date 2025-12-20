// components/XKeyboardAvoidingView.tsx
import React, { ReactNode } from "react";

type XKeyboardAvoidingViewProps = {
    children?: ReactNode;
    behavior?: "height" | "position" | "padding";
    style?: React.CSSProperties;
};

export default function XKeyboardAvoidingView({
                                                  children,
                                                  style,
                                              }: XKeyboardAvoidingViewProps) {
    // وب کیبورد نداره → صرفا passthrough
    return <div style={style}>{children}</div>;
}
