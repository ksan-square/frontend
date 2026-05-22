import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import GoogleAnalytics from "@/app/_components/google-analytics";
import JsonLd from "@/app/_components/json-ld";
import ToastViewport from "@/app/_components/toast-viewport";
import {
  DEFAULT_DESCRIPTION,
  SITE_LOGO_PATH,
  SITE_NAME,
  SITE_OG_IMAGE_PATH,
  buildAbsoluteUrl,
  createMetadataBase,
} from "@/lib/seo";
import "./globals.css";

const siteUrl = createMetadataBase().toString();
const absoluteLogoUrl = buildAbsoluteUrl(SITE_LOGO_PATH);
const absoluteOgImageUrl = buildAbsoluteUrl(SITE_OG_IMAGE_PATH);

export const metadata: Metadata = {
  metadataBase: createMetadataBase(),
  title: {
    default: `${SITE_NAME} | 宵越しのアンサンブル 非公式ファンコミュニティ`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  icons: {
    icon: [
      {
        url: SITE_LOGO_PATH,
        type: "image/png",
        sizes: "1024x1024",
      },
    ],
    apple: [
      {
        url: SITE_LOGO_PATH,
        type: "image/png",
        sizes: "1024x1024",
      },
    ],
    shortcut: [SITE_LOGO_PATH],
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: `${SITE_NAME} | 宵越しのアンサンブル 非公式ファンコミュニティ`,
    description: DEFAULT_DESCRIPTION,
    url: "/",
    siteName: SITE_NAME,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: SITE_OG_IMAGE_PATH,
        width: 1672,
        height: 941,
        alt: "こしあんスクエア",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | 宵越しのアンサンブル 非公式ファンコミュニティ`,
    description: DEFAULT_DESCRIPTION,
    images: [SITE_OG_IMAGE_PATH],
  },
  verification: {
    google: "PSvxFLOZNFQgjOfJF5XwONxoY5bIXCnZ4qJDLqxzxLg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: siteUrl,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "ja",
  };
  const organizationJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: siteUrl,
    logo: {
      "@type": "ImageObject",
      url: absoluteLogoUrl,
      width: 1024,
      height: 1024,
    },
    image: {
      "@type": "ImageObject",
      url: absoluteOgImageUrl,
      width: 1672,
      height: 941,
    },
    description: DEFAULT_DESCRIPTION,
  };

  return (
    <html lang="ja">
      <body className="site-shell min-h-screen overflow-x-hidden text-zinc-100 antialiased">
        <JsonLd data={websiteJsonLd} />
        <JsonLd data={organizationJsonLd} />
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

            <nav className="hidden items-center gap-1 bg-zinc-900 p-1 text-sm text-zinc-300 md:flex">
              <Link href="/songs" className="rounded-sm px-3 py-1.5 hover:bg-white hover:text-black">
                曲
              </Link>
              <Link href="/lives" className="rounded-sm px-3 py-1.5 hover:bg-white hover:text-black">
                ライブ
              </Link>
              <Link href="/wiki" className="rounded-sm px-3 py-1.5 hover:bg-white hover:text-black">
                Wiki
              </Link>
              <Link href="/portal" className="rounded-sm px-3 py-1.5 hover:bg-white hover:text-black">
                ポータル
              </Link>
            </nav>

            <details className="group relative md:hidden">
              <summary
                aria-label="メニューを開く"
                className="grid size-10 cursor-pointer list-none place-items-center bg-zinc-900 ring-1 ring-white/10 marker:hidden"
              >
                <span className="flex flex-col gap-1.5">
                  <span className="block h-0.5 w-5 bg-white" />
                  <span className="block h-0.5 w-5 bg-white" />
                  <span className="block h-0.5 w-5 bg-white" />
                </span>
              </summary>

              <nav className="absolute right-0 top-12 z-50 grid min-w-44 gap-1 bg-black p-2 text-sm text-zinc-200 shadow-2xl shadow-black/50 ring-1 ring-white/10">
                <Link href="/songs" className="px-4 py-3 hover:bg-white hover:text-black">
                  曲
                </Link>
                <Link href="/lives" className="px-4 py-3 hover:bg-white hover:text-black">
                  ライブ
                </Link>
                <Link href="/wiki" className="px-4 py-3 hover:bg-white hover:text-black">
                  Wiki
                </Link>
                <Link href="/portal" className="px-4 py-3 hover:bg-white hover:text-black">
                  ポータル
                </Link>
              </nav>
            </details>
          </div>
        </header>

        <div className="mx-auto max-w-6xl px-4 py-10 md:py-14">{children}</div>

        <footer className="border-t border-white/10 bg-black/70">
          <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 md:flex-row md:items-end md:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold text-white">{SITE_NAME}</p>
              <p className="max-w-2xl text-sm leading-7 text-zinc-400">
                宵越しのアンサンブルのライブ情報、セトリ、コール、歌割、Wikiをまとめた非公式ファンコミュニティです。
              </p>
            </div>

            <nav className="flex flex-wrap gap-3 text-sm text-zinc-300">
              <Link href="/terms" className="rounded-sm px-3 py-2 hover:bg-white hover:text-black">
                利用規約
              </Link>
              <Link
                href="/privacy-policy"
                className="rounded-sm px-3 py-2 hover:bg-white hover:text-black"
              >
                プライバシーポリシー
              </Link>
            </nav>
          </div>
        </footer>
        <GoogleAnalytics />
        <ToastViewport />
      </body>
    </html>
  );
}
