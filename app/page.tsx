"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Menu,
  X,
  User,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Barcode } from "@/components/barcode";
import { ThemeToggle } from "@/components/theme-toggle";
import { insforge } from "@/lib/insforge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

/** A real upload, from the moment it lands to the moment it's collected. */
const SAMPLE = {
  fileName: "brand-kit-2026.zip",
  fileSize: "24.6 MB",
  token: "7F3A-91C2-D4E8",
  collected: 12,
};

const FEATURES = [
  {
    scope: "Per file",
    title: "200 MB, any format",
    body: "Documents, images, video, archives. If it's under 200 MB, it goes.",
  },
  {
    scope: "Per link",
    title: "A short link you can paste",
    body: "Every upload gets its own link. Send it by email, chat, or drop it in a doc.",
  },
  {
    scope: "Per device",
    title: "A QR code for phones",
    body: "Open a file's share page to show or download the code — handy for moving a file to a phone.",
  },
  {
    scope: "Per file",
    title: "Download counts",
    body: "See how many times each file has been collected, numbered on its own row.",
  },
  {
    scope: "Per list",
    title: "Search, filter, sort",
    body: "Find a file by name, filter by type, sort by size, date, or downloads, and delete in bulk.",
  },
  {
    scope: "Per account",
    title: "Files stay yours",
    body: "Uploads sit in your own storage folder behind your account. Only someone with the link can collect one.",
  },
];

const STEPS = [
  {
    n: "01",
    title: "Create an account",
    body: "Email and password, or Google and GitHub. Takes about a minute.",
  },
  {
    n: "02",
    title: "Upload",
    body: "Drag files onto the dashboard. Each one gets a link and a QR code.",
  },
  {
    n: "03",
    title: "Send the link",
    body: "Paste it wherever. The count goes up as people collect the file.",
  },
];

