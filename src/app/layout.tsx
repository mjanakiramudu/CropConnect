
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProductProvider } from "@/contexts/ProductContext"; 
import { CartProvider } from "@/contexts/CartContext"; 
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { Toaster } from "@/components/ui/toaster";
import { APP_NAME } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Directly connecting farmers with customers.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen`}
      >
        <LanguageProvider>
          <AuthProvider>
            <ProductProvider>
              <CartProvider>
                <Navbar />
                <main className="flex-grow container p-8">{children}</main>
                <Footer />
                <Toaster />
              </CartProvider>
            </ProductProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
