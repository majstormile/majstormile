import type { Metadata, Viewport } from "next";
import "./globals.css";
import "./baunavi.css";
import { LangProvider } from "@/lib/i18n";
import { instance } from "@/lib/instance";
import SwRegister from "@/components/sw-register";
import WebAnalytics from "@/components/web-analytics";

const meta = instance.meta[instance.defaultLang] || instance.meta.en!;
const HTML_LANG = { sr: "sr-Latn", de: "de", en: "en" } as const;

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: `/icons/${instance.id}-apple.png`,
  },
  appleWebApp: { capable: true, title: instance.brand, statusBarStyle: "default" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = { themeColor: "#152a40", viewportFit: "cover", width: "device-width", initialScale: 1 };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={HTML_LANG[instance.defaultLang]}>
      <body className="antialiased"><LangProvider>{children}</LangProvider><SwRegister/><WebAnalytics/></body>
    </html>
  );
}
