"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

type Song = {
    id: string;
    title: string;
    slug: string;
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
    const [description, setDescription] = useState(song.description ?? "");
    const [releaseDate, setReleaseDate] = useState(song.release_date ?? "");
    const [lyricist, setLyricist] = useState(song.lyricist ?? "");
    const [composer, setComposer] = useState(song.composer ?? "");
    const [arranger, setArranger] = useState(song.arranger ?? "");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabase
            .from("songs")
            .update({
                title,
                slug,
                description: description || null,
                release_date: releaseDate || null,
                lyricist: lyricist || null,
                composer: composer || null,
                arranger: arranger || null,
            })
            .eq("id", song.id);

        if (error) {
            setMessage(`更新失敗: ${error.message}`);
            return;
        }

        setMessage("更新した。");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="作詞者" value={lyricist} onChange={(e) => setLyricist(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="作曲者" value={composer} onChange={(e) => setComposer(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="編曲者" value={arranger} onChange={(e) => setArranger(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" value={description} onChange={(e) => setDescription(e.target.value)} />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">
                更新
            </button>

            {message && <p>{message}</p>}
        </form>
    );
}