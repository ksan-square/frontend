import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Song } from "@/types";

export default async function SongsPage() {
    const { data, error } = await supabase
        .from("songs")
        .select("id,title,slug,description,release_date,lyricist,composer,arranger")
        .order("title");

    if (error) {
        return <main>曲一覧の取得に失敗しました: {error.message}</main>;
    }

    const songs = data as Song[];

    return (
        <main className="space-y-8">
            <section>
                <p className="text-sm font-semibold text-pink-300">Songs</p>
                <h1 className="mt-2 text-3xl font-bold">曲一覧</h1>
                <p className="mt-3 text-zinc-400">
                    歌割・コール・作詞作曲情報を確認できます。
                </p>
            </section>

            <section className="grid gap-4">
                {songs.map((song) => (
                    <Link
                        key={song.id}
                        href={`/songs/${song.slug}`}
                        className="group rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-pink-400/60"
                    >
                        <h2 className="text-xl font-bold group-hover:text-pink-300">
                            {song.title}
                        </h2>

                        {song.description && (
                            <p className="mt-2 text-sm text-zinc-400">{song.description}</p>
                        )}

                        <div className="mt-3 flex flex-wrap gap-2 text-xs text-zinc-400">
                            {song.lyricist && <span>作詞: {song.lyricist}</span>}
                            {song.composer && <span>作曲: {song.composer}</span>}
                            {song.arranger && <span>編曲: {song.arranger}</span>}
                        </div>
                    </Link>
                ))}
            </section>
        </main>
    );
}