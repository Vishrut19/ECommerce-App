'use client';

import { useProduct } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Card } from '@/components/ui/card';
import { useCartStore } from '@/store/cart-store';
import { useState } from 'react';
import Image from 'next/image';
import { use } from 'react';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: product, isLoading, error } = useProduct(id);
    const { addItem, selectedCurrency } = useCartStore();
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState(0);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-8">
                    <Skeleton className="h-96 w-full" />
                    <div className="space-y-4">
                        <Skeleton className="h-8 w-3/4" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-24 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-8">
                <p className="text-red-500">Product not found</p>
            </div>
        );
    }

    const price = product.prices.find(p => p.currency.label === selectedCurrency.label);
    const canAddToCart = product.inStock &&
        product.attributes.every(attr => selectedAttributes[attr.id]);

    const handleAddToCart = () => {
        if (canAddToCart) {
            addItem(product, selectedAttributes);
            alert('Added to cart!');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-8">
                {/* Image Gallery */}
                <div>
                    <div className="relative h-96 w-full mb-4">
                        <Image
                            src={product.gallery[selectedImage]}
                            alt={product.name}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto">
                        {product.gallery.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative h-20 w-20 shrink-0 border-2 ${selectedImage === index ? 'border-primary' : 'border-gray-200'
                                    }`}
                            >
                                <Image
                                    src={image}
                                    alt={`${product.name} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="80px"
                                />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Product Info */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                        <p className="text-lg text-muted-foreground">{product.brand}</p>
                    </div>

                    <div className="text-2xl font-bold">
                        {selectedCurrency.symbol}{price?.amount.toFixed(2)}
                    </div>

                    {!product.inStock && (
                        <Badge variant="destructive" className="text-lg">Out of Stock</Badge>
                    )}

                    {/* Attributes */}
                    {product.attributes.map((attributeSet) => (
                        <div key={attributeSet.id}>
                            <h3 className="font-semibold mb-2">{attributeSet.name}:</h3>
                            <div className="flex flex-wrap gap-2">
                                {attributeSet.items.map((item) => {
                                    const isSelected = selectedAttributes[attributeSet.id] === item.value;

                                    if (attributeSet.type === 'swatch') {
                                        return (
                                            <button
                                                key={item.id}
                                                onClick={() =>
                                                    setSelectedAttributes((prev) => ({
                                                        ...prev,
                                                        [attributeSet.id]: item.value,
                                                    }))
                                                }
                                                className={`h-10 w-10 border-2 ${isSelected ? 'border-primary' : 'border-gray-300'
                                                    }`}
                                                style={{ backgroundColor: item.value }}
                                                title={item.displayValue}
                                            />
                                        );
                                    }

                                    return (
                                        <Button
                                            key={item.id}
                                            variant={isSelected ? 'default' : 'outline'}
                                            onClick={() =>
                                                setSelectedAttributes((prev) => ({
                                                    ...prev,
                                                    [attributeSet.id]: item.value,
                                                }))
                                            }
                                        >
                                            {item.displayValue}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <Button
                        size="lg"
                        className="w-full"
                        disabled={!canAddToCart}
                        onClick={handleAddToCart}
                    >
                        {product.inStock ? 'Add to Cart' : 'Out of Stock'}
                    </Button>

                    <Card className="p-4">
                        <div
                            className="prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
}
