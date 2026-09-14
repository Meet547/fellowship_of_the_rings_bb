import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { SmoothScroll } from "@/components/khoj/smooth-scroll";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "KHOJ — Find someone. Follow the evidence.",
  description:
    "KHOJ is an AI-assisted missing-person investigation platform. Describe someone in your own words — KHOJ searches connected public and authorized sources and turns scattered information into potential leads, with the evidence behind them.",
  keywords: [
    "KHOJ",
    "missing person",
    "investigation",
    "search",
    "evidence",
    "found person",
  ],
  icons: {
    icon: "/khoj-icon.svg",
  },
  openGraph: {
    title: "KHOJ — Find someone. Follow the evidence.",
    description:
      "Turn scattered information into potential leads when someone goes missing.",
    siteName: "KHOJ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f5f2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="auto">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-cream text-ink font-sans`}
      >
        {children}
        <SmoothScroll />
        <Toaster />
      </body>
    </html>
  );
}
