import Link from "next/link";

function getVisiblePages(currentPage: number, totalPages: number) {
    const pages = new Set([1, totalPages]);

    for (let page = currentPage - 2; page <= currentPage + 2; page += 1) {
        if (page >= 1 && page <= totalPages) {
            pages.add(page);
        }
    }

    return Array.from(pages).sort((a, b) => a - b);
}

function createHref({
    basePath,
    query,
    page,
}: {
    basePath: string;
    query?: Record<string, string | null | undefined>;
    page?: number;
}) {
    const params = new URLSearchParams();

    for (const [key, value] of Object.entries(query ?? {})) {
        if (value) {
            params.set(key, value);
        }
    }

    if (page && page > 1) {
        params.set("page", String(page));
    }

    const search = params.toString();

    return search ? `${basePath}?${search}` : basePath;
}

export default function Pagination({
    basePath,
    currentPage,
    totalPages,
    query,
}: {
    basePath: string;
    currentPage: number;
    totalPages: number;
    query?: Record<string, string | null | undefined>;
}) {
    if (totalPages <= 1) {
        return null;
    }

    const pages = getVisiblePages(currentPage, totalPages);

    return (
        <nav
            aria-label="ページ"
            className="flex flex-wrap items-center justify-center gap-2"
        >
            <Link
                href={createHref({
                    basePath,
                    query,
                    page: Math.max(currentPage - 1, 1),
                })}
                aria-disabled={currentPage === 1}
                className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
                前へ
            </Link>

            {pages.map((page, index) => {
                const previousPage = pages[index - 1];
                const shouldShowGap =
                    previousPage !== undefined && page - previousPage > 1;

                return (
                    <div key={page} className="flex items-center gap-2">
                        {shouldShowGap && (
                            <span className="px-1 text-sm text-zinc-500">
                                ...
                            </span>
                        )}

                        <Link
                            href={createHref({
                                basePath,
                                query,
                                page,
                            })}
                            aria-current={
                                page === currentPage ? "page" : undefined
                            }
                            className="min-w-10 rounded-sm bg-zinc-900 px-3 py-2 text-center text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-current:bg-violet-500 aria-current:font-black aria-current:text-white"
                        >
                            {page}
                        </Link>
                    </div>
                );
            })}

            <Link
                href={createHref({
                    basePath,
                    query,
                    page: Math.min(currentPage + 1, totalPages),
                })}
                aria-disabled={currentPage === totalPages}
                className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-disabled:pointer-events-none aria-disabled:opacity-40"
            >
                次へ
            </Link>
        </nav>
    );
}
