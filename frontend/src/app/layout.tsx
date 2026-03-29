import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { BrandingProvider } from "@/components/providers/BrandingProvider";
import { TourProvider } from "@/components/providers/TourProvider";
import { TranslationProvider } from "@/components/providers/TranslationProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { Toaster } from "sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InvenTrust | Modern ERP & Inventory",
  description: "The intelligent ERP system for modern businesses.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${outfit.variable} font-sans antialiased`}
      >
        <AuthProvider>
          <BrandingProvider>
            <TranslationProvider>
              <TourProvider>
                <AppLayout>
                  {children}
                </AppLayout>
              </TourProvider>
            </TranslationProvider>
          </BrandingProvider>
          <Toaster richColors position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}
