"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Sprout, AlertTriangle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Check if Supabase is configured
  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const supabase = createClient();

      // If Supabase is not configured, allow direct access in dev mode
      if (!supabase) {
        console.warn("Supabase not configured - allowing dev access");
        router.push("/admin");
        router.refresh();
        return;
      }

      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) {
        setError(signInError.message || "Invalid credentials");
        setIsLoading(false);
        return;
      }

      if (!data.user) {
        setError("Authentication failed");
        setIsLoading(false);
        return;
      }

      // Check if user has admin role in user metadata
      const userRole = data.user.user_metadata?.role;
      if (userRole !== "admin") {
        // Sign out if not admin
        await supabase.auth.signOut();
        setError("Access denied. Admin privileges required.");
        setIsLoading(false);
        return;
      }

      // Redirect to admin dashboard
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  // Dev mode bypass
  const handleDevAccess = () => {
    router.push("/admin");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-amber-50 dark:from-green-950 dark:to-amber-950 px-4 font-sans">
      <div className="w-full max-w-md relative">
        <div className="mb-12 text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-600 text-white mb-4">
            <Sprout className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold text-green-800 dark:text-green-200">
            AgroOrder Admin
          </h1>
          <p className="text-sm text-muted-foreground">
            B2B Farm Produce Wholesale Platform
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-green-100 dark:border-green-900 p-8 md:p-10">
          <h2 className="text-xl font-semibold mb-6 text-center">
            Admin Login
          </h2>

          {!supabaseConfigured && (
            <div className="mb-6 bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="space-y-2">
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Development Mode
                  </p>
                  <p className="text-xs text-amber-600 dark:text-amber-400">
                    Supabase auth is not configured. Click below to access admin
                    panel directly.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDevAccess}
                    className="mt-2 border-amber-300 text-amber-700 hover:bg-amber-100"
                  >
                    Access Admin Panel (Dev Mode)
                  </Button>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@agroorder.com"
                className="h-12"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                className="h-12"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-green-600 hover:bg-green-700"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>

            <div className="pt-4 border-t text-center space-y-2">
              <p className="text-xs text-muted-foreground">Demo Credentials</p>
              <div className="text-sm">
                <span className="text-muted-foreground">Email: </span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  admin@agroorder.com
                </code>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Password: </span>
                <code className="bg-muted px-2 py-1 rounded text-xs">
                  admin123
                </code>
              </div>
            </div>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          AgroOrder v1.0 - Wholesale Management System
        </p>
      </div>
    </div>
  );
}
