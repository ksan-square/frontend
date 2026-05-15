import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "こしあんスクエア",
  description: "コール・歌割・セトリDB",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-zinc-950 text-zinc-100">
        <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
          <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4">
            <Link href="/" className="text-lg font-bold tracking-wide">
              こしあんスクエア
            </Link>

            <nav className="flex gap-4 text-sm text-zinc-300">
              <Link href="/songs" className="hover:text-white">
                曲
              </Link>
              <Link href="/lives" className="hover:text-white">
                ライブ
              </Link>
              <Link href="/wiki" className="hover:text-white">
                Wiki
              </Link>
              <Link href="/admin" className="hover:text-white">
                管理画面
              </Link>
            </nav>
          </div>
        </header>

        <div className="mx-auto max-w-5xl px-4 py-8">{children}</div>
      </body>
    </html>
  );
}
