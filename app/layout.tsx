import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";

import LoadingScreen from "../components/LoadingScreen";
import "./globals.css";

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FCFBF8",
};

export const metadata: Metadata = {
  title: "Nirāma (निराम) · Food Label Transparency",
  description: "AI-powered food transparency for decoding FSSAI labels with clarity · OpenAI × FoodPharmer Hackathon.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} font-sans antialiased`}>
        <LoadingScreen />
        {children}
      </body>
    </html>
  );
}
