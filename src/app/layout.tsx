import type { Metadata } from "next";
import { PT_Serif } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { Analytics } from "@/components/layout/Analytics";
import { Providers } from "@/components/providers/Providers";
import { createMetadata, artistJsonLd } from "@/lib/seo";
import "./globals.css";

const ptSerif = PT_Serif({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-pt-serif",
  display: "swap",
});

export const metadata: Metadata = createMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={ptSerif.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(artistJsonLd()) }}
        />
      </head>
      <body className={ptSerif.className}>
        <Providers>
          <Analytics />
          <Header />
          <main>{children}</main>
          <FooterWrapper />
        </Providers>
      </body>
    </html>
  );
}
