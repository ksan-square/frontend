import Link from "next/link";
import Pagination from "@/app/_components/pagination";
import { supabase } from "@/lib/supabase";

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
        ? `/admin/songs?initial=${encodeURIComponent(initial)}`
        : "/admin/songs";
}

export default async function AdminSongsPage({
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
        .order("title");

    if (songIndexError) {
        return <main>取得失敗: {songIndexError.message}</main>;
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
        .select("id,title,slug,lyricist,composer,arranger")
        .order("title");

    if (pageSongIds) {
        songsQuery =
            pageSongIds.length > 0
                ? songsQuery.in("id", pageSongIds)
                : songsQuery.eq("id", "__no_song__");
    } else {
        songsQuery = songsQuery.range(rangeStart, rangeEnd);
    }

    const { data: songs, error } = await songsQuery;

    if (error) {
        return <main>取得失敗: {error.message}</main>;
    }

    return (
        <main className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">曲管理</h1>

                <Link
                    href="/admin/songs/new"
                    className="rounded-full bg-pink-500 px-4 py-2 font-bold"
                >
                    新規追加
                </Link>
            </div>

            <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/admin/songs"
                        aria-current={!selectedInitial ? "page" : undefined}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm aria-current:bg-pink-500 aria-current:font-bold"
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
                            className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm aria-current:bg-pink-500 aria-current:font-bold"
                        >
                            {item.key}
                            <span className="ml-1 text-xs text-zinc-300">
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
                        href="/admin/songs"
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-zinc-100"
                    >
                        頭文字選択を解除
                    </Link>
                )}
            </div>

            <section className="space-y-3">
                {songs?.length === 0 && (
                    <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
                        曲が登録されていません。
                    </p>
                )}

                {songs?.map((song) => (
                    <Link
                        key={song.id}
                        href={`/admin/songs/${song.id}/edit`}
                        className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-pink-400"
                    >
                        <h2 className="text-xl font-bold">{song.title}</h2>
                        <p className="mt-1 text-sm text-zinc-400">slug: {song.slug}</p>
                        <p className="mt-2 text-sm text-zinc-400">
                            作詞: {song.lyricist ?? "未登録"} / 作曲: {song.composer ?? "未登録"} / 編曲: {song.arranger ?? "未登録"}
                        </p>
                    </Link>
                ))}
            </section>

            <Pagination
                basePath="/admin/songs"
                currentPage={currentPage}
                totalPages={totalPages}
                query={{ initial: selectedInitial }}
            />
        </main>
    );
}
