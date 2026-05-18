import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { DEFAULT_DESCRIPTION, createDescription, joinDescriptionParts } from "@/lib/seo";
import { supabase } from "@/lib/supabase";
import type { Live, SetlistItem } from "@/types";

export const dynamic = "force-dynamic";

function formatTime(time: string | null) {
    return time ? time.slice(0, 5) : null;
}

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;

    const { data: liveData } = await supabase
        .from("lives")
        .select(`
            id,
            live_date,
            live_start_time,
            live_end_time,
            benefit_meeting_time_note,
            event_name,
            memo,
            venues!lives_venue_id_fkey (
                name,
                area
            )
        `)
        .eq("id", id)
        .eq("is_delete", false)
        .maybeSingle();

    if (!liveData) {
        return {
            title: "ライブが見つかりません",
            description: DEFAULT_DESCRIPTION,
        };
    }

    const venue = Array.isArray(liveData.venues)
        ? liveData.venues[0]
        : liveData.venues;
    const liveTimeText = liveData.live_start_time
        ? liveData.live_end_time
            ? `${formatTime(liveData.live_start_time)}-${formatTime(liveData.live_end_time)}`
            : `${formatTime(liveData.live_start_time)} 開演`
        : null;
    const description = joinDescriptionParts([
        liveData.live_date,
        liveTimeText,
        venue?.name,
        venue?.area,
        liveData.benefit_meeting_time_note,
        createDescription(liveData.memo, 80),
    ]);

    return {
        title: liveData.event_name,
        description,
        alternates: {
            canonical: `/lives/${id}`,
        },
        openGraph: {
            title: liveData.event_name,
            description,
            url: `/lives/${id}`,
        },
        twitter: {
            title: liveData.event_name,
            description,
        },
    };
}

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
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/lives", label: "ライブ" },
                    { label: live.event_name },
                ]}
            />

            <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />
                <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">
                    {isUpcoming ? "次回予定" : live.live_date}
                </p>

                <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">
                    {live.event_name}
                </h1>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <div className="surface-subtle p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-fuchsia-300">
                            ライブ予定
                        </p>
                        <p className="mt-2 text-lg font-black text-white">
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

                    <div className="surface-subtle p-4">
                        <p className="text-xs font-black uppercase tracking-wide text-fuchsia-300">
                            特典会
                        </p>
                        <p className="mt-2 text-lg font-black text-white">
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
                        className="mt-4 inline-block text-sm font-bold text-fuchsia-300 hover:underline"
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
                            className="rounded-md bg-violet-500 px-4 py-2 text-sm font-black text-white hover:bg-violet-400"
                        >
                            チケット
                        </a>
                    )}

                    {live.official_x_url && (
                        <a
                            href={live.official_x_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-black text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black"
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
                    <h2 className="text-3xl font-black text-white">
                        セトリ
                    </h2>

                    <p className="mt-2 text-sm text-zinc-400">
                        曲名を押すと、歌割・コールページに移動できます。
                    </p>
                </div>

                {items.length === 0 && (
                    <div className="surface p-6 text-zinc-400 ring-1 ring-white/10">
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
                                className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                            >
                                <div className="flex items-center gap-4">
                                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-violet-500 font-black text-white group-hover:bg-black">
                                        {item.order_no}
                                    </span>

                                    <div>
                                        {visibleSong ? (
                                            <Link
                                                href={`/songs/${visibleSong.slug}`}
                                                className="text-lg font-black text-white group-hover:text-black"
                                            >
                                                {visibleSong.title}
                                            </Link>
                                        ) : (
                                            <p className="text-lg font-black text-white group-hover:text-black">
                                                不明な曲
                                            </p>
                                        )}

                                        {item.note && (
                                            <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">
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
