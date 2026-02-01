'use client';

import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Minus, Plus, Trash2, ArrowRight, ShoppingBag } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, getTotal, selectedCurrency } = useCartStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mx-auto mb-8">
                    <ShoppingBag className="w-12 h-12 text-muted-foreground" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tighter">YOUR BAG IS EMPTY</h1>
                <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
                    Looks like you haven't added anything to your collection yet. 
                    Explore our latest technology and fashion arrivals.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                    <Link href="/tech">
                        <Button className="rounded-none px-8 h-12 text-xs uppercase tracking-widest font-bold">
                            Shop Technology
                        </Button>
                    </Link>
                    <Link href="/clothes">
                        <Button variant="outline" className="rounded-none px-8 h-12 text-xs uppercase tracking-widest font-bold">
                            Shop Fashion
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    const subtotal = getTotal();
    const shipping = subtotal > 200 ? 0 : 25;
    const total = subtotal + shipping;

    return (
        <div className="container mx-auto px-4 py-24 animate-in fade-in duration-1000">
            <div className="mb-16">
                <span className="text-xs uppercase tracking-[0.3em] font-bold text-muted-foreground block mb-2">Checkout</span>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tighter">SHOPPING BAG</h1>
            </div>

            <div className="grid lg:grid-cols-12 gap-16">
                {/* Cart Items */}
                <div className="lg:col-span-8 space-y-12">
                    {items.map((item, index) => {
                        const price = item.product.prices.find(
                            p => p.currency.label === selectedCurrency.label
                        );

                        return (
                            <div key={index} className="group border-b border-border/40 pb-12">
                                <div className="flex flex-col sm:flex-row gap-8">
                                    <Link href={`/${item.product.category}/${item.product.id}`} className="relative aspect-square w-full sm:w-48 bg-muted overflow-hidden shrink-0">
                                        <Image
                                            src={item.product.gallery[0]}
                                            alt={item.product.name}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                                            sizes="192px"
                                        />
                                    </Link>

                                    <div className="flex-1 flex flex-col justify-between py-2">
                                        <div className="space-y-4">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1 font-bold">{item.product.brand}</p>
                                                    <h3 className="text-2xl font-bold tracking-tight">{item.product.name}</h3>
                                                </div>
                                                <p className="text-xl font-bold">
                                                    {selectedCurrency.symbol}{price?.amount.toFixed(2)}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-x-6 gap-y-2">
                                                {Object.entries(item.selectedAttributes).map(([key, value]) => (
                                                    <div key={key} className="flex items-center gap-2">
                                                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">{key}:</span>
                                                        <span className="text-xs font-medium">{value}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-8">
                                            <div className="flex items-center border border-border/60">
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.selectedAttributes, item.quantity - 1)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                                                >
                                                    <Minus className="w-3 h-3" />
                                                </button>
                                                <span className="w-10 text-center text-sm font-bold">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product.id, item.selectedAttributes, item.quantity + 1)}
                                                    className="w-10 h-10 flex items-center justify-center hover:bg-muted transition-colors"
                                                >
                                                    <Plus className="w-3 h-3" />
                                                </button>
                                            </div>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-destructive hover:bg-transparent"
                                                onClick={() => removeItem(item.product.id, item.selectedAttributes)}
                                            >
                                                <Trash2 className="w-3 h-3 mr-2" />
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}

                    <Button
                        variant="ghost"
                        className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground hover:text-primary transition-colors"
                        onClick={clearCart}
                    >
                        Clear entire bag
                    </Button>
                </div>

                {/* Summary */}
                <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit">
                    <div className="bg-muted/30 border border-border/40 p-8 space-y-8">
                        <h2 className="text-2xl font-bold tracking-tight">SUMMARY</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-bold">{selectedCurrency.symbol}{subtotal.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="font-bold">{shipping === 0 ? 'FREE' : `${selectedCurrency.symbol}${shipping.toFixed(2)}`}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Estimated Tax</span>
                                <span className="font-bold">{selectedCurrency.symbol}0.00</span>
                            </div>
                            <Separator className="bg-border/40" />
                            <div className="flex justify-between text-xl font-bold">
                                <span>TOTAL</span>
                                <span>{selectedCurrency.symbol}{total.toFixed(2)}</span>
                            </div>
                        </div>

                        <Button className="w-full h-16 rounded-none uppercase tracking-[0.2em] font-bold group">
                            Proceed to Checkout
                            <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                        </Button>
                        
                        <div className="space-y-4 pt-4">
                            <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mb-4">Accepted Payments</p>
                            <div className="flex gap-2 opacity-50 grayscale hover:grayscale-0 transition-all">
                                <div className="h-6 w-10 bg-white/10 rounded border border-white/10" />
                                <div className="h-6 w-10 bg-white/10 rounded border border-white/10" />
                                <div className="h-6 w-10 bg-white/10 rounded border border-white/10" />
                                <div className="h-6 w-10 bg-white/10 rounded border border-white/10" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
