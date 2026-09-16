"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthShell } from "@/components/auth-shell";
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
      const { error } = await insforge.auth.sendResetPasswordEmail({
        email,
      });

      if (error) {
        toast.error(error.message || "Failed to send reset email");
        return;
      }

      setEmailSent(true);
      toast.success("Reset code sent! Check your email.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      eyebrow="Password reset"
      title={emailSent ? "Six digits are on their way." : "Forgot the password?"}
      description={
        emailSent
          ? "Enter the code from the email on the next screen to choose a new one."
          : "Give us the address on the account and we'll post a reset code to it."
      }
      footer={
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 font-semibold text-foreground underline underline-offset-4 hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Back to sign in
        </Link>
      }
    >
      {emailSent ? (
        <div className="space-y-4">
          <div className="border border-border bg-background px-4 py-3">
            <p className="stamp text-muted-foreground">Code sent to</p>
            <p className="mt-1.5 break-all font-mono text-sm font-bold">
              {email}
            </p>
          </div>

          <Button asChild className="h-11 w-full">
            <Link href="/auth/reset-password">Enter reset code</Link>
          </Button>
          <Button
            onClick={() => setEmailSent(false)}
            variant="outline"
            className="h-11 w-full"
          >
            Send it again
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
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Sending…" : "Send reset code"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
