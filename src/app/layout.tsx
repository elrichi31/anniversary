import type { Metadata, Viewport } from "next";
import "./globals.css";
import { birthdayConfig } from "@/data/birthday";

export const metadata: Metadata = {
  title: birthdayConfig.pageTitle,
  description: birthdayConfig.pageDescription,
};

export const viewport: Viewport = {
  themeColor: "#fff7ef",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full">{children}</body>
    </html>
  );
}
