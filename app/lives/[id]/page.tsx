import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { SetlistItem } from "@/types";

type Props = {
    params: Promise<{ id: string }>;
};

export default async function LiveDetailPage({ params }: Props) {
    const { id } = await params;

    const { data: live, error: liveError } = await supabase
        .from("lives")
        .select("id,live_date,event_name,venue,area,memo")
        .eq("id", id)
        .single();

    if (liveError || !live) {
        return <main>ライブが見つかりませんでした。</main>;
    }

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
        return <main>セトリの取得に失敗しました: {setlistError.message}</main>;
    }

    const items = (setlist ?? []) as SetlistItem[];

    return (
        <main className="space-y-8">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm font-semibold text-pink-300">
                    {live.live_date}
                </p>

                <h1 className="mt-2 text-3xl font-bold">{live.event_name}</h1>

                <p className="mt-3 text-zinc-400">
                    {live.venue ?? "会場未登録"}
                    {live.area && ` / ${live.area}`}
                </p>

                {live.memo && <p className="mt-4 text-zinc-300">{live.memo}</p>}
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold">セトリ</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        曲名を押すと、歌割・コールページに移動できますっｓ。
                    </p>
                </div>

                {items.length === 0 && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
                        まだセトリが登録されていません。
                    </div>
                )}

                <ol className="space-y-3">
                    {items.map((item) => {
                        const song = item.songs?.[0];

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
                                            <p className="text-lg font-bold">不明な曲</p>
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