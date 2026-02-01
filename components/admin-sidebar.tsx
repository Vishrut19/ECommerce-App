'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
    LayoutDashboard, 
    Package, 
    ShoppingBag, 
    LogOut, 
    ExternalLink,
    ChevronRight,
    Search,
    Settings,
    Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth-client';

const sidebarLinks = [
    {
        title: 'Terminal',
        href: '/admin',
        icon: LayoutDashboard,
    },
    {
        title: 'Products',
        href: '/admin/products',
        icon: Package,
    },
    {
        title: 'Orders',
        href: '/admin/orders',
        icon: ShoppingBag,
    },
];

export function AdminSidebar() {
    const pathname = usePathname();
    const router = useRouter();

    const handleLogout = async () => {
        await signOut();
        router.push('/admin/login');
        router.refresh();
    };

    return (
        <aside className="fixed left-0 top-0 h-screen w-72 border-r border-border/40 bg-background z-50 flex flex-col">
            {/* Header */}
            <div className="p-8 border-b border-border/10">
                <Link href="/admin" className="flex items-center gap-3 group">
                    <div className="w-10 h-10 bg-primary flex items-center justify-center transition-transform group-hover:scale-105">
                        <span className="text-primary-foreground font-bold text-xl tracking-tighter">L</span>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold tracking-tighter uppercase leading-none">Lumina</h2>
                        <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Terminal v2.0</span>
                    </div>
                </Link>
            </div>

            {/* Search - Decorative */}
            <div className="px-6 py-6">
                <div className="relative group">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground transition-colors group-focus-within:text-primary" />
                    <input 
                        type="text" 
                        placeholder="SEARCH COMMANDS..." 
                        className="w-full bg-muted/30 border border-border/40 h-10 pl-10 pr-4 text-[10px] uppercase tracking-widest font-bold focus:outline-none focus:ring-1 focus:ring-primary transition-all"
                    />
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-1 overflow-y-auto py-4">
                <div className="px-4 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 font-bold">Core Modules</span>
                </div>
                {sidebarLinks.map((link) => {
                    const isActive = pathname === link.href;
                    const Icon = link.icon;
                    
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "flex items-center justify-between px-4 py-3 group transition-all relative overflow-hidden",
                                isActive 
                                    ? "bg-primary text-primary-foreground" 
                                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                            )}
                        >
                            <div className="flex items-center gap-4 relative z-10">
                                <Icon className={cn("h-4 w-4 transition-transform group-hover:scale-110", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                                <span className="text-xs uppercase tracking-[0.2em] font-bold">{link.title}</span>
                            </div>
                            <ChevronRight className={cn(
                                "h-3 w-3 transition-all",
                                isActive ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0"
                            )} />
                            {isActive && (
                                <div className="absolute left-0 top-0 w-1 h-full bg-primary-foreground/30" />
                            )}
                        </Link>
                    );
                })}

                <div className="px-4 mt-12 mb-4">
                    <span className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground/60 font-bold">System</span>
                </div>
                <Link
                    href="/"
                    target="_blank"
                    className="flex items-center gap-4 px-4 py-3 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all group"
                >
                    <ExternalLink className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs uppercase tracking-[0.2em] font-bold">View Storefront</span>
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-4 px-4 py-3 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all group"
                >
                    <LogOut className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs uppercase tracking-[0.2em] font-bold">Terminate Session</span>
                </button>
            </nav>

            {/* Footer */}
            <div className="p-6 border-t border-border/10 bg-muted/20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center">
                        <span className="text-[10px] font-bold">AD</span>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-[10px] font-bold uppercase tracking-widest truncate">Administrator</p>
                        <p className="text-[9px] text-muted-foreground truncate uppercase tracking-tighter">Secure Connection Active</p>
                    </div>
                    <div className="flex gap-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </aside>
    );
}
