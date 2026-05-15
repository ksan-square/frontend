import Link from "next/link";
import Pagination from "@/app/_components/pagination";
import { supabase } from "@/lib/supabase";
import DeleteButton from "./delete-button";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
    month?: string | string[];
    page?: string | string[];
}>;

type Live = {
    id: string;
    live_date: string;
    same_day_order: number;
    event_name: string;
    memo: string | null;
    venues:
        | {
              name: string | null;
              area: string | null;
          }
        | {
              name: string | null;
              area: string | null;
          }[]
        | null;
};

type MonthIndexItem = {
    key: string;
    label: string;
    count: number;
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

function parseMonth(value: string | string[] | undefined) {
    const month = firstParam(value);

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
        return null;
    }

    return month;
}

function getNextMonth(month: string) {
    const [year, monthNumber] = month.split("-").map(Number);
    const date = new Date(Date.UTC(year, monthNumber, 1));

    return `${date.getUTCFullYear()}-${String(
        date.getUTCMonth() + 1,
    ).padStart(2, "0")}`;
}

function formatMonthLabel(month: string) {
    const [year, monthNumber] = month.split("-");

    return `${year}年${Number(monthNumber)}月`;
}

function getMonthKey(date: string) {
    return date.slice(0, 7);
}

function getWeekKey(date: string) {
    const day = new Date(`${date}T00:00:00`);
    const year = day.getFullYear();
    const month = day.getMonth();
    const dayOfMonth = day.getDate();
    const weekOfMonth = Math.floor((dayOfMonth - 1) / 7) + 1;

    return `${year}-${String(month + 1).padStart(2, "0")}-w${weekOfMonth}`;
}

function formatWeekLabel(date: string) {
    const day = new Date(`${date}T00:00:00`);
    const weekOfMonth = Math.floor((day.getDate() - 1) / 7) + 1;

    return `${day.getMonth() + 1}月 第${weekOfMonth}週`;
}

function buildMonthIndex(liveDates: { live_date: string | null }[]) {
    const counts = new Map<string, number>();

    for (const live of liveDates) {
        if (!live.live_date) {
            continue;
        }

        const month = getMonthKey(live.live_date);
        counts.set(month, (counts.get(month) ?? 0) + 1);
    }

    return Array.from(counts.entries()).map<MonthIndexItem>(
        ([key, count]) => ({
            key,
            label: formatMonthLabel(key),
            count,
        }),
    );
}

function createLivesHref({
    month,
    page,
}: {
    month?: string | null;
    page?: number;
}) {
    const params = new URLSearchParams();

    if (month) {
        params.set("month", month);
    }

    if (page && page > 1) {
        params.set("page", String(page));
    }

    const query = params.toString();

    return query ? `/admin/lives?${query}` : "/admin/lives";
}

