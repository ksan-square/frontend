import type { Metadata } from "next";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import MixYellForm from "./mix-yell-form";
import {
  SITE_NAME,
  buildCanonicalPath,
  createMetadataBase,
  joinDescriptionParts,
} from "@/lib/seo";

const MIX_YELL_VOTE_URL = "https://yell.mixch.tv/contests/339/candidates/14917";

export const metadata: Metadata = {
  title: "ミクチャエール投票所",
  description: joinDescriptionParts([
    `${SITE_NAME}のミクチャエール投票所です。`,
    "LINEでログインして投票し、スクリーンショットを投稿できます。",
  ]),
  alternates: {
    canonical: buildCanonicalPath("/mix-yell"),
  },
  openGraph: {
    title: `ミクチャエール投票所 | ${SITE_NAME}`,
    description: joinDescriptionParts([
      `${SITE_NAME}のミクチャエール投票所です。`,
      "LINEでログインして投票し、スクリーンショットを投稿できます。",
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
        <h1 className="text-4xl font-black text-white md:text-5xl">
          ミクチャエール投票所
        </h1>
        <p className="max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
          ミクチャエールで投票したら、完了画面をスクリーンショットしてここに投稿してください。
          投稿された画像をもとに投票状況を確認します。
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-[1.1fr_0.9fr]">
        <div className="surface-subtle p-5">
          <h2 className="text-lg font-black text-white">投票の流れ</h2>
          <ol className="mt-4 grid gap-3">
            {[
              "ミクチャエールのページを開く",
              "LINEでログインして投票する",
              "投票完了画面をスクショする",
              "このページに名前または画像を投稿する",
            ].map((step, index) => (
              <li key={step} className="flex gap-3 bg-black p-3 ring-1 ring-white/10">
                <span className="grid size-7 shrink-0 place-items-center rounded-sm bg-white text-sm font-black text-black">
                  {index + 1}
                </span>
                <span className="pt-1 text-sm font-semibold text-zinc-100">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <aside className="surface p-5 ring-1 ring-white/10">
          <p className="text-xs font-black uppercase text-fuchsia-300">Vote Link</p>
          <h2 className="mt-2 text-2xl font-black text-white">ミクチャエールへ</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            投票ページを開いて、LINEログイン後にエール投票を進めてください。
          </p>
          <a
            href={MIX_YELL_VOTE_URL}
            target="_blank"
            rel="noreferrer"
            className="mt-5 inline-flex w-fit rounded-md bg-white px-5 py-3 text-sm font-black text-black hover:bg-zinc-200"
          >
            投票ページを開く
          </a>
        </aside>
      </section>

      <MixYellForm />
    </main>
  );
}
