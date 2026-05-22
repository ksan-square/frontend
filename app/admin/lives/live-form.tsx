"use client";

import { useRouter } from "next/navigation";
import type { AdminLiveSummary } from "@/lib/admin-server-api";
import { updateLive } from "./actions";

type LiveFormProps = {
    initialData: AdminLiveSummary;
    venues: {
        id: string;
        name: string;
        area: string | null;
    }[];
};

export default function LiveForm({ initialData, venues }: LiveFormProps) {
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
                name="event_name"
                defaultValue={initialData?.event_name ?? ""}
                placeholder="イベント名"
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <select
                name="venue_id"
                defaultValue={initialData.venue?.id ?? ""}
                className="w-full rounded-xl bg-zinc-900 p-3"
            >
                <option value="">基準会場を未設定</option>
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
                placeholder="親ライブの場所補足 例: メインステージ"
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
