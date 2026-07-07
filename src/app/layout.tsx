import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SanUp - Preparazione test Professioni Sanitarie",
  description:
    "Allenati, capisci dove sbagli e migliora ogni giorno per il test di ammissione alle Professioni Sanitarie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="it" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <main className="flex-1 w-full max-w-2xl mx-auto px-4 pt-6 pb-28">
          {children}
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