export default function LandingPage() {
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void (async () => {
      try {
        const { data, error } = await insforge.auth.getCurrentUser();
        setIsAuthenticated(!error && !!data?.user);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await insforge.auth.signOut();
      setIsAuthenticated(false);
      toast.success("Signed out");
      router.push("/");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b-2 border-rule bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 sm:py-4">
          <Link href="/" className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 bg-primary" />
            <span className="text-lg font-extrabold tracking-tight sm:text-xl">
              FileShare
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#features"
              className="stamp text-muted-foreground transition-colors hover:text-foreground"
            >
              What you get
            </Link>
            <Link
              href="#how-it-works"
              className="stamp text-muted-foreground transition-colors hover:text-foreground"
            >
              How it works
            </Link>
            <ThemeToggle />
            {!loading &&
              (isAuthenticated ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" aria-label="Account">
                      <User className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel className="stamp text-muted-foreground">
                      My account
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="cursor-pointer">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-3">
                  <Link
                    href="/auth/login"
                    className="stamp text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Sign in
                  </Link>
                  <Button asChild size="sm">
                    <Link href="/auth/signup">Create an account</Link>
                  </Button>
                </div>
              ))}
          </nav>

          {/* Mobile Navigation */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            {!loading && isAuthenticated && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account">
                    <User className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link
                      href="/dashboard"
                      className="cursor-pointer"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      Dashboard
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button
              variant="ghost"
              size="icon"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-4 w-4" />
              ) : (
                <Menu className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-background md:hidden">
            <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
              <Link
                href="#features"
                className="stamp py-3 text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                What you get
              </Link>
              <Link
                href="#how-it-works"
                className="stamp py-3 text-muted-foreground"
                onClick={() => setMobileMenuOpen(false)}
              >
                How it works
              </Link>
              {!loading && !isAuthenticated && (
                <div className="flex flex-col gap-2 pt-2">
                  <Button asChild variant="outline" className="justify-center">
                    <Link
                      href="/auth/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign in
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link
                      href="/auth/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Create an account
                    </Link>
                  </Button>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Hero: the counter. You hand a file over; you get a stub back. */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-14 sm:py-20 lg:py-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
            <div className="print-in">
              <p className="stamp text-muted-foreground">
                No account needed to collect
              </p>
              <h1 className="mt-5 text-4xl leading-[0.95] font-extrabold tracking-[-0.035em] sm:text-6xl lg:text-7xl">
                Hand it over.
                <br />
                Get a link back.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                Upload a file up to 200 MB. We give you a short link and a QR
                code. Anyone can collect it, and you&apos;ll see every download.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" asChild className="group">
                  <Link href="/auth/signup">
                    Create an account
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="#how-it-works">See how it works</Link>
                </Button>
              </div>
            </div>

            {/* The consignment: the whole product in one object. */}
            <div className="print-in-late">
              <div className="pinfeed" />
              <div className="border-x border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <span className="stamp text-muted-foreground">
                    Sample transfer
                  </span>
                  <span className="stamp flex items-center gap-2 font-bold">
                    <span className="size-1.5 bg-primary" />
                    Ready
                  </span>
                </div>

                <div className="px-4 py-5 sm:px-6">
                  <p className="stamp text-muted-foreground">Consignment</p>
                  <p className="mt-2 truncate text-lg font-bold tracking-tight sm:text-xl">
                    {SAMPLE.fileName}
                  </p>
                  <div className="tabular mt-1 flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{SAMPLE.fileSize}</span>
                    <span aria-hidden>·</span>
                    <span>collected {SAMPLE.collected} times</span>
                  </div>
                </div>

                <div className="border-t border-border px-4 py-5 sm:px-6">
                  <Barcode value={SAMPLE.token} height={64} showValue={false} />
                  <div className="mt-3 flex items-center justify-between gap-4">
                    <span className="stamp text-muted-foreground">
                      Token
                    </span>
                    <span className="stamp tabular font-bold">
                      {SAMPLE.token}
                    </span>
                  </div>
                </div>
              </div>
              <div className="pinfeed" />
            </div>
          </div>

          {/* Spec strip — the constraints, stated once. */}
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-3 lg:mt-20">
            {[
              { value: "200 MB", label: "Max per file" },
              { value: "Unlimited", label: "Uploads" },
              { value: "Link + QR", label: "Two ways to collect" },
            ].map((spec) => (
              <div key={spec.label} className="bg-card px-5 py-5">
                <p className="text-xl font-bold tracking-tight sm:text-2xl">
                  {spec.value}
                </p>
                <p className="stamp mt-2 text-muted-foreground">{spec.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you get */}
      <section id="features" className="scroll-mt-20 border-b border-border">
        <div className="container mx-auto px-4 py-14 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="stamp text-muted-foreground">What you get</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              Six things, and nothing you have to configure.
            </h2>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border sm:grid-cols-2 lg:mt-14 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="bg-card px-5 py-6 sm:px-6 sm:py-7">
                <p className="stamp text-muted-foreground">{feature.scope}</p>
                <h3 className="mt-3 text-lg font-bold tracking-tight">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {feature.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works — here the numbering is the content. */}
      <section
        id="how-it-works"
        className="scroll-mt-20 border-b border-border bg-card"
      >
        <div className="container mx-auto px-4 py-14 sm:py-20 lg:py-24">
          <div className="max-w-2xl">
            <p className="stamp text-muted-foreground">How it works</p>
            <h2 className="mt-4 text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              Three steps, in this order.
            </h2>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-border bg-border md:grid-cols-3 lg:mt-14">
            {STEPS.map((step) => (
              <div key={step.n} className="bg-card px-5 py-6 sm:px-6 sm:py-8">
                <span className="tabular text-4xl font-extrabold tracking-tight text-primary sm:text-5xl">
                  {step.n}
                </span>
                <h3 className="mt-4 text-xl font-bold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {step.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="container mx-auto px-4 py-16 sm:py-20 lg:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-3xl font-extrabold tracking-[-0.03em] sm:text-4xl lg:text-5xl">
              Ready to hand something over?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Create an account, drop a file on the dashboard, and you&apos;ll
              have a link to send in under a minute.
            </p>
            <div className="mt-8">
              <Button size="lg" asChild className="group">
                <Link href="/auth/signup">
                  Create an account
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="container mx-auto flex flex-col items-start justify-between gap-4 px-4 py-10 sm:flex-row sm:items-center">
          <div className="flex items-center gap-2">
            <span aria-hidden className="size-2.5 bg-primary" />
            <span className="text-lg font-extrabold tracking-tight">
              FileShare
            </span>
          </div>
          <p className="stamp text-muted-foreground">
            Secure transfer · © {new Date().getFullYear()} FileShare
          </p>
        </div>
      </footer>
    </div>
  );
}
