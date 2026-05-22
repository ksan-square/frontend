"use client";

import { useCallback, useMemo, useState } from "react";
import SortableSetlist from "./sortable-setlist";
import {
    addSetlistItem,
    deleteSetlistItem,
    getAdminLiveDetailByApi,
    updateSetlistItem,
} from "@/lib/admin-api";

type Song = {
    id: string;
    title: string;
};

type SetlistItem = {
    id: string;
    order_no: number;
    entry_type: "song" | "talk" | "photo_time" | "other";
    display_label: string;
    entry_title: string | null;
    note: string | null;
    song: {
        id: string;
        title: string;
    } | null;
};

type DraftItem = {
    entry_type: "song" | "talk" | "photo_time" | "other";
    display_label: string;
    entry_title: string;
    song_id: string;
    note: string;
};

function createEmptyDraft(nextIndex: number): DraftItem {
    return {
        entry_type: "song",
        display_label: `M${nextIndex}`,
        entry_title: "",
        song_id: "",
        note: "",
    };
}

function getEntryTypeLabel(entryType: DraftItem["entry_type"]) {
    switch (entryType) {
        case "song":
            return "曲";
        case "talk":
            return "MC";
        case "photo_time":
            return "写真撮影タイム";
        default:
            return "その他";
    }
}

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
    const [draft, setDraft] = useState<DraftItem>(createEmptyDraft(initialItems.length + 1));
    const [message, setMessage] = useState("");

    const nextDraftIndex = useMemo(() => items.length + 1, [items.length]);

    const fetchSetlist = useCallback(async () => {
        try {
            const payload = await getAdminLiveDetailByApi(parentLiveId);
            const targetItem = payload.live?.schedule_items.find((item) => item.id === scheduleItemId);
            const nextItems = (targetItem?.setlist_items ?? []).map((item) => ({
                id: item.id,
                order_no: item.order_no,
                entry_type: item.entry_type as SetlistItem["entry_type"],
                display_label: item.display_label,
                entry_title: item.entry_title,
                note: item.note,
                song: item.song
                    ? {
                          id: item.song.id,
                          title: item.song.title,
                      }
                    : null,
            }));
            setItems(nextItems);
            setDraft((current) => {
                const fallback = createEmptyDraft(nextItems.length + 1);
                return current.display_label ? current : fallback;
            });
            setMessage("");
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "取得失敗");
        }
    }, [parentLiveId, scheduleItemId]);

    async function handleAdd() {
        if (!draft.display_label.trim()) {
            setMessage("表示番号を入力してください。");
            return;
        }
        if (draft.entry_type === "song" && !draft.song_id) {
            setMessage("曲を選択してください。");
            return;
        }

        try {
            await addSetlistItem(scheduleItemId, {
                entry_type: draft.entry_type,
                display_label: draft.display_label.trim(),
                entry_title: draft.entry_type === "song" ? null : (draft.entry_title.trim() || null),
                song_id: draft.entry_type === "song" ? draft.song_id : null,
                note: draft.note.trim() || null,
            });
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "追加失敗");
            return;
        }

        setDraft(createEmptyDraft(nextDraftIndex + 1));
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

    async function handleUpdate(item: SetlistItem, values: DraftItem) {
        if (!values.display_label.trim()) {
            setMessage("表示番号を入力してください。");
            return;
        }
        if (values.entry_type === "song" && !values.song_id) {
            setMessage("曲を選択してください。");
            return;
        }

        try {
            await updateSetlistItem(item.id, {
                entry_type: values.entry_type,
                display_label: values.display_label.trim(),
                entry_title: values.entry_type === "song" ? null : (values.entry_title.trim() || null),
                song_id: values.entry_type === "song" ? values.song_id : null,
                note: values.note.trim() || null,
            });
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "更新失敗");
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
                    `M1`、`MC1`、`E1` のような表示番号と、曲以外の進行項目を登録できます。
                </p>
            </div>

            <div className="space-y-3 rounded-2xl border border-zinc-800 p-4">
                <div className="grid gap-3 md:grid-cols-2">
                    <select
                        value={draft.entry_type}
                        onChange={(event) =>
                            setDraft((current) => ({
                                ...current,
                                entry_type: event.target.value as DraftItem["entry_type"],
                                entry_title: event.target.value === "photo_time" ? "写真撮影タイム" : current.entry_title,
                            }))
                        }
                        className="w-full rounded-xl bg-zinc-950 p-3"
                    >
                        <option value="song">曲</option>
                        <option value="talk">MC</option>
                        <option value="photo_time">写真撮影タイム</option>
                        <option value="other">その他</option>
                    </select>

                    <input
                        value={draft.display_label}
                        onChange={(event) => setDraft((current) => ({ ...current, display_label: event.target.value }))}
                        placeholder="表示番号 例: M1 / MC1 / E1"
                        className="w-full rounded-xl bg-zinc-950 p-3"
                    />

                    {draft.entry_type === "song" ? (
                        <select
                            value={draft.song_id}
                            onChange={(event) => setDraft((current) => ({ ...current, song_id: event.target.value }))}
                            className="w-full rounded-xl bg-zinc-950 p-3 md:col-span-2"
                        >
                            <option value="">曲を選択</option>
                            {songs.map((song) => (
                                <option key={song.id} value={song.id}>
                                    {song.title}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            value={draft.entry_title}
                            onChange={(event) => setDraft((current) => ({ ...current, entry_title: event.target.value }))}
                            placeholder={`${getEntryTypeLabel(draft.entry_type)}の表示名。空ならラベルだけ表示`}
                            className="w-full rounded-xl bg-zinc-950 p-3 md:col-span-2"
                        />
                    )}

                    <input
                        value={draft.note}
                        onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
                        placeholder="メモ"
                        className="w-full rounded-xl bg-zinc-950 p-3 md:col-span-2"
                    />
                </div>

                <button
                    onClick={handleAdd}
                    className="rounded-full bg-pink-500 px-5 py-3 font-bold"
                >
                    項目を追加
                </button>

                {message && (
                    <p className="text-sm text-red-400">
                        {message}
                    </p>
                )}
            </div>

            <SortableSetlist
                key={JSON.stringify(items.map((item) => ({
                    id: item.id,
                    order_no: item.order_no,
                    entry_type: item.entry_type,
                    display_label: item.display_label,
                    entry_title: item.entry_title,
                    note: item.note,
                    songId: item.song?.id ?? null,
                })))}
                items={items}
                songs={songs}
                onDelete={handleDelete}
                onUpdate={handleUpdate}
                onError={setMessage}
                liveId={scheduleItemId}
            />
        </section>
    );
}
