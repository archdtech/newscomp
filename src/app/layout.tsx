import type { Metadata } from "next";
<<<<<<< HEAD
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
=======
import { Inter } from "next/font/google";
import Link from "next/link";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";
import "./globals.css";

const inter = Inter({
>>>>>>> 681bf3f8575421626dc4166ce9f4b2df0df214b5
  subsets: ["latin"],
});

export const metadata: Metadata = {
<<<<<<< HEAD
  title: "Z.ai Code Scaffold - AI-Powered Development",
  description: "Modern Next.js scaffold optimized for AI-powered development with Z.ai. Built with TypeScript, Tailwind CSS, and shadcn/ui.",
  keywords: ["Z.ai", "Next.js", "TypeScript", "Tailwind CSS", "shadcn/ui", "AI development", "React"],
  authors: [{ name: "Z.ai Team" }],
  openGraph: {
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
    url: "https://chat.z.ai",
    siteName: "Z.ai",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Z.ai Code Scaffold",
    description: "AI-powered development with modern React stack",
  },
=======
  title: "Beacon - Compliance Intelligence Platform",
  description: "AI-powered compliance intelligence platform",
>>>>>>> 681bf3f8575421626dc4166ce9f4b2df0df214b5
};

export default function RootLayout({
  children,
<<<<<<< HEAD
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
=======
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={`${inter.className} bg-white text-black`}>
          <div className="min-h-screen">
            <header className="border-b bg-white/95 backdrop-blur-sm">
              <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                  <Link href="/" className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                    Beacon
                  </Link>
                  <div className="flex items-center gap-4">
                    <SignedOut>
                      <div className="flex items-center gap-2">
                        <SignInButton mode="modal">
                          <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">
                            Sign In
                          </button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <button className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                            Sign Up
                          </button>
                        </SignUpButton>
                      </div>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex items-center gap-4">
                        <nav className="hidden md:flex items-center gap-6">
                          <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                            Dashboard
                          </Link>
                          <Link href="/dashboard-v2" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                            Dashboard v2
                          </Link>
                          <Link href="/news" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                            News Feed
                          </Link>
                          <Link href="/vendors" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                            Vendors
                          </Link>
                          <Link href="/ai-alerts" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                            AI Alerts
                          </Link>
                          <Link href="/regulatory-monitoring" className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors">
                            Regulatory
                          </Link>
                        </nav>
                        <UserButton afterSignOutUrl="/" />
                      </div>
                    </SignedIn>
                  </div>
                </div>
              </div>
            </header>
            {children}
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
>>>>>>> 681bf3f8575421626dc4166ce9f4b2df0df214b5
