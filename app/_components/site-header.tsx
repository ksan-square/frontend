"use client";

import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { SITE_NAME, SITE_LOGO_PATH } from "@/lib/seo";

const NAV_ITEMS = [
  { href: "/songs", label: "曲" },
  { href: "/lives", label: "ライブ" },
  { href: "/wiki", label: "Wiki" },
  { href: "/mix-yell", label: "Mix Yell" },
  { href: "/portal", label: "ポータル" },
] as const;

export function SiteHeader() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null;
      if (!rootRef.current || !target) {
        return;
      }

      if (!rootRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isMenuOpen]);

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/92 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="group flex items-center gap-3">
          <Image
            src={SITE_LOGO_PATH}
            alt=""
            width={40}
            height={40}
            className="size-10 rounded-md bg-white object-contain"
            priority
          />
          <span className="text-base font-black text-white md:text-lg">
            {SITE_NAME}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 bg-zinc-900 p-1 text-sm text-zinc-300 md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-sm px-3 py-1.5 hover:bg-white hover:text-black"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div
          ref={rootRef}
          className="relative md:hidden"
        >
          <button
            type="button"
            aria-label="メニューを開く"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            className="grid size-10 cursor-pointer place-items-center bg-zinc-900 ring-1 ring-white/10"
            onClick={() => setIsMenuOpen((prev) => !prev)}
          >
            <span className="flex flex-col gap-1.5">
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
              <span className="block h-0.5 w-5 bg-white" />
            </span>
          </button>

          {isMenuOpen ? (
            <nav
              id="mobile-menu"
              className="absolute right-0 top-12 z-50 grid min-w-44 gap-1 bg-black p-2 text-sm text-zinc-200 shadow-2xl shadow-black/50 ring-1 ring-white/10"
              aria-hidden={!isMenuOpen}
            >
              {NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="px-4 py-3 hover:bg-white hover:text-black"
                  onClick={closeMenu}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          ) : null}
        </div>
      </div>
    </header>
  );
}
