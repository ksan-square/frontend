"use client";

import { useRouter } from "next/navigation";
import { updateLive } from "./actions";

export default function LiveForm({ venues, initialData }: any) {
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        await updateLive(initialData.id, formData);

        alert("ライブを更新しました。");
        router.refresh();
        router.push("/admin/lives");
    }

    return (
        <form action={handleSubmit} className="space-y-4">
            <input
                type="date"
                name="live_date"
                defaultValue={initialData?.live_date ?? ""}
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                type="number"
                name="same_day_order"
                defaultValue={initialData?.same_day_order ?? 1}
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                type="time"
                name="live_start_time"
                defaultValue={initialData?.live_start_time ?? ""}
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                type="time"
                name="live_end_time"
                defaultValue={initialData?.live_end_time ?? ""}
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                name="event_name"
                defaultValue={initialData?.event_name ?? ""}
                placeholder="イベント名"
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                name="ticket_url"
                type="url"
                defaultValue={initialData?.ticket_url ?? ""}
                placeholder="チケットURL"
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                name="official_x_url"
                type="url"
                defaultValue={initialData?.official_x_url ?? ""}
                placeholder="公式X URL"
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <select
                name="venue_id"
                defaultValue={initialData?.venue_id ?? ""}
                className="w-full rounded-xl bg-zinc-900 p-3"
            >
                <option value="">会場を選択</option>

                {venues.map((venue: any) => (
                    <option key={venue.id} value={venue.id}>
                        {venue.name}
                    </option>
                ))}
            </select>

            <input
                type="time"
                name="benefit_meeting_start_time"
                defaultValue={initialData?.benefit_meeting_start_time ?? ""}
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                type="time"
                name="benefit_meeting_end_time"
                defaultValue={initialData?.benefit_meeting_end_time ?? ""}
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                name="benefit_meeting_time_note"
                defaultValue={initialData?.benefit_meeting_time_note ?? ""}
                placeholder="特典会時間メモ 例: 終演後特典会"
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <select
                name="benefit_venue_id"
                defaultValue={initialData?.benefit_venue_id ?? ""}
                className="w-full rounded-xl bg-zinc-900 p-3"
            >
                <option value="">特典会会場はライブ会場と同じ</option>

                {venues.map((venue: any) => (
                    <option key={venue.id} value={venue.id}>
                        {venue.name}
                    </option>
                ))}
            </select>

            <input
                name="benefit_meeting_place_detail"
                defaultValue={initialData?.benefit_meeting_place_detail ?? ""}
                placeholder="特典会場所補足 例: Aブロック"
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <textarea
                name="memo"
                defaultValue={initialData?.memo ?? ""}
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <button className="rounded-full bg-pink-500 px-5 py-3">
                更新
            </button>
        </form>
    );
}
