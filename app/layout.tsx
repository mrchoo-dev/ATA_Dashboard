import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ATA Dashboard",
  description: "LG/Samsung item name ATA monitoring dashboard"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
