import type { Metadata } from "next";
import { Space_Grotesk, Inter } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SanUp - Preparazione test Professioni Sanitarie",
  description:
    "Allenati, capisci dove sbagli e migliora ogni giorno per il test di ammissione alle Professioni Sanitarie.",
  manifest: "/site.webmanifest",
  themeColor: "#16c7c3",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SanUp",
  },
  icons: {
    icon: "/logo.svg",
    apple: "/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
