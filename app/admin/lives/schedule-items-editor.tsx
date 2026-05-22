"use client";

import { useState } from "react";
import {
    createLiveScheduleItem,
    deleteLiveScheduleItem,
    getAdminLiveDetailByApi,
    updateLiveScheduleItem,
} from "@/lib/admin-api";
import SetlistEditor from "./setlist-editor";

type Venue = {
    id: string;
    name: string;
    area: string | null;
};

type Song = {
    id: string;
    title: string;
};

type ScheduleItem = {
    id: string;
    live_id: string;
    order_no: number;
    schedule_kind: string;
    item_title: string | null;
    start_time: string | null;
    end_time: string | null;
    time_note: string | null;
    place_detail: string | null;
    venue: Venue | null;
    setlist_items: {
        id: string;
        order_no: number;
        note: string | null;
        song: {
            id: string;
            title: string;
            slug: string;
        } | null;
    }[];
};

type ScheduleItemPayload = {
    order_no: number;
    schedule_kind: string;
    item_title: string | null;
    start_time: string | null;
    end_time: string | null;
    time_note: string | null;
    place_detail: string | null;
    venue_id: string | null;
};

function emptyScheduleItemPayload(orderNo = 1): ScheduleItemPayload {
    return {
        order_no: orderNo,
        schedule_kind: "live",
        item_title: null,
        start_time: null,
        end_time: null,
        time_note: null,
        place_detail: null,
        venue_id: null,
    };
}

function buildPayloadFromForm(formData: FormData): ScheduleItemPayload {
    return {
        order_no: Number(formData.get("order_no")),
        schedule_kind: String(formData.get("schedule_kind")),
        item_title: formData.get("item_title") ? String(formData.get("item_title")) : null,
        start_time: formData.get("start_time") ? String(formData.get("start_time")) : null,
        end_time: formData.get("end_time") ? String(formData.get("end_time")) : null,
        time_note: formData.get("time_note") ? String(formData.get("time_note")) : null,
        place_detail: formData.get("place_detail") ? String(formData.get("place_detail")) : null,
        venue_id: formData.get("venue_id") ? String(formData.get("venue_id")) : null,
    };
}

function ScheduleItemFormFields({
    venues,
    initialData,
}: {
    venues: Venue[];
    initialData: ScheduleItemPayload;
}) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            <input
                type="number"
                name="order_no"
                min={1}
                defaultValue={initialData.order_no}
                placeholder="表示順"
                className="w-full rounded-xl bg-zinc-950 p-3"
            />

            <select
                name="schedule_kind"
                defaultValue={initialData.schedule_kind}
                className="w-full rounded-xl bg-zinc-950 p-3"
            >
                <option value="live">ライブ</option>
                <option value="meet_and_greet">Meet-and-greet</option>
            </select>

            <input
                name="item_title"
                defaultValue={initialData.item_title ?? ""}
                placeholder="枠名 例: 1部 / 終演後特典会"
                className="w-full rounded-xl bg-zinc-950 p-3 md:col-span-2"
            />

            <input
                type="time"
                name="start_time"
                defaultValue={initialData.start_time ?? ""}
                className="w-full rounded-xl bg-zinc-950 p-3"
            />

            <input
                type="time"
                name="end_time"
                defaultValue={initialData.end_time ?? ""}
                className="w-full rounded-xl bg-zinc-950 p-3"
            />

            <input
                name="time_note"
                defaultValue={initialData.time_note ?? ""}
                placeholder="時間メモ"
                className="w-full rounded-xl bg-zinc-950 p-3 md:col-span-2"
            />

            <select
                name="venue_id"
                defaultValue={initialData.venue_id ?? ""}
                className="w-full rounded-xl bg-zinc-950 p-3"
            >
                <option value="">会場未設定</option>
                {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                        {venue.name}
                        {venue.area ? ` / ${venue.area}` : ""}
                    </option>
                ))}
            </select>

            <input
                name="place_detail"
                defaultValue={initialData.place_detail ?? ""}
                placeholder="場所補足"
                className="w-full rounded-xl bg-zinc-950 p-3"
            />
        </div>
    );
}

