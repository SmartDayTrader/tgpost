import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TGPost — Telegram Channel → SEO Website",
  description: "Turn your Telegram channel into an SEO-optimized website. Every post becomes a Google-indexed page.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
