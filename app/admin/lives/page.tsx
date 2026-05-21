import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
import DeleteButton from "./delete-button";
import { getAdminLives, type AdminLiveSummary } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PAGE_SIZE = 20;

function formatTime(time: string | null) {
    return time ? time.slice(0, 5) : null;
}

type SearchParams = Promise<{
    month?: string | string[];
    page?: string | string[];
}>;

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

function getVenueText(live: AdminLiveSummary) {
    const venue = live.venue;
    return `${venue?.name ?? "会場未登録"}${venue?.area ? ` / ${venue.area}` : ""}`;
}

function getBenefitVenueText(live: AdminLiveSummary) {
    const benefitVenue = live.benefit_venue ?? live.venue;
    return `${benefitVenue?.name ?? "会場未定"}${benefitVenue?.area ? ` / ${benefitVenue.area}` : ""}`;
}

export default async function AdminLivesPage({
    searchParams,
}: {
    searchParams: SearchParams;
}) {
    const params = await searchParams;
    const selectedMonth = parseMonth(params.month);
    const requestedPage = parsePage(params.page);

    let payload;
    try {
        payload = await getAdminLives({
            month: selectedMonth,
            page: requestedPage,
        });
    } catch (error) {
        return <main>取得失敗: {error instanceof Error ? error.message : "unknown error"}</main>;
    }

    const monthIndex = payload.month_index;
    const totalLives = payload.pagination.total_items;
    const totalPages = payload.pagination.total_pages;
    const currentPage = payload.pagination.page;
    const rangeStart = (currentPage - 1) * PAGE_SIZE;
    const rangeEnd = rangeStart + PAGE_SIZE - 1;
    const upcomingLives = payload.upcoming_items;
    const typedLives = payload.history_items;

    return (
        <main className="space-y-6">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "ライブ管理" },
                ]}
            />

            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-3xl font-bold">ライブ管理</h1>

                <Link href="/admin/lives/new" className="rounded-full bg-pink-500 px-4 py-2">
                    新規追加
                </Link>
            </div>

            <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div>
                    <h2 className="text-xl font-bold">今後のライブ予定</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        予定だけ先に作って、セトリは編集画面からあとで追加できます。
                    </p>
                </div>

                {upcomingLives.length === 0 && (
                    <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
                        今後のライブ予定はまだありません。
                    </p>
                )}

                {upcomingLives.map((live) => {
                    const liveTimeText = live.live_start_time
                        ? live.live_end_time
                            ? `${formatTime(live.live_start_time)}-${formatTime(live.live_end_time)}`
                            : `${formatTime(live.live_start_time)} 開演`
                        : "時間未定";

                    return (
                        <div
                            key={live.id}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-pink-300">
                                        {live.live_date} / {liveTimeText}
                                    </p>

                                    <h3 className="mt-2 text-xl font-bold">{live.event_name}</h3>

                                    <p className="mt-2 text-sm text-zinc-400">
                                        ライブ会場: {getVenueText(live)}
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-400">
                                        特典会会場: {getBenefitVenueText(live)}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/lives/${live.id}/edit`}
                                        className="rounded-full bg-zinc-800 px-4 py-2 text-sm"
                                    >
                                        編集
                                    </Link>

                                    <DeleteButton id={live.id} />
                                </div>
                            </div>
                        </div>
                    );
                })}
            </section>

            <section className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h2 className="text-2xl font-bold">過去ライブ履歴</h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            月単位に絞り込みできます。
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
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
                            aria-current={selectedMonth === month.key ? "page" : undefined}
                            className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm aria-current:bg-pink-500 aria-current:font-bold"
                        >
                            {month.label}
                            <span className="ml-1 text-xs text-zinc-300">{month.count}</span>
                        </Link>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
                    <p>
                        {totalLives}件中 {totalLives === 0 ? 0 : rangeStart + 1}-
                        {Math.min(rangeEnd + 1, totalLives)}件を表示
                    </p>

                    {selectedMonth && (
                        <Link href="/admin/lives" className="rounded-full bg-zinc-800 px-3 py-1.5 text-zinc-100">
                            月選択を解除
                        </Link>
                    )}
                </div>

                <div className="space-y-4">
                    {typedLives.length === 0 && (
                        <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
                            ライブ履歴はまだありません。
                        </p>
                    )}

                    {typedLives.map((live, index) => {
                        const month = getMonthKey(live.live_date);
                        const week = getWeekKey(live.live_date);
                        const previousLive = typedLives[index - 1];
                        const previousMonth = previousLive ? getMonthKey(previousLive.live_date) : null;
                        const previousWeek = previousLive ? getWeekKey(previousLive.live_date) : null;
                        const showMonth = month !== previousMonth;
                        const showWeek = week !== previousWeek;

                        return (
                            <div key={live.id} className="space-y-3">
                                {showMonth && (
                                    <div className="pt-2">
                                        <h3 className="text-lg font-bold text-pink-300">{month}</h3>
                                    </div>
                                )}

                                {showWeek && (
                                    <p className="text-sm font-semibold text-zinc-400">
                                        {formatWeekLabel(live.live_date)}
                                    </p>
                                )}

                                <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <p className="text-sm text-zinc-400">
                                                {live.live_date}
                                                {live.live_start_time &&
                                                    ` / ${formatTime(live.live_start_time)}`}
                                            </p>
                                            <h3 className="mt-2 text-xl font-bold">{live.event_name}</h3>
                                            <p className="mt-2 text-sm text-zinc-400">
                                                ライブ会場: {getVenueText(live)}
                                            </p>
                                            <p className="mt-1 text-sm text-zinc-400">
                                                特典会会場: {getBenefitVenueText(live)}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/lives/${live.id}/edit`}
                                                className="rounded-full bg-zinc-800 px-4 py-2 text-sm"
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
                </div>

                <Pagination
                    basePath="/admin/lives"
                    currentPage={currentPage}
                    totalPages={totalPages}
                    query={{ month: selectedMonth }}
                />
            </section>
        </main>
    );
}
