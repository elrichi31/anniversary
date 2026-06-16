import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "18 de junio de 2026 | 3 anos y 6 meses",
  description:
    "Una experiencia interactiva de aniversario hecha para celebrar desde el 18 de diciembre de 2022 hasta el 18 de junio de 2026.",
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
