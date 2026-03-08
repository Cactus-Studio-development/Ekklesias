import type { Metadata } from "next";
import { Lora, Great_Vibes, DM_Sans } from "next/font/google";
import "./globals.css";

const lora = Lora({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "500", "600", "700"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  variable: "--font-script",
  weight: ["400"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ekklesias | Plataforma Cristiana Evangélica",
  description:
    "Comunidad cristiana evangélica para conectarte con mensajes, discipulado, oración y eventos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${lora.variable} ${greatVibes.variable} ${dmSans.variable}`}>{children}</body>
    </html>
  );
}
