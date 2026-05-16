import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
import { supabase } from "@/lib/supabase";
import DeleteButton from "./delete-button";

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

type Live = {
    id: string;
    live_date: string;
    same_day_order: number;
    live_start_time: string | null;
    live_end_time: string | null;
    benefit_meeting_start_time: string | null;
    benefit_meeting_end_time: string | null;
    benefit_meeting_time_note: string | null;
    benefit_meeting_place_detail: string | null;
    ticket_url: string | null;
    official_x_url: string | null;
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
    benefit_venue:
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
    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    const { data: liveDates, error: liveDatesError } = await supabase
        .from("lives")
        .select("live_date")
        .eq("is_delete", false)
        .lt("live_date", today)
        .order("live_date", { ascending: false });

    if (liveDatesError) {
        return <main>取得失敗: {liveDatesError.message}</main>;
    }

    const monthIndex = buildMonthIndex(liveDates ?? []);
    const monthStart = selectedMonth ? `${selectedMonth}-01` : null;
    const monthEnd = selectedMonth ? `${getNextMonth(selectedMonth)}-01` : null;

    const { data: upcomingLives, error: upcomingLivesError } = await supabase
        .from("lives")
        .select(`
            id,
            live_date,
            same_day_order,
            live_start_time,
            live_end_time,
            benefit_meeting_start_time,
            benefit_meeting_end_time,
            benefit_meeting_time_note,
            benefit_meeting_place_detail,
            ticket_url,
            official_x_url,
            event_name,
            memo,
            venues!lives_venue_id_fkey (
                name,
                area
            ),
            benefit_venue:venues!lives_benefit_venue_id_fkey (
                name,
                area
            )
        `)
        .eq("is_delete", false)
        .gte("live_date", today)
        .order("live_date", { ascending: true })
        .order("live_start_time", { ascending: true })
        .order("same_day_order", { ascending: true });

    if (upcomingLivesError) {
        return <main>取得失敗: {upcomingLivesError.message}</main>;
    }

    let livesQuery = supabase
        .from("lives")
        .select(`
            id,
            live_date,
            same_day_order,
            live_start_time,
            live_end_time,
            benefit_meeting_start_time,
            benefit_meeting_end_time,
            benefit_meeting_time_note,
            benefit_meeting_place_detail,
            ticket_url,
            official_x_url,
            event_name,
            memo,
            venues!lives_venue_id_fkey (
                name,
                area
            ),
            benefit_venue:venues!lives_benefit_venue_id_fkey (
                name,
                area
            )
        `, { count: "exact" })
        .eq("is_delete", false)
        .lt("live_date", today)
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
            <Breadcrumbs
                items={[
                    { href: "/admin", label: "管理" },
                    { label: "ライブ管理" },
                ]}
            />

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
                <div>
                    <h2 className="text-xl font-bold">今後のライブ予定</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        予定だけ先に作って、セトリは編集画面からあとで追加できます。
                    </p>
                </div>

                {(upcomingLives ?? []).length === 0 && (
                    <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 text-zinc-400">
                        今後のライブ予定はまだありません。
                    </p>
                )}

                {(upcomingLives as Live[]).map((live) => {
                    const venue = Array.isArray(live.venues)
                        ? live.venues[0]
                        : live.venues;
                    const benefitVenue = Array.isArray(live.benefit_venue)
                        ? live.benefit_venue[0]
                        : live.benefit_venue;
                    const liveStartTime = formatTime(live.live_start_time);
                    const liveEndTime = formatTime(live.live_end_time);
                    const benefitStartTime = formatTime(live.benefit_meeting_start_time);
                    const benefitEndTime = formatTime(live.benefit_meeting_end_time);
                    const benefitPlaceText = benefitVenue?.name
                        ? `${benefitVenue.name}${benefitVenue.area ? ` / ${benefitVenue.area}` : ""}${live.benefit_meeting_place_detail ? ` / ${live.benefit_meeting_place_detail}` : ""}`
                        : live.benefit_meeting_place_detail ?? "会場未定";
                    const liveTimeText = liveStartTime
                        ? liveEndTime
                            ? `${liveStartTime}-${liveEndTime}`
                            : `${liveStartTime} 開演`
                        : "時間未定";
                    const benefitTimeText = live.benefit_meeting_time_note
                        ? live.benefit_meeting_time_note
                        : benefitStartTime
                        ? benefitEndTime
                            ? `${benefitStartTime}-${benefitEndTime}`
                            : `${benefitStartTime} 開始予定`
                        : "未定";

                    return (
                        <div
                            key={live.id}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                        >
                            <div className="flex flex-wrap justify-between gap-4">
                                <div>
                                    <p className="text-pink-300">
                                        {live.live_date}
                                        {` / ${liveTimeText}`}
                                    </p>

                                    <h3 className="text-xl font-bold">
                                        {live.event_name}
                                    </h3>

                                    <p className="text-zinc-400">
                                        ライブ会場: {venue?.name ?? "会場未登録"}
                                        {venue?.area && ` / ${venue.area}`}
                                    </p>

                                    <p className="mt-1 text-sm text-zinc-400">
                                        特典会:{" "}
                                        {benefitTimeText}
                                        {benefitPlaceText && ` / ${benefitPlaceText}`}
                                    </p>

                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {live.ticket_url && (
                                            <a
                                                href={live.ticket_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white"
                                            >
                                                チケット
                                            </a>
                                        )}

                                        {live.official_x_url && (
                                            <a
                                                href={live.official_x_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-200"
                                            >
                                                公式X
                                            </a>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
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
                    );
                })}
            </section>

            <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                <div>
                    <h2 className="text-xl font-bold">過去ライブ履歴</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        月ごとのインデックスから過去公演を探せます。
                    </p>
                </div>

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
                                            {live.live_start_time &&
                                                ` / ${formatTime(live.live_start_time)}${live.live_end_time ? `-${formatTime(live.live_end_time)}` : ""}`}
                                        </p>

                                        <h3 className="text-xl font-bold">
                                            {live.event_name}
                                        </h3>

                                        <p className="text-zinc-400">
                                            {venue?.name}
                                            {venue?.area &&
                                                ` / ${venue.area}`}
                                        </p>

                                        <p className="mt-1 text-sm text-zinc-400">
                                            特典会:{" "}
                                            {live.benefit_meeting_start_time
                                                ? live.benefit_meeting_end_time
                                                    ? `${live.benefit_meeting_start_time}-${live.benefit_meeting_end_time}`
                                                    : `${live.benefit_meeting_start_time} 開始予定`
                                                : "未定"}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-2">
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
