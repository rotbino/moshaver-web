// components/XModal.tsx
import React, { ReactNode } from "react";
import ReactDOM from "react-dom";

type XModalProps = {
    visible: boolean;
    onRequestClose?: () => void;
    transparent?: boolean;
    animationType?: "none" | "slide" | "fade";
    children?: ReactNode;
};

export default function XModal({
                                   visible,
                                   onRequestClose,
                                   transparent = false,
                                   children,
                               }: XModalProps) {
    if (!visible) return null;

    return ReactDOM.createPortal(
        <div
            style={{
                position: "fixed",
                inset: 0,
                backgroundColor: transparent ? "rgba(0,0,0,0.5)" : "white",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                zIndex: 9999,
            }}
            onClick={onRequestClose}
        >
            <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>,
        document.body
    );
}
