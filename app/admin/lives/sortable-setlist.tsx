"use client";

import { useState } from "react";

import {
    DndContext,
    PointerSensor,
    closestCenter,
    type DragEndEvent,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { reorderSetlist } from "@/lib/admin-api";

type Song = {
    id: string;
    title: string;
};

type Item = {
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

type DraftValues = {
    entry_type: "song" | "talk" | "photo_time" | "other";
    display_label: string;
    entry_title: string;
    song_id: string;
    note: string;
};

function getDisplayTitle(item: Item) {
    if (item.entry_type === "song") {
        return item.song?.title ?? "曲未設定";
    }
    return item.entry_title ?? item.display_label;
}

function SortableItem({
    item,
    songs,
    onDelete,
    onSave,
}: {
    item: Item;
    songs: Song[];
    onDelete: (id: string) => void;
    onSave: (item: Item, values: DraftValues) => Promise<void>;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: item.id });
    const [isEditing, setIsEditing] = useState(false);
    const [draft, setDraft] = useState<DraftValues>({
        entry_type: item.entry_type,
        display_label: item.display_label,
        entry_title: item.entry_title ?? "",
        song_id: item.song?.id ?? "",
        note: item.note ?? "",
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    async function handleSave() {
        await onSave(item, draft);
        setIsEditing(false);
    }

    return (
        <li ref={setNodeRef} style={style} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <div className="flex items-start justify-between gap-4">
                <div className="flex cursor-grab items-start gap-4" {...attributes} {...listeners}>
                    <span className="rounded-full bg-pink-500 px-3 py-1 text-sm font-bold text-white">
                        {item.display_label}
                    </span>

                    <div>
                        <p className="font-bold">{getDisplayTitle(item)}</p>
                        {item.note && <p className="text-sm text-zinc-400">{item.note}</p>}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button
                        type="button"
                        onClick={() => setIsEditing((current) => !current)}
                        className="rounded-full bg-zinc-800 px-4 py-2 text-sm"
                    >
                        {isEditing ? "閉じる" : "編集"}
                    </button>

                    <button
                        type="button"
                        onClick={() => onDelete(item.id)}
                        className="rounded-full bg-red-500 px-4 py-2 text-sm"
                    >
                        削除
                    </button>
                </div>
            </div>

            {isEditing && (
                <div className="grid gap-3 md:grid-cols-2">
                    <select
                        value={draft.entry_type}
                        onChange={(event) =>
                            setDraft((current) => ({
                                ...current,
                                entry_type: event.target.value as DraftValues["entry_type"],
                                entry_title:
                                    event.target.value === "photo_time" && !current.entry_title
                                        ? "写真撮影タイム"
                                        : current.entry_title,
                            }))
                        }
                        className="w-full rounded-xl bg-zinc-900 p-3"
                    >
                        <option value="song">曲</option>
                        <option value="talk">MC</option>
                        <option value="photo_time">写真撮影タイム</option>
                        <option value="other">その他</option>
                    </select>

                    <input
                        value={draft.display_label}
                        onChange={(event) => setDraft((current) => ({ ...current, display_label: event.target.value }))}
                        className="w-full rounded-xl bg-zinc-900 p-3"
                    />

                    {draft.entry_type === "song" ? (
                        <select
                            value={draft.song_id}
                            onChange={(event) => setDraft((current) => ({ ...current, song_id: event.target.value }))}
                            className="w-full rounded-xl bg-zinc-900 p-3 md:col-span-2"
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
                            placeholder="表示名。空ならラベルだけ表示"
                            className="w-full rounded-xl bg-zinc-900 p-3 md:col-span-2"
                        />
                    )}

                    <input
                        value={draft.note}
                        onChange={(event) => setDraft((current) => ({ ...current, note: event.target.value }))}
                        placeholder="メモ"
                        className="w-full rounded-xl bg-zinc-900 p-3 md:col-span-2"
                    />

                    <div className="md:col-span-2">
                        <button
                            type="button"
                            onClick={handleSave}
                            className="rounded-full bg-pink-500 px-5 py-3 font-bold text-white"
                        >
                            項目を更新
                        </button>
                    </div>
                </div>
            )}
        </li>
    );
}

export default function SortableSetlist({
    items,
    songs,
    onDelete,
    onUpdate,
    onError,
    liveId,
}: {
    items: Item[];
    songs: Song[];
    onDelete: (id: string) => void;
    onUpdate: (item: Item, values: DraftValues) => Promise<void>;
    onError?: (message: string) => void;
    liveId: string;
}) {
    const [localItems, setLocalItems] = useState<Item[]>(items);
    const sensors = useSensors(useSensor(PointerSensor));

    async function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;

        if (!over || active.id === over.id) {
            return;
        }

        const oldIndex = localItems.findIndex((value) => value.id === active.id);
        const newIndex = localItems.findIndex((value) => value.id === over.id);
        const reordered = arrayMove(localItems, oldIndex, newIndex);
        setLocalItems(reordered);

        try {
            await reorderSetlist(
                liveId,
                reordered.map((item, index) => ({
                    id: item.id,
                    order_no: index + 1,
                })),
            );
        } catch (error) {
            setLocalItems(localItems);
            onError?.(`並び替え失敗: ${error instanceof Error ? error.message : "unknown error"}`);
        }
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={localItems.map((value) => value.id)} strategy={verticalListSortingStrategy}>
                <ol className="space-y-3">
                    {localItems.map((item) => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            songs={songs}
                            onDelete={onDelete}
                            onSave={onUpdate}
                        />
                    ))}
                </ol>
            </SortableContext>
        </DndContext>
    );
}
