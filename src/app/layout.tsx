import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  title: "EcoSync | Intelligent Sustainability Orchestrator",
  description:
    "EcoSync synchronizes high-energy consumption tasks with renewable energy availability. Track real-time solar, wind, water, and internet resources to minimize carbon footprint.",
  keywords: [
    "sustainability",
    "renewable energy",
    "carbon footprint",
    "green energy",
    "solar",
    "wind",
    "clean tech",
  ],
  authors: [{ name: "EcoSync Team" }],
  openGraph: {
    title: "EcoSync | Intelligent Sustainability Orchestrator",
    description:
      "Synchronize your energy consumption with renewable energy availability",
    type: "website",
  },
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
        {children}
      </body>
    </html>
  );
}
