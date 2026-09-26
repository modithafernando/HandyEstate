import type { Metadata, Viewport } from "next";
import { Schibsted_Grotesk } from "next/font/google";
import { I18nProvider } from "@/lib/i18n/client";
import { LOCALE_TAGS } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import "./globals.css";

const grotesk = Schibsted_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-grotesk",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: "HandyEstate — find someone who can fix it", template: "%s · HandyEstate" },
  description: "Find trusted plumbers, electricians, AC technicians and more near you in Matara and Galle. See who's free today and call them directly.",
  openGraph: { images: ["/brand/handyestate-logo.png"], siteName: "HandyEstate" },
};

export const viewport: Viewport = {
  themeColor: "#faf8f4",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { locale, messages } = await getI18n();
  return (
    <html lang={LOCALE_TAGS[locale]} className={grotesk.variable}>
      <body className="font-sans antialiased">
        <I18nProvider locale={locale} messages={messages}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
