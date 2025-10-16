import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OrganizeMe",
  description: "Your personal organization space",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // To enable dark mode, you would add className="dark" to this html tag
    <html lang="en">
      <body className={`${inter.className} bg-background text-text-primary`}>
        {children}
      </body>
    </html>
  );
}
