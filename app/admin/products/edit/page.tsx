'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productFormSchema, ProductFormData } from '@/lib/validations/product';
import { useProduct, useUpdateProduct } from '@/hooks/use-products';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Helper to create prices for all currencies
const createPrices = (usdPrice: number) => {
    const currencies = [
        { label: 'USD', symbol: '$' },
        { label: 'GBP', symbol: '£' },
        { label: 'AUD', symbol: 'A$' },
        { label: 'JPY', symbol: '¥' },
        { label: 'RUB', symbol: '₽' },
    ];

    const rates = {
        USD: 1,
        GBP: 0.79,
        AUD: 1.52,
        JPY: 149.83,
        RUB: 92.5,
    };

    return currencies.map(currency => ({
        currency,
        amount: parseFloat((usdPrice * rates[currency.label as keyof typeof rates]).toFixed(2)),
    }));
};

export default function EditProductPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const productId = searchParams.get('id');

    const { data: product, isLoading } = useProduct(productId);
    const updateProduct = useUpdateProduct();

    const form = useForm<ProductFormData>({
        resolver: zodResolver(productFormSchema),
        defaultValues: {
            name: '',
            brand: '',
            category: 'tech',
            description: '',
            inStock: true,
            priceUSD: 0,
            gallery: [''],
            attributes: [],
        },
    });

    // Populate form with product data when loaded
    useEffect(() => {
        if (product) {
            const usdPrice = product.prices?.find(p => p.currency.label === 'USD')?.amount || 0;
            form.reset({
                name: product.name,
                brand: product.brand,
                category: product.category as 'tech' | 'clothes',
                description: product.description,
                inStock: product.inStock,
                priceUSD: usdPrice,
                gallery: product.gallery?.length > 0 ? product.gallery : [''],
                attributes: product.attributes || [],
            });
        }
    }, [product, form]);

    const onSubmit = (data: ProductFormData) => {
        if (!productId) return;

        updateProduct.mutate(
            {
                id: productId,
                name: data.name,
                brand: data.brand,
                category: data.category,
                description: data.description,
                inStock: data.inStock,
                prices: createPrices(data.priceUSD),
                gallery: data.gallery.filter(url => url.trim() !== ''),
                attributes: data.attributes || [],
            },
            {
                onSuccess: () => {
                    router.push('/admin/products');
                },
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-[10px] uppercase tracking-[0.4em] font-bold animate-pulse">Retrieving SKU Data...</p>
            </div>
        );
    }

    if (!product && !isLoading) {
        return (
            <div className="border border-border/40 bg-muted/20 p-12 text-center space-y-6">
                <p className="text-sm uppercase tracking-widest font-bold text-muted-foreground">SKU Identifer Not Found in Global Core</p>
                <Button asChild variant="outline" className="rounded-none h-12 uppercase tracking-widest text-[10px] font-bold border-border/40">
                    <Link href="/admin/products">Return to Inventory</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-12 animate-in fade-in duration-700 max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-primary">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-bold">Edit Mode</span>
                    </div>
                    <h2 className="text-4xl font-bold tracking-tighter uppercase">{product?.name}</h2>
                    <p className="text-sm text-muted-foreground uppercase tracking-[0.2em] font-medium max-w-2xl">
                        Modify active unit specifications and market valuation.
                    </p>
                </div>
                <Button variant="outline" asChild className="rounded-none h-12 px-8 uppercase tracking-[0.2em] text-[10px] font-bold border-border/40">
                    <Link href="/admin/products">
                        ← Abort & Return
                    </Link>
                </Button>
            </div>

            <div className="border border-border/40 bg-background relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-primary/20" />
                
                <div className="p-12">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
                            {/* Primary Configuration */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary border-b border-border/10 pb-2">Core Identity</h3>
                                    
                                    <FormField
                                        control={form.control}
                                        name="name"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Product Identifier</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="E.G. TITAN CHRONOGRAPH" className="h-12 rounded-none border-border/40 bg-muted/20 uppercase text-xs tracking-widest font-bold focus:ring-1 focus:ring-primary" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px] uppercase font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="brand"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Manufacturer / Brand</FormLabel>
                                                <FormControl>
                                                    <Input placeholder="E.G. LUMINA" className="h-12 rounded-none border-border/40 bg-muted/20 uppercase text-xs tracking-widest font-bold focus:ring-1 focus:ring-primary" {...field} />
                                                </FormControl>
                                                <FormMessage className="text-[10px] uppercase font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="category"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Operational Segment</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl>
                                                        <SelectTrigger className="h-12 rounded-none border-border/40 bg-muted/20 uppercase text-[10px] tracking-widest font-bold focus:ring-1 focus:ring-primary">
                                                            <SelectValue placeholder="SELECT SEGMENT" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="rounded-none border-border/40">
                                                        <SelectItem value="tech" className="text-[10px] uppercase tracking-widest font-bold">TECH CORE</SelectItem>
                                                        <SelectItem value="clothes" className="text-[10px] uppercase tracking-widest font-bold">FASHION SEGMENT</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[10px] uppercase font-bold" />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <div className="space-y-8">
                                    <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary border-b border-border/10 pb-2">Financials & Logistics</h3>
                                    
                                    <FormField
                                        control={form.control}
                                        name="priceUSD"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Base Valuation (USD)</FormLabel>
                                                <FormControl>
                                                    <div className="relative">
                                                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[10px] font-bold text-muted-foreground">$</span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            placeholder="0.00"
                                                            className="h-12 pl-8 rounded-none border-border/40 bg-muted/20 text-xs font-bold tracking-widest focus:ring-1 focus:ring-primary tabular-nums"
                                                            {...field}
                                                            onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                                        />
                                                    </div>
                                                </FormControl>
                                                <FormDescription className="text-[9px] uppercase tracking-widest font-medium text-muted-foreground/60">
                                                    Global currency sync initiated on save.
                                                </FormDescription>
                                                <FormMessage className="text-[10px] uppercase font-bold" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="inStock"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-row items-center justify-between border border-border/40 bg-muted/10 p-6">
                                                <div className="space-y-1">
                                                    <FormLabel className="text-[10px] uppercase tracking-widest font-bold">Availability Status</FormLabel>
                                                    <FormDescription className="text-[9px] uppercase tracking-widest font-medium text-muted-foreground/60">
                                                        Enable immediate market access.
                                                    </FormDescription>
                                                </div>
                                                <FormControl>
                                                    <Switch
                                                        checked={field.value}
                                                        onCheckedChange={field.onChange}
                                                        className="data-[state=checked]:bg-primary"
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            </div>

                            {/* Content & Media */}
                            <div className="space-y-8">
                                <h3 className="text-xs uppercase tracking-[0.3em] font-bold text-primary border-b border-border/10 pb-2">Media & Documentation</h3>
                                
                                <FormField
                                    control={form.control}
                                    name="gallery.0"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Primary Resource URL (Image)</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="HTTPS://RESOURCES.LUMINA.COM/SKU-01.JPG"
                                                    className="h-12 rounded-none border-border/40 bg-muted/20 text-[10px] tracking-widest font-bold focus:ring-1 focus:ring-primary"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">System Specifications / Description</FormLabel>
                                            <FormControl>
                                                <Textarea
                                                    placeholder="ENTER DETAILED SPECIFICATIONS..."
                                                    className="min-h-[150px] rounded-none border-border/40 bg-muted/20 text-xs tracking-wider leading-relaxed focus:ring-1 focus:ring-primary p-6"
                                                    {...field}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px] uppercase font-bold" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-8 border-t border-border/10">
                                <Button
                                    type="submit"
                                    disabled={updateProduct.isPending}
                                    className="flex-1 h-14 rounded-none uppercase tracking-[0.3em] text-xs font-bold hover:scale-[1.01] transition-all"
                                >
                                    {updateProduct.isPending ? 'Syncing...' : 'Commit Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/products')}
                                    className="h-14 rounded-none uppercase tracking-[0.3em] text-xs font-bold px-12 border-border/40"
                                >
                                    Abort
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>
        </div>
    );
}
