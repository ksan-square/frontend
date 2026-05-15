"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

export default function LiveForm({
    venues,
    initialData,
}: any) {
    const router = useRouter();

    const [liveDate, setLiveDate] = useState(
        initialData?.live_date ?? ""
    );

    const [sameDayOrder, setSameDayOrder] = useState(
        initialData?.same_day_order ?? 1
    );

    const [eventName, setEventName] = useState(
        initialData?.event_name ?? ""
    );

    const [venueId, setVenueId] = useState(
        initialData?.venue_id ?? ""
    );

    const [memo, setMemo] = useState(
        initialData?.memo ?? ""
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const payload = {
            live_date: liveDate,
            same_day_order: sameDayOrder,
            event_name: eventName,
            venue_id: venueId || null,
            memo: memo || null,
        };

        if (initialData?.id) {
            await supabaseClient
                .from("lives")
                .update(payload)
                .eq("id", initialData.id);
        } else {
            await supabaseClient
                .from("lives")
                .insert(payload);
        }

        router.push("/admin/lives");
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
        >
            <input
                type="date"
                value={liveDate}
                onChange={(e) =>
                    setLiveDate(e.target.value)
                }
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                type="number"
                value={sameDayOrder}
                onChange={(e) =>
                    setSameDayOrder(Number(e.target.value))
                }
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <input
                value={eventName}
                onChange={(e) =>
                    setEventName(e.target.value)
                }
                placeholder="イベント名"
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <select
                value={venueId}
                onChange={(e) =>
                    setVenueId(e.target.value)
                }
                className="w-full rounded-xl bg-zinc-900 p-3"
            >
                <option value="">
                    会場を選択
                </option>

                {venues.map((venue: any) => (
                    <option
                        key={venue.id}
                        value={venue.id}
                    >
                        {venue.name}
                    </option>
                ))}
            </select>

            <textarea
                value={memo}
                onChange={(e) =>
                    setMemo(e.target.value)
                }
                className="w-full rounded-xl bg-zinc-900 p-3"
            />

            <button className="rounded-full bg-pink-500 px-5 py-3">
                {initialData ? "更新" : "登録"}
            </button>
        </form>
    );
}