"use client";

import { useState } from "react";
import { getCurrentUserId } from "@/lib/current-user";
import { supabase } from "@/lib/supabase";

type Live = {
    id: string;
    live_date: string;
    event_name: string;
};

type Song = {
    id: string;
    title: string;
};

type Props = {
    lives: Live[];
    songs: Song[];
};

export default function SetlistForm({ lives, songs }: Props) {
    const [liveId, setLiveId] = useState("");
    const [songId, setSongId] = useState("");
    const [orderNo, setOrderNo] = useState(1);
    const [note, setNote] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const userId = await getCurrentUserId();

        const { error } = await supabase.from("setlist_items").insert({
            live_id: liveId,
            song_id: songId,
            order_no: orderNo,
            note: note || null,
            is_delete: false,
            created_user: userId,
            updated_user: userId,
        });

        if (error) {
            setMessage(`登録失敗: ${error.message}`);
            return;
        }

        setOrderNo(orderNo + 1);
        setSongId("");
        setNote("");
        setMessage("セトリを追加した。");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <select className="w-full rounded-xl bg-zinc-950 p-3" value={liveId} onChange={(e) => setLiveId(e.target.value)}>
                <option value="">ライブを選択</option>
                {lives.map((live) => (
                    <option key={live.id} value={live.id}>
                        {live.live_date} {live.event_name}
                    </option>
                ))}
            </select>

            <select className="w-full rounded-xl bg-zinc-950 p-3" value={songId} onChange={(e) => setSongId(e.target.value)}>
                <option value="">曲を選択</option>
                {songs.map((song) => (
                    <option key={song.id} value={song.id}>{song.title}</option>
                ))}
            </select>

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="number" value={orderNo} onChange={(e) => setOrderNo(Number(e.target.value))} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="備考 例: SE / MC後 / アンコール" value={note} onChange={(e) => setNote(e.target.value)} />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">追加</button>
            {message && <p className="text-sm text-zinc-300">{message}</p>}
        </form>
    );
}
