import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Felices 42 meses preciosa 👩🏿‍⚕️",
  description:
    "Te amo princesa hermosa. Felices 42 meses, mi amor. Esta sorpresa es solo para ti.",
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
