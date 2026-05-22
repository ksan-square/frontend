import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
import { createPathWithQuery, getPaginationRange, parsePageParam, parseTrimmedParam } from "@/lib/page-utils";
import { getAdminSongs } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
    initial?: string | string[];
    page?: string | string[];
}>;

function createSongsHref(initial?: string | null) {
    return createPathWithQuery("/admin/songs", { initial });
}

export default async function AdminSongsPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const requestedInitial = parseTrimmedParam(params.initial);
    const requestedPage = parsePageParam(params.page);

    let payload;
    try {
        payload = await getAdminSongs({
            initial: requestedInitial,
            page: requestedPage,
        });
    } catch (error) {
        return (
            <main>
                取得失敗: {error instanceof Error ? error.message : "unknown error"}
            </main>
        );
    }

    const songIndex = payload.index;
    const songs = payload.items;
    const totalSongs = payload.pagination.total_items;
    const totalPages = payload.pagination.total_pages;
    const currentPage = payload.pagination.page;
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
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "曲管理" },
                ]}
            />

            <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />

                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                            Admin / Songs
                        </p>
                        <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
                            曲管理
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                            曲情報、説明文、歌詞ページの元データを更新します。
                        </p>
                    </div>

                    <Link
                        href="/admin/songs/new"
                        className="w-fit rounded-md bg-violet-500 px-5 py-3 text-sm font-black text-white hover:bg-violet-400"
                    >
                        新規追加
                    </Link>
                </div>
            </section>

            <section className="surface-subtle p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/admin/songs"
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
                            <span className="ml-1 text-xs text-zinc-400">
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
                            href="/admin/songs"
                            className="rounded-sm bg-zinc-900 px-3 py-1.5 text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black"
                        >
                            頭文字選択を解除
                        </Link>
                    )}
                </div>

            <section className="grid gap-4">
                {songs.length === 0 && (
                    <p className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                        曲が登録されていません。
                    </p>
                )}

                {songs.map((song) => (
                    <Link
                        key={song.id}
                        href={`/admin/songs/${song.id}/edit`}
                        className="group block bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                    >
                        <h2 className="text-xl font-black text-white group-hover:text-black">{song.title}</h2>
                        <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">slug: {song.slug}</p>
                        <p className="mt-2 text-sm text-zinc-400 group-hover:text-zinc-700">
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
