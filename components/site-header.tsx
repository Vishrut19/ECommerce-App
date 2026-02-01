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
import { ShoppingCart, Search, User } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { useCurrencies } from '@/hooks/use-currencies';
import { useState, useEffect } from 'react';

export function SiteHeader() {
    const { getItemCount, selectedCurrency, setSelectedCurrency } = useCartStore();
    const { data: currencies } = useCurrencies();
    const [itemCount, setItemCount] = useState(0);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setItemCount(getItemCount());
    }, [getItemCount]);

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    <div className="flex items-center gap-12">
                        <Link href="/" className="text-2xl font-bold tracking-tighter font-display">
                            LUMINA
                        </Link>

                        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
                            <Link href="/tech" className="hover:text-primary transition-colors uppercase tracking-widest text-[10px]">
                                Technology
                            </Link>
                            <Link href="/clothes" className="hover:text-primary transition-colors uppercase tracking-widest text-[10px]">
                                Fashion
                            </Link>
                        </nav>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="hidden sm:flex items-center gap-2">
                            <Select
                                value={selectedCurrency.label}
                                onValueChange={(value) => {
                                    const currency = currencies?.find(c => c.label === value);
                                    if (currency) setSelectedCurrency(currency);
                                }}
                            >
                                <SelectTrigger className="w-[80px] h-8 text-[10px] uppercase tracking-widest bg-transparent border-none hover:bg-muted focus:ring-0">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {currencies?.map((currency) => (
                                        <SelectItem key={currency.label} value={currency.label} className="text-[10px] uppercase tracking-widest">
                                            {currency.symbol} {currency.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="ghost" size="icon" className="h-9 w-9">
                                <Search className="h-4 w-4" />
                            </Button>
                            <Link href="/admin/login">
                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                    <User className="h-4 w-4" />
                                </Button>
                            </Link>
                            <Link href="/cart">
                                <Button variant="ghost" size="icon" className="relative h-9 w-9">
                                    <ShoppingCart className="h-4 w-4" />
                                    {mounted && itemCount > 0 && (
                                        <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[8px] font-bold text-primary-foreground flex items-center justify-center animate-in zoom-in">
                                            {itemCount}
                                        </span>
                                    )}
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
}
