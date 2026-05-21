"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteSong, updateSong } from "@/lib/admin-api";

type Song = {
    id: string;
    title: string;
    slug: string;
    order_no: number;
    description: string | null;
    release_date: string | null;
    lyricist: string | null;
    composer: string | null;
    arranger: string | null;
};

export default function SongEditForm({ song }: { song: Song }) {
    const router = useRouter();

    const [title, setTitle] = useState(song.title);
    const [slug, setSlug] = useState(song.slug);
    const [orderNo, setOrderNo] = useState(song.order_no);
    const [description, setDescription] = useState(song.description ?? "");
    const [releaseDate, setReleaseDate] = useState(song.release_date ?? "");
    const [lyricist, setLyricist] = useState(song.lyricist ?? "");
    const [composer, setComposer] = useState(song.composer ?? "");
    const [arranger, setArranger] = useState(song.arranger ?? "");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            await updateSong(song.id, {
                title,
                slug,
                order_no: orderNo,
                description: description || null,
                release_date: releaseDate || null,
                lyricist: lyricist || null,
                composer: composer || null,
                arranger: arranger || null,
            })
            alert("更新しました。");
            setMessage("更新しました。");
            router.refresh();
        } catch (error) {
            const message = error instanceof Error ? error.message : "更新失敗";
            alert(`更新失敗: ${message}`);
            setMessage(`更新失敗: ${message}`);
            return;
        }
    }

    async function handleDelete() {
        const ok = confirm("曲を削除しますか？");
        if (!ok) {
            return;
        }

        try {
            await deleteSong(song.id);
        } catch (error) {
            const message = error instanceof Error ? error.message : "削除失敗";
            alert(`削除失敗: ${message}`);
            return;
        }

        alert("曲を削除しました。");
        router.push("/admin/songs");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" type="number" min={1} value={orderNo} onChange={(e) => setOrderNo(Number(e.target.value))} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="作詞者" value={lyricist} onChange={(e) => setLyricist(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="作曲者" value={composer} onChange={(e) => setComposer(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="編曲者" value={arranger} onChange={(e) => setArranger(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" value={description} onChange={(e) => setDescription(e.target.value)} />

            <div className="flex gap-2">
                <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">
                    更新
                </button>
                <button type="button" onClick={handleDelete} className="rounded-full bg-red-500 px-5 py-3 font-bold text-white">
                    削除
                </button>
            </div>

            {message && <p>{message}</p>}
        </form>
    );
}
