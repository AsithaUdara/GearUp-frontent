// app/layout.tsx
import type { Metadata } from "next";
import { Oswald, Noto_Sans_KR } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";

const oswald = Oswald({ 
  subsets: ["latin"],
  weight: ['500', '700'], 
  variable: "--font-heading" 
});

const notoSansKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ['400', '500', '700'],
  variable: "--font-body"
});

export const metadata: Metadata = {
  title: "GearUp | #1 Automobile Service",
  description: "The definitive standard in automobile care, from seamless booking to real-time progress tracking.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="!scroll-smooth" suppressHydrationWarning>
      <body className={`${oswald.variable} ${notoSansKR.variable} antialiased`} suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}