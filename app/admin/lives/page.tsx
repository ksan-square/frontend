import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
import DeleteButton from "./delete-button";
import { formatTime, formatWeekLabel, getMonthKey, getWeekKey } from "@/lib/date-time";
import { createPathWithQuery, getPaginationRange, parseMonthParam, parsePageParam } from "@/lib/page-utils";
import { getAdminLives, type AdminLiveSummary } from "@/lib/admin-server-api";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

const PAGE_SIZE = 20;

type SearchParams = Promise<{
    month?: string | string[];
    page?: string | string[];
}>;

function createLivesHref({
    month,
    page,
}: {
    month?: string | null;
    page?: number;
}) {
    return createPathWithQuery("/admin/lives", {
        month,
        page: page && page > 1 ? page : null,
    });
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
    const selectedMonth = parseMonthParam(params.month);
    const requestedPage = parsePageParam(params.page);

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
    const { displayStart, displayEnd } = getPaginationRange({
        currentPage,
        pageSize: PAGE_SIZE,
        totalItems: totalLives,
    });
    const upcomingLives = payload.upcoming_items;
    const typedLives = payload.history_items;

    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "ライブ管理" },
                ]}
            />

            <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />

                <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                    <div>
                        <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                            Admin / Lives
                        </p>
                        <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">
                            ライブ管理
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
                            今後の予定と過去履歴を公開画面と同じ温度感で保ちます。
                        </p>
                    </div>

                    <Link href="/admin/lives/new" className="w-fit rounded-md bg-violet-500 px-5 py-3 text-sm font-black text-white hover:bg-violet-400">
                        新規追加
                    </Link>
                </div>
            </section>

            <section className="surface-subtle space-y-3 p-4">
                <div>
                    <h2 className="text-xl font-black text-white">今後のライブ予定</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        予定だけ先に作って、セトリは編集画面からあとで追加できます。
                    </p>
                </div>

                {upcomingLives.length === 0 && (
                    <p className="surface p-6 text-zinc-400 ring-1 ring-white/10">
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
                            className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                        >
                            <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-fuchsia-300 group-hover:text-violet-700">
                                        {live.live_date} / {liveTimeText}
                                    </p>

                                    <h3 className="mt-2 text-xl font-black text-white group-hover:text-black">{live.event_name}</h3>

                                    <p className="mt-2 text-sm text-zinc-400 group-hover:text-zinc-700">
                                        ライブ会場: {getVenueText(live)}
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">
                                        特典会会場: {getBenefitVenueText(live)}
                                    </p>
                                </div>

                                <div className="flex gap-2">
                                    <Link
                                        href={`/admin/lives/${live.id}/edit`}
                                        className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black"
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
                        <h2 className="text-2xl font-black text-white">過去ライブ履歴</h2>
                        <p className="mt-2 text-sm text-zinc-400">
                            月単位に絞り込みできます。
                        </p>
                    </div>
                </div>

                <div className="surface-subtle flex flex-wrap gap-2 p-4">
                    <Link
                        href="/admin/lives"
                        aria-current={!selectedMonth ? "page" : undefined}
                        className="rounded-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-current:bg-violet-500 aria-current:font-black aria-current:text-white"
                    >
                        すべて
                    </Link>

                    {monthIndex.map((month) => (
                        <Link
                            key={month.key}
                            href={createLivesHref({ month: month.key })}
                            aria-current={selectedMonth === month.key ? "page" : undefined}
                            className="rounded-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-current:bg-violet-500 aria-current:font-black aria-current:text-white"
                        >
                            {month.label}
                            <span className="ml-1 text-xs text-zinc-400">{month.count}</span>
                        </Link>
                    ))}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-zinc-400">
                    <p>
                        {totalLives}件中 {displayStart}-{displayEnd}件を表示
                    </p>

                    {selectedMonth && (
                        <Link href="/admin/lives" className="rounded-sm bg-zinc-900 px-3 py-1.5 text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black">
                            月選択を解除
                        </Link>
                    )}
                </div>

                <div className="space-y-4">
                    {typedLives.length === 0 && (
                        <p className="surface p-6 text-zinc-400 ring-1 ring-white/10">
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
                                        <h3 className="text-lg font-black text-fuchsia-300">{month}</h3>
                                    </div>
                                )}

                                {showWeek && (
                                    <p className="text-sm font-semibold text-zinc-400">
                                        {formatWeekLabel(live.live_date)}
                                    </p>
                                )}

                                <div className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white">
                                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                                        <div>
                                            <p className="text-sm text-zinc-400 group-hover:text-zinc-700">
                                                {live.live_date}
                                                {live.live_start_time &&
                                                    ` / ${formatTime(live.live_start_time)}`}
                                            </p>
                                            <h3 className="mt-2 text-xl font-black text-white group-hover:text-black">{live.event_name}</h3>
                                            <p className="mt-2 text-sm text-zinc-400 group-hover:text-zinc-700">
                                                ライブ会場: {getVenueText(live)}
                                            </p>
                                            <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">
                                                特典会会場: {getBenefitVenueText(live)}
                                            </p>
                                        </div>

                                        <div className="flex gap-2">
                                            <Link
                                                href={`/admin/lives/${live.id}/edit`}
                                                className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black"
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
