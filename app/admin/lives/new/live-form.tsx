"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";
import { useRouter } from "next/navigation";

type Venue = {
    id: string;
    name: string;
    area: string | null;
};

export default function LiveForm({ venues }: { venues: Venue[] }) {
    const router = useRouter();
    const [liveDate, setLiveDate] = useState("");
    const [sameDayOrder, setSameDayOrder] = useState(1);
    const [eventName, setEventName] = useState("");
    const [venueId, setVenueId] = useState("");
    const [memo, setMemo] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabaseClient.from("lives").insert({
            live_date: liveDate,
            same_day_order: sameDayOrder,
            event_name: eventName,
            venue_id: venueId || null,
            memo: memo || null,
        });

        if (error) {
            alert(`登録失敗: ${error.message}`);
            setMessage(`登録失敗: ${error.message}`);
            return;
        }

        alert("ライブを登録しました。");
        setMessage("ライブを登録した。");
        setEventName("");
        setMemo("");
        router.refresh();
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" type="date" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="number" min={1} placeholder="同日順 例: 1部=1, 2部=2" value={sameDayOrder} onChange={(e) => setSameDayOrder(Number(e.target.value))} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="イベント名" value={eventName} onChange={(e) => setEventName(e.target.value)} />

            <select className="w-full rounded-xl bg-zinc-950 p-3" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
                <option value="">会場を選択</option>
                {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                        {venue.name} {venue.area ? `/ ${venue.area}` : ""}
                    </option>
                ))}
            </select>

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="メモ" value={memo} onChange={(e) => setMemo(e.target.value)} />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">登録</button>

            {message && <p>{message}</p>}
        </form>
    );
}
