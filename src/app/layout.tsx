import type { Metadata, Viewport } from "next";
import { Inter, Caveat } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const caveat = Caveat({
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
        className={`${inter.variable} ${caveat.variable} antialiased bg-[#f4f2ee] text-[#141311] font-sans`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
