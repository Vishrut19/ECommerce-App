import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import prisma from '@/lib/prisma';

interface ProductsPageProps {
    searchParams: Promise<{ category?: string; organic?: string; search?: string }>;
}

async function getCategories() {
    return prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
    });
}

async function getProducts(filters: { category?: string; organic?: string; search?: string }) {
    const where: any = { isActive: true };

    if (filters.category) {
        const category = await prisma.category.findUnique({
            where: { name: filters.category },
        });
        if (category) {
            where.categoryId = category.id;
        }
    }

    if (filters.organic === 'true') {
        where.isOrganic = true;
    }

    if (filters.search) {
        where.OR = [
            { name: { contains: filters.search, mode: 'insensitive' } },
            { description: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    return prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { name: 'asc' },
    });
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
    const params = await searchParams;
    const [categories, products] = await Promise.all([
        getCategories(),
        getProducts(params),
    ]);

    const selectedCategory = categories.find(c => c.name === params.category);

    return (
        <div className="min-h-screen bg-background">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 text-white py-12">
                <div className="container mx-auto px-4">
                    <Link href="/" className="inline-flex items-center gap-2 text-emerald-100 hover:text-white mb-4 transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Home
                    </Link>
                    <h1 className="text-3xl md:text-4xl font-bold mb-2">
                        {selectedCategory ? selectedCategory.displayName : 'All Products'}
                    </h1>
                    <p className="text-emerald-100">
                        {products.length} products available for wholesale
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="lg:w-64 shrink-0">
                        <div className="sticky top-4 space-y-6">
                            {/* Search */}
                            <div>
                                <label className="text-sm font-medium mb-2 block">Search</label>
                                <form>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <input
                                            type="text"
                                            name="search"
                                            defaultValue={params.search}
                                            placeholder="Search products..."
                                            className="w-full pl-10 pr-4 py-2 border border-input rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </form>
                            </div>

                            {/* Categories */}
                            <div>
                                <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Filter className="w-4 h-4" />
                                    Categories
                                </h3>
                                <div className="space-y-1">
                                    <Link
                                        href="/products"
                                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!params.category
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                                                : 'hover:bg-muted'
                                            }`}
                                    >
                                        All Products
                                    </Link>
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/products?category=${category.name}`}
                                            className={`block px-3 py-2 rounded-lg text-sm transition-colors ${params.category === category.name
                                                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                                                    : 'hover:bg-muted'
                                                }`}
                                        >
                                            <span className="mr-2">{category.icon}</span>
                                            {category.displayName}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Organic Filter */}
                            <div>
                                <h3 className="text-sm font-medium mb-3">Type</h3>
                                <div className="space-y-1">
                                    <Link
                                        href={params.category ? `/products?category=${params.category}` : '/products'}
                                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${!params.organic
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                                                : 'hover:bg-muted'
                                            }`}
                                    >
                                        All Types
                                    </Link>
                                    <Link
                                        href={`/products?${params.category ? `category=${params.category}&` : ''}organic=true`}
                                        className={`block px-3 py-2 rounded-lg text-sm transition-colors ${params.organic === 'true'
                                                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300'
                                                : 'hover:bg-muted'
                                            }`}
                                    >
                                        🌱 Organic Only
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Products Grid */}
                    <main className="flex-1">
                        {products.length === 0 ? (
                            <div className="text-center py-16">
                                <div className="text-5xl mb-4">🔍</div>
                                <h3 className="text-xl font-semibold mb-2">No products found</h3>
                                <p className="text-muted-foreground mb-6">
                                    Try adjusting your filters or search terms
                                </p>
                                <Link href="/products">
                                    <Button>Clear Filters</Button>
                                </Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                                {products.map((product) => (
                                    <Link
                                        key={product.id}
                                        href={`/products/${product.slug}`}
                                        className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg hover:border-emerald-200 dark:hover:border-emerald-800 transition-all duration-300"
                                    >
                                        <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                                            <div className="absolute inset-0 flex items-center justify-center text-6xl group-hover:scale-110 transition-transform duration-300">
                                                {product.category.icon}
                                            </div>
                                            <div className="absolute top-3 left-3 flex gap-2">
                                                {product.isOrganic && (
                                                    <span className="px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                                                        Organic
                                                    </span>
                                                )}
                                                {product.stockQty <= product.lowStockAlert && (
                                                    <span className="px-2 py-1 bg-amber-500 text-white text-xs font-medium rounded-full">
                                                        Low Stock
                                                    </span>
                                                )}
                                            </div>
                                            {product.stockQty === 0 && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="px-4 py-2 bg-red-500 text-white text-sm font-medium rounded-full">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <div className="text-xs text-muted-foreground mb-1">
                                                {product.category.displayName}
                                            </div>
                                            <h3 className="font-semibold text-lg mb-2 group-hover:text-emerald-600 transition-colors">
                                                {product.name}
                                            </h3>
                                            <div className="flex items-center justify-between mb-3">
                                                <div>
                                                    <span className="text-2xl font-bold text-emerald-600">₹{product.pricePerUnit}</span>
                                                    <span className="text-sm text-muted-foreground">/{product.unitType.toLowerCase()}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                <span>MOQ: {product.minOrderQty} {product.unitType.toLowerCase()}</span>
                                                <span className={product.stockQty > 0 ? 'text-emerald-600' : 'text-red-500'}>
                                                    {product.stockQty > 0 ? `${product.stockQty} in stock` : 'Out of stock'}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}
