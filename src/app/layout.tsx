import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  title: {
    default: "MonaPacksIA - Biblioteca de Packs para Criadores",
    template: "%s | MonaPacksIA",
  },
  description: "Sua galeria completa de trilhas sonoras, memes, efeitos e packs para youtubers e editores.",
  openGraph: {
    title: "MonaPacksIA - Biblioteca de Packs para Criadores",
    description: "Sua galeria completa de trilhas sonoras, memes, efeitos e packs para youtubers e editores.",
    url: siteUrl,
    siteName: "MonaPacksIA",
    locale: "pt_BR",
    type: "website",
    images: [{ url: `${siteUrl}/og-image.png`, width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "MonaPacksIA",
    description: "Biblioteca de packs para youtubers e editores.",
    images: [`${siteUrl}/og-image.png`],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="bg-black text-zinc-100 min-h-full flex flex-col">
        <Header />
        <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
