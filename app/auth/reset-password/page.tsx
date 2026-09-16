"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthShell } from "@/components/auth-shell";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

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

    setLoading(true);

    try {
      // The backend uses the "code" reset method: exchange the emailed code
      // for a short-lived reset token before setting the new password.
      const { data: exchangeData, error: exchangeError } =
        await insforge.auth.exchangeResetPasswordToken({
          email,
          code: code.trim(),
        });

      if (exchangeError || !exchangeData?.token) {
        toast.error(exchangeError?.message || "Invalid or expired reset code");
        return;
      }

      const { error } = await insforge.auth.resetPassword({
        newPassword: password,
        otp: exchangeData.token,
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
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password reset"
      title={resetSuccess ? "New password filed." : "Set a new password."}
      description={
        resetSuccess
          ? "That's the account back in order. Taking you to the sign-in counter."
          : "Enter the code we emailed you, then choose a password you'll remember."
      }
      footer={
        <Link
          href="/auth/login"
          className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
        >
          Back to sign in
        </Link>
      }
    >
      {resetSuccess ? (
        <div className="space-y-4">
          <div className="border border-border bg-background px-4 py-6 text-center">
            <p className="stamp text-muted-foreground">Password changed</p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Redirecting you to sign in…
            </p>
          </div>
          <Button asChild className="h-11 w-full">
            <Link href="/auth/login">Go to sign in</Link>
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
          <div className="space-y-2">
            <Label htmlFor="code">Reset code</Label>
            <Input
              id="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="123456"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              maxLength={6}
              className="h-12 text-center font-mono text-lg font-bold tracking-[0.4em]"
              required
            />
            <p className="stamp text-muted-foreground">
              The 6-digit code from the email
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <PasswordInput
              id="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <p className="stamp text-muted-foreground">At least 6 characters</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm password</Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Filing…" : "Reset password"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