export default async function AdminLivesPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const selectedMonth = parseMonth(params.month);
    const requestedPage = parsePage(params.page);

    const { data: liveDates, error: liveDatesError } = await supabase
        .from("lives")
        .select("live_date")
        .order("live_date", { ascending: false });

    if (liveDatesError) {
        return <main>取得失敗: {liveDatesError.message}</main>;
    }

    const monthIndex = buildMonthIndex(liveDates ?? []);
    const monthStart = selectedMonth ? `${selectedMonth}-01` : null;
    const monthEnd = selectedMonth ? `${getNextMonth(selectedMonth)}-01` : null;

    let livesQuery = supabase
        .from("lives")
        .select(`
            id,
            live_date,
            same_day_order,
            event_name,
            memo,
            venues (
                name,
                area
            )
        `, { count: "exact" })
        .order("live_date", { ascending: false })
        .order("same_day_order", { ascending: true });

    if (monthStart && monthEnd) {
        livesQuery = livesQuery
            .gte("live_date", monthStart)
            .lt("live_date", monthEnd);
    }

    const totalLives =
        selectedMonth && monthIndex.find((month) => month.key === selectedMonth)
            ? monthIndex.find((month) => month.key === selectedMonth)?.count ?? 0
            : liveDates?.length ?? 0;
    const totalPages = Math.max(Math.ceil(totalLives / PAGE_SIZE), 1);
    const currentPage = Math.min(requestedPage, totalPages);
    const rangeStart = (currentPage - 1) * PAGE_SIZE;
    const rangeEnd = rangeStart + PAGE_SIZE - 1;

    const { data: lives, error } = await livesQuery.range(rangeStart, rangeEnd);

    if (error) {
        return <main>{error.message}</main>;
    }

    const typedLives = (lives ?? []) as Live[];
    let previousMonth: string | null = null;
    let previousWeek: string | null = null;

    return (
        <main className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">
                    ライブ管理
                </h1>

                <Link
                    href="/admin/lives/new"
                    className="rounded-full bg-pink-500 px-4 py-2"
                >
                    新規追加
                </Link>
            </div>

            <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div className="flex flex-wrap items-center gap-2">
                    <Link
                        href="/admin/lives"
                        aria-current={!selectedMonth ? "page" : undefined}
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm aria-current:bg-pink-500 aria-current:font-bold"
                    >
                        すべて
                    </Link>

                    {monthIndex.map((month) => (
                        <Link
                            key={month.key}
                            href={createLivesHref({ month: month.key })}
                            aria-current={
                                selectedMonth === month.key
                                    ? "page"
                                    : undefined
                            }
                            className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm aria-current:bg-pink-500 aria-current:font-bold"
                        >
                            {month.label}
                            <span className="ml-1 text-xs text-zinc-300">
                                {month.count}
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
                <p>
                    {totalLives}件中 {totalLives === 0 ? 0 : rangeStart + 1}-
                    {Math.min(rangeEnd + 1, totalLives)}件を表示
                </p>

                {selectedMonth && (
                    <Link
                        href="/admin/lives"
                        className="rounded-full bg-zinc-800 px-3 py-1.5 text-zinc-100"
                    >
                        月選択を解除
                    </Link>
                )}
            </div>

            <section className="space-y-3">
                {typedLives.map((live) => {
                    const venue = Array.isArray(live.venues)
                        ? live.venues[0]
                        : live.venues;
                    const month = getMonthKey(live.live_date);
                    const week = getWeekKey(live.live_date);
                    const shouldShowMonth = month !== previousMonth;
                    const shouldShowWeek = week !== previousWeek;

                    previousMonth = month;
                    previousWeek = week;

                    return (
                        <div key={live.id} className="space-y-3">
                            {shouldShowMonth && (
                                <h2 className="pt-4 text-2xl font-bold">
                                    {formatMonthLabel(month)}
                                </h2>
                            )}

                            {shouldShowWeek && (
                                <p className="border-l-4 border-pink-500 pl-3 text-sm font-bold text-pink-200">
                                    {formatWeekLabel(live.live_date)}
                                </p>
                            )}

                            <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                                <div className="flex flex-wrap justify-between gap-4">
                                    <div>
                                        <p className="text-pink-300">
                                            {live.live_date}
                                        </p>

                                        <h3 className="text-xl font-bold">
                                            {live.event_name}
                                        </h3>

                                        <p className="text-zinc-400">
                                            {venue?.name}
                                            {venue?.area &&
                                                ` / ${venue.area}`}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <Link
                                            href={`/admin/lives/${live.id}/edit`}
                                            className="rounded-full bg-zinc-800 px-4 py-2"
                                        >
                                            編集
                                        </Link>

                                        <DeleteButton id={live.id} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {typedLives.length === 0 && (
                    <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
                        ライブが登録されていません。
                    </p>
                )}
            </section>

            <Pagination
                basePath="/admin/lives"
                currentPage={currentPage}
                totalPages={totalPages}
                query={{ month: selectedMonth }}
            />
        </main>
    );
}
