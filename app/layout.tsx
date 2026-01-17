import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import "./globals.css";
import { NowPlayingProvider } from "@/lib/now-playing-context";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "La Eterna Salsa | Radio Salsa en Vivo Gratis 24 Horas",
  description: "Escucha radio salsa en vivo gratis. Salsa clásica, brava y vieja guardia desde Colombia para todo LATAM. Emisora online 24/7.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "La Eterna Salsa",
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: "#D32F2F",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="overflow-x-hidden">
      <body
        className={`${montserrat.variable} font-sans antialiased overflow-x-hidden`}
      >
        <NowPlayingProvider>
          {children}
        </NowPlayingProvider>
      </body>
    </html>
  );
}
