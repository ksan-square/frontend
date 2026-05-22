"use client";

import { useRouter } from "next/navigation";
import type { AdminLiveSummary } from "@/lib/admin-server-api";
import { updateLive } from "./actions";
import VenueCombobox from "./venue-combobox";
import { showToast } from "@/lib/toast";

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
        try {
            await updateLive(initialData.id, formData);
            showToast({ kind: "success", text: "ライブを更新しました。" });
            router.refresh();
            router.push("/editor/lives");
        } catch (error) {
            const message = error instanceof Error ? error.message : "ライブ更新に失敗しました。";
            showToast({ kind: "error", text: message });
            return;
        }
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

            <VenueCombobox
                name="venue_id"
                initialVenue={initialData.venue}
                initialOptions={venues}
                onChange={() => undefined}
                placeholder="基準会場を検索"
            />

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

            <button className="rounded-md bg-violet-500 px-5 py-2.5 text-sm font-black text-white hover:bg-violet-400">
                更新
            </button>
        </form>
    );
}
