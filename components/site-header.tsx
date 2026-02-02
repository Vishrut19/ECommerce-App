import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Leaf } from 'lucide-react';

export function SiteHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                        <Leaf className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold">AgroOrder</span>
                </Link>

                <nav className="hidden md:flex items-center gap-6">
                    <Link
                        href="/products"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Products
                    </Link>
                    <Link
                        href="/products?category=grains-pulses"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Grains & Pulses
                    </Link>
                    <Link
                        href="/products?category=vegetables"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Vegetables
                    </Link>
                    <Link
                        href="/products?category=fruits"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Fruits
                    </Link>
                    <Link
                        href="/products?organic=true"
                        className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                        🌱 Organic
                    </Link>
                </nav>

                <div className="flex items-center gap-3">
                    <Link href="/admin/login">
                        <Button variant="outline" size="sm">
                            Admin
                        </Button>
                    </Link>
                </div>
            </div>
        </header>
    );
}
