import Link from "next/link";
import { supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function AdminSongsPage() {
    const { data: songs, error } = await supabase
        .from("songs")
        .select("id,title,slug,lyricist,composer,arranger")
        .order("title");

    if (error) {
        return <main>取得失敗: {error.message}</main>;
    }

    return (
        <main className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">曲管理</h1>

                <Link
                    href="/admin/songs/new"
                    className="rounded-full bg-pink-500 px-4 py-2 font-bold"
                >
                    新規追加
                </Link>
            </div>

            <section className="space-y-3">
                {songs?.map((song) => (
                    <Link
                        key={song.id}
                        href={`/admin/songs/${song.id}/edit`}
                        className="block rounded-2xl border border-zinc-800 bg-zinc-900 p-5 hover:border-pink-400"
                    >
                        <h2 className="text-xl font-bold">{song.title}</h2>
                        <p className="mt-1 text-sm text-zinc-400">slug: {song.slug}</p>
                        <p className="mt-2 text-sm text-zinc-400">
                            作詞: {song.lyricist ?? "未登録"} / 作曲: {song.composer ?? "未登録"} / 編曲: {song.arranger ?? "未登録"}
                        </p>
                    </Link>
                ))}
            </section>
        </main>
    );
}