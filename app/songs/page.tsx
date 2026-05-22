import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
import { createPathWithQuery, getPaginationRange, parsePageParam, parseTrimmedParam } from "@/lib/page-utils";
import { getPublicSongs } from "@/lib/public-api";

export const metadata: Metadata = {
    title: "曲一覧",
    description:
        "宵越しのアンサンブル楽曲のコール・歌割・歌詞構成を掲載。ライブで使えるコール案やメンバー歌割を曲ごとに確認できます。",
    alternates: {
        canonical: "/songs",
    },
};

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
    initial?: string | string[];
    page?: string | string[];
}>;

function createSongsHref(initial?: string | null) {
    return createPathWithQuery("/songs", { initial });
}

export default async function SongsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const requestedInitial = parseTrimmedParam(params.initial);
    const requestedPage = parsePageParam(params.page);
    const response = await getPublicSongs({
        initial: requestedInitial,
        page: requestedPage,
    }).catch((error) => ({
        error: error instanceof Error ? error.message : "unknown error",
    }));

    if ("error" in response) {
        return <main>曲一覧の取得に失敗しました: {response.error}</main>;
    }

        const songs = response.items;
        const songIndex = response.index;
        const totalSongs = response.pagination.total_items;
        const totalPages = response.pagination.total_pages;
        const currentPage = response.pagination.page;
        const { displayStart, displayEnd } = getPaginationRange({
            currentPage,
            pageSize: PAGE_SIZE,
            totalItems: totalSongs,
        });
        const selectedInitial =
            requestedInitial &&
            songIndex.some((item) => item.key === requestedInitial)
                ? requestedInitial
                : null;

        return (
            <main className="space-y-10">
                <Breadcrumbs items={[{ label: "曲一覧" }]} />

                <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                    <div className="editorial-rule absolute inset-x-0 top-0 h-1" />
                    <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">Songs</p>
                    <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">曲一覧</h1>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                        歌割・コール・作詞作曲情報を確認できます。
                    </p>
                </section>

                <section className="surface-subtle p-4">
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/songs"
                            aria-current={!selectedInitial ? "page" : undefined}
                            className="rounded-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-current:bg-violet-500 aria-current:font-black aria-current:text-white"
                        >
                            すべて
                        </Link>

                        {songIndex.map((item) => (
                            <Link
                                key={item.key}
                                href={createSongsHref(item.key)}
                                aria-current={
                                    selectedInitial === item.key
                                        ? "page"
                                        : undefined
                                }
                                className="rounded-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-current:bg-violet-500 aria-current:font-black aria-current:text-white"
                            >
                                {item.key}
                                <span className="ml-1 text-xs text-zinc-400 aria-current:text-violet-100">
                                    {item.count}
                                </span>
                            </Link>
                        ))}
                    </div>
                </section>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
                    <p>
                        {totalSongs}曲中 {displayStart}-{displayEnd}曲を表示
                    </p>

                    {selectedInitial && (
                        <Link
                            href="/songs"
                            className="rounded-sm bg-zinc-900 px-3 py-1.5 text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black"
                        >
                            頭文字選択を解除
                        </Link>
                    )}
                </div>

                <section className="grid gap-4">
                    {songs.length === 0 && (
                        <div className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                            曲が登録されていません。
                        </div>
                    )}

                    {songs.map((song) => (
                        <Link
                            key={song.id}
                            href={`/songs/${song.slug}`}
                            className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                        >
                            <h2 className="text-xl font-black text-white group-hover:text-black">
                                {song.title}
                            </h2>

                            {song.description && (
                                <p className="mt-2 text-sm leading-6 text-zinc-400 group-hover:text-zinc-700">{song.description}</p>
                            )}

                            <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold text-zinc-500 group-hover:text-zinc-600">
                                {song.lyricist && <span>作詞: {song.lyricist}</span>}
                                {song.composer && <span>作曲: {song.composer}</span>}
                                {song.arranger && <span>編曲: {song.arranger}</span>}
                            </div>
                        </Link>
                    ))}
                </section>

                <Pagination
                    basePath="/songs"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    query={{ initial: selectedInitial }}
                />
            </main>
        );
}
