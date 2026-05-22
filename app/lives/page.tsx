import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import Pagination from "@/app/_components/pagination";
import {
  formatMonthLabel,
  formatTime,
  formatWeekLabel,
  getMonthKey,
  getWeekKey,
} from "@/lib/date-time";
import { createPathWithQuery, getPaginationRange, parseMonthParam, parsePageParam } from "@/lib/page-utils";
import { getPublicLives } from "@/lib/public-api";

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

type SearchParams = Promise<{
  month?: string | string[];
  page?: string | string[];
}>;

function createLivesHref(month?: string | null) {
  return createPathWithQuery("/lives", { month });
}

export default async function LivesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const selectedMonth = parseMonthParam(params.month);
  const requestedPage = parsePageParam(params.page);
  let payload;
  try {
    payload = await getPublicLives({
      month: selectedMonth,
      page: requestedPage,
    });
  } catch (error) {
    return (
      <main>
        ライブの取得に失敗しました:{" "}
        {error instanceof Error ? error.message : "unknown error"}
      </main>
    );
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
  const lives = payload.history_items;
  const upcomingLives = payload.upcoming_items;
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

        {upcomingLives.map((live) => {
          const venue = live.venue;
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
          {totalLives}件中 {displayStart}-{displayEnd}件を表示
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
          const venue = live.venue;

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
