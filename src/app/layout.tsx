import type { Metadata } from "next";
import { JetBrains_Mono, PT_Serif } from "next/font/google";
import { Header } from "@/components/layout/Header";
import { FooterWrapper } from "@/components/layout/FooterWrapper";
import { StickyMediaPlayer } from "@/components/layout/StickyMediaPlayer";
import { Analytics } from "@/components/layout/Analytics";
import { Providers } from "@/components/providers/Providers";
import FallingLogoBackground from "@/components/FallingLogoBackground";
import { createMetadata, artistJsonLd } from "@/lib/seo";
import { isTerminalThemeEnabled } from "@/lib/terminal-theme";
import { cn } from "@/lib/utils";
import "./globals.css";
import "./globals.experiment.css";

const ptSerif = PT_Serif({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-pt-serif",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
});

const terminalTheme = isTerminalThemeEnabled();

export const metadata: Metadata = createMetadata();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={cn(
        ptSerif.variable,
        jetbrainsMono.variable,
        terminalTheme && "terminal-theme"
      )}
      data-terminal-theme={terminalTheme ? "1" : undefined}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(artistJsonLd()) }}
        />
      </head>
      <body
        className={cn(
          terminalTheme ? jetbrainsMono.className : ptSerif.className
        )}
      >
        <Providers>
          <Analytics />
          <div style={{ position: "relative" }}>
            <FallingLogoBackground />
            <div style={{ position: "relative", zIndex: 1 }}>
              <Header />
              <main>{children}</main>
              <FooterWrapper />
              <StickyMediaPlayer />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
