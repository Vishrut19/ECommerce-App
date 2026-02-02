'use client';

import { Button } from '@/components/ui/button';
import { ShoppingBag, ArrowRight, Leaf } from 'lucide-react';
import Link from 'next/link';

// For AgroOrder B2B, buyers typically order directly from product pages
// This page redirects users to the products catalog

export default function CartPage() {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 py-16">
            <div className="max-w-lg text-center space-y-8">
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto">
                    <ShoppingBag className="w-10 h-10 text-green-600" />
                </div>
                
                <div className="space-y-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-green-800 dark:text-green-200">
                        Wholesale Ordering
                    </h1>
                    <p className="text-muted-foreground leading-relaxed">
                        AgroOrder uses a direct ordering system for B2B wholesale. 
                        Browse our catalog and submit orders directly from product pages 
                        with your quantity requirements.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link href="/products">
                        <Button className="bg-green-600 hover:bg-green-700 h-12 px-8">
                            Browse Products
                            <ArrowRight className="ml-2 w-4 h-4" />
                        </Button>
                    </Link>
                </div>

                <div className="pt-8 border-t">
                    <p className="text-sm text-muted-foreground mb-4">
                        Featured Categories
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                        <Link href="/products?category=grains-pulses">
                            <Button variant="outline" size="sm">🌾 Grains</Button>
                        </Link>
                        <Link href="/products?category=vegetables">
                            <Button variant="outline" size="sm">🥔 Vegetables</Button>
                        </Link>
                        <Link href="/products?category=fruits">
                            <Button variant="outline" size="sm">🍎 Fruits</Button>
                        </Link>
                        <Link href="/products?category=spices">
                            <Button variant="outline" size="sm">🌶 Spices</Button>
                        </Link>
                        <Link href="/products?category=dairy">
                            <Button variant="outline" size="sm">🧀 Dairy</Button>
                        </Link>
                        <Link href="/products?category=organic">
                            <Button variant="outline" size="sm">
                                <Leaf className="w-3 h-3 mr-1" /> Organic
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
