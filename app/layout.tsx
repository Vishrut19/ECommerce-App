import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LUMINA | Modern E-Commerce",
  description: "Experience the future of shopping with LUMINA. High-end tech and curated fashion.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${spaceGrotesk.variable} ${inter.variable} font-sans antialiased min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground`}
      >
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-border/40 py-12 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-8">
                <div className="col-span-1 md:col-span-2">
                  <Link href="/" className="text-2xl font-bold tracking-tighter font-display mb-4 block">
                    LUMINA
                  </Link>
                  <p className="text-muted-foreground max-w-xs">
                    Curating the finest selection of technology and fashion for the modern individual.
                  </p>
                </div>
                <div>
                  <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-muted-foreground">Shop</h4>
                  <ul className="space-y-2">
                    <li><Link href="/tech" className="hover:text-primary transition-colors">Technology</Link></li>
                    <li><Link href="/clothes" className="hover:text-primary transition-colors">Fashion</Link></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4 uppercase text-xs tracking-widest text-muted-foreground">Internal</h4>
                  <ul className="space-y-2">
                    <li><Link href="/admin" className="hover:text-primary transition-colors">Admin Dashboard</Link></li>
                  </ul>
                </div>
              </div>
              <div className="pt-8 border-t border-border/40 text-center text-sm text-muted-foreground">
                <p>© 2026 LUMINA. All rights reserved.</p>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
