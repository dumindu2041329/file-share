import type { Metadata } from "next";
import { Archivo, Martian_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { AutoTheme } from "@/components/auto-theme";
import { Analytics } from "@vercel/analytics/react";

/**
 * Two voices, chosen for the subject (a file transfer is a consignment):
 * Archivo carries the print — an industrial American gothic that reads like
 * something set on a shipping label. Martian Mono carries the machine data —
 * tokens, sizes, counts — the register of a scanner, not of a paragraph.
 */
const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const martianMono = Martian_Mono({
  subsets: ["latin"],
  variable: "--font-martian",
  display: "swap",
});

export const metadata: Metadata = {
  title: "FileShare — Hand a file over, get a link back",
  description:
    "Upload a file up to 200 MB and get a shareable link and QR code. Anyone can collect it, no account needed. Track every download.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${archivo.variable} ${martianMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AutoTheme />
          {children}
          <Toaster />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
