import type { Metadata } from "next";
import { Inter, Bebas_Neue, Space_Grotesk } from "next/font/google";
import { MainLayout } from "@/components/layout/MainLayout";
import { QueryProvider } from "@/providers/QueryProvider";
import { FootballProvider } from "@/providers/FootballProvider";
import "./globals.css";



const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas-neue",
  weight: "400",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GVB WORLD CUP 2026",
  description: "Plataforma premium de pronósticos para la Copa Mundial GVB 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${bebasNeue.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          <FootballProvider>
            <MainLayout>{children}</MainLayout>
          </FootballProvider>
        </QueryProvider>
      </body>
    </html>
  );
}

