import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = "https://hioverturn.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Overturn — Every denial deserves a fight.",
    template: "%s · Overturn",
  },
  description:
    "Overturn turns denied insurance claims into winning appeals in 60 seconds. Built for small medical practices tired of fighting alone.",
  keywords: [
    "insurance denial appeal",
    "medical claim appeal",
    "small practice billing",
    "denied claim software",
    "medical necessity appeal",
    "HIPAA AI",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: "Overturn — Every denial deserves a fight.",
    description:
      "Turn denied insurance claims into winning appeals in 60 seconds. Built for small medical practices.",
    siteName: "Overturn",
    images: [{ url: "/opengraph-image", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Overturn — Every denial deserves a fight.",
    description:
      "Turn denied insurance claims into winning appeals in 60 seconds.",
    images: ["/opengraph-image"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body className="min-h-screen flex flex-col bg-white text-navy-800 antialiased">
        {children}
      </body>
    </html>
  );
}
