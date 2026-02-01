'use client';

import { useProducts } from '@/hooks/use-products';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import Image from 'next/image';
import { useCartStore } from '@/store/cart-store';

export default function ClothesPage() {
    const { data: products, isLoading, error } = useProducts('clothes');
    const selectedCurrency = useCartStore((state) => state.selectedCurrency);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8">Clothes</h1>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-48 w-full" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-3/4 mb-2" />
                                <Skeleton className="h-4 w-1/2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold mb-8">Clothes</h1>
                <p className="text-red-500">Error loading products. Please try again later.</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-4xl font-bold mb-8">Clothes</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products?.map((product) => {
                    const price = product.prices.find(p => p.currency.label === selectedCurrency.label);

                    return (
                        <Link href={`/clothes/${product.id}`} key={product.id}>
                            <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                                <CardHeader className="p-0">
                                    <div className="relative h-64 w-full">
                                        <Image
                                            src={product.gallery[0]}
                                            alt={product.name}
                                            fill
                                            className="object-cover rounded-t-lg"
                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                        />
                                        {!product.inStock && (
                                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                <Badge variant="secondary" className="text-lg">Out of Stock</Badge>
                                            </div>
                                        )}
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-4">
                                    <h3 className="font-semibold text-lg mb-1">{product.name}</h3>
                                    <p className="text-sm text-muted-foreground mb-2">{product.brand}</p>
                                </CardContent>

                                <CardFooter>
                                    <p className="text-xl font-bold">
                                        {selectedCurrency.symbol}{price?.amount.toFixed(2)}
                                    </p>
                                </CardFooter>
                            </Card>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
