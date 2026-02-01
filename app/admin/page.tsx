'use client';

import { useProducts } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Package, ShoppingBag, Users } from 'lucide-react';

export default function AdminDashboardPage() {
    const { data: products } = useProducts();
    const techProducts = products?.filter(p => p.category === 'tech').length || 0;
    const clothesProducts = products?.filter(p => p.category === 'clothes').length || 0;
    const inStockProducts = products?.filter(p => p.inStock).length || 0;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-4xl font-bold">Admin Dashboard</h1>
                <Button asChild>
                    <Link href="/">← Back to Store</Link>
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{products?.length || 0}</div>
                        <p className="text-xs text-muted-foreground">
                            {inStockProducts} in stock
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Tech Products</CardTitle>
                        <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{techProducts}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Clothes</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{clothesProducts}</div>
                    </CardContent>
                </Card>
            </div>

            {/* Quick Actions */}
            <Card>
                <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    <p className="text-muted-foreground mb-4">
                        Admin dashboard features coming soon! This will include:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-sm">
                        <li>Product management table with TanStack Table (sorting, filtering, pagination)</li>
                        <li>Create/Edit product forms with React Hook Form + Zod validation</li>
                        <li>Order management and tracking</li>
                        <li>Customer management</li>
                        <li>Analytics and reports</li>
                    </ul>

                    <div className="pt-4">
                        <p className="text-sm font-medium mb-2">Current Products:</p>
                        <div className="space-y-1 text-sm">
                            {products?.slice(0, 5).map(product => (
                                <div key={product.id} className="flex justify-between">
                                    <span>{product.name}</span>
                                    <span className="text-muted-foreground">{product.category}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
