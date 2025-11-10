"use client";

export function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-background">
      {/* Animated gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-pink-950/20" />
      
      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-float-delayed" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse-slow" />
      
      {/* Main loading content */}
      <div className="relative z-10 text-center space-y-12">
        {/* Modern spinner with rings */}
        <div className="relative flex items-center justify-center">
          {/* Outer rotating ring */}
          <div className="absolute w-32 h-32">
            <div className="w-full h-full rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-400 animate-spin-slow" />
          </div>
          
          {/* Middle rotating ring */}
          <div className="absolute w-24 h-24">
            <div className="w-full h-full rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-400 animate-spin-reverse" />
          </div>
          
          {/* Inner rotating ring */}
          <div className="absolute w-16 h-16">
            <div className="w-full h-full rounded-full border-4 border-transparent border-t-pink-500 border-r-pink-400 animate-spin" />
          </div>
          
          {/* Center pulsing dot */}
          <div className="w-4 h-4 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full animate-pulse" />
        </div>

        {/* Brand with gradient effect */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent animate-gradient">
              FileShare
            </span>
          </h1>
          
          {/* Loading bar */}
          <div className="relative h-1.5 w-64 mx-auto bg-muted rounded-full overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 animate-loading-bar" />
          </div>
          
          {/* Loading text with dots */}
          <p className="text-sm text-muted-foreground font-medium">
            Loading
            <span className="inline-flex ml-1">
              <span className="animate-bounce animation-delay-0">.</span>
              <span className="animate-bounce animation-delay-200">.</span>
              <span className="animate-bounce animation-delay-400">.</span>
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
