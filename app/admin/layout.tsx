'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Loader2 } from 'lucide-react';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        // Don't check auth on login page
        if (typeof window !== 'undefined' && window.location.pathname === '/admin/login') {
            return;
        }

        if (!isPending && !session) {
            router.push('/admin/login');
        }

        if (!isPending && session && session.user.role !== 'admin') {
            router.push('/');
        }
    }, [session, isPending, router]);

    // Show loading while checking auth
    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    // Don't render admin pages if not authenticated (except login page)
    if (typeof window !== 'undefined' && window.location.pathname !== '/admin/login') {
        if (!session || session.user.role !== 'admin') {
            return null;
        }
    }

    return <>{children}</>;
}
