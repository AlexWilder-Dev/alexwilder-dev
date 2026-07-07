import type { Metadata, Viewport } from "next";
import { Fraunces, Instrument_Sans, Spline_Sans_Mono } from "next/font/google";
import SmoothScroll from "@/components/SmoothScroll";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  axes: ["opsz", "SOFT", "WONK"],
  display: "swap",
});

const instrument = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument",
  display: "swap",
});

const splineMono = Spline_Sans_Mono({
  subsets: ["latin"],
  variable: "--font-spline-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Alex Wilder — I build your website before you've paid me a penny",
  description:
    "Demo-first web design. See it before you buy it. London-based, working everywhere.",
};

export const viewport: Viewport = {
  themeColor: "#F2EFE9",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en-GB"
      className={`${fraunces.variable} ${instrument.variable} ${splineMono.variable}`}
    >
      <body>
        {/* runs before first paint of the content below it, so the hero
            pre-hide styles only ever apply when JS will actually animate */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js')",
          }}
        />
        <a
          href="#main"
          className="anno sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:bg-paper focus:px-3 focus:py-2"
        >
          Skip to content
        </a>
        <div className="sheet-grid" aria-hidden="true" />
        <SmoothScroll />
        {children}
        <div className="grain" aria-hidden="true" />
        {/* stamp-edge roughening for the two seals */}
        <svg width="0" height="0" aria-hidden="true" focusable="false">
          <filter id="stamp-rough">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.55"
              numOctaves="2"
              seed="7"
              result="n"
            />
            <feDisplacementMap in="SourceGraphic" in2="n" scale="2.2" />
          </filter>
        </svg>
      </body>
    </html>
  );
}
