import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
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

const PAGE_SIZE = 20;

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
    const params = new URLSearchParams();

    if (sort !== "updated_at") {
        params.set("sort", sort);
    }

    if (direction !== "desc") {
        params.set("direction", direction);
    }

    const search = params.toString();

    return search ? `/wiki?${search}` : "/wiki";
}

function formatDate(date: string) {
    return new Date(date).toLocaleDateString("ja-JP");
}

export default async function WikiIndexPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const requestedPage = parsePage(params.page);
    const sort = parseSort(params.sort);
    const direction = parseDirection(params.direction);
    const authClient = await createSupabaseServerClient();
    const {
        data: { user },
    } = await authClient.auth.getUser();

    let countQuery = authClient
        .from("wiki_pages")
        .select("id", {
            count: "exact",
            head: true,
        })
        .eq("is_delete", false);

    if (!user) {
        countQuery = countQuery.eq("is_published", true);
    }

    const { count, error: countError } = await countQuery;

    if (countError) {
        return <main>Wikiの取得に失敗しました: {countError.message}</main>;
    }

    const totalItems = count ?? 0;
    const resolvedTotalPages = Math.max(Math.ceil(totalItems / PAGE_SIZE), 1);
    const currentPage = Math.min(requestedPage, resolvedTotalPages);
    const rangeStart = (currentPage - 1) * PAGE_SIZE;
    const rangeEnd = rangeStart + PAGE_SIZE - 1;

    let query = authClient
        .from("wiki_pages")
        .select("id,title,slug,is_published,created_at,updated_at")
        .eq("is_delete", false)
        .order(sort, { ascending: direction === "asc" });

    if (!user) {
        query = query.eq("is_published", true);
    }

    const { data: pages, error } = await query.range(rangeStart, rangeEnd);

    if (error) {
        return <main>Wikiの取得に失敗しました: {error.message}</main>;
    }

    const wikiPages = (pages ?? []) as WikiPage[];

    return (
        <main className="space-y-8">
            <Breadcrumbs items={[{ label: "Wiki" }]} />

            <section className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-pink-300">Wiki</p>
                    <h1 className="mt-2 text-3xl font-bold">Wiki</h1>
                    <p className="mt-3 text-zinc-400">
                        共有したい情報をブログ形式で。
                    </p>
                </div>

                {user && (
                    <Link
                        href="/wiki/new"
                        className="rounded-full bg-pink-500 px-4 py-2 font-bold"
                    >
                        新規作成
                    </Link>
                )}
            </section>

            <section className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-wrap gap-2">
                    <Link
                        href={createWikiHref({
                            sort: "updated_at",
                            direction,
                        })}
                        aria-current={sort === "updated_at" ? "page" : undefined}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm aria-current:bg-pink-500 aria-current:font-bold"
                    >
                        更新日順
                    </Link>

                    <Link
                        href={createWikiHref({
                            sort: "created_at",
                            direction,
                        })}
                        aria-current={sort === "created_at" ? "page" : undefined}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm aria-current:bg-pink-500 aria-current:font-bold"
                    >
                        作成日順
                    </Link>

                    <Link
                        href={createWikiHref({
                            sort,
                            direction: direction === "desc" ? "asc" : "desc",
                        })}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                    >
                        {direction === "desc" ? "新しい順" : "古い順"}
                    </Link>
                </div>

                <p className="text-sm text-zinc-400">
                    {totalItems}件中 {totalItems === 0 ? 0 : rangeStart + 1}-
                    {Math.min(rangeEnd + 1, totalItems)}件を表示
                </p>
            </section>

            <section className="grid gap-4">
                {wikiPages.length === 0 && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
                        Wikiページはまだありません。
                    </div>
                )}

                {wikiPages.map((page) => (
                    <Link
                        key={page.id}
                        href={`/wiki/${page.slug}`}
                        className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-pink-400/60"
                    >
                        <div className="flex flex-wrap items-center gap-2">
                            <h2 className="text-xl font-bold">{page.title}</h2>

                            {!page.is_published && (
                                <span className="rounded-full bg-zinc-800 px-2 py-1 text-xs text-zinc-300">
                                    下書き
                                </span>
                            )}
                        </div>

                        <p className="mt-2 text-sm text-zinc-400">
                            作成: {formatDate(page.created_at)} / 最終更新:{" "}
                            {formatDate(page.updated_at)}
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
