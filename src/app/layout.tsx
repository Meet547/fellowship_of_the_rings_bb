import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, IBM_Plex_Mono, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const display = Instrument_Serif({
  variable: "--font-instrument",
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const sans = Inter_Tight({
  variable: "--font-intertight",
  subsets: ["latin"],
  display: "swap",
});

const mono = IBM_Plex_Mono({
  variable: "--font-plexmono",
  weight: ["400", "500"],
  subsets: ["latin"],
  display: "swap",
});

const hand = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KHOJ — People. Connected.",
  description:
    "A safer, more connected India. Khoj helps families, citizens, NGOs and authorities find missing people and reunite lives.",
  keywords: ["Khoj", "missing people", "reunite", "India", "search", "NGO"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "KHOJ — People. Connected.",
    description:
      "Because everyone belongs somewhere. Find missing people and reunite lives.",
    siteName: "KHOJ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f4f2ee",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${display.variable} ${sans.variable} ${mono.variable} ${hand.variable} antialiased bg-paper text-ink font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
