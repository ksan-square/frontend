import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { count: songCount } = await supabase
    .from("songs")
    .select("*", { count: "exact", head: true });

  const { count: liveCount } = await supabase
    .from("lives")
    .select("*", { count: "exact", head: true });

  const { data: notices } = await supabase
    .from("notices")
    .select("id,title,tag,body,published_at")
    .eq("is_published", true)
    .order("published_at", { ascending: false })
    .limit(5);

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-zinc-800 bg-gradient-to-br from-zinc-900 to-zinc-950 p-8 shadow-xl">
        <p className="mb-3 text-sm font-semibold text-pink-300">
          宵越しのアンサンブル 非公式ファンデータベース
        </p>

        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">
          コール・歌割・セトリを
          <br />
          みんなで見やすく。
        </h1>

        <p className="mt-5 max-w-2xl text-zinc-300">
          楽曲ごとのコール、歌割、ライブ履歴、セトリをまとめるためのファンコミュニティサイトです。
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/songs"
            className="rounded-full bg-pink-500 px-5 py-3 text-sm font-bold text-white hover:bg-pink-400"
          >
            曲一覧を見る
          </Link>

          <Link
            href="/lives"
            className="rounded-full border border-zinc-700 px-5 py-3 text-sm font-bold text-zinc-200 hover:bg-zinc-900"
          >
            ライブ履歴を見る
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-bold">お知らせ</h2>

        <div className="mt-4 space-y-3">
          {notices?.length === 0 && (
            <p className="text-sm text-zinc-400">現在お知らせはありません。</p>
          )}

          {notices?.map((notice) => (
            <article key={notice.id} className="rounded-xl bg-zinc-950 p-4">
              <div className="flex items-center gap-2">
                {notice.tag && (
                  <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs text-pink-200">
                    {notice.tag}
                  </span>
                )}
                <h3 className="font-bold">{notice.title}</h3>
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-zinc-300">
                {notice.body}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">登録曲数</p>
          <p className="mt-2 text-4xl font-bold">{songCount ?? 0}</p>
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
          <p className="text-sm text-zinc-400">ライブ履歴</p>
          <p className="mt-2 text-4xl font-bold">{liveCount ?? 0}</p>
        </div>
      </section>

      <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
        <h2 className="text-xl font-bold">このサイトでできること</h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-zinc-950 p-4">
            <h3 className="font-bold">歌割を見る</h3>
            <p className="mt-2 text-sm text-zinc-400">
              曲ごとに誰がどこを歌っているか確認できる。
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950 p-4">
            <h3 className="font-bold">コールを見る</h3>
            <p className="mt-2 text-sm text-zinc-400">
              現場で使いやすいように、コールを行単位で確認できる。
            </p>
          </div>

          <div className="rounded-xl bg-zinc-950 p-4">
            <h3 className="font-bold">セトリを見る</h3>
            <p className="mt-2 text-sm text-zinc-400">
              どの日にどの曲をやったかをライブ単位で確認できる。
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}