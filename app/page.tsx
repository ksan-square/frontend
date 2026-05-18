import type { Metadata } from "next";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "ホーム",
  description:
    "曲、ライブ、Wiki、お知らせをまとめて確認できるこしあんスクエアのトップページです。",
  alternates: {
    canonical: "/",
  },
};

export const dynamic = "force-dynamic";

function formatTime(time: string | null) {
  return time ? time.slice(0, 5) : null;
}

type NextLiveCandidate = {
  live_date: string;
  live_start_time: string | null;
  benefit_meeting_end_time: string | null;
};

function createShareUrl() {
  const shareText =
    "こしあんのファンへ！\n\n #こしあんスクエア というサイトができました！\n\n🎤 ライブ予定の確認\n📣 コール表・歌割表の確認\n\nができて、予習や現場でかなり便利です！\n\nこれから機能も増えていくらしいので気になる人はぜひ！\n\n#こしあん\n#宵越しのアンサンブル\n\n";
  const params = new URLSearchParams({
    text: shareText,
    url: getSiteUrl(),
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function getJapanTimeKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value ?? "00";
  const minute = parts.find((part) => part.type === "minute")?.value ?? "00";

  return `${hour === "24" ? "00" : hour}:${minute}`;
}

function isLiveStillUpcomingToday(
  live: NextLiveCandidate,
  sameDayLives: NextLiveCandidate[],
  liveIndex: number,
  currentTime: string,
) {
  const benefitEndTime = formatTime(live.benefit_meeting_end_time);

  if (benefitEndTime) {
    return currentTime <= benefitEndTime;
  }

  const nextLiveStartTime = formatTime(sameDayLives[liveIndex + 1]?.live_start_time);

  if (sameDayLives.length >= 2 && nextLiveStartTime) {
    return currentTime < nextLiveStartTime;
  }

  return true;
}

function findNextLive<T extends NextLiveCandidate>(
  lives: T[] | null,
  today: string,
  currentTime: string,
) {
  const candidates = lives ?? [];

  return candidates.find((live, index) => {
    if (live.live_date > today) {
      return true;
    }

    if (live.live_date < today) {
      return false;
    }

    const sameDayLives = candidates.filter(
      (candidate) => candidate.live_date === live.live_date,
    );
    const sameDayIndex = sameDayLives.findIndex(
      (candidate) => candidate === live,
    );

    return isLiveStillUpcomingToday(
      live,
      sameDayLives,
      sameDayIndex >= 0 ? sameDayIndex : index,
      currentTime,
    );
  });
}

export default async function Home() {
  const now = new Date();
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(now);
  const currentTime = getJapanTimeKey(now);

  const [
    { count: songCount },
    { count: liveCount },
    { count: wikiCount },
    { data: notices },
    { data: latestSongs },
    { data: latestLives },
    { data: latestWikiPages },
    { data: nextLives },
    { data: upcomingPreviewLives },
  ] = await Promise.all([
    supabase
      .from("songs")
      .select("*", { count: "exact", head: true })
      .eq("is_delete", false),
    supabase
      .from("lives")
      .select("*", { count: "exact", head: true })
      .eq("is_delete", false),
    supabase
      .from("wiki_pages")
      .select("*", { count: "exact", head: true })
      .eq("is_delete", false)
      .eq("is_published", true),
    supabase
      .from("notices")
      .select("id,title,tag,body,published_at")
      .eq("is_delete", false)
      .eq("is_published", true)
      .order("published_at", { ascending: false })
      .limit(3),
    supabase
      .from("songs")
      .select("id,title,slug,description")
      .eq("is_delete", false)
      .order("order_no", { ascending: true })
      .limit(3),
    supabase
      .from("lives")
      .select(
        "id,live_date,live_start_time,live_end_time,event_name,venues(name,area)",
      )
      .eq("is_delete", false)
      .lt("live_date", today)
      .order("live_date", { ascending: false })
      .order("same_day_order", { ascending: true })
      .limit(3),
    supabase
      .from("wiki_pages")
      .select("id,title,slug,updated_at")
      .eq("is_delete", false)
      .eq("is_published", true)
      .order("updated_at", { ascending: false })
      .limit(3),
    supabase
      .from("lives")
      .select(
        "id,live_date,live_start_time,live_end_time,benefit_meeting_start_time,benefit_meeting_end_time,benefit_meeting_time_note,benefit_meeting_place_detail,ticket_url,official_x_url,event_name,venues!lives_venue_id_fkey(name,area),benefit_venue:venues!lives_benefit_venue_id_fkey(name,area)",
      )
      .eq("is_delete", false)
      .gte("live_date", today)
      .order("live_date", { ascending: true })
      .order("live_start_time", { ascending: true })
      .order("same_day_order", { ascending: true }),
    supabase
      .from("lives")
      .select(
        "id,live_date,live_start_time,live_end_time,event_name,venues(name,area)",
      )
      .eq("is_delete", false)
      .gte("live_date", today)
      .order("live_date", { ascending: true })
      .order("live_start_time", { ascending: true })
      .order("same_day_order", { ascending: true })
      .limit(3),
  ]);

  const primaryActions = [
    {
      href: "/songs",
      label: "曲を探す",
      description: "歌割、コール、作詞作曲情報を見る。",
      count: `${songCount ?? 0} 曲`,
      symbol: "♪",
    },
    {
      href: "/lives",
      label: "ライブを探す",
      description: "日付、会場、イベントごとのセトリを見る。",
      count: `${liveCount ?? 0} 本`,
      symbol: "LIVE",
    },
    {
      href: "/wiki",
      label: "Wikiを読む",
      description: "現場メモや共有情報を確認する。",
      count: `${wikiCount ?? 0} 件`,
      symbol: "W",
    },
  ];

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("ja-JP");
  }

  const nextLive = findNextLive(nextLives, today, currentTime);
  const nextLiveVenue = nextLive
    ? Array.isArray(nextLive.venues)
      ? nextLive.venues[0]
      : nextLive.venues
    : null;
  const nextBenefitVenue = nextLive
    ? Array.isArray(nextLive.benefit_venue)
      ? nextLive.benefit_venue[0]
      : nextLive.benefit_venue
    : null;
  const nextBenefitPlaceText = nextLive
    ? nextBenefitVenue?.name
      ? `${nextBenefitVenue.name}${nextBenefitVenue.area ? ` / ${nextBenefitVenue.area}` : ""}${nextLive.benefit_meeting_place_detail ? ` / ${nextLive.benefit_meeting_place_detail}` : ""}`
      : (nextLive.benefit_meeting_place_detail ?? "会場未定")
    : null;
  const livePreviewLives =
    latestLives && latestLives.length > 0
      ? latestLives
      : (upcomingPreviewLives ?? []);
  const nextLiveTimeText = nextLive
    ? nextLive.live_start_time
      ? nextLive.live_end_time
        ? `${formatTime(nextLive.live_start_time)}-${formatTime(nextLive.live_end_time)}`
        : `${formatTime(nextLive.live_start_time)} 開演`
      : "時間未定"
    : null;
  const nextBenefitTimeText = nextLive
    ? nextLive.benefit_meeting_time_note
      ? nextLive.benefit_meeting_time_note
      : nextLive.benefit_meeting_start_time
        ? nextLive.benefit_meeting_end_time
          ? `${formatTime(nextLive.benefit_meeting_start_time)}-${formatTime(nextLive.benefit_meeting_end_time)}`
          : `${formatTime(nextLive.benefit_meeting_start_time)} 開始`
        : "未定"
    : null;

  const shareUrl = createShareUrl();

  return (
    <main className="space-y-14 md:space-y-20">
      <section className="relative overflow-hidden bg-black px-5 py-6 shadow-2xl shadow-black/40 ring-1 ring-white/10 md:px-10 md:py-10">
        <div className="editorial-rule absolute inset-x-0 top-0 h-1" />

        <div className="grid gap-5 lg:grid-cols-[0.88fr_1.12fr] lg:items-stretch">
          <div className="flex flex-col justify-between gap-5">
            <div>
              <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
              宵越しのアンサンブル 非公式ファンコミュニティ
            </p>

              <h1 className="mt-5 text-3xl font-black leading-tight text-white md:text-5xl">
                こしあんスクエア
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-300 md:text-base">
              楽曲ごとのコール、歌割、ライブ履歴、セトリをまとめるためのファンコミュニティサイトです。
            </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/lives"
                className="rounded-md bg-violet-500 px-5 py-3 text-sm font-black text-white hover:bg-violet-400"
              >
                次のライブを見る
              </Link>
              <Link
                href="/songs"
                className="rounded-md bg-zinc-900 px-5 py-3 text-sm font-bold text-white ring-1 ring-white/10 hover:bg-white hover:text-black"
              >
                曲から予習する
              </Link>
            </div>
          </div>

          {nextLive && (
            <div className="surface p-5 ring-1 ring-white/10 md:p-6">
              <div className="flex h-full flex-col justify-between gap-5">
                <div className="space-y-2">
                  <p className="text-xs font-black uppercase text-fuchsia-300">
                    次のライブ予定
                  </p>
                  <h2 className="text-2xl font-black leading-tight text-white md:text-4xl">{nextLive.event_name}</h2>
                  <p className="text-sm font-semibold text-zinc-100">
                    {nextLiveVenue?.name ?? "会場未登録"}
                    {nextLiveVenue?.area && ` / ${nextLiveVenue.area}`}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {nextLive.live_date}
                    {nextLiveTimeText && ` / ${nextLiveTimeText}`}
                  </p>
                  <p className="text-sm text-zinc-400">
                    特典会: {nextBenefitTimeText}
                    {nextBenefitPlaceText && ` / ${nextBenefitPlaceText}`}
                  </p>
                </div>

                <Link
                  href={`/lives/${nextLive.id}`}
                  className="w-fit rounded-md bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200"
                >
                  詳細を見る
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
        <div className="surface-subtle p-5">
          <p className="text-sm font-black text-white">こしあんスクエアを広める</p>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            便利な導線を、現場に行く人へ。
          </p>
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex rounded-md bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200"
          >
            Xで広める
          </a>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {primaryActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white hover:text-black"
            >
              <div className="mb-5 flex items-center justify-between gap-3">
                <span className="inline-grid h-10 min-w-10 place-items-center rounded-sm bg-zinc-950 px-2 text-xs font-black text-white ring-1 ring-white/10 group-hover:bg-black">
                  {action.symbol}
                </span>
                <span className="text-xs font-black text-fuchsia-300">
                  {action.count}
                </span>
              </div>
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-black text-white group-hover:text-black">{action.label}</h2>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400 group-hover:text-zinc-700">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-white">Top Wiki</h2>
            <Link href="/wiki" className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white hover:text-black">
              Wiki一覧
            </Link>
          </div>

          <div className="grid gap-3">
            {latestWikiPages?.map((page) => (
              <Link
                key={page.id}
                href={`/wiki/${page.slug}`}
                className="surface-subtle block p-4 hover:-translate-y-0.5 hover:bg-zinc-900"
              >
                <p className="text-lg font-black text-white">{page.title}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  更新: {formatDate(page.updated_at)}
                </p>
              </Link>
            ))}

            {latestWikiPages?.length === 0 && (
              <p className="surface-subtle p-4 text-sm text-zinc-400">
                まだWikiはありません。
              </p>
            )}
          </div>
        </div>

        <aside className="surface space-y-4 p-5 ring-1 ring-white/10">
          <h2 className="text-2xl font-black text-white">お知らせ</h2>

          <div className="space-y-3">
            {notices?.length === 0 && (
              <p className="text-sm text-zinc-400">
                現在お知らせはありません。
              </p>
            )}

            {notices?.map((notice) => (
              <article
                key={notice.id}
                className="bg-black/30 p-4"
              >
                <div className="flex flex-wrap items-center gap-2">
                  {notice.tag && (
                    <span className="rounded-full bg-violet-500/15 px-3 py-1 text-xs font-bold text-fuchsia-200 ring-1 ring-violet-300/20">
                      {notice.tag}
                    </span>
                  )}
                  <h3 className="font-black text-white">{notice.title}</h3>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                  {notice.body}
                </p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-white">曲から探す</h2>
            <Link href="/songs" className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white hover:text-black">
              曲一覧
            </Link>
          </div>

          <div className="space-y-3">
            {latestSongs?.map((song) => (
              <Link
                key={song.id}
                href={`/songs/${song.slug}`}
                className="group block bg-[#111113] p-4 shadow-lg shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white hover:ring-white"
              >
                <h3 className="text-xl font-black text-white group-hover:text-black">{song.title}</h3>
                {song.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-400 group-hover:text-zinc-700">
                    {song.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-3xl font-black text-white">ライブから探す</h2>
            <Link href="/lives" className="rounded-md bg-zinc-900 px-3 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white hover:text-black">
              ライブ履歴
            </Link>
          </div>

          <div className="space-y-3">
            {livePreviewLives?.map((live) => {
              const venue = Array.isArray(live.venues)
                ? live.venues[0]
                : live.venues;
              const startTime = formatTime(live.live_start_time ?? null);
              const endTime = formatTime(live.live_end_time ?? null);

              return (
                <Link
                  key={live.id}
                  href={`/lives/${live.id}`}
                  className="group block bg-[#111113] p-4 shadow-lg shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white hover:ring-white"
                >
                  <p className="text-sm font-bold text-fuchsia-300">
                    {live.live_date}
                    {startTime &&
                      ` / ${endTime ? `${startTime}-${endTime}` : startTime}`}
                  </p>
                  <h3 className="mt-1 text-lg font-black text-white group-hover:text-black">{live.event_name}</h3>
                  <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">
                    {venue?.name ?? "会場未登録"}
                    {venue?.area && ` / ${venue.area}`}
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
