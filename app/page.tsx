import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight, Zap, Shield, Globe } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col gap-24 pb-24">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05),transparent)] z-0" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] uppercase tracking-[0.2em] font-bold animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Zap className="w-3 h-3" />
              Next Generation Shopping
            </div>
            <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              ESSENTIALS <br />
              <span className="text-muted-foreground">REDEFINED.</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
              Curating the finest intersection of cutting-edge technology and timeless fashion. 
              Designed for the modern minimalist.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-500">
              <Link href="/tech">
                <Button size="lg" className="rounded-none px-8 h-14 text-sm uppercase tracking-widest font-bold group">
                  Explore Tech
                  <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link href="/clothes">
                <Button size="lg" variant="outline" className="rounded-none px-8 h-14 text-sm uppercase tracking-widest font-bold">
                  Shop Fashion
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 gap-8">
          <Link href="/tech" className="group relative overflow-hidden aspect-[4/5] md:aspect-video bg-muted">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute inset-0 flex flex-col justify-end p-12 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">Collection 01</span>
              <h2 className="text-4xl font-bold mb-4 tracking-tighter">FUTURE TECH</h2>
              <p className="text-muted-foreground max-w-xs group-hover:text-white transition-colors duration-500">
                Precision engineered devices for a seamless digital life.
              </p>
            </div>
          </Link>

          <Link href="/clothes" className="group relative overflow-hidden aspect-[4/5] md:aspect-video bg-muted/50">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
            <div className="absolute inset-0 flex flex-col justify-end p-12 z-20 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <span className="text-xs uppercase tracking-[0.3em] font-bold text-primary mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500">Collection 02</span>
              <h2 className="text-4xl font-bold mb-4 tracking-tighter">MODERN ATTIRE</h2>
              <p className="text-muted-foreground max-w-xs group-hover:text-white transition-colors duration-500">
                Minimalist silhouettes crafted from premium sustainable materials.
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-muted/30 py-24 border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">SECURE TRANSACTIONS</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every purchase is protected by industry-leading encryption and fraud prevention.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <Globe className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">GLOBAL DELIVERY</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Fast, reliable shipping to over 150 countries with real-time tracking.
              </p>
            </div>
            <div className="space-y-4 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/5 flex items-center justify-center mx-auto mb-6">
                <Zap className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold tracking-tight">24/7 SUPPORT</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Our dedicated concierge team is available around the clock to assist you.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto bg-primary text-primary-foreground p-12 md:p-24 text-center space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <h2 className="text-4xl md:text-5xl font-bold tracking-tighter">JOIN THE INNER CIRCLE</h2>
          <p className="text-primary-foreground/70 max-w-md mx-auto">
            Be the first to know about new arrivals, limited collections, and exclusive events.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input 
              type="email" 
              placeholder="Enter your email" 
              className="flex-1 bg-white/10 border border-white/20 px-6 h-12 outline-none focus:border-white/40 transition-colors"
            />
            <Button variant="secondary" className="rounded-none h-12 px-8 uppercase tracking-widest font-bold">
              Subscribe
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
