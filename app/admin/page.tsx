'use client';

import { useProducts } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Package, ShoppingBag, Users, ArrowRight, LogOut, LayoutDashboard } from 'lucide-react';
import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

export default function AdminDashboardPage() {
    const { data: products } = useProducts();
    const { data: session } = useSession();
    const router = useRouter();
    const techProducts = products?.filter(p => p.category === 'tech').length || 0;
    const clothesProducts = products?.filter(p => p.category === 'clothes').length || 0;
    const inStockProducts = products?.filter(p => p.inStock).length || 0;

    const handleLogout = async () => {
        await signOut();
        router.push('/admin/login');
    };

    return (
        <div className="container mx-auto px-4 py-24 animate-in fade-in duration-1000">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-16">
                <div>
                    <div className="flex items-center gap-2 text-primary mb-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span className="text-xs uppercase tracking-[0.3em] font-bold">Terminal</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tighter">DASHBOARD</h1>
                    <p className="text-muted-foreground mt-4 text-sm font-medium">
                        Connected as <span className="text-foreground">{session?.user?.email}</span>
                    </p>
                </div>
                <div className="flex gap-4">
                    <Link href="/">
                        <Button variant="outline" className="rounded-none h-12 px-8 uppercase tracking-widest text-xs font-bold">
                            View Store
                        </Button>
                    </Link>
                    <Button variant="destructive" onClick={handleLogout} className="rounded-none h-12 px-8 uppercase tracking-widest text-xs font-bold">
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                <div className="bg-muted/30 border border-border/40 p-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Total Inventory</span>
                        <Package className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-4xl font-bold tracking-tighter">{products?.length || 0}</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-primary">
                        {inStockProducts} Units Available
                    </div>
                </div>

                <div className="bg-muted/30 border border-border/40 p-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Tech Segment</span>
                        <ShoppingBag className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-4xl font-bold tracking-tighter">{techProducts}</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Active SKUs
                    </div>
                </div>

                <div className="bg-muted/30 border border-border/40 p-8 space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Fashion Segment</span>
                        <Users className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-4xl font-bold tracking-tighter">{clothesProducts}</div>
                    <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                        Active SKUs
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="border border-border/40 p-12 space-y-8 group hover:bg-muted/10 transition-colors">
                    <h3 className="text-2xl font-bold tracking-tighter uppercase">Catalog Management</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Control your global product inventory with granular attribute management, 
                        real-time stock tracking, and advanced categorization.
                    </p>
                    <Link href="/admin/products" className="block">
                        <Button className="w-full h-14 rounded-none uppercase tracking-[0.2em] font-bold group-hover:bg-primary group-hover:text-primary-foreground">
                            Open Catalog
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>

                <div className="border border-border/40 p-12 space-y-8 group hover:bg-muted/10 transition-colors">
                    <h3 className="text-2xl font-bold tracking-tighter uppercase">Order Fulfillment</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                        Monitor global logistics, manage customer transactions, and analyze sales performance 
                        metrics through our unified fulfillment interface.
                    </p>
                    <Link href="/admin/orders" className="block">
                        <Button className="w-full h-14 rounded-none uppercase tracking-[0.2em] font-bold group-hover:bg-primary group-hover:text-primary-foreground">
                            Review Orders
                            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
