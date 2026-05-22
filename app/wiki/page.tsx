import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
import { formatDateJa } from "@/lib/date-time";
import { createPathWithQuery, firstParam, getPaginationRange, parsePageParam } from "@/lib/page-utils";
import { getPublicWikiPages } from "@/lib/public-api";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export const metadata: Metadata = {
    title: "Wiki",
    description:
        "現場メモや共有情報をブログ形式で読める Wiki 一覧ページです。",
    alternates: {
        canonical: "/wiki",
    },
};

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
    page?: string | string[];
    sort?: string | string[];
    direction?: string | string[];
}>;

type WikiPage = {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
};

type SortKey = "updated_at" | "created_at";
type SortDirection = "desc" | "asc";

function parseSort(value: string | string[] | undefined): SortKey {
    const sort = firstParam(value);

    return sort === "created_at" ? "created_at" : "updated_at";
}

function parseDirection(value: string | string[] | undefined): SortDirection {
    const direction = firstParam(value);

    return direction === "asc" ? "asc" : "desc";
}

function createWikiHref({
    sort,
    direction,
}: {
    sort: SortKey;
    direction: SortDirection;
}) {
    return createPathWithQuery("/wiki", {
        sort: sort === "updated_at" ? null : sort,
        direction: direction === "desc" ? null : direction,
    });
}

export default async function WikiIndexPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const requestedPage = parsePageParam(params.page);
    const sort = parseSort(params.sort);
    const direction = parseDirection(params.direction);
    const authClient = await createSupabaseServerClient();
    const {
        data: { user },
    } = await authClient.auth.getUser();
    let payload;
    try {
        payload = await getPublicWikiPages({
            page: requestedPage,
            sort,
            direction,
        });
    } catch (error) {
        return (
            <main>
                Wikiの取得に失敗しました:{" "}
                {error instanceof Error ? error.message : "unknown error"}
            </main>
        );
    }

    const wikiPages = payload.items as WikiPage[];
    const totalItems = payload.pagination.total_items;
    const currentPage = payload.pagination.page;
    const resolvedTotalPages = payload.pagination.total_pages;
    const { displayStart, displayEnd } = getPaginationRange({
        currentPage,
        pageSize: payload.pagination.page_size,
        totalItems,
    });

    return (
        <main className="space-y-10">
            <Breadcrumbs items={[{ label: "Wiki" }]} />

            <section className="relative flex flex-wrap items-center justify-between gap-4 overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />
                <div>
                    <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">Wiki</p>
                    <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">Wiki</h1>
                    <p className="mt-3 text-sm leading-7 text-zinc-300 md:text-base">
                        共有したい情報をブログ形式で。
                    </p>
                </div>

                {user && (
                    <Link
                        href="/wiki/new"
                        className="rounded-md bg-violet-500 px-4 py-2 font-black text-white hover:bg-violet-400"
                    >
                        新規作成
                    </Link>
                )}
            </section>

            <section className="surface-subtle flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={createWikiHref({
                            sort: "updated_at",
                            direction,
                        })}
                        aria-current={sort === "updated_at" ? "page" : undefined}
                        className="rounded-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-current:bg-violet-500 aria-current:font-black aria-current:text-white"
                    >
                        更新日順
                    </Link>

                    <Link
                        href={createWikiHref({
                            sort: "created_at",
                            direction,
                        })}
                        aria-current={sort === "created_at" ? "page" : undefined}
                        className="rounded-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-current:bg-violet-500 aria-current:font-black aria-current:text-white"
                    >
                        作成日順
                    </Link>

                    <Link
                        href={createWikiHref({
                            sort,
                            direction: direction === "desc" ? "asc" : "desc",
                        })}
                        className="rounded-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black"
                    >
                        {direction === "desc" ? "新しい順" : "古い順"}
                    </Link>
                </div>

                <p className="text-sm text-zinc-400">
                    {totalItems}件中 {displayStart}-{displayEnd}件を表示
                </p>
            </section>

            <section className="grid gap-4">
                {wikiPages.length === 0 && (
                    <div className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                        Wikiページはまだありません。
                    </div>
                )}

                {wikiPages.map((page) => (
                    <Link
                        key={page.id}
                        href={`/wiki/${page.slug}`}
                        className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-black text-white group-hover:text-black">{page.title}</h2>

                            {!page.is_published && (
                                <span className="rounded-sm bg-violet-500/15 px-2 py-1 text-xs font-bold text-fuchsia-200 ring-1 ring-violet-300/20">
                                    下書き
                                </span>
                            )}
                        </div>

                        <p className="mt-2 text-sm text-zinc-400 group-hover:text-zinc-700">
                            作成: {formatDateJa(page.created_at)} / 最終更新:{" "}
                            {formatDateJa(page.updated_at)}
                        </p>
                    </Link>
                ))}
            </section>

            <Pagination
                basePath="/wiki"
                currentPage={currentPage}
                totalPages={resolvedTotalPages}
                query={{
                    sort: sort === "updated_at" ? null : sort,
                    direction: direction === "desc" ? null : direction,
                }}
            />
        </main>
    );
}
