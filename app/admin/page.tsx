'use client';

import { useProducts } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Package, ShoppingBag, Users, ArrowRight, LayoutDashboard } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

export default function AdminDashboardPage() {
    const { data: products } = useProducts();
    const { data: session } = useSession();
    
    const techProducts = products?.filter(p => p.category === 'tech').length || 0;
    const clothesProducts = products?.filter(p => p.category === 'clothes').length || 0;
    const inStockProducts = products?.filter(p => p.inStock).length || 0;
    const lowStockProducts = products?.filter(p => p.inStock && (p as any).stock < 10).length || 0;

    const stats = [
        {
            label: 'Total Inventory',
            value: products?.length || 0,
            subValue: `${inStockProducts} Active SKUs`,
            icon: Package,
            trend: '+2.4%',
            color: 'primary'
        },
        {
            label: 'Tech Segment',
            value: techProducts,
            subValue: 'Active Inventory',
            icon: ShoppingBag,
            trend: '+1.2%',
            color: 'primary'
        },
        {
            label: 'Fashion Segment',
            value: clothesProducts,
            subValue: 'Active Inventory',
            icon: Users,
            trend: '-0.4%',
            color: 'primary'
        }
    ];

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* Hero Section */}
            <div className="flex flex-col gap-4">
                <h2 className="text-4xl font-bold tracking-tighter uppercase">Command Center</h2>
                <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium max-w-2xl">
                    Unified interface for LUMINA operations. Monitor inventory, manage fulfillment, and analyze system performance metrics in real-time.
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="group relative overflow-hidden border border-border/40 bg-muted/20 p-8 transition-all hover:border-primary/50">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <stat.icon className="h-24 w-24 -mr-8 -mt-8" />
                        </div>
                        
                        <div className="relative z-10 space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-muted-foreground">{stat.label}</span>
                                <stat.icon className="h-4 w-4 text-primary" />
                            </div>
                            <div className="flex items-baseline gap-4">
                                <span className="text-5xl font-bold tracking-tighter">{stat.value}</span>
                                <span className={cn(
                                    "text-[10px] font-bold tracking-widest px-2 py-0.5 border",
                                    stat.trend.startsWith('+') ? "text-green-500 border-green-500/20 bg-green-500/5" : "text-red-500 border-red-500/20 bg-red-500/5"
                                )}>
                                    {stat.trend}
                                </span>
                            </div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{stat.subValue}</p>
                        </div>

                        <div className="absolute bottom-0 left-0 w-full h-1 bg-primary/10 group-hover:bg-primary/30 transition-colors" />
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* System Status */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between border-b border-border/10 pb-4">
                        <h3 className="text-xl font-bold tracking-tighter uppercase">Operational Status</h3>
                        <div className="flex items-center gap-2">
                            <div className="h-2 w-2 rounded-full bg-green-500" />
                            <span className="text-[10px] uppercase tracking-widest font-bold text-green-500">All Systems Nominal</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-border/40 p-8 space-y-6 group hover:bg-muted/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <Package className="h-4 w-4" />
                                </div>
                                <h4 className="font-bold tracking-tighter uppercase">Inventory Core</h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium uppercase tracking-wider">
                                Manage your global product database. Update SKUs, adjust pricing, and control visibility across segments.
                            </p>
                            <Link href="/admin/products">
                                <Button variant="outline" className="w-full rounded-none h-12 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-primary hover:text-primary-foreground transition-all">
                                    Access Catalog
                                    <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                            </Link>
                        </div>

                        <div className="border border-border/40 p-8 space-y-6 group hover:bg-muted/30 transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 border border-border/40 flex items-center justify-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                                    <ShoppingBag className="h-4 w-4" />
                                </div>
                                <h4 className="font-bold tracking-tighter uppercase">Fulfillment Engine</h4>
                            </div>
                            <p className="text-xs text-muted-foreground leading-relaxed font-medium uppercase tracking-wider">
                                Process customer transactions, track logistics, and manage order lifecycles from initiation to delivery.
                            </p>
                            <Link href="/admin/orders">
                                <Button variant="outline" className="w-full rounded-none h-12 uppercase tracking-[0.2em] text-[10px] font-bold hover:bg-primary hover:text-primary-foreground transition-all">
                                    Review Orders
                                    <ArrowRight className="ml-2 h-3 w-3" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Activity Feed */}
                <div className="space-y-8">
                    <div className="flex items-center justify-between border-b border-border/10 pb-4">
                        <h3 className="text-xl font-bold tracking-tighter uppercase">System Logs</h3>
                        <Link href="#" className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors">View All</Link>
                    </div>

                    <div className="space-y-6">
                        {[
                            { event: 'New Order Received', time: '2m ago', id: '#ORD-9421', type: 'success' },
                            { event: 'Inventory Low: Tech Segment', time: '14m ago', id: 'SKU-8829', type: 'warning' },
                            { event: 'Database Sync Complete', time: '1h ago', id: 'SYS-SYNC', type: 'info' },
                            { event: 'Admin Session Initiated', time: '2h ago', id: 'USR-ADMIN', type: 'info' },
                        ].map((log, i) => (
                            <div key={i} className="flex gap-4 group cursor-default">
                                <div className={cn(
                                    "w-1 mt-1 shrink-0 h-10",
                                    log.type === 'success' ? "bg-green-500" : 
                                    log.type === 'warning' ? "bg-yellow-500" : "bg-primary/20"
                                )} />
                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center justify-between">
                                        <p className="text-[10px] font-bold uppercase tracking-widest group-hover:text-primary transition-colors">{log.event}</p>
                                        <span className="text-[9px] text-muted-foreground font-bold">{log.time}</span>
                                    </div>
                                    <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-bold">{log.id}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
