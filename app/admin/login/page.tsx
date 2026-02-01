'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            const result = await signIn.email({
                email,
                password,
            });

            if (result.error) {
                setError(result.error.message || 'Invalid credentials');
                setIsLoading(false);
                return;
            }

            // Check if user has admin role
            if (result.data?.user?.role !== 'admin') {
                setError('Access denied. Admin privileges required.');
                setIsLoading(false);
                return;
            }

            // Redirect to admin dashboard
            router.push('/admin');
            router.refresh();
        } catch (err) {
            setError('An error occurred. Please try again.');
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4 font-sans selection:bg-primary selection:text-primary-foreground">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.05)_0%,transparent_50%)] pointer-events-none" />
            
            <div className="w-full max-w-md relative">
                <div className="mb-12 text-center space-y-4">
                    <div className="inline-flex items-center justify-center w-12 h-12 border border-primary/20 bg-primary/5 mb-4">
                        <span className="text-xl font-bold tracking-tighter">L</span>
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter uppercase">LUMINA TERMINAL</h1>
                    <p className="text-sm text-muted-foreground uppercase tracking-[0.2em]">Authorized Personnel Only</p>
                </div>

                <div className="border border-border/40 p-8 md:p-12 glass relative">
                    <div className="absolute -top-px left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
                    
                    <form onSubmit={handleSubmit} className="space-y-8">
                        {error && (
                            <div className="bg-destructive/10 border border-destructive/20 p-4 text-xs font-bold text-destructive uppercase tracking-widest animate-in fade-in slide-in-from-top-1">
                                {error}
                            </div>
                        )}

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Access ID (Email)</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@lumina.com"
                                className="h-12 rounded-none border-border/40 bg-background/50 focus:ring-primary focus:border-primary transition-all uppercase text-xs tracking-widest"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password" className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground">Security Key</Label>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                className="h-12 rounded-none border-border/40 bg-background/50 focus:ring-primary focus:border-primary transition-all text-xs tracking-[0.3em]"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </div>

                        <Button 
                            type="submit" 
                            className="w-full h-14 rounded-none uppercase tracking-[0.3em] font-bold text-xs hover:scale-[1.01] active:scale-[0.99] transition-all" 
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Authenticating...
                                </>
                            ) : (
                                'Initiate Login'
                            )}
                        </Button>

                        <div className="pt-4 border-t border-border/10">
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">
                                <span>Demo ID</span>
                                <span className="text-muted-foreground">admin@example.com</span>
                            </div>
                            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mt-2">
                                <span>Security Code</span>
                                <span className="text-muted-foreground">admin123</span>
                            </div>
                        </div>
                    </form>
                </div>

                <p className="mt-8 text-center text-[10px] uppercase tracking-[0.3em] text-muted-foreground/40 font-bold">
                    System Version 2.0.1 // encrypted session
                </p>
            </div>
        </div>
    );
}
