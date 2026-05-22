"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLive } from "@/lib/admin-api";
import VenueCombobox from "../venue-combobox";
import { showToast } from "@/lib/toast";

export default function LiveForm({
    venues,
}: {
    venues: {
        id: string;
        name: string;
        area: string | null;
    }[];
}) {
    const router = useRouter();
    const [liveDate, setLiveDate] = useState("");
    const [sameDayOrder, setSameDayOrder] = useState(1);
    const [eventName, setEventName] = useState("");
    const [venueId, setVenueId] = useState("");
    const [placeDetail, setPlaceDetail] = useState("");
    const [ticketUrl, setTicketUrl] = useState("");
    const [officialXUrl, setOfficialXUrl] = useState("");
    const [memo, setMemo] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!liveDate || !eventName.trim()) {
            const nextMessage = "日付とイベント名を入力してください。";
            setMessage(nextMessage);
            showToast({ kind: "error", text: nextMessage });
            return;
        }
        try {
            const data = await createLive({
                live_date: liveDate,
                same_day_order: sameDayOrder,
                event_name: eventName,
                venue_id: venueId || null,
                place_detail: placeDetail || null,
                ticket_url: ticketUrl || null,
                official_x_url: officialXUrl || null,
                memo: memo || null,
            });
            showToast({ kind: "success", text: "ライブを登録しました。" });
            setMessage("ライブを登録した。");
            setEventName("");
            setMemo("");
            router.refresh();
            router.push(`/editor/lives/${data.id}/edit`);
        } catch (error) {
            const nextMessage = error instanceof Error ? error.message : "登録失敗";
            showToast({ kind: "error", text: nextMessage });
            setMessage(`登録失敗: ${nextMessage}`);
            return;
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" type="date" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="number" min={1} placeholder="同日順 例: 1部=1, 2部=2" value={sameDayOrder} onChange={(e) => setSameDayOrder(Number(e.target.value))} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="イベント名" value={eventName} onChange={(e) => setEventName(e.target.value)} />

            <VenueCombobox
                initialOptions={venues}
                onChange={(venue) => setVenueId(venue?.id ?? "")}
                placeholder="基準会場を検索"
            />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="親ライブの場所補足 例: メインステージ" value={placeDetail} onChange={(e) => setPlaceDetail(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="url" placeholder="チケットURL" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="url" placeholder="公式X URL" value={officialXUrl} onChange={(e) => setOfficialXUrl(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="メモ" value={memo} onChange={(e) => setMemo(e.target.value)} />

            <button className="rounded-md bg-violet-500 px-5 py-2.5 text-sm font-black text-white hover:bg-violet-400">登録</button>

            {message && <p>{message}</p>}
        </form>
    );
}
