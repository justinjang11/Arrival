import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ArrivalSessionProvider } from "@/features/app-session/ArrivalSessionContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Arrival",
  description: "AI-powered outfit discovery and multi-retailer shopping platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ArrivalSessionProvider>{children}</ArrivalSessionProvider>
      </body>
    </html>
  );
}
