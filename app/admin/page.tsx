'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
    Package, 
    ShoppingBag, 
    Users, 
    ArrowRight, 
    TrendingUp,
    AlertTriangle,
    CheckCircle2,
    Clock,
    IndianRupee
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { DashboardStats, Order } from '@/types';

export default function AdminDashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/dashboard');
                const data = await res.json();
                if (data.success) {
                    setStats(data.data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setIsLoading(false);
            }
        }
        fetchStats();
    }, []);

    const statCards = [
        {
            label: 'Total Orders',
            value: stats?.totalOrders || 0,
            subValue: `${stats?.pendingOrders || 0} pending`,
            icon: ShoppingBag,
            color: 'bg-blue-500',
        },
        {
            label: 'Active Products',
            value: stats?.activeProducts || 0,
            subValue: `of ${stats?.totalProducts || 0} total`,
            icon: Package,
            color: 'bg-green-500',
        },
        {
            label: 'Low Stock Alerts',
            value: stats?.lowStockProducts || 0,
            subValue: 'items need restock',
            icon: AlertTriangle,
            color: 'bg-amber-500',
        },
        {
            label: 'Monthly Revenue',
            value: `₹${((stats?.monthlyRevenue || 0) / 1000).toFixed(1)}K`,
            subValue: 'this month',
            icon: IndianRupee,
            color: 'bg-purple-500',
        },
    ];

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING': return 'text-amber-600 bg-amber-50';
            case 'CONFIRMED': return 'text-blue-600 bg-blue-50';
            case 'PROCESSING': return 'text-purple-600 bg-purple-50';
            case 'DELIVERED': return 'text-green-600 bg-green-50';
            case 'CANCELLED': return 'text-red-600 bg-red-50';
            default: return 'text-gray-600 bg-gray-50';
        }
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">Dashboard</h1>
                <p className="text-muted-foreground">
                    Welcome to AgroOrder - Monitor your wholesale operations
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div 
                        key={i} 
                        className={cn(
                            "bg-white dark:bg-gray-900 rounded-xl border p-6 transition-all hover:shadow-lg",
                            isLoading && "animate-pulse"
                        )}
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={cn("p-3 rounded-lg text-white", stat.color)}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <TrendingUp className="h-4 w-4 text-green-500" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-muted-foreground">{stat.label}</p>
                            <p className="text-2xl font-bold">{isLoading ? '—' : stat.value}</p>
                            <p className="text-xs text-muted-foreground">{stat.subValue}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Recent Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Quick Actions */}
                <div className="space-y-6">
                    <h2 className="text-xl font-semibold">Quick Actions</h2>
                    
                    <div className="space-y-4">
                        <Link href="/admin/products/new" className="block">
                            <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 hover:border-green-500 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900 text-green-600 group-hover:bg-green-600 group-hover:text-white transition-all">
                                        <Package className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">Add New Product</h3>
                                        <p className="text-sm text-muted-foreground">List a new farm produce</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-green-600" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/orders" className="block">
                            <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 hover:border-green-500 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ShoppingBag className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">Manage Orders</h3>
                                        <p className="text-sm text-muted-foreground">Process bulk orders</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-blue-600" />
                                </div>
                            </div>
                        </Link>

                        <Link href="/admin/products" className="block">
                            <div className="bg-white dark:bg-gray-900 rounded-xl border p-6 hover:border-green-500 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-all">
                                        <AlertTriangle className="h-5 w-5" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-semibold">Check Inventory</h3>
                                        <p className="text-sm text-muted-foreground">Monitor stock levels</p>
                                    </div>
                                    <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-amber-600" />
                                </div>
                            </div>
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-semibold">Recent Orders</h2>
                        <Link href="/admin/orders" className="text-sm text-green-600 hover:underline">
                            View all
                        </Link>
                    </div>

                    <div className="bg-white dark:bg-gray-900 rounded-xl border overflow-hidden">
                        {isLoading ? (
                            <div className="p-8 text-center text-muted-foreground">
                                Loading orders...
                            </div>
                        ) : stats?.recentOrders && stats.recentOrders.length > 0 ? (
                            <div className="divide-y">
                                {stats.recentOrders.slice(0, 5).map((order: Order) => (
                                    <div key={order.id} className="p-4 hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex items-center gap-3">
                                                <span className="font-mono text-sm font-semibold">
                                                    {order.orderNumber}
                                                </span>
                                                <span className={cn(
                                                    "px-2 py-1 rounded-full text-xs font-medium",
                                                    getStatusColor(order.status)
                                                )}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <span className="font-semibold">
                                                ₹{order.totalAmount.toLocaleString()}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                                            <span>{order.buyerName} • {order.buyerCompany || 'Individual'}</span>
                                            <span className="flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {new Date(order.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="p-8 text-center text-muted-foreground">
                                <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
                                <p>No orders yet</p>
                                <p className="text-sm">Orders will appear here when buyers place them</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
