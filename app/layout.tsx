import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Can I Take This Road? — Bengaluru route reality check",
  description:
    "Google Maps tells you how to get there. We tell you whether you should go right now — traffic, weather, and Bengaluru road conditions in one call.",
};

export const viewport: Viewport = {
  themeColor: "#0B0F14",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
