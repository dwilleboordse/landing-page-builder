import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Page Builder — Advertorials, Listicles, Comparisons",
  description: "One-shot landing page generator for eCommerce brands",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
