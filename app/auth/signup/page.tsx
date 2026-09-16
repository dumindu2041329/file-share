"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { GithubIcon } from "@/components/ui/github-icon";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { AuthShell, TearLine } from "@/components/auth-shell";
import { toast } from "sonner";
import { insforge } from "@/lib/insforge";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<"form" | "verify">("form");
  const [code, setCode] = useState("");
  const [resending, setResending] = useState(false);

  // Users sent here from the login page (unverified email) go straight to the
  // verification step with their address pre-filled.
  useEffect(() => {
    const emailToVerify = searchParams.get("verify");
    if (!emailToVerify) return;
    void (async () => {
      setEmail(emailToVerify);
      setStep("verify");
    })();
  }, [searchParams]);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await insforge.auth.signUp({
        email,
        password,
      });

      if (error) {
        toast.error(error.message || "Failed to sign up");
        return;
      }

      if (data?.requireEmailVerification) {
        setStep("verify");
        toast.success("We sent a 6-digit verification code to your email.");
        return;
      }

      if (data?.accessToken) {
        toast.success("Account created successfully!");
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await insforge.auth.verifyEmail({
        email,
        otp: code.trim(),
      });

      if (error) {
        toast.error(error.message || "Invalid or expired code");
        return;
      }

      // verifyEmail() signs the user in automatically
      toast.success("Email verified! Welcome to FileShare.");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);

    try {
      const { error } = await insforge.auth.resendVerificationEmail({ email });

      if (error) {
        toast.error(error.message || "Failed to resend code");
        return;
      }

      toast.success("A new verification code is on its way.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setResending(false);
    }
  };

  const handleOAuth = async (provider: "google" | "github") => {
    try {
      const { error } = await insforge.auth.signInWithOAuth({
        provider,
        redirectTo: `${window.location.origin}/dashboard`,
      });

      if (error) {
        toast.error(error.message || `Failed to sign in with ${provider}`);
        return;
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    }
  };

  if (step === "verify") {
    return (
      <AuthShell
        eyebrow="Step two of two"
        title="Read us the six digits."
        description={`We sent a verification code to ${email}. Enter it to open your account.`}
      >
        <form onSubmit={handleVerify} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">Verification code</Label>
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
          </div>
          <Button type="submit" className="h-11 w-full" disabled={loading}>
            {loading ? "Checking…" : "Verify email"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleResend}
            disabled={resending}
          >
            {resending ? "Sending…" : "Send a new code"}
          </Button>
        </form>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      eyebrow="New account"
      title="Open a counter account."
      description="One account keeps every link you hand out on a single manifest."
      footer={
        <>
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="font-semibold text-foreground underline underline-offset-4 hover:text-primary"
          >
            Sign in
          </Link>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="outline"
          onClick={() => handleOAuth("google")}
          className="h-10 w-full"
        >
          <svg className="mr-2 size-4" viewBox="0 0 24 24" aria-hidden="true">
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
              fill="#EA4335"
            />
          </svg>
          Google
        </Button>
        <Button
          variant="outline"
          onClick={() => handleOAuth("github")}
          className="h-10 w-full"
        >
          <GithubIcon className="mr-2 size-4" />
          GitHub
        </Button>
      </div>

      <div className="my-6">
        <TearLine label="or use email" />
      </div>

      <form onSubmit={handleSignUp} className="space-y-4">
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
            minLength={6}
          />
          <p className="stamp text-muted-foreground">At least 6 characters</p>
        </div>
        <Button type="submit" className="h-11 w-full" disabled={loading}>
          {loading ? "Opening…" : "Sign up"}
        </Button>
      </form>
    </AuthShell>
  );
}
