import "./globals.css";
import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Noto_Sans, Source_Serif_4 } from "next/font/google";
import Providers from "@/components/Providers";
import Header from "@/components/Header";

const sans = Noto_Sans({ subsets: ["latin"], weight: ["300", "400", "500", "700", "800"], variable: "--font-sans" });
const serif = Source_Serif_4({ subsets: ["latin"], weight: ["300"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "goodbyte",
  description: "Ideas, ready to download.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable}`}>
      <body>
        <Providers>
          <Header />
          <main>{children}</main>
          <footer className="w">
            <span className="cap">Ideas, ready to download.</span>
            <span className="mut">Sample content until real sellers join.</span>
          </footer>
        </Providers>
      </body>
    </html>
  );
}
