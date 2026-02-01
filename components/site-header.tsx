'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ShoppingCart } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCurrencies } from '@/hooks/use-currencies';
import { useState, useEffect } from 'react';

export function SiteHeader() {
    const { getItemCount, selectedCurrency, setSelectedCurrency } = useCartStore();
    const { data: currencies } = useCurrencies();
    const [itemCount, setItemCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    // Only show cart count after client-side hydration to prevent hydration mismatch
    useEffect(() => {
        setMounted(true);
        setItemCount(getItemCount());
    }, [getItemCount]);

    return (
        <header className="border-b sticky top-0 bg-background z-50">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/" className="text-2xl font-bold">
                        E-Store
                    </Link>

                    {/* Navigation */}
                    <nav className="hidden md:flex items-center gap-6">
                        <Link href="/tech" className="hover:text-primary transition-colors">
                            Tech
                        </Link>
                        <Link href="/clothes" className="hover:text-primary transition-colors">
                            Clothes
                        </Link>
                    </nav>

                    {/* Actions */}
                    <div className="flex items-center gap-4">
                        {/* Currency Selector */}
                        <Select
                            value={selectedCurrency.label}
                            onValueChange={(value) => {
                                const currency = currencies?.find(c => c.label === value);
                                if (currency) setSelectedCurrency(currency);
                            }}
                        >
                            <SelectTrigger className="w-24">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {currencies?.map((currency) => (
                                    <SelectItem key={currency.label} value={currency.label}>
                                        {currency.symbol} {currency.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* Cart Button */}
                        <Link href="/cart">
                            <Button variant="outline" size="icon" className="relative">
                                <ShoppingCart className="h-5 w-5" />
                                {mounted && itemCount > 0 && (
                                    <Badge
                                        variant="destructive"
                                        className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                                    >
                                        {itemCount}
                                    </Badge>
                                )}
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
