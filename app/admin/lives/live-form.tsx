"use client";

import { useRouter } from "next/navigation";
import { updateLive } from "./actions";

export default function LiveForm({ venues, initialData }: any) {
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        await updateLive(initialData.id, formData);

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
                name="event_name"
                defaultValue={initialData?.event_name ?? ""}
                placeholder="イベント名"
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