function ScheduleItemCard({
    liveId,
    item,
    venues,
    songs,
    onUpdated,
}: {
    liveId: string;
    item: ScheduleItem;
    venues: Venue[];
    songs: Song[];
    onUpdated: () => Promise<void>;
}) {
    const [message, setMessage] = useState("");

    async function handleUpdate(formData: FormData) {
        try {
            await updateLiveScheduleItem(item.id, buildPayloadFromForm(formData));
            setMessage("更新しました。");
            await onUpdated();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "更新失敗");
        }
    }

    async function handleDelete() {
        try {
            await deleteLiveScheduleItem(item.id);
            await onUpdated();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "削除失敗");
        }
    }

    return (
        <article className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                        <h3 className="text-xl font-black text-white">
                        {item.item_title || (item.schedule_kind === "meet_and_greet" ? "Meet-and-greet" : "ライブ")}
                    </h3>
                    <p className="mt-1 text-sm text-zinc-400">
                        kind: {item.schedule_kind} / order: {item.order_no}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={handleDelete}
                    className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white"
                >
                    削除
                </button>
            </div>

            <form
                action={handleUpdate}
                className="space-y-3"
            >
                <ScheduleItemFormFields
                    venues={venues}
                    initialData={{
                        order_no: item.order_no,
                        schedule_kind: item.schedule_kind,
                        item_title: item.item_title,
                        start_time: item.start_time,
                        end_time: item.end_time,
                        time_note: item.time_note,
                        place_detail: item.place_detail,
                        venue_id: item.venue?.id ?? null,
                    }}
                />

                <div className="flex flex-wrap items-center gap-3">
                    <button className="rounded-full bg-pink-500 px-5 py-3 font-bold text-white">
                        枠を更新
                    </button>

                    {message && <p className="text-sm text-zinc-300">{message}</p>}
                </div>
            </form>

            {item.schedule_kind === "live" && (
                <SetlistEditor
                    parentLiveId={liveId}
                    scheduleItemId={item.id}
                    songs={songs}
                    initialItems={item.setlist_items.map((setlistItem) => ({
                        id: setlistItem.id,
                        order_no: setlistItem.order_no,
                        note: setlistItem.note,
                        songs: setlistItem.song
                            ? {
                                  id: setlistItem.song.id,
                                  title: setlistItem.song.title,
                              }
                            : null,
                    }))}
                    label={item.item_title || "ライブ"}
                />
            )}
        </article>
    );
}

export default function ScheduleItemsEditor({
    liveId,
    venues,
    songs,
    initialItems,
}: {
    liveId: string;
    venues: Venue[];
    songs: Song[];
    initialItems: ScheduleItem[];
}) {
    const [items, setItems] = useState(initialItems);
    const [message, setMessage] = useState("");

    async function refresh() {
        const payload = await getAdminLiveDetailByApi(liveId);
        setItems(payload.live?.schedule_items ?? []);
    }

    async function handleCreate(formData: FormData) {
        try {
            await createLiveScheduleItem(liveId, buildPayloadFromForm(formData));
            setMessage("枠を追加しました。");
            await refresh();
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "追加失敗");
        }
    }

    return (
        <section className="space-y-6">
            <article className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                <div>
                    <h2 className="text-2xl font-black text-white">時間枠を追加</h2>
                    <p className="mt-2 text-sm text-zinc-400">
                        1つのイベントに複数のライブ枠と特典会枠を紐付けられます。
                    </p>
                </div>

                <form action={handleCreate} className="space-y-3">
                    <ScheduleItemFormFields
                        venues={venues}
                        initialData={emptyScheduleItemPayload(items.length + 1)}
                    />

                    <div className="flex flex-wrap items-center gap-3">
                        <button className="rounded-full bg-pink-500 px-5 py-3 font-bold text-white">
                            枠を追加
                        </button>

                        {message && <p className="text-sm text-zinc-300">{message}</p>}
                    </div>
                </form>
            </article>

            <div className="space-y-4">
                {items.length === 0 && (
                    <p className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                        まだ時間枠がありません。先にライブ枠や特典会枠を追加してください。
                    </p>
                )}

                {items.map((item) => (
                    <ScheduleItemCard
                        key={item.id}
                        liveId={liveId}
                        item={item}
                        venues={venues}
                        songs={songs}
                        onUpdated={refresh}
                    />
                ))}
            </div>
        </section>
    );
}
