// components/XPressable.tsx
import React, { ReactNode, CSSProperties, useState } from "react";

type XPressableProps = {
    children?: ReactNode;
    onPress?: (e: React.MouseEvent<HTMLDivElement>) => void;
    onLongPress?: (e: React.MouseEvent<HTMLDivElement>) => void;
    disabled?: boolean;
    style?: CSSProperties | ((state: { pressed: boolean }) => CSSProperties);
    android_ripple?: { color?: string }; // فقط سازگاری
    hitSlop?: number; // فقط سازگاری
} & React.HTMLAttributes<HTMLDivElement>;

export default function XPressable({
                                       children,
                                       onPress,
                                       onLongPress,
                                       disabled = false,
                                       style,
                                       ...rest
                                   }: XPressableProps) {
    const [pressed, setPressed] = useState(false);

    const computedStyle: CSSProperties =
        typeof style === "function" ? style({ pressed }) : style || {};

    return (
        <div
            role="button"
            tabIndex={disabled ? -1 : 0}
            onClick={(e) => !disabled && onPress?.(e)}
            onContextMenu={(e) => {
                e.preventDefault();
                !disabled && onLongPress?.(e);
            }}
            onMouseDown={() => setPressed(true)}
            onMouseUp={() => setPressed(false)}
            style={{
                cursor: disabled ? "default" : "pointer",
                userSelect: "none",
                ...computedStyle,
            }}
            {...rest}
        >
            {children}
        </div>
    );
}
