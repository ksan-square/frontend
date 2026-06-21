import type { Metadata } from "next";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import MixYellForm from "./mix-yell-form";
import {
  SITE_NAME,
  buildCanonicalPath,
  createMetadataBase,
  joinDescriptionParts,
} from "@/lib/seo";

export const metadata: Metadata = {
  title: "Mix Yell",
  description: joinDescriptionParts([
    `${SITE_NAME}のMix Yell投稿ページです。`,
    "日付、画像（任意）、名前（任意）を登録できます。",
  ]),
  alternates: {
    canonical: buildCanonicalPath("/mix-yell"),
  },
  openGraph: {
    title: `Mix Yell | ${SITE_NAME}`,
    description: joinDescriptionParts([
      `${SITE_NAME}のMix Yell投稿ページです。`,
      "日付、画像（任意）、名前（任意）を登録できます。",
    ]),
    url: new URL("/mix-yell", createMetadataBase()).toString(),
  },
};

export default function MixYellPage() {
  return (
    <main className="space-y-8">
      <Breadcrumbs items={[{ label: "Mix Yell" }]} />

      <section className="space-y-4">
        <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
          Mix Yell
        </p>
        <h1 className="text-4xl font-black text-white md:text-5xl">Mix Yell</h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
          日付を選択し、画像投稿と名前のどちらかを入力して送信できます。
        </p>
      </section>

      <MixYellForm />
    </main>
  );
}
