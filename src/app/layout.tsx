import type { Metadata } from "next";
import { Inter, Cormorant_Garamond } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { StickyMediaPlayer } from "@/components/layout/StickyMediaPlayer";
import { Analytics } from "@/components/layout/Analytics";
import { Providers } from "@/components/providers/Providers";
import { createMetadata, artistJsonLd } from "@/lib/seo";
import { cn } from "@/lib/utils";
import "./globals.css";
import "./globals.experiment.css";

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-cormorant",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = createMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(cormorant.variable, inter.variable)}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(artistJsonLd()) }}
        />
      </head>
      <body className={inter.className}>
        <Providers>
          <Analytics />
          <Header />
          <main>{children}</main>
          <FooterWrapper />
          <StickyMediaPlayer />
        </Providers>
      </body>
    </html>
  );
}
