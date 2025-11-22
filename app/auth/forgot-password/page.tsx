"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await insforge.auth.sendResetPasswordEmail({
        email,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      setEmailSent(true);
      toast.success("Password reset link sent! Check your email.");
    } catch (error: any) {
      toast.error(error.message || "An error occurred");
    } finally {
      setLoading(false);
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
              {emailSent ? "Check your email" : "Forgot password?"}
            </CardTitle>
            <CardDescription className="text-center text-sm sm:text-base">
              {emailSent
                ? "We've sent you a password reset link"
                : "Enter your email and we'll send you a reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 sm:space-y-6 px-6 sm:px-8 pb-6 sm:pb-8">
            {emailSent ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  We've sent a password reset link to <strong>{email}</strong>. 
                  Click the link in the email to reset your password.
                </p>
                <p className="text-sm text-muted-foreground text-center">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <Button
                  onClick={() => setEmailSent(false)}
                  variant="outline"
                  className="w-full"
                >
                  Send again
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send reset link"}
                </Button>
              </form>
            )}

            <div className="pt-4 border-t">
              <Link
                href="/auth/login"
                className="flex items-center justify-center text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
