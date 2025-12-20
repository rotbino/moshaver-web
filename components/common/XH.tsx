// components/XH.tsx
import React, {type CSSProperties, JSX, type ReactNode} from "react";

type XHProps = {
    size?: 1 | 2 | 3 | 4 | 5 | 6;
    children?: ReactNode;
    style?: CSSProperties;
    allowFontScaling?: boolean;
    className?: string;
    testID?: string;
} & React.HTMLAttributes<HTMLHeadingElement>;

export default function XH({ size = 1, children, ...rest }: XHProps) {
    const Tag = (`h${size}`) as keyof JSX.IntrinsicElements;
    return <Tag {...(rest as any)}>{children}</Tag>;
}
