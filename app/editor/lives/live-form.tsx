"use client";

import { useRouter } from "next/navigation";
// @boundary-exception: type-only import from SERVER ONLY file.
// admin-server-api.ts は Server Component 専用だが、型定義は build 時に消えるため安全。
// 実装 import (関数・変数) は絶対に追加しないこと — 実行時エラーになる。
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

            <div className="space-y-1">
                <p className="text-xs font-black uppercase tracking-wide text-zinc-400">開場 / 開演時間</p>
                <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400">開場時間</label>
                        <input
                            type="time"
                            name="open_time"
                            defaultValue={initialData?.open_time ?? ""}
                            className="w-full rounded-xl bg-zinc-900 p-3"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-zinc-400">開演時間</label>
                        <input
                            type="time"
                            name="show_start_time"
                            defaultValue={initialData?.show_start_time ?? ""}
                            className="w-full rounded-xl bg-zinc-900 p-3"
                        />
                    </div>
                </div>
            </div>

            <button className="rounded-md bg-violet-500 px-5 py-2.5 text-sm font-black text-white hover:bg-violet-400">
                更新
            </button>
        </form>
    );
}
