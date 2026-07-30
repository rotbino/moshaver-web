// app/components/AppHeader.tsx
'use client';

import MobileHeader from './MobileHeader';
import DesktopHeader from './DesktopHeader';

interface AppHeaderProps {
    showLocation?: boolean;
    fixed?: boolean;
}

export function AppHeader({ showLocation = false, fixed = true }: AppHeaderProps) {
    return (
        <>
            <div className="lg:hidden">
                <MobileHeader showLocation={showLocation} fixed={fixed} />
            </div>
            <div className="hidden lg:block">
                <DesktopHeader />
            </div>
        </>
    );
}