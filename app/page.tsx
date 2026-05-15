import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    { count: songCount },
    { count: liveCount },
    { count: wikiCount },
    { data: notices },
    { data: latestSongs },
    { data: latestLives },
    { data: latestWikiPages },
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
      .select("id,live_date,event_name,venues(name,area)")
      .eq("is_delete", false)
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
  ]);

  const primaryActions = [
    {
      href: "/songs",
      label: "曲を探す",
      description: "歌割、コール、作詞作曲情報を見る。",
      count: `${songCount ?? 0} 曲`,
    },
    {
      href: "/lives",
      label: "ライブを探す",
      description: "日付、会場、イベントごとのセトリを見る。",
      count: `${liveCount ?? 0} 本`,
    },
    {
      href: "/wiki",
      label: "Wikiを読む",
      description: "現場メモや共有情報を確認する。",
      count: `${wikiCount ?? 0} 件`,
    },
  ];

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString("ja-JP");
  }

  return (
    <main className="space-y-8">
      <section className="space-y-6 border-b border-zinc-800 pb-8">
        <div className="max-w-3xl">
          <p className="text-sm font-semibold text-pink-300">
            宵越しのアンサンブル 非公式ファンデータベース
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-5xl">
            コール・歌割・セトリを
            <br />
            みんなで見やすく。
          </h1>

          <p className="mt-5 text-zinc-300">
            楽曲ごとのコール、歌割、ライブ履歴、セトリをまとめるためのファンコミュニティサイトです。
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          {primaryActions.map((action) => (
            <Link
              key={action.href}
              href={action.href}
              className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 hover:border-pink-400"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-xl font-bold">{action.label}</h2>
                <span className="rounded-full bg-zinc-800 px-2.5 py-1 text-xs text-zinc-300">
                  {action.count}
                </span>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {action.description}
              </p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">最近見るもの</h2>
            <Link href="/wiki" className="text-sm font-semibold text-pink-300">
              Wiki一覧
            </Link>
          </div>

          <div className="grid gap-3">
            {latestWikiPages?.map((page) => (
              <Link
                key={page.id}
                href={`/wiki/${page.slug}`}
                className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-pink-400"
              >
                <p className="font-bold">{page.title}</p>
                <p className="mt-1 text-sm text-zinc-400">
                  更新: {formatDate(page.updated_at)}
                </p>
              </Link>
            ))}

            {latestWikiPages?.length === 0 && (
              <p className="rounded-lg border border-zinc-800 bg-zinc-900 p-4 text-sm text-zinc-400">
                まだWikiはありません。
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-4 rounded-lg border border-zinc-800 bg-zinc-900 p-5">
          <h2 className="text-xl font-bold">お知らせ</h2>

          <div className="space-y-3">
            {notices?.length === 0 && (
              <p className="text-sm text-zinc-400">現在お知らせはありません。</p>
            )}

            {notices?.map((notice) => (
              <article key={notice.id} className="border-b border-zinc-800 pb-3 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center gap-2">
                  {notice.tag && (
                    <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs text-pink-200">
                      {notice.tag}
                    </span>
                  )}
                  <h3 className="font-bold">{notice.title}</h3>
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-300">
                  {notice.body}
                </p>
              </article>
            ))}
          </div>
        </aside>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">曲から探す</h2>
            <Link href="/songs" className="text-sm font-semibold text-pink-300">
              曲一覧
            </Link>
          </div>

          <div className="space-y-3">
            {latestSongs?.map((song) => (
              <Link
                key={song.id}
                href={`/songs/${song.slug}`}
                className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-pink-400"
              >
                <h3 className="font-bold">{song.title}</h3>
                {song.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-zinc-400">
                    {song.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-bold">ライブから探す</h2>
            <Link href="/lives" className="text-sm font-semibold text-pink-300">
              ライブ履歴
            </Link>
          </div>

          <div className="space-y-3">
            {latestLives?.map((live) => {
              const venue = Array.isArray(live.venues)
                ? live.venues[0]
                : live.venues;

              return (
                <Link
                  key={live.id}
                  href={`/lives/${live.id}`}
                  className="block rounded-lg border border-zinc-800 bg-zinc-900 p-4 hover:border-pink-400"
                >
                  <p className="text-sm font-semibold text-pink-300">
                    {live.live_date}
                  </p>
                  <h3 className="mt-1 font-bold">{live.event_name}</h3>
                  <p className="mt-1 text-sm text-zinc-400">
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
