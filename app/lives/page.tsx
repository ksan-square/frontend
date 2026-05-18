import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
import { supabase } from "@/lib/supabase";
import type { Live } from "@/types";

export const metadata: Metadata = {
  title: "ライブ予定・履歴",
  description:
    "今後のライブ予定と過去ライブ履歴、会場情報、セトリを確認できるページです。",
  alternates: {
    canonical: "/lives",
  },
};

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

  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(
    2,
    "0",
  )}`;
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
  const weekOfMonth = Math.floor((day.getDate() - 1) / 7) + 1;

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

  return Array.from(counts.entries()).map<MonthIndexItem>(([key, count]) => ({
    key,
    label: formatMonthLabel(key),
    count,
  }));
}

function createLivesHref(month?: string | null) {
  return month ? `/lives?month=${month}` : "/lives";
}

export default async function LivesPage({
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
    return (
      <main>ライブ履歴の取得に失敗しました: {liveDatesError.message}</main>
    );
  }

  const monthIndex = buildMonthIndex(liveDates ?? []);
  const monthStart = selectedMonth ? `${selectedMonth}-01` : null;
  const monthEnd = selectedMonth ? `${getNextMonth(selectedMonth)}-01` : null;
  const selectedMonthItem = monthIndex.find(
    (month) => month.key === selectedMonth,
  );
  const totalLives = selectedMonth
    ? (selectedMonthItem?.count ?? 0)
    : (liveDates?.length ?? 0);
  const totalPages = Math.max(Math.ceil(totalLives / PAGE_SIZE), 1);
  const currentPage = Math.min(requestedPage, totalPages);
  const rangeStart = (currentPage - 1) * PAGE_SIZE;
  const rangeEnd = rangeStart + PAGE_SIZE - 1;

  const { data: upcomingLives, error: upcomingLivesError } = await supabase
    .from("lives")
    .select(
      `
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
            id,
            name,
            area,
            google_map_url
        ),
        benefit_venue:venues!lives_benefit_venue_id_fkey (
            id,
            name,
            area,
            google_map_url
        )
    `,
    )
    .eq("is_delete", false)
    .gte("live_date", today)
    .order("live_date", { ascending: true })
    .order("live_start_time", { ascending: true })
    .order("same_day_order", { ascending: true });

  if (upcomingLivesError) {
    return (
      <main>ライブ予定の取得に失敗しました: {upcomingLivesError.message}</main>
    );
  }

  let livesQuery = supabase
    .from("lives")
    .select(
      `
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
            id,
            name,
            area,
            google_map_url
        ),
        benefit_venue:venues!lives_benefit_venue_id_fkey (
            id,
            name,
            area,
            google_map_url
        )
    `,
    )
    .eq("is_delete", false)
    .lt("live_date", today)
    .order("live_date", { ascending: false })
    .order("same_day_order", { ascending: true });

  if (monthStart && monthEnd) {
    livesQuery = livesQuery
      .gte("live_date", monthStart)
      .lt("live_date", monthEnd);
  }

  const { data, error } = await livesQuery.range(rangeStart, rangeEnd);

  if (error) {
    return <main>ライブ履歴の取得に失敗しました: {error.message}</main>;
  }

  const lives = (data ?? []) as unknown as Live[];
  const historyLives = lives.map((live, index) => {
    const month = getMonthKey(live.live_date);
    const week = getWeekKey(live.live_date);
    const previousLive = lives[index - 1];
    const previousMonth = previousLive ? getMonthKey(previousLive.live_date) : null;
    const previousWeek = previousLive ? getWeekKey(previousLive.live_date) : null;

    return {
      live,
      month,
      shouldShowMonth: month !== previousMonth,
      shouldShowWeek: week !== previousWeek,
    };
  });

  return (
    <main className="space-y-10">
      <Breadcrumbs items={[{ label: "ライブ" }]} />

      <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
        <div className="editorial-rule absolute inset-x-0 top-0 h-1" />
        <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">Lives</p>

        <h1 className="mt-5 text-4xl font-black text-white md:text-5xl">ライブ予定・履歴</h1>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-zinc-300 md:text-base">
          次回のライブ予定の確認と、過去ライブのセトリの確認ができます。
        </p>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-3xl font-black text-white">今後のライブ予定</h2>
          <p className="mt-2 text-sm text-zinc-400">
            時間や特典会会場は決まり次第更新します。
          </p>
        </div>

        {(upcomingLives ?? []).length === 0 && (
          <div className="surface p-6 text-zinc-400 ring-1 ring-white/10">
            現在公開中のライブ予定はありません。
          </div>
        )}

        {(upcomingLives as unknown as Live[]).map((live) => {
          const venue = live.venues;
          const benefitVenue = live.benefit_venue ?? venue;
          const liveStartTime = formatTime(live.live_start_time);
          const liveEndTime = formatTime(live.live_end_time);
          const benefitStartTime = formatTime(live.benefit_meeting_start_time);
          const benefitEndTime = formatTime(live.benefit_meeting_end_time);
          const benefitPlaceText = benefitVenue?.name
            ? `${benefitVenue.name}${benefitVenue.area ? ` / ${benefitVenue.area}` : ""}${live.benefit_meeting_place_detail ? ` / ${live.benefit_meeting_place_detail}` : ""}`
            : (live.benefit_meeting_place_detail ?? "会場未定");
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
              className="surface p-5 ring-1 ring-white/10"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <p className="text-sm font-black text-fuchsia-300">
                    {live.live_date}
                    {` / ${liveTimeText}`}
                  </p>

                  <h3 className="mt-1 text-2xl font-black text-white">{live.event_name}</h3>

                  <p className="mt-2 text-sm text-zinc-400">
                    ライブ会場: {venue?.name ?? "会場未登録"}
                    {venue?.area && ` / ${venue.area}`}
                  </p>

                  <p className="mt-1 text-sm text-zinc-400">
                    特典会: {benefitTimeText}
                    {benefitPlaceText && ` / ${benefitPlaceText}`}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {live.ticket_url && (
                      <a
                        href={live.ticket_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-sm bg-violet-500 px-3 py-1 text-xs font-black text-white hover:bg-violet-400"
                      >
                        チケット
                      </a>
                    )}

                    {live.official_x_url && (
                      <a
                        href={live.official_x_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-sm bg-zinc-950 px-3 py-1 text-xs font-semibold text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black"
                      >
                        公式X
                      </a>
                    )}
                  </div>
                </div>

                <Link
                  href={`/lives/${live.id}`}
                  className="w-fit rounded-sm bg-white px-3 py-1.5 text-xs font-black text-black hover:bg-zinc-200"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          );
        })}
      </section>

      <section className="surface-subtle space-y-3 p-4">
        <div>
          <h2 className="text-3xl font-black text-white">過去ライブ履歴</h2>
          <p className="mt-2 text-sm text-zinc-400">
            月ごとのインデックスで探せます。
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/lives"
            aria-current={!selectedMonth ? "page" : undefined}
            className="rounded-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-current:bg-violet-500 aria-current:font-black aria-current:text-white"
          >
            すべて
          </Link>

          {monthIndex.map((month) => (
            <Link
              key={month.key}
              href={createLivesHref(month.key)}
              aria-current={selectedMonth === month.key ? "page" : undefined}
              className="rounded-sm bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black aria-current:bg-violet-500 aria-current:font-black aria-current:text-white"
            >
              {month.label}
              <span className="ml-1 text-xs text-zinc-300">{month.count}</span>
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
            href="/lives"
            className="rounded-sm bg-zinc-900 px-3 py-1.5 text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black"
          >
            月選択を解除
          </Link>
        )}
      </div>

      <section className="space-y-4">
        {lives.length === 0 && (
          <div className="surface p-6 text-zinc-400 ring-1 ring-white/10">
            まだライブ履歴が登録されていません。
          </div>
        )}

        {historyLives.map(({ live, month, shouldShowMonth, shouldShowWeek }) => {
          const venue = live.venues;

          return (
            <div key={live.id} className="space-y-3">
              {shouldShowMonth && (
                <h2 className="pt-4 text-3xl font-black text-white">
                  {formatMonthLabel(month)}
                </h2>
              )}

              {shouldShowWeek && (
                <p className="border-l-4 border-violet-500 pl-3 text-sm font-black text-fuchsia-200">
                  {formatWeekLabel(live.live_date)}
                </p>
              )}

              <div className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-black text-fuchsia-300 group-hover:text-violet-700">
                      {live.live_date}
                      {live.live_start_time &&
                        ` / ${formatTime(live.live_start_time)}${live.live_end_time ? `-${formatTime(live.live_end_time)}` : ""}`}
                    </p>

                    <h3 className="mt-1 text-xl font-black text-white group-hover:text-black">
                      {live.event_name}
                    </h3>

                    <p className="mt-2 text-sm text-zinc-400 group-hover:text-zinc-700">
                      {venue?.name ?? "会場未登録"}
                      {venue?.area && ` / ${venue.area}`}
                    </p>

                    {venue?.google_map_url && (
                      <a
                        href={venue.google_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-bold text-fuchsia-300 hover:underline group-hover:text-violet-700"
                      >
                        Google Mapで見る
                      </a>
                    )}
                  </div>

                  <Link
                    href={`/lives/${live.id}`}
                    className="w-fit rounded-sm bg-zinc-950 px-3 py-1.5 text-xs font-black text-zinc-200 ring-1 ring-white/10 hover:bg-black group-hover:bg-black group-hover:text-white"
                  >
                    セトリを見る
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      <Pagination
        basePath="/lives"
        currentPage={currentPage}
        totalPages={totalPages}
        query={{ month: selectedMonth }}
      />
    </main>
  );
}
