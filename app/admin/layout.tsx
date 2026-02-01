'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useSession } from '@/lib/auth-client';
import { Loader2, Bell, Search, User } from 'lucide-react';
import { AdminSidebar } from '@/components/admin-sidebar';

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session, isPending } = useSession();
    const isLoginPage = pathname === '/admin/login';

    useEffect(() => {
        if (isLoginPage) return;

        if (!isPending && !session) {
            router.push('/admin/login');
        }

        if (!isPending && session && session.user.role !== 'admin') {
            router.push('/');
        }
    }, [session, isPending, router, isLoginPage]);

    if (isPending && !isLoginPage) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                    <p className="text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">Establishing Secure Link...</p>
                </div>
            </div>
        );
    }

    if (!isLoginPage) {
        if (!session || session.user.role !== 'admin') {
            return null;
        }
    }

    if (isLoginPage) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-primary-foreground">
            <AdminSidebar />
            
            <div className="pl-72 flex flex-col min-h-screen">
                {/* Admin Header */}
                <header className="h-20 border-b border-border/10 bg-background/80 backdrop-blur-xl sticky top-0 z-40 px-12 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <h1 className="text-[10px] uppercase tracking-[0.4em] font-bold text-muted-foreground">
                            {pathname === '/admin' ? 'Terminal / Dashboard' : 
                             pathname.startsWith('/admin/products') ? 'Terminal / Inventory' : 
                             pathname.startsWith('/admin/orders') ? 'Terminal / Fulfillment' : 'Terminal'}
                        </h1>
                    </div>

                    <div className="flex items-center gap-8">
                        <div className="flex items-center gap-6 pr-8 border-r border-border/10">
                            <button className="text-muted-foreground hover:text-primary transition-colors relative">
                                <Bell className="h-4 w-4" />
                                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full border-2 border-background" />
                            </button>
                            <button className="text-muted-foreground hover:text-primary transition-colors">
                                <Search className="h-4 w-4" />
                            </button>
                        </div>
                        
                        <div className="flex items-center gap-4">
                            <div className="text-right">
                                <p className="text-[10px] font-bold uppercase tracking-widest">{session?.user.name}</p>
                                <p className="text-[9px] text-muted-foreground uppercase tracking-tighter">System Operator</p>
                            </div>
                            <div className="w-10 h-10 border border-border/40 bg-muted/30 flex items-center justify-center">
                                <User className="h-4 w-4 text-muted-foreground" />
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 overflow-x-hidden">
                    <div className="max-w-[1600px] mx-auto p-12">
                        {children}
                    </div>
                </main>

                <footer className="py-8 px-12 border-t border-border/10">
                    <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">
                        <p>© 2026 LUMINA ARCHITECTURE // ALL RIGHTS RESERVED</p>
                        <p>STABLE BUILD 2.0.42_X64</p>
                    </div>
                </footer>
            </div>
        </div>
    );
}
