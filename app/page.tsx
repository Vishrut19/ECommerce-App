import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight, Truck, Shield, Clock, Leaf } from 'lucide-react';
import prisma from '@/lib/prisma';

async function getCategories() {
  return prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
  });
}

async function getFeaturedProducts() {
  return prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    include: { category: true },
    take: 6,
  });
}

export default async function HomePage() {
  const [categories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(),
  ]);

  return (
    <div className="flex flex-col gap-16 pb-16">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-green-900">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm text-emerald-100 text-sm font-medium">
              <Leaf className="w-4 h-4" />
              B2B Wholesale Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight text-white">
              Farm Fresh Produce
              <br />
              <span className="text-emerald-300">Wholesale Orders</span>
            </h1>
            <p className="text-xl text-emerald-100/80 max-w-2xl mx-auto leading-relaxed">
              Source quality grains, vegetables, fruits, spices, and dairy products directly from verified suppliers.
              Bulk ordering made simple for your business.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link href="/products">
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 px-8 h-14 text-base font-semibold group">
                  Browse Products
                  <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/admin/login">
                <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 px-8 h-14 text-base font-semibold">
                  Admin Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Shop by Category</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Explore our wide range of farm produce categories
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${category.name}`}
              className="group p-6 rounded-2xl bg-gradient-to-br from-muted/50 to-muted hover:from-emerald-50 hover:to-emerald-100 dark:hover:from-emerald-950 dark:hover:to-emerald-900 transition-all duration-300 text-center border border-border/50 hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              <div className="text-4xl mb-3">{category.icon}</div>
              <h3 className="font-semibold text-sm group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">
                {category.displayName}
              </h3>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-2">Featured Products</h2>
            <p className="text-muted-foreground">Top picks for wholesale buyers</p>
          </div>
          <Link href="/products">
            <Button variant="outline" className="hidden sm:flex">
              View All
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                  {product.category.icon}
                </div>
                {product.isOrganic && (
                  <span className="absolute top-3 left-3 px-2 py-1 bg-emerald-500 text-white text-xs font-medium rounded-full">
                    Organic
                  </span>
                )}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-lg group-hover:text-emerald-600 transition-colors">
                    {product.name}
                  </h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                    {product.category.displayName}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xl font-bold text-emerald-600">₹{product.pricePerUnit}</span>
                    <span className="text-sm text-muted-foreground">/{product.unitType.toLowerCase()}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    MOQ: {product.minOrderQty} {product.unitType.toLowerCase()}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-6 text-center sm:hidden">
          <Link href="/products">
            <Button variant="outline">
              View All Products
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/30 py-16 border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Simple wholesale ordering in 4 easy steps
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { icon: '🔍', title: 'Browse Products', desc: 'Explore our catalog of farm produce' },
              { icon: '📝', title: 'Select Quantity', desc: 'Choose products and enter quantities' },
              { icon: '📨', title: 'Submit Order', desc: 'Send your order request to us' },
              { icon: '🚚', title: 'Get Delivery', desc: 'Receive products at your location' },
            ].map((step, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-3xl mx-auto mb-4">
                  {step.icon}
                </div>
                <div className="text-sm font-medium text-emerald-600 mb-2">Step {index + 1}</div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
              <Truck className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Pan-India Delivery</h3>
              <p className="text-sm text-muted-foreground">
                Reliable delivery across all major cities and towns
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
              <Shield className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Verified Suppliers</h3>
              <p className="text-sm text-muted-foreground">
                All suppliers are verified for quality standards
              </p>
            </div>
          </div>
          <div className="flex items-start gap-4 p-6 rounded-2xl bg-muted/30">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold mb-1">Quick Response</h3>
              <p className="text-sm text-muted-foreground">
                Get order confirmations within 24 hours
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-emerald-600 to-green-600 rounded-3xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-emerald-100 max-w-xl mx-auto mb-8">
            Browse our complete catalog of farm produce and submit your wholesale order today.
          </p>
          <Link href="/products">
            <Button size="lg" className="bg-white text-emerald-700 hover:bg-emerald-50 px-8 h-14 text-base font-semibold">
              Start Shopping
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
