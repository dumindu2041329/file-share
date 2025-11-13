"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Github } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await insforge.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to sign in");
        return;
      }

      toast.success("Signed in successfully!");
      router.push("/dashboard");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    try {
      const { data, error } = await insforge.auth.signInWithOAuth({
        provider,
        redirectTo: window.location.origin + "/dashboard",
        skipBrowserRedirect: true,
      });

      if (error) {
        toast.error(error.message || `Failed to sign in with ${provider}`);
        return;
      }

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 gradient-bg opacity-20" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />
      
      {/* Logo Header */}
      <div className="relative z-20 w-full p-4 sm:p-6">
        <Link href="/" className="inline-block">
          <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
            FileShare
          </div>
        </Link>
      </div>

      {/* Center Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md glass-card border-0 relative z-10 shadow-2xl animate-fade-in-up">
        <CardHeader className="space-y-2 pt-6 sm:pt-8 px-6 sm:px-8">
          <CardTitle className="text-3xl sm:text-4xl font-bold text-center bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Welcome back
          </CardTitle>
          <CardDescription className="text-center text-sm sm:text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-6 sm:px-8 pb-6 sm:pb-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <Button
              variant="outline"
              onClick={() => handleOAuth("google")}
              className="w-full hover:scale-105 transition-transform text-xs sm:text-sm"
            >
              <svg className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="##EA4335"
                />
              </svg>
              Google
            </Button>
            <Button
              variant="outline"
              onClick={() => handleOAuth("github")}
              className="w-full hover:scale-105 transition-transform text-xs sm:text-sm"
            >
              <Github className="mr-1 sm:mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              GitHub
            </Button>
          </div>

          <div className="relative my-6 sm:my-8">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-muted" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="glass px-4 py-1 text-muted-foreground font-medium rounded-full">
                Or continue with
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-primary hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardContent>
        </Card>
      </div>
    </div>
  );
}
