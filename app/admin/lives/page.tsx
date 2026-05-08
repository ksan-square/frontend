import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default async function AdminLivesPage() {
    const { data: lives, error } = await supabase
        .from("lives")
        .select(`
      id,
      live_date,
      same_day_order,
      event_name,
      memo,
      venues (
        name,
        area,
        google_map_url
      )
    `)
        .order("live_date", { ascending: false })
        .order("same_day_order", { ascending: true });

    if (error) {
        return <main>ライブ一覧の取得に失敗した: {error.message}</main>;
    }

    return (
        <main className="space-y-6">
            <div className="flex items-center justify-between gap-4">
                <div>
                    <p className="text-sm font-semibold text-pink-300">Admin / Lives</p>
                    <h1 className="mt-2 text-3xl font-bold">ライブ管理</h1>
                    <p className="mt-2 text-sm text-zinc-400">
                        ライブ履歴の確認・編集を行う。
                    </p>
                </div>

                <Link
                    href="/admin/lives/new"
                    className="rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white hover:bg-pink-400"
                >
                    新規追加
                </Link>
            </div>

            <section className="space-y-3">
                {lives?.length === 0 && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
                        まだライブが登録されていない。
                    </div>
                )}

                {lives?.map((live) => {
                    const venue = live.venues?.[0];

                    return (
                        <Link
                            key={live.id}
                            href={`/admin/lives/${live.id}/edit`}
                            className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-pink-400/60"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-pink-300">
                                        {live.live_date}
                                        {live.same_day_order > 1 && ` / ${live.same_day_order}部`}
                                    </p>

                                    <h2 className="mt-1 text-xl font-bold">
                                        {live.event_name}
                                    </h2>

                                    <p className="mt-2 text-sm text-zinc-400">
                                        {venue?.name ?? "会場未登録"}
                                        {venue?.area && ` / ${venue.area}`}
                                    </p>

                                    {live.memo && (
                                        <p className="mt-2 text-sm text-zinc-500">
                                            {live.memo}
                                        </p>
                                    )}
                                </div>

                                <span className="w-fit rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                                    編集
                                </span>
                            </div>
                        </Link>
                    );
                })}
            </section>
        </main>
    );
}