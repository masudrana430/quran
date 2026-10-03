import type { Metadata } from "next";
import {
  Inter,
  Hind_Siliguri,
  Amiri_Quran,
  Noto_Naskh_Arabic,
} from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import Link from "next/link";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const hindSiliguri = Hind_Siliguri({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-hind-siliguri",
});

const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-amiri-quran",
});

const notoNaskhArabic = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto-naskh-arabic",
});

export const metadata: Metadata = {
  title: "Quran Word by Word Bangla",
  description: "Learn Quran words with Bangla meaning and memorization tricks.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn">
      <body
        className={`${inter.variable} ${hindSiliguri.variable} ${amiriQuran.variable} ${notoNaskhArabic.variable}`}
      >
        <a className="skip-link" href="#main-content">
          মূল লেখায় যান
        </a>
        <SiteHeader />
        <main id="main-content">{children}</main>
        <footer className="site-footer">
          <p>কুরআন · পড়ুন, বুঝুন, অনুশীলন করুন</p>
          <Link href="/about">অনুবাদ ও শেখার সহায়িকার উৎস</Link>
        </footer>
      </body>
    </html>
  );
}
