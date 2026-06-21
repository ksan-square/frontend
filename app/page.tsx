import type { Metadata } from "next";
import Link from "next/link";
import JsonLd from "@/app/_components/json-ld";
import { formatDateJa, formatTime } from "@/lib/date-time";
import { getPrimaryVenue, getScheduleSummaryLines } from "@/lib/live-utils";
import { getPublicHome, type PublicHomeResponse } from "@/lib/public-api";
import { getSiteUrl } from "@/lib/seo";

export const metadata: Metadata = {
  title: "こしあんスクエア | 宵越しのアンサンブル 非公式ファンコミュニティ",
  description:
    "宵越しのアンサンブルの非公式ファンコミュニティ「こしあんスクエア」。ライブ情報・セトリ・コール・歌割・Wiki・お知らせをまとめて掲載。",
  alternates: {
    canonical: "/",
  },
};

export const dynamic = "force-dynamic";

function createShareUrl() {
  const shareText =
    "こしあんのファンへ！\n\n #こしあんスクエア というサイトができました！\n\n🎤 ライブ予定の確認\n📣 コール表・歌割表の確認\n\nができて、予習や現場でかなり便利です！\n\nこれから機能も増えていくらしいので気になる人はぜひ！\n\n#こしあん\n#宵越しのアンサンブル\n\n";
  const params = new URLSearchParams({
    text: shareText,
    url: getSiteUrl(),
  });

  return `https://twitter.com/intent/tweet?${params.toString()}`;
}

function createFallbackHome(): PublicHomeResponse {
  return {
    counts: {
      songs: 0,
      lives: 0,
      wiki_pages: 0,
    },
    notices: [],
    latest_songs: [],
    latest_lives: [],
    latest_wiki_pages: [],
    next_live: null,
  };
}

export default async function Home() {
  const payload = await getPublicHome().catch((error) => {
    console.error("Failed to fetch public home", error);
    return createFallbackHome();
  });
  const siteUrl = getSiteUrl();
  const songCount = payload.counts.songs;
  const liveCount = payload.counts.lives;
  const wikiCount = payload.counts.wiki_pages;
  const notices = payload.notices;
  const latestSongs = payload.latest_songs;
  const latestLives = payload.latest_lives;
  const latestWikiPages = payload.latest_wiki_pages;
  const nextLive = payload.next_live;

  const primaryActions = [
    {
      href: "/songs",
      label: "曲を探す",
      description: "歌割、コール、作詞作曲情報を見る。",
      count: `${songCount} 曲`,
      symbol: "♪",
    },
    {
      href: "/lives",
      label: "ライブを探す",
      description: "日付、会場、イベントごとのセトリを見る。",
      count: `${liveCount} 本`,
      symbol: "LIVE",
    },
    {
      href: "/wiki",
      label: "Wikiを読む",
      description: "現場メモや共有情報を確認する。",
      count: `${wikiCount} 件`,
      symbol: "W",
    },
  ];

  const nextLiveVenue = nextLive ? getPrimaryVenue(nextLive) : null;
  const nextLiveScheduleLines = nextLive ? getScheduleSummaryLines(nextLive) : [];
  const livePreviewLives = latestLives;
  const nextLiveTimeText = nextLive
    ? nextLive.start_time
      ? nextLive.end_time
        ? `${formatTime(nextLive.start_time)}-${formatTime(nextLive.end_time)}`
        : formatTime(nextLive.start_time)
      : "時間未定"
    : null;

  const shareUrl = createShareUrl();
  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "こしあんスクエア",
    url: siteUrl,
    description:
      "宵越しのアンサンブルの非公式ファンコミュニティ「こしあんスクエア」。ライブ情報・セトリ・コール・歌割・Wiki・お知らせをまとめて掲載。",
    inLanguage: "ja",
    about: {
      "@type": "MusicGroup",
      name: "宵越しのアンサンブル",
    },
    hasPart: [
      {
        "@type": "CollectionPage",
        name: "曲一覧",
        url: `${siteUrl}/songs`,
      },
      {
        "@type": "CollectionPage",
        name: "ライブ一覧",
        url: `${siteUrl}/lives`,
      },
      {
        "@type": "CollectionPage",
        name: "Wiki一覧",
        url: `${siteUrl}/wiki`,
      },
    ],
    mainEntity: {
      "@type": "ItemList",
      name: "こしあんスクエア掲載コンテンツ",
      numberOfItems: songCount + liveCount + wikiCount,
      itemListElement: [
        {
          "@type": "ListItem",
          position: 1,
          name: "曲一覧",
          url: `${siteUrl}/songs`,
        },
        {
          "@type": "ListItem",
          position: 2,
          name: "ライブ一覧",
          url: `${siteUrl}/lives`,
        },
        {
          "@type": "ListItem",
          position: 3,
          name: "Wiki一覧",
          url: `${siteUrl}/wiki`,
        },
      ],
    },
  };

  return (
    <main className="space-y-14 md:space-y-20">
      <JsonLd data={collectionPageJsonLd} />
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
                  <div className="space-y-1 text-sm text-zinc-400">
                    {nextLiveScheduleLines.map((line) => (
                      <p key={line.id}>
                        {line.label}: {line.timeText}
                        {line.placeText && ` / ${line.placeText}`}
                      </p>
                    ))}
                  </div>
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
                  更新: {formatDateJa(page.updated_at)}
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
              const venue = getPrimaryVenue(live);
              const startTime = formatTime(live.start_time ?? null);
              const endTime = formatTime(live.end_time ?? null);

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
                  <div className="mt-2 space-y-1 text-sm text-zinc-400 group-hover:text-zinc-700">
                    {getScheduleSummaryLines(live).slice(0, 2).map((line) => (
                      <p key={line.id}>
                        {line.label}: {line.timeText}
                      </p>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
