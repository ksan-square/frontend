import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Live, SetlistItem } from "@/types";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function LiveDetailPage({ params }: Props) {
    const { id } = await params;

    const { data: liveData, error: liveError } = await supabase
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
        .eq("id", id)
        .single();

    if (liveError || !liveData) {
        return <main>ライブが見つかりませんでした。</main>;
    }

    const live = liveData as unknown as Live;

    const venue = live.venues;

    const { data: setlist, error: setlistError } = await supabase
        .from("setlist_items")
        .select(`
            id,
            order_no,
            note,
            songs (
                title,
                slug
            )
        `)
        .eq("live_id", id)
        .order("order_no");

    if (setlistError) {
        return (
            <main>
                セトリの取得に失敗しました: {setlistError.message}
            </main>
        );
    }

    const items = (setlist ?? []) as SetlistItem[];

    return (
        <main className="space-y-8">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm font-semibold text-pink-300">
                    {live.live_date}
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                    {live.event_name}
                </h1>

                <p className="mt-3 text-zinc-400">
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

                {live.memo && (
                    <p className="mt-4 text-zinc-300">
                        {live.memo}
                    </p>
                )}
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold">
                        セトリ
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                        曲名を押すと、歌割・コールページに移動できます。
                    </p>
                </div>

                {items.length === 0 && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
                        まだセトリが登録されていません。
                    </div>
                )}

                <ol className="space-y-3">
                    {items.map((item) => {
                        const song = Array.isArray(item.songs)
                            ? item.songs[0]
                            : item.songs;

                        return (
                            <li
                                key={item.id}
                                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500 font-bold text-white">
                                        {item.order_no}
                                    </span>

                                    <div>
                                        {song ? (
                                            <Link
                                                href={`/songs/${song.slug}`}
                                                className="text-lg font-bold hover:text-pink-300"
                                            >
                                                {song.title}
                                            </Link>
                                        ) : (
                                            <p className="text-lg font-bold">
                                                不明な曲
                                            </p>
                                        )}

                                        {item.note && (
                                            <p className="mt-1 text-sm text-zinc-400">
                                                {item.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </section>
        </main>
    );
}