import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "@/components/ui/toaster";
import { NotificationProvider } from "@/components/ui/notifications";
import ErrorBoundary from "@/components/ui/error-boundary";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Beacon - Compliance Intelligence Platform",
  description: "AI-powered compliance intelligence platform for regulatory monitoring and risk management",
  keywords: ["compliance", "regulatory", "AI", "risk management", "Beacon"],
  authors: [{ name: "Beacon Team" }],
  openGraph: {
    title: "Beacon - Compliance Intelligence Platform",
    description: "AI-powered compliance intelligence platform",
    url: "https://beacon.com",
    siteName: "Beacon",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beacon - Compliance Intelligence Platform",
    description: "AI-powered compliance intelligence platform",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body className={`${inter.variable} font-sans antialiased bg-background text-foreground`}>
          <ErrorBoundary>
            <NotificationProvider>
              <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
                {children}
              </div>
              <Toaster />
            </NotificationProvider>
          </ErrorBoundary>
        </body>
      </html>
    </ClerkProvider>
  );
}