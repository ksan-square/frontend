import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Live } from "@/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function LivesPage() {
    const { data, error } = await supabase
        .from("lives")
        .select(`
        id,
        live_date,
        event_name,
        memo,
        venues!lives_venue_id_fkey (
            id,
            name,
            area,
            google_map_url
        )
    `)
        .order("live_date", { ascending: false });


    if (error) {
        return (
            <main>
                ライブ履歴の取得に失敗しました: {error.message}
            </main>
        );
    }

    const lives = data as unknown as Live[];

    return (
        <main className="space-y-8">
            <section>
                <p className="text-sm font-semibold text-pink-300">
                    Lives
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                    ライブ履歴
                </h1>

                <p className="mt-3 text-zinc-400">
                    日付・会場・イベントごとにセトリを確認できます。
                </p>
            </section>

            <section className="space-y-4">
                {lives.length === 0 && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
                        まだライブ履歴が登録されていません。
                    </div>
                )}

                {lives.map((live) => {
                    const venue = live.venues;

                    return (
                        <div
                            key={live.id}
                            className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-pink-400/60"
                        >
                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-pink-300">
                                        {live.live_date}
                                    </p>

                                    <h2 className="mt-1 text-xl font-bold">
                                        {live.event_name}
                                    </h2>

                                    <p className="mt-2 text-sm text-zinc-400">
                                        {venue?.name ?? "会場未登録"}
                                        {venue?.area && ` / ${venue.area}`}
                                    </p>

                                    {venue?.google_map_url && (
                                        <a
                                            href={venue.google_map_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="mt-2 inline-block text-sm font-semibold text-pink-300 hover:underline"
                                        >
                                            Google Mapで見る
                                        </a>
                                    )}
                                </div>

                                <Link
                                    href={`/lives/${live.id}`}
                                    className="w-fit rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300 hover:bg-pink-500 hover:text-white"
                                >
                                    セトリを見る
                                </Link>
                            </div>
                        </div>
                    );
                })}
            </section>
        </main>
    );
}