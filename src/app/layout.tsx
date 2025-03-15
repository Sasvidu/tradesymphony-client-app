import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import ClientRoot from "./client";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TradeSymphony",
  description: "AI-Powered Stock Trading Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <ClientRoot>
          {children}
        </ClientRoot>
      </body>
    </html>
  );
}
