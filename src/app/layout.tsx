import type { Metadata, Viewport } from "next";
import "./globals.css";
import { SoundProvider } from "@/context/SoundContext";
import { AuthProvider } from "@/context/AuthContext";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: "The Navodayan Network | Super App for 660+ JNV Schools Worldwide",
    template: "%s | The Navodayan Network",
  },
  description:
    "The premier zero-operating-cost Super App connecting alumni, students, and faculty of Jawahar Navodaya Vidyalaya across all 660+ schools in India and the global diaspora.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon",
    apple: "/apple-icon",
  },
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: "https://navodayan.org",
    title: "The Navodayan Network | Super App for 660+ JNV Schools",
    description:
      "Exclusive network for Jawahar Navodaya Vidyalaya alumni and students. Discover 660+ school hubs, 1-on-1 mentorship, blood emergency matching, and business hubs.",
    siteName: "The Navodayan Network",
  },
  twitter: {
    card: "summary_large_image",
    title: "The Navodayan Network",
    description: "Super App for 660+ Jawahar Navodaya Vidyalayas worldwide.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1E3A8A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="antialiased selection:bg-amber-500 selection:text-white">
        <SoundProvider>
          <AuthProvider>
            <AppShell>{children}</AppShell>
            <Toaster position="top-right" richColors closeButton duration={3000} />
          </AuthProvider>
        </SoundProvider>
      </body>
    </html>
  );
}
