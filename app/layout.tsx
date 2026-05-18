import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GoogleAnalytics from "@/app/_components/google-analytics";
import { DEFAULT_DESCRIPTION, SITE_NAME, createMetadataBase } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: createMetadataBase(),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "ja_JP",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="site-shell min-h-screen overflow-x-hidden text-zinc-100 antialiased">
        <header className="sticky top-0 z-50 border-b border-white/10 bg-black/92 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="group flex items-center gap-3">
              <Image
                src="/koshian_square_logo.png"
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-md bg-white object-contain"
                priority
              />
              <span className="text-base font-black text-white md:text-lg">
                こしあんスクエア
              </span>
            </Link>

            <nav className="flex items-center gap-1 bg-zinc-900 p-1 text-sm text-zinc-300">
              <Link href="/songs" className="rounded-sm px-3 py-1.5 hover:bg-white hover:text-black">
                曲
              </Link>
              <Link href="/lives" className="rounded-sm px-3 py-1.5 hover:bg-white hover:text-black">
                ライブ
              </Link>
              <Link href="/wiki" className="rounded-sm px-3 py-1.5 hover:bg-white hover:text-black">
                Wiki
              </Link>
              <Link href="/admin" className="hidden rounded-sm px-3 py-1.5 hover:bg-white hover:text-black sm:inline">
                管理画面
              </Link>
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">{children}</div>
      </body>
      <GoogleAnalytics />
    </html>
  );
}
