import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const serif = Playfair_Display({
  variable: "--font-playfair",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const sans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const hand = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "KHOJ — People. Places. Possibilities.",
  description:
    "Because every person has a place to belong. KHOJ uses AI, open data and community effort to help find missing people across India.",
  keywords: ["Khoj", "missing people", "reunite", "India", "search", "NGO"],
  icons: {
    icon: "/favicon.svg",
  },
  openGraph: {
    title: "KHOJ — People. Places. Possibilities.",
    description: "Because every person has a place to belong.",
    siteName: "KHOJ",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#f2ede3",
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
        className={`${serif.variable} ${sans.variable} ${hand.variable} antialiased bg-paper text-ink font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
