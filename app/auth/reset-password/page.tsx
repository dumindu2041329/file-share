"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    // Get OTP from URL if provided (for link-based flow)
    const hash = window.location.hash;
    if (hash) {
      const params = new URLSearchParams(hash.substring(1));
      const token = params.get("token") || params.get("otp");
      if (token) {
        setOtp(token);
      }
    }

    // Also check query params
    const tokenFromQuery = searchParams.get("token") || searchParams.get("otp");
    if (tokenFromQuery) {
      setOtp(tokenFromQuery);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    if (!otp) {
      toast.error("Reset code is required. Please check your email.");
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await insforge.auth.resetPassword({
        newPassword: password,
        otp: otp,
      });

      if (error) {
        toast.error(error.message || "Failed to reset password");
        return;
      }

      setResetSuccess(true);
      toast.success("Password reset successfully!");
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!otp && !resetSuccess) {
    return (
      <div className="min-h-screen flex flex-col relative overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />
        
        <div className="relative z-20 w-full p-4 sm:p-6">
          <Link href="/" className="inline-block">
            <div className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
              FileShare
            </div>
          </Link>
        </div>

        <div className="flex-1 flex items-center justify-center p-4">
          <Card className="w-full max-w-md glass-card border-0 relative z-10 shadow-2xl">
            <CardHeader className="space-y-2 pt-6 sm:pt-8 px-6 sm:px-8">
              <CardTitle className="text-2xl font-bold text-center">Invalid Reset Link</CardTitle>
              <CardDescription className="text-center">
                This password reset link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 px-6 sm:px-8 pb-6 sm:pb-8">
              <Button asChild className="w-full">
                <Link href="/auth/forgot-password">Request New Link</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
              {resetSuccess ? "Success!" : "Reset password"}
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              {resetSuccess
                ? "Your password has been reset successfully"
                : "Enter your new password below"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-6 sm:px-8 pb-6 sm:pb-8">
            {resetSuccess ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <CheckCircle2 className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Redirecting to login page...
                </p>
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                  <Link href="/auth/login">Go to Login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Reset Code</Label>
                  <Input
                    id="otp"
                    placeholder="Enter code from email"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter the code sent to your email
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">New Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Must be at least 6 characters
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  disabled={loading}
                >
                  {loading ? "Resetting..." : "Reset password"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
