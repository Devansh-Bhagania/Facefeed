import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using Inter for a modern look
import "./globals.css";
import { Toaster } from "@/components/ui/toaster"; // Add Toaster for notifications

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "FaceFeed",
  description: "Webcam feed with facial analysis",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
