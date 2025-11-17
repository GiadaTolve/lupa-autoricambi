// src/app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from 'next/font/local'; // <-- 1. Importa localFont
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 2. Definisci il tuo font
const fontBrand = localFont({
  src: './fonts/Epigram-OG8g4.ttf', // Assicurati che il nome file sia giusto
  variable: '--font-brand', // Creiamo una variabile CSS
});

export const metadata: Metadata = {
  title: "Gestionale Lupa Autoricambi",
  description: "Gestionale interno per magazzino e clienti",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* 3. Aggiungi la variabile del font al body */}
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${fontBrand.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}