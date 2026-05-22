"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSong } from "@/lib/admin-api";
import { showToast } from "@/lib/toast";

export default function SongForm() {
    const router = useRouter();
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [songIndex, setSongIndex] = useState("");
    const [orderNo, setOrderNo] = useState(1);
    const [description, setDescription] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [lyricist, setLyricist] = useState("");
    const [composer, setComposer] = useState("");
    const [arranger, setArranger] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const data = await createSong({
                title,
                slug,
                song_index: songIndex,
                order_no: orderNo,
                description: description || null,
                release_date: releaseDate || null,
                lyricist: lyricist || null,
                composer: composer || null,
                arranger: arranger || null,
            });
            showToast({ kind: "success", text: "曲を登録しました。" });
            router.refresh();
            router.push(`/editor/songs/${data.id}/edit`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "登録失敗";
            showToast({ kind: "error", text: `登録失敗: ${message}` });
            setMessage(`登録失敗: ${message}`);
            return;
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="曲名" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="slug 例: natsu-no-ookami" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="一覧インデックス 例: あ / A / 数字" value={songIndex} onChange={(e) => setSongIndex(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" type="number" min={1} placeholder="表示順" value={orderNo} onChange={(e) => setOrderNo(Number(e.target.value))} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="作詞者" value={lyricist} onChange={(e) => setLyricist(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="作曲者" value={composer} onChange={(e) => setComposer(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="編曲者" value={arranger} onChange={(e) => setArranger(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="説明" value={description} onChange={(e) => setDescription(e.target.value)} />

            <button className="rounded-md bg-violet-500 px-5 py-2.5 text-sm font-black text-white hover:bg-violet-400">登録</button>
            {message && <p className="text-sm text-zinc-300">{message}</p>}
        </form>
    );
}
