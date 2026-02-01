'use client';

import { useProducts } from '@/hooks/use-products';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';
import { ArrowRight, Plus } from 'lucide-react';

export default function ClothesPage() {
    const { data: products, isLoading, error } = useProducts('clothes');
    const selectedCurrency = useCartStore((state) => state.selectedCurrency);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24">
                <div className="mb-16 space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-12 w-64" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="space-y-4">
                            <Skeleton className="aspect-square w-full" />
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-4 w-1/4" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-4xl font-bold mb-4">Oops!</h1>
                <p className="text-muted-foreground">Error loading products. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-24">
            <div className="mb-16">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground block mb-2">Category</span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">MODERN ATTIRE</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
                {products?.map((product) => {
                    const price = product.prices.find(p => p.currency.label === selectedCurrency.label);

                    return (
                        <Link href={`/clothes/${product.id}`} key={product.id} className="group">
                            <div className="relative aspect-square overflow-hidden bg-muted mb-6">
                                <Image
                                    src={product.gallery[0]}
                                    alt={product.name}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                />
                                {!product.inStock && (
                                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-10">
                                        <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Sold Out</span>
                                    </div>
                                )}
                                <div className="absolute bottom-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 z-20">
                                    <div className="w-10 h-10 bg-primary text-primary-foreground flex items-center justify-center">
                                        <Plus className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold tracking-tight group-hover:text-muted-foreground transition-colors">{product.name}</h3>
                                    <p className="font-bold">
                                        {selectedCurrency.symbol}{price?.amount.toFixed(2)}
                                    </p>
                                </div>
                                <p className="text-xs uppercase tracking-widest text-muted-foreground">{product.brand}</p>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
