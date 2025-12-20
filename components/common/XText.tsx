// components/Text.tsx
import React, { type ReactNode, type CSSProperties } from "react";

type XTextProps = {
    children?: ReactNode;
    style?: CSSProperties;
    numberOfLines?: number;
    ellipsizeMode?: "head" | "middle" | "tail" | "clip";
    allowFontScaling?: boolean;
    className?: string;
    testID?: string;
};

export default function XText({
                                  children,
                                  style,
                                  className,
                                  ...rest
                              }: XTextProps) {
    return (
        <span style={style} className={className} {...rest}>
          {children}
        </span>
    );
}
