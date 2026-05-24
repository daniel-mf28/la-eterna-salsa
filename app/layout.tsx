import type { Metadata, Viewport } from "next";
import { Inter, DM_Serif_Display, Playfair_Display } from "next/font/google";
import "./globals.css";
import { NowPlayingProvider } from "@/lib/now-playing-context";
import { fetchNowPlayingSnapshot } from "@/lib/shoutcast";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const dmSerif = DM_Serif_Display({
  variable: "--font-dm-serif",
  subsets: ["latin"],
  weight: ["400"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
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
  themeColor: "#0A3538",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const initialSnapshot = await fetchNowPlayingSnapshot();

  return (
    <html lang="es" className="overflow-x-hidden" style={{ backgroundColor: "#FBF1E4" }}>
      <body
        className={`${inter.variable} ${dmSerif.variable} ${playfair.variable} font-sans antialiased overflow-x-hidden`}
        style={{ backgroundColor: "#FBF1E4", color: "#0E1817" }}
      >
        <NowPlayingProvider initialSnapshot={initialSnapshot}>
          {children}
        </NowPlayingProvider>
      </body>
    </html>
  );
}
