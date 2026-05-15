"use client";

import { useEffect, useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import SortableSetlist from "./sortable-setlist";

type Song = {
    id: string;
    title: string;
};

type SetlistItem = {
    id: string;
    order_no: number;
    note: string | null;
    songs: {
        id: string;
        title: string;
    } | null;
};

export default function SetlistEditor({
    liveId,
    songs,
}: {
    liveId: string;
    songs: Song[];
}) {
    const [items, setItems] = useState<SetlistItem[]>([]);
    const [songId, setSongId] = useState("");
    const [note, setNote] = useState("");
    const [message, setMessage] = useState("");

    async function fetchSetlist() {
        const { data } = await supabaseClient
            .from("setlist_items")
            .select(`
                id,
                order_no,
                note,
                songs (
                    id,
                    title
                )
            `)
            .eq("live_id", liveId)
            .order("order_no");

        setItems((data ?? []) as unknown as SetlistItem[]);
    }

    useEffect(() => {
        fetchSetlist();
    }, []);

    async function handleAdd() {
        if (!songId) {
            return;
        }

        const nextOrder =
            items.length > 0
                ? Math.max(...items.map((v) => v.order_no)) + 1
                : 1;

        const { error } = await supabaseClient
            .from("setlist_items")
            .insert({
                live_id: liveId,
                song_id: songId,
                order_no: nextOrder,
                note: note || null,
            });

        if (error) {
            setMessage(error.message);
            return;
        }

        setSongId("");
        setNote("");

        await fetchSetlist();
    }

    async function handleDelete(id: string) {
        await supabaseClient
            .from("setlist_items")
            .delete()
            .eq("id", id);

        await fetchSetlist();
    }

    return (
        <section className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div>
                <h2 className="text-2xl font-bold">
                    セトリ編集
                </h2>

                <p className="mt-2 text-sm text-zinc-400">
                    曲追加・並び替え・削除を行える。
                </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-zinc-800 p-4">
                <select
                    value={songId}
                    onChange={(e) => setSongId(e.target.value)}
                    className="w-full rounded-xl bg-zinc-950 p-3"
                >
                    <option value="">
                        曲を選択
                    </option>

                    {songs.map((song) => (
                        <option
                            key={song.id}
                            value={song.id}
                        >
                            {song.title}
                        </option>
                    ))}
                </select>

                <input
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="メモ"
                    className="w-full rounded-xl bg-zinc-950 p-3"
                />

                <button
                    onClick={handleAdd}
                    className="rounded-full bg-pink-500 px-5 py-3 font-bold"
                >
                    セトリ追加
                </button>

                {message && (
                    <p className="text-sm text-red-400">
                        {message}
                    </p>
                )}
            </div>

            <SortableSetlist
                items={items}
                onDelete={handleDelete}
            />
        </section>
    );
}