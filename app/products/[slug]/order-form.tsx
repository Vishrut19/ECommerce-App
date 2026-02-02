'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Minus, Plus, ShoppingCart, Loader2 } from 'lucide-react';

interface Product {
    id: string;
    name: string;
    slug: string;
    pricePerUnit: number;
    unitType: string;
    minOrderQty: number;
    stockQty: number;
}

interface OrderFormProps {
    product: Product;
}

export function OrderForm({ product }: OrderFormProps) {
    const router = useRouter();
    const [quantity, setQuantity] = useState(product.minOrderQty);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({
        buyerName: '',
        buyerEmail: '',
        buyerPhone: '',
        buyerCompany: '',
        buyerAddress: '',
        notes: '',
    });

    const subtotal = quantity * product.pricePerUnit;

    const handleQuantityChange = (delta: number) => {
        const newQty = quantity + delta;
        if (newQty >= product.minOrderQty && newQty <= product.stockQty) {
            setQuantity(newQty);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const response = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    items: [
                        {
                            productId: product.id,
                            quantity,
                            unitType: product.unitType,
                            pricePerUnit: product.pricePerUnit,
                        },
                    ],
                }),
            });

            const data = await response.json();

            if (response.ok) {
                router.push(`/order-success?orderNumber=${data.orderNumber}`);
            } else {
                alert(data.error || 'Failed to submit order');
            }
        } catch (error) {
            alert('An error occurred. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!showForm) {
        return (
            <div className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border">
                <div className="flex items-center justify-between">
                    <Label>Quantity ({product.unitType.toLowerCase()})</Label>
                    <div className="flex items-center gap-3">
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(-product.minOrderQty)}
                            disabled={quantity <= product.minOrderQty}
                        >
                            <Minus className="w-4 h-4" />
                        </Button>
                        <Input
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                                const val = parseInt(e.target.value) || product.minOrderQty;
                                setQuantity(Math.min(Math.max(val, product.minOrderQty), product.stockQty));
                            }}
                            className="w-24 text-center"
                            min={product.minOrderQty}
                            max={product.stockQty}
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => handleQuantityChange(product.minOrderQty)}
                            disabled={quantity >= product.stockQty}
                        >
                            <Plus className="w-4 h-4" />
                        </Button>
                    </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t border-border">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="text-2xl font-bold text-emerald-600">₹{subtotal.toLocaleString()}</span>
                </div>

                <Button
                    onClick={() => setShowForm(true)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                >
                    <ShoppingCart className="w-5 h-5 mr-2" />
                    Place Order Request
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                    Min order: {product.minOrderQty} {product.unitType.toLowerCase()}
                </p>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-muted/30 rounded-xl border border-border">
            <div className="flex items-center justify-between pb-4 border-b border-border">
                <div>
                    <span className="text-muted-foreground">Order:</span>
                    <span className="ml-2 font-semibold">{quantity} {product.unitType.toLowerCase()}</span>
                </div>
                <span className="text-xl font-bold text-emerald-600">₹{subtotal.toLocaleString()}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <Label htmlFor="buyerName">Full Name *</Label>
                    <Input
                        id="buyerName"
                        required
                        value={formData.buyerName}
                        onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                        placeholder="Your name"
                    />
                </div>
                <div>
                    <Label htmlFor="buyerEmail">Email *</Label>
                    <Input
                        id="buyerEmail"
                        type="email"
                        required
                        value={formData.buyerEmail}
                        onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                        placeholder="you@company.com"
                    />
                </div>
                <div>
                    <Label htmlFor="buyerPhone">Phone *</Label>
                    <Input
                        id="buyerPhone"
                        type="tel"
                        required
                        value={formData.buyerPhone}
                        onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                        placeholder="+91 98765 43210"
                    />
                </div>
                <div>
                    <Label htmlFor="buyerCompany">Company Name</Label>
                    <Input
                        id="buyerCompany"
                        value={formData.buyerCompany}
                        onChange={(e) => setFormData({ ...formData, buyerCompany: e.target.value })}
                        placeholder="Your company"
                    />
                </div>
            </div>

            <div>
                <Label htmlFor="buyerAddress">Delivery Address</Label>
                <textarea
                    id="buyerAddress"
                    value={formData.buyerAddress}
                    onChange={(e) => setFormData({ ...formData, buyerAddress: e.target.value })}
                    placeholder="Full delivery address"
                    className="w-full min-h-[80px] px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            <div>
                <Label htmlFor="notes">Order Notes (Optional)</Label>
                <textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any special requirements..."
                    className="w-full min-h-[60px] px-3 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
            </div>

            <div className="flex gap-3 pt-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowForm(false)}
                    className="flex-1"
                >
                    Back
                </Button>
                <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        'Submit Order Request'
                    )}
                </Button>
            </div>
        </form>
    );
}
