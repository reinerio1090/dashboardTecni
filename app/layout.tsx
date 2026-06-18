import "./globals.css";
import type { Metadata } from "next";
import HeaderNav from "@/components/HeaderNav";

export const metadata: Metadata = {
  title: "Dashboard Comercial",
  description: "Sistema Comercial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-gray-100">
          <HeaderNav />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
