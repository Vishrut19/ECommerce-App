import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-bold mb-4">Welcome to E-Store</h1>
        <p className="text-xl text-muted-foreground mb-8">
          Discover amazing products in Tech and Clothes
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link href="/tech">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Tech Products</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Explore the latest gadgets, gaming consoles, and electronics
              </p>
              <Button>Browse Tech →</Button>
            </CardContent>
          </Card>
        </Link>

        <Link href="/clothes">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <CardTitle className="text-2xl">Clothes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Discover stylish apparel and footwear from top brands
              </p>
              <Button>Browse Clothes →</Button>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
