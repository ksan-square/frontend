import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
import { supabase } from "@/lib/supabase";
import type { Song } from "@/types";

export const metadata: Metadata = {
    title: "曲一覧",
    description:
        "歌詞、コール、作詞作曲情報を探せる曲一覧ページです。",
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

type SongIndexItem = {
    key: string;
    count: number;
};

type SongIndexRow = {
    id: string;
    title: string | null;
};

function firstParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

function parsePage(value: string | string[] | undefined) {
    const page = Number(firstParam(value));

    if (!Number.isInteger(page) || page < 1) {
        return 1;
    }

    return page;
}

function parseInitial(value: string | string[] | undefined) {
    const initial = firstParam(value)?.trim();

    if (!initial) {
        return null;
    }

    return Array.from(initial)[0] ?? null;
}

function getInitial(title: string | null) {
    const normalizedTitle = title?.trim();

    if (!normalizedTitle) {
        return "#";
    }

    return Array.from(normalizedTitle)[0].toUpperCase();
}

function buildSongIndex(songs: SongIndexRow[]) {
    const counts = new Map<string, number>();

    for (const song of songs) {
        const initial = getInitial(song.title);
        counts.set(initial, (counts.get(initial) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map<SongIndexItem>(
        ([key, count]) => ({
            key,
            count,
        }),
    );
}

function createSongsHref(initial?: string | null) {
    return initial
        ? `/songs?initial=${encodeURIComponent(initial)}`
        : "/songs";
}

export default async function SongsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const requestedInitial = parseInitial(params.initial);
    const requestedPage = parsePage(params.page);

    const { data: songIndexRows, error: songIndexError } = await supabase
        .from("songs")
        .select("id,title")
        .eq("is_delete", false)
        .order("order_no", { ascending: true });

    if (songIndexError) {
        return <main>曲一覧の取得に失敗しました: {songIndexError.message}</main>;
    }

    const songIndex = buildSongIndex(songIndexRows ?? []);
    const selectedInitial =
        requestedInitial &&
        songIndex.some((item) => item.key === requestedInitial)
            ? requestedInitial
            : null;
    const selectedSongIds = selectedInitial
        ? (songIndexRows ?? [])
              .filter((song) => getInitial(song.title) === selectedInitial)
              .map((song) => song.id)
        : null;
    const totalSongs = selectedSongIds?.length ?? songIndexRows?.length ?? 0;
    const totalPages = Math.max(Math.ceil(totalSongs / PAGE_SIZE), 1);
    const currentPage = Math.min(requestedPage, totalPages);
    const rangeStart = (currentPage - 1) * PAGE_SIZE;
    const rangeEnd = rangeStart + PAGE_SIZE - 1;
    const pageSongIds = selectedSongIds?.slice(rangeStart, rangeEnd + 1);

    let songsQuery = supabase
        .from("songs")
        .select("id,title,slug,order_no,description,release_date,lyricist,composer,arranger")
        .eq("is_delete", false)
        .order("order_no", { ascending: true });

    if (pageSongIds) {
        songsQuery =
            pageSongIds.length > 0
                ? songsQuery.in("id", pageSongIds)
                : songsQuery.eq("id", "__no_song__");
    } else {
        songsQuery = songsQuery.range(rangeStart, rangeEnd);
    }

    const { data, error } = await songsQuery;

    if (error) {
        return <main>曲一覧の取得に失敗しました: {error.message}</main>;
    }

    const songs = (data ?? []) as Song[];

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
                    {totalSongs}曲中 {totalSongs === 0 ? 0 : rangeStart + 1}-
                    {Math.min(rangeEnd + 1, totalSongs)}曲を表示
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
