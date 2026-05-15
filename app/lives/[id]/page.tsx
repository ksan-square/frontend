import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { supabase } from "@/lib/supabase";
import type { Live, SetlistItem } from "@/types";

export const dynamic = "force-dynamic";

function formatTime(time: string | null) {
    return time ? time.slice(0, 5) : null;
}

type Props = {
    params: Promise<{ id: string }>;
};

export default async function LiveDetailPage({ params }: Props) {
    const { id } = await params;
    const today = new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).format(new Date());

    const { data: liveData, error: liveError } = await supabase
        .from("lives")
        .select(`
            id,
            live_date,
            same_day_order,
            live_start_time,
            live_end_time,
            benefit_meeting_start_time,
            benefit_meeting_end_time,
            benefit_meeting_time_note,
            benefit_meeting_place_detail,
            ticket_url,
            official_x_url,
            event_name,
            memo,
            venues!lives_venue_id_fkey (
                id,
                name,
                area,
                google_map_url
            ),
            benefit_venue:venues!lives_benefit_venue_id_fkey (
                id,
                name,
                area,
                google_map_url
            )
        `)
        .eq("id", id)
        .eq("is_delete", false)
        .single();

    if (liveError || !liveData) {
        return <main>ライブが見つかりませんでした。</main>;
    }

    const live = liveData as unknown as Live;

    const venue = live.venues;
    const benefitVenue = live.benefit_venue ?? venue;
    const isUpcoming = live.live_date >= today;
    const liveStartTime = formatTime(live.live_start_time);
    const liveEndTime = formatTime(live.live_end_time);
    const benefitStartTime = formatTime(live.benefit_meeting_start_time);
    const benefitEndTime = formatTime(live.benefit_meeting_end_time);
    const benefitPlaceText = benefitVenue?.name
        ? `${benefitVenue.name}${benefitVenue.area ? ` / ${benefitVenue.area}` : ""}${live.benefit_meeting_place_detail ? ` / ${live.benefit_meeting_place_detail}` : ""}`
        : live.benefit_meeting_place_detail ?? "会場未定";
    const liveTimeText = liveStartTime
        ? liveEndTime
            ? `${liveStartTime}-${liveEndTime}`
            : `${liveStartTime} 開演`
        : "時間未定";
    const benefitTimeText = live.benefit_meeting_time_note
        ? live.benefit_meeting_time_note
        : benefitStartTime
        ? benefitEndTime
            ? `${benefitStartTime}-${benefitEndTime}`
            : `${benefitStartTime} 開始予定`
        : "未定";

    const { data: setlist, error: setlistError } = await supabase
        .from("setlist_items")
        .select(`
            id,
            order_no,
            note,
            songs (
                title,
                slug,
                is_delete
            )
        `)
        .eq("live_id", id)
        .eq("is_delete", false)
        .order("order_no");

    if (setlistError) {
        return (
            <main>
                セトリの取得に失敗しました: {setlistError.message}
            </main>
        );
    }

    const items = (setlist ?? []) as SetlistItem[];

    return (
        <main className="space-y-8">
            <Breadcrumbs
                items={[
                    { href: "/lives", label: "ライブ" },
                    { label: live.event_name },
                ]}
            />

            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm font-semibold text-pink-300">
                    {isUpcoming ? "次回予定" : live.live_date}
                </p>

                <h1 className="mt-2 text-3xl font-bold">
                    {live.event_name}
                </h1>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            ライブ予定
                        </p>
                        <p className="mt-2 text-lg font-bold">
                            {live.live_date}
                        </p>
                        <p className="mt-1 text-sm text-zinc-400">
                            {liveTimeText}
                        </p>
                        <p className="mt-3 text-sm text-zinc-300">
                            {venue?.name ?? "会場未登録"}
                            {venue?.area && ` / ${venue.area}`}
                        </p>
                    </div>

                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                            特典会
                        </p>
                        <p className="mt-2 text-lg font-bold">
                            {benefitTimeText}
                        </p>
                        <p className="mt-1 text-sm text-zinc-300">
                            {benefitPlaceText}
                        </p>
                    </div>
                </div>

                {venue?.google_map_url && (
                    <a
                        href={venue.google_map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-sm font-semibold text-pink-300 hover:underline"
                    >
                        Google Mapで見る
                    </a>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                    {live.ticket_url && (
                        <a
                            href={live.ticket_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white"
                        >
                            チケット
                        </a>
                    )}

                    {live.official_x_url && (
                        <a
                            href={live.official_x_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-full bg-zinc-800 px-4 py-2 text-sm font-bold text-zinc-100"
                        >
                            公式X
                        </a>
                    )}
                </div>

                {live.memo && (
                    <p className="mt-4 text-zinc-300">
                        {live.memo}
                    </p>
                )}
            </section>

            <section className="space-y-4">
                <div>
                    <h2 className="text-2xl font-bold">
                        セトリ
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                        曲名を押すと、歌割・コールページに移動できます。
                    </p>
                </div>

                {items.length === 0 && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
                        {isUpcoming
                            ? "セトリはライブ後に追加予定です。"
                            : "まだセトリが登録されていません。"}
                    </div>
                )}

                <ol className="space-y-3">
                    {items.map((item) => {
                        const song = Array.isArray(item.songs)
                            ? item.songs[0]
                            : item.songs;
                        const visibleSong =
                            song && !song.is_delete ? song : null;

                        return (
                            <li
                                key={item.id}
                                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-pink-500 font-bold text-white">
                                        {item.order_no}
                                    </span>

                                    <div>
                                        {visibleSong ? (
                                            <Link
                                                href={`/songs/${visibleSong.slug}`}
                                                className="text-lg font-bold hover:text-pink-300"
                                            >
                                                {visibleSong.title}
                                            </Link>
                                        ) : (
                                            <p className="text-lg font-bold">
                                                不明な曲
                                            </p>
                                        )}

                                        {item.note && (
                                            <p className="mt-1 text-sm text-zinc-400">
                                                {item.note}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ol>
            </section>
        </main>
    );
}
