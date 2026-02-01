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
            <div className="container mx-auto px-4 py-8 flex justify-center items-center min-h-[50vh]">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    if (!product && !isLoading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardContent className="py-8 text-center">
                        <p className="text-muted-foreground">Product not found</p>
                        <Button asChild className="mt-4">
                            <Link href="/admin/products">Back to Products</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-3xl">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-4xl font-bold">Edit Product</h1>
                    <p className="text-muted-foreground mt-2">
                        Update product details
                    </p>
                </div>
                <Button asChild variant="outline">
                    <Link href="/admin/products">← Back</Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Product Details</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            {/* Name */}
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Product Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="iPhone 13 Pro" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Brand */}
                            <FormField
                                control={form.control}
                                name="brand"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Brand</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Apple" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Category */}
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="tech">Tech</SelectItem>
                                                <SelectItem value="clothes">Clothes</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Price */}
                            <FormField
                                control={form.control}
                                name="priceUSD"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Price (USD)</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="0.01"
                                                placeholder="999.99"
                                                {...field}
                                                onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Prices in other currencies will be calculated automatically
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Description */}
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Enter product description (HTML supported)"
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            You can use HTML tags for formatting
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* Gallery */}
                            <FormField
                                control={form.control}
                                name="gallery.0"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Image URL</FormLabel>
                                        <FormControl>
                                            <Input
                                                placeholder="https://example.com/image.jpg"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Enter the full URL of the product image
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {/* In Stock */}
                            <FormField
                                control={form.control}
                                name="inStock"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">In Stock</FormLabel>
                                            <FormDescription>
                                                Is this product currently available?
                                            </FormDescription>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />

                            {/* Submit Buttons */}
                            <div className="flex gap-4">
                                <Button
                                    type="submit"
                                    disabled={updateProduct.isPending}
                                    className="flex-1"
                                >
                                    {updateProduct.isPending ? 'Saving...' : 'Save Changes'}
                                </Button>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/admin/products')}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
}
