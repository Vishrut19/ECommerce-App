'use client';

import { useProduct } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useCartStore } from '@/store/cart-store';
import { useState } from 'react';
import Image from 'next/image';
import { use } from 'react';
import { ArrowLeft, ShoppingBag, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { data: product, isLoading, error } = useProduct(id);
    const { addItem, selectedCurrency } = useCartStore();
    const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
    const [selectedImage, setSelectedImage] = useState(0);
    const [isAdded, setIsAdded] = useState(false);

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-24">
                <div className="grid lg:grid-cols-2 gap-16">
                    <Skeleton className="aspect-square w-full" />
                    <div className="space-y-8">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-12 w-3/4" />
                        <Skeleton className="h-8 w-24" />
                        <Skeleton className="h-40 w-full" />
                    </div>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-4xl font-bold mb-4">Not Found</h1>
                <p className="text-muted-foreground mb-8">The product you are looking for does not exist.</p>
                <Link href="/clothes">
                    <Button variant="outline" className="rounded-none px-8">Back to Shop</Button>
                </Link>
            </div>
        );
    }

    const price = product.prices.find(p => p.currency.label === selectedCurrency.label);
    const canAddToCart = product.inStock &&
        product.attributes.every(attr => selectedAttributes[attr.id]);

    const handleAddToCart = () => {
        if (canAddToCart) {
            addItem(product, selectedAttributes);
            setIsAdded(true);
            setTimeout(() => setIsAdded(false), 2000);
        }
    };

    return (
        <div className="container mx-auto px-4 py-24">
            <Link href="/clothes" className="inline-flex items-center text-xs uppercase tracking-widest font-bold mb-12 hover:text-muted-foreground transition-colors group">
                <ArrowLeft className="mr-2 w-4 h-4 transition-transform group-hover:-translate-x-1" />
                Back to Collection
            </Link>

            <div className="grid lg:grid-cols-12 gap-16">
                {/* Image Gallery - Left Side (Desktop: 2 columns thumbnails, 6 columns main) */}
                <div className="lg:col-span-8 grid grid-cols-12 gap-4">
                    <div className="col-span-2 space-y-4">
                        {product.gallery.map((image, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedImage(index)}
                                className={`relative aspect-square w-full bg-muted overflow-hidden border ${selectedImage === index ? 'border-primary' : 'border-transparent'
                                    }`}
                            >
                                <Image
                                    src={image}
                                    alt={`${product.name} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="10vw"
                                />
                            </button>
                        ))}
                    </div>
                    <div className="col-span-10 relative aspect-square bg-muted overflow-hidden">
                        <Image
                            src={product.gallery[selectedImage]}
                            alt={product.name}
                            fill
                            className="object-cover animate-in fade-in duration-500"
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority
                        />
                        {!product.inStock && (
                            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                                <span className="text-xs uppercase tracking-[0.3em] font-bold">Sold Out</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Product Info - Right Side (Desktop: 4 columns) */}
                <div className="lg:col-span-4 space-y-12">
                    <div>
                        <span className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground block mb-2">{product.brand}</span>
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tighter mb-4 leading-none">{product.name}</h1>
                        <p className="text-2xl font-bold tracking-tight">
                            {selectedCurrency.symbol}{price?.amount.toFixed(2)}
                        </p>
                    </div>

                    {/* Attributes */}
                    {product.attributes.map((attributeSet) => (
                        <div key={attributeSet.id} className="space-y-4">
                            <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{attributeSet.name}</h3>
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
                                                className={`h-12 w-12 border transition-all ${isSelected ? 'border-primary p-1' : 'border-border/60'
                                                    }`}
                                                title={item.displayValue}
                                            >
                                                <div className="w-full h-full" style={{ backgroundColor: item.value }} />
                                            </button>
                                        );
                                    }

                                    return (
                                        <button
                                            key={item.id}
                                            onClick={() =>
                                                setSelectedAttributes((prev) => ({
                                                    ...prev,
                                                    [attributeSet.id]: item.value,
                                                }))
                                            }
                                            className={`px-6 h-12 text-xs uppercase tracking-widest font-bold border transition-all ${isSelected
                                                ? 'bg-primary text-primary-foreground border-primary'
                                                : 'bg-transparent border-border hover:border-primary'
                                                }`}
                                        >
                                            {item.displayValue}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="space-y-4">
                        <Button
                            size="lg"
                            className="w-full h-16 rounded-none uppercase tracking-[0.2em] font-bold transition-all relative overflow-hidden group"
                            disabled={!canAddToCart}
                            onClick={handleAddToCart}
                        >
                            {isAdded ? (
                                <span className="flex items-center gap-2 animate-in slide-in-from-bottom-2">
                                    <CheckCircle2 className="w-5 h-5" /> Added to Bag
                                </span>
                            ) : (
                                <span className="flex items-center gap-2 group-hover:scale-105 transition-transform">
                                    <ShoppingBag className="w-5 h-5" />
                                    {product.inStock ? 'Add to Bag' : 'Out of Stock'}
                                </span>
                            )}
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest">
                            Free worldwide shipping on all orders over {selectedCurrency.symbol}200
                        </p>
                    </div>

                    <div className="pt-12 border-t border-border/40">
                        <h3 className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-4">Description</h3>
                        <div
                            className="prose prose-invert prose-sm max-w-none text-muted-foreground leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
