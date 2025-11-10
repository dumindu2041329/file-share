import Link from "next/link";
import { ArrowRight, Shield, Zap, Users, FileCheck, Download, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass shadow-lg">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent hover:scale-105 transition-transform">
            FileShare
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="#features" className="hover:text-primary transition-all hover:scale-105 font-medium">
              Features
            </Link>
            <Link href="#how-it-works" className="hover:text-primary transition-all hover:scale-105 font-medium">
              How It Works
            </Link>
            <ThemeToggle />
            <Button asChild variant="ghost" className="hover:scale-105 transition-transform">
              <Link href="/auth/login">Sign In</Link>
            </Button>
            <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all hover:scale-105">
              <Link href="/auth/signup">Get Started</Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute inset-0 gradient-bg opacity-20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)]" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-fade-in-up">
              Share Files Securely, Instantly
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-2xl mx-auto animate-fade-in-up animation-delay-200">
              Upload your files and share them with anyone, anywhere. Fast, secure, and incredibly simple. No limits, no hassle.
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-fade-in-up animation-delay-400">
              <Button size="lg" asChild className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all hover:scale-105">
                <Link href="/auth/signup">
                  Start Sharing
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="glass hover:bg-accent transition-all hover:scale-105 shadow-md">
                <Link href="#how-it-works">Learn More</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-20 max-w-3xl mx-auto">
              <div className="glass-card p-8 rounded-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent animate-pulse-slow">
                  10GB
                </div>
                <div className="text-sm text-muted-foreground mt-3 font-medium">Max File Size</div>
              </div>
              <div className="glass-card p-8 rounded-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent animate-pulse-slow">
                  Unlimited
                </div>
                <div className="text-sm text-muted-foreground mt-3 font-medium">File Uploads</div>
              </div>
              <div className="glass-card p-8 rounded-2xl transform hover:scale-105 transition-all duration-300 hover:shadow-xl">
                <div className="text-4xl font-bold bg-gradient-to-br from-pink-600 to-red-600 bg-clip-text text-transparent animate-pulse-slow">
                  Secure
                </div>
                <div className="text-sm text-muted-foreground mt-3 font-medium">End-to-End</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Powerful Features</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Everything you need for seamless file sharing, all in one place
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="glass-card border-0 group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Zap className="h-7 w-7 text-blue-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Upload and share files in seconds. Our optimized infrastructure ensures blazing fast transfers.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Shield className="h-7 w-7 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Secure Storage</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Your files are encrypted and stored securely. We take your privacy seriously.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Share2 className="h-7 w-7 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Easy Sharing</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Generate shareable links instantly. Share with anyone via email, social media, or messaging.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-orange-500/20 to-orange-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-7 w-7 text-orange-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Collaborate</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Share files with your team effortlessly. Perfect for collaboration and teamwork.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-pink-500/20 to-pink-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <FileCheck className="h-7 w-7 text-pink-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">All File Types</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Support for documents, images, videos, archives, and more. No file type restrictions.
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card border-0 group hover:scale-105 transition-all duration-300 hover:shadow-xl">
              <CardContent className="pt-6">
                <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Download className="h-7 w-7 text-cyan-500" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Download Analytics</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Track your file downloads and see how many people accessed your shared files.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-muted/30 scroll-mt-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Three simple steps to start sharing your files securely
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            <div className="text-center group">
              <div className="glass-card w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <span className="text-4xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  1
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Sign Up</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create your free account in seconds using email or social login
              </p>
            </div>

            <div className="text-center group">
              <div className="glass-card w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <span className="text-4xl font-bold bg-gradient-to-br from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  2
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Upload Files</h3>
              <p className="text-muted-foreground leading-relaxed">
                Drag and drop your files or click to browse. It's that simple
              </p>
            </div>

            <div className="text-center group">
              <div className="glass-card w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg group-hover:scale-110 group-hover:shadow-xl transition-all duration-300">
                <span className="text-4xl font-bold bg-gradient-to-br from-pink-600 to-red-600 bg-clip-text text-transparent">
                  3
                </span>
              </div>
              <h3 className="text-2xl font-semibold mb-3">Share Link</h3>
              <p className="text-muted-foreground leading-relaxed">
                Get a secure shareable link and send it to anyone you want
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="glass-card rounded-3xl p-16 text-center max-w-4xl mx-auto shadow-2xl hover:shadow-3xl transition-all duration-300 relative overflow-hidden">
            <div className="absolute inset-0 gradient-bg opacity-5" />
            <div className="relative z-10">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">Ready to Start Sharing?</h2>
              <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
                Join thousands of users who trust FileShare for their file sharing needs
              </p>
              <Button size="lg" asChild className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-2xl transition-all hover:scale-105 text-lg px-8 py-6">
                <Link href="/auth/signup">
                  Get Started For Free
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              FileShare
            </div>
            <div className="text-sm text-muted-foreground font-medium">
              © {new Date().getFullYear()} FileShare. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
