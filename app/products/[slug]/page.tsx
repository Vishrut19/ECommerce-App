import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Truck, Package, Building2, Leaf } from 'lucide-react';
import prisma from '@/lib/prisma';
import { OrderForm } from './order-form';

interface ProductPageProps {
    params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
    return prisma.product.findUnique({
        where: { slug },
        include: { category: true },
    });
}

async function getRelatedProducts(categoryId: string, productId: string) {
    return prisma.product.findMany({
        where: {
            categoryId,
            id: { not: productId },
            isActive: true,
        },
        include: { category: true },
        take: 4,
    });
}

export default async function ProductPage({ params }: ProductPageProps) {
    const { slug } = await params;
    const product = await getProduct(slug);

    if (!product) {
        notFound();
    }

    const relatedProducts = await getRelatedProducts(product.categoryId, product.id);

    return (
        <div className="min-h-screen bg-background pb-16">
            {/* Breadcrumb */}
            <div className="bg-muted/30 border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <span>/</span>
                        <Link href="/products" className="hover:text-foreground transition-colors">Products</Link>
                        <span>/</span>
                        <Link href={`/products?category=${product.category.name}`} className="hover:text-foreground transition-colors">
                            {product.category.displayName}
                        </Link>
                        <span>/</span>
                        <span className="text-foreground">{product.name}</span>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <Link href="/products" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Products
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Product Gallery */}
                    <div className="space-y-4">
                        <div className="aspect-square bg-muted rounded-2xl relative overflow-hidden">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-[12rem]">{product.category.icon}</span>
                            </div>
                            <div className="absolute top-4 left-4 flex gap-2">
                                {product.isOrganic && (
                                    <span className="px-3 py-1.5 bg-emerald-500 text-white text-sm font-medium rounded-full flex items-center gap-1">
                                        <Leaf className="w-4 h-4" />
                                        Organic
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Product Details */}
                    <div className="space-y-6">
                        <div>
                            <div className="text-sm text-muted-foreground mb-2">
                                {product.category.icon} {product.category.displayName}
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
                            <div className="flex items-baseline gap-2 mb-4">
                                <span className="text-4xl font-bold text-emerald-600">₹{product.pricePerUnit}</span>
                                <span className="text-xl text-muted-foreground">per {product.unitType.toLowerCase()}</span>
                            </div>
                            <p className="text-muted-foreground leading-relaxed">
                                {product.description}
                            </p>
                        </div>

                        {/* Product Info Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <div className="text-sm text-muted-foreground mb-1">Unit Type</div>
                                <div className="font-semibold">{product.unitType}</div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <div className="text-sm text-muted-foreground mb-1">Min Order Qty</div>
                                <div className="font-semibold">{product.minOrderQty} {product.unitType.toLowerCase()}</div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <div className="text-sm text-muted-foreground mb-1">Available Stock</div>
                                <div className={`font-semibold ${product.stockQty > product.lowStockAlert ? 'text-emerald-600' : 'text-amber-600'}`}>
                                    {product.stockQty} {product.unitType.toLowerCase()}
                                </div>
                            </div>
                            <div className="p-4 bg-muted/50 rounded-xl">
                                <div className="text-sm text-muted-foreground mb-1">Supplier</div>
                                <div className="font-semibold flex items-center gap-1">
                                    <Building2 className="w-4 h-4" />
                                    {product.supplierName || 'AgroOrder'}
                                </div>
                            </div>
                        </div>

                        {/* Order Form */}
                        {product.stockQty > 0 ? (
                            <OrderForm product={product} />
                        ) : (
                            <div className="p-6 bg-red-50 dark:bg-red-950 rounded-xl text-center">
                                <Package className="w-12 h-12 mx-auto text-red-500 mb-3" />
                                <h3 className="font-semibold text-red-700 dark:text-red-300 mb-2">Out of Stock</h3>
                                <p className="text-sm text-red-600 dark:text-red-400">
                                    This product is currently unavailable. Please check back later.
                                </p>
                            </div>
                        )}

                        {/* Delivery Info */}
                        <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950 rounded-xl">
                            <Truck className="w-8 h-8 text-emerald-600 shrink-0" />
                            <div>
                                <div className="font-semibold text-emerald-700 dark:text-emerald-300">Pan-India Delivery</div>
                                <div className="text-sm text-emerald-600 dark:text-emerald-400">
                                    Delivery timeline will be confirmed after order submission
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Products */}
                {relatedProducts.length > 0 && (
                    <section className="mt-16">
                        <h2 className="text-2xl font-bold mb-6">Related Products</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {relatedProducts.map((relatedProduct) => (
                                <Link
                                    key={relatedProduct.id}
                                    href={`/products/${relatedProduct.slug}`}
                                    className="group bg-card rounded-xl border border-border overflow-hidden hover:shadow-md transition-all"
                                >
                                    <div className="aspect-[4/3] bg-muted relative">
                                        <div className="absolute inset-0 flex items-center justify-center text-5xl">
                                            {relatedProduct.category.icon}
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold group-hover:text-emerald-600 transition-colors">
                                            {relatedProduct.name}
                                        </h3>
                                        <div className="text-emerald-600 font-bold">
                                            ₹{relatedProduct.pricePerUnit}/{relatedProduct.unitType.toLowerCase()}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </section>
                )}
            </div>
        </div>
    );
}
