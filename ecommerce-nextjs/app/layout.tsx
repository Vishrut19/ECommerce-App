import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SiteHeader } from "@/components/site-header";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "E-Commerce Store",
  description: "Modern e-commerce store built with Next.js 15, TanStack Query, and TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Providers>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <footer className="border-t py-6 mt-12">
            <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
              <p>© 2026 E-Commerce Store. Built with Next.js 15 & TanStack Query.</p>
              <Link href="/admin" className="text-primary hover:underline mt-2 inline-block">
                Admin Dashboard
              </Link>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
