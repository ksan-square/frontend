"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function SongForm() {
    const [title, setTitle] = useState("");
    const [slug, setSlug] = useState("");
    const [description, setDescription] = useState("");
    const [releaseDate, setReleaseDate] = useState("");
    const [lyricist, setLyricist] = useState("");
    const [composer, setComposer] = useState("");
    const [arranger, setArranger] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabase.from("songs").insert({
            title,
            slug,
            description: description || null,
            release_date: releaseDate || null,
            lyricist: lyricist || null,
            composer: composer || null,
            arranger: arranger || null,
        });

        if (error) {
            setMessage(`登録失敗: ${error.message}`);
            return;
        }

        setTitle("");
        setSlug("");
        setDescription("");
        setReleaseDate("");
        setLyricist("");
        setComposer("");
        setArranger("");
        setMessage("曲を登録した。");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="曲名" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="slug 例: natsu-no-ookami" value={slug} onChange={(e) => setSlug(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" type="date" value={releaseDate} onChange={(e) => setReleaseDate(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="作詞者" value={lyricist} onChange={(e) => setLyricist(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="作曲者" value={composer} onChange={(e) => setComposer(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="編曲者" value={arranger} onChange={(e) => setArranger(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="説明" value={description} onChange={(e) => setDescription(e.target.value)} />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">登録</button>
            {message && <p className="text-sm text-zinc-300">{message}</p>}
        </form>
    );
}