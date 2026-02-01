'use client';

import { useCartStore } from '@/store/cart-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import Image from 'next/image';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, getTotal, selectedCurrency } = useCartStore();

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 text-center">
                <h1 className="text-3xl font-bold mb-4">Your Cart is Empty</h1>
                <p className="text-muted-foreground mb-8">Add some products to get started!</p>
                <Button asChild>
                    <Link href="/tech">Browse Products</Link>
                </Button>
            </div>
        );
    }

    const total = getTotal();

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Shopping Cart</h1>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Cart Items */}
                <div className="lg:col-span-2 space-y-4">
                    {items.map((item, index) => {
                        const price = item.product.prices.find(
                            p => p.currency.label === selectedCurrency.label
                        );

                        return (
                            <Card key={index}>
                                <CardContent className="p-4">
                                    <div className="flex gap-4">
                                        <div className="relative h-24 w-24 shrink-0">
                                            <Image
                                                src={item.product.gallery[0]}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover rounded"
                                                sizes="96px"
                                            />
                                        </div>

                                        <div className="flex-1">
                                            <h3 className="font-semibold">{item.product.name}</h3>
                                            <p className="text-sm text-muted-foreground">{item.product.brand}</p>

                                            <div className="mt-2 space-y-1">
                                                {Object.entries(item.selectedAttributes).map(([key, value]) => (
                                                    <p key={key} className="text-sm">
                                                        <span className="font-medium">{key}:</span> {value}
                                                    </p>
                                                ))}
                                            </div>

                                            <p className="font-bold mt-2">
                                                {selectedCurrency.symbol}{price?.amount.toFixed(2)}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-end justify-between">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeItem(item.product.id, item.selectedAttributes)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>

                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.product.id,
                                                            item.selectedAttributes,
                                                            item.quantity - 1
                                                        )
                                                    }
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className="h-8 w-8"
                                                    onClick={() =>
                                                        updateQuantity(
                                                            item.product.id,
                                                            item.selectedAttributes,
                                                            item.quantity + 1
                                                        )
                                                    }
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Order Summary */}
                <div>
                    <Card>
                        <CardHeader>
                            <h2 className="text-xl font-bold">Order Summary</h2>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between">
                                <span>Subtotal</span>
                                <span>{selectedCurrency.symbol}{total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Tax</span>
                                <span>{selectedCurrency.symbol}0.00</span>
                            </div>
                            <Separator />
                            <div className="flex justify-between text-lg font-bold">
                                <span>Total</span>
                                <span>{selectedCurrency.symbol}{total.toFixed(2)}</span>
                            </div>
                        </CardContent>
                        <CardFooter className="flex-col gap-2">
                            <Button className="w-full" size="lg">
                                Proceed to Checkout
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={clearCart}
                            >
                                Clear Cart
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
