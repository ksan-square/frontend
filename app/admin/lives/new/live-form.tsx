"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLive } from "@/lib/admin-api";

type Venue = {
    id: string;
    name: string;
    area: string | null;
};

export default function LiveForm({ venues }: { venues: Venue[] }) {
    const router = useRouter();
    const [liveDate, setLiveDate] = useState("");
    const [sameDayOrder, setSameDayOrder] = useState(1);
    const [liveStartTime, setLiveStartTime] = useState("");
    const [liveEndTime, setLiveEndTime] = useState("");
    const [benefitMeetingStartTime, setBenefitMeetingStartTime] = useState("");
    const [benefitMeetingEndTime, setBenefitMeetingEndTime] = useState("");
    const [benefitMeetingTimeNote, setBenefitMeetingTimeNote] = useState("");
    const [benefitMeetingPlaceDetail, setBenefitMeetingPlaceDetail] = useState("");
    const [eventName, setEventName] = useState("");
    const [ticketUrl, setTicketUrl] = useState("");
    const [officialXUrl, setOfficialXUrl] = useState("");
    const [venueId, setVenueId] = useState("");
    const [benefitVenueId, setBenefitVenueId] = useState("");
    const [memo, setMemo] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        try {
            const data = await createLive({
                live_date: liveDate,
                same_day_order: sameDayOrder,
                live_start_time: liveStartTime || null,
                live_end_time: liveEndTime || null,
                benefit_meeting_start_time: benefitMeetingStartTime || null,
                benefit_meeting_end_time: benefitMeetingEndTime || null,
                benefit_meeting_time_note: benefitMeetingTimeNote || null,
                benefit_meeting_place_detail: benefitMeetingPlaceDetail || null,
                event_name: eventName,
                ticket_url: ticketUrl || null,
                official_x_url: officialXUrl || null,
                venue_id: venueId || null,
                benefit_venue_id: benefitVenueId || null,
                memo: memo || null,
            })
            alert("ライブを登録しました。");
            setMessage("ライブを登録した。");
            setEventName("");
            setMemo("");
            router.refresh();
            router.push(`/admin/lives/${data.id}/edit`);
        } catch (error) {
            const message = error instanceof Error ? error.message : "登録失敗";
            alert(`登録失敗: ${message}`);
            setMessage(`登録失敗: ${message}`);
            return;
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" type="date" value={liveDate} onChange={(e) => setLiveDate(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="number" min={1} placeholder="同日順 例: 1部=1, 2部=2" value={sameDayOrder} onChange={(e) => setSameDayOrder(Number(e.target.value))} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="time" value={liveStartTime} onChange={(e) => setLiveStartTime(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="time" value={liveEndTime} onChange={(e) => setLiveEndTime(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="イベント名" value={eventName} onChange={(e) => setEventName(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="url" placeholder="チケットURL" value={ticketUrl} onChange={(e) => setTicketUrl(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="url" placeholder="公式X URL" value={officialXUrl} onChange={(e) => setOfficialXUrl(e.target.value)} />

            <select className="w-full rounded-xl bg-zinc-950 p-3" value={venueId} onChange={(e) => setVenueId(e.target.value)}>
                <option value="">会場を選択</option>
                {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                        {venue.name} {venue.area ? `/ ${venue.area}` : ""}
                    </option>
                ))}
            </select>

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="time" value={benefitMeetingStartTime} onChange={(e) => setBenefitMeetingStartTime(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="time" value={benefitMeetingEndTime} onChange={(e) => setBenefitMeetingEndTime(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="特典会時間メモ 例: 終演後特典会" value={benefitMeetingTimeNote} onChange={(e) => setBenefitMeetingTimeNote(e.target.value)} />

            <select className="w-full rounded-xl bg-zinc-950 p-3" value={benefitVenueId} onChange={(e) => setBenefitVenueId(e.target.value)}>
                <option value="">特典会会場はライブ会場と同じ</option>
                {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                        {venue.name} {venue.area ? `/ ${venue.area}` : ""}
                    </option>
                ))}
            </select>

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="特典会場所補足 例: Aブロック" value={benefitMeetingPlaceDetail} onChange={(e) => setBenefitMeetingPlaceDetail(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="メモ" value={memo} onChange={(e) => setMemo(e.target.value)} />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">登録</button>

            {message && <p>{message}</p>}
        </form>
    );
}
