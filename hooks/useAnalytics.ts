
"use client"
import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { trackEvent } from '@/lib/analytics';

export const usePageViewTracking = () => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        // Track page views
        const url = pathname + (searchParams?.toString() ? `?${searchParams.toString()}` : '');
        trackEvent('page_view', { page_path: url });
    }, [pathname, searchParams]);
};