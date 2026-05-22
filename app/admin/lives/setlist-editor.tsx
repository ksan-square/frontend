"use client";

import { useCallback, useState } from "react";
import SortableSetlist from "./sortable-setlist";
import {
    addSetlistItem,
    deleteSetlistItem,
    getAdminLiveDetailByApi,
} from "@/lib/admin-api";

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
    parentLiveId,
    scheduleItemId,
    songs,
    initialItems,
    label,
}: {
    parentLiveId: string;
    scheduleItemId: string;
    songs: Song[];
    initialItems: SetlistItem[];
    label?: string;
}) {
    const [items, setItems] = useState<SetlistItem[]>(initialItems);
    const [songId, setSongId] = useState("");
    const [note, setNote] = useState("");
    const [message, setMessage] = useState("");

    const fetchSetlist = useCallback(async () => {
        try {
            const payload = await getAdminLiveDetailByApi(parentLiveId);
            const targetItem = payload.live?.schedule_items.find((item) => item.id === scheduleItemId);
            const nextItems = (targetItem?.setlist_items ?? []).map((item) => ({
                id: item.id,
                order_no: item.order_no,
                note: item.note,
                songs: item.song
                    ? {
                          id: "",
                          title: item.song.title,
                      }
                    : null,
            }));
            setItems(nextItems);
            setMessage("");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "取得失敗");
        }
    }, [parentLiveId, scheduleItemId]);

    async function handleAdd() {
        if (!songId) {
            return;
        }

        try {
            await addSetlistItem(scheduleItemId, {
                song_id: songId,
                note: note || null,
            });
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "追加失敗");
            return;
        }

        setSongId("");
        setNote("");

        await fetchSetlist();
    }

    async function handleDelete(id: string) {
        try {
            await deleteSetlistItem(id);
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "削除失敗");
            return;
        }

        await fetchSetlist();
    }

    return (
        <section className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div>
                <h2 className="text-2xl font-bold">
                    {label ? `${label} のセトリ編集` : "セトリ編集"}
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
                key={items.map((item) => item.id).join(",")}
                items={items}
                onDelete={handleDelete}
                onError={setMessage}
                liveId={scheduleItemId}
            />
        </section>
    );
}
