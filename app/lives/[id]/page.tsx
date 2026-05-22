import type { Metadata } from "next";
import Link from "next/link";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import { formatTime, getTodayInTokyo } from "@/lib/date-time";
import { getPrimaryVenue, getScheduleSummaryLines } from "@/lib/live-utils";
import { DEFAULT_DESCRIPTION, createDescription, joinDescriptionParts } from "@/lib/seo";
import { getPublicLiveDetail } from "@/lib/public-api";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { id } = await params;
    let payload;
    try {
        payload = await getPublicLiveDetail(id);
    } catch {
        payload = null;
    }

    const liveData = payload?.live;

    if (!liveData) {
        return {
            title: "ライブが見つかりません",
            description: DEFAULT_DESCRIPTION,
        };
    }

    const primaryVenue = getPrimaryVenue(liveData);
    const liveTimeText = liveData.start_time
        ? liveData.end_time
            ? `${formatTime(liveData.start_time)}-${formatTime(liveData.end_time)}`
            : formatTime(liveData.start_time)
        : null;
    const description = joinDescriptionParts([
        liveData.live_date,
        liveTimeText,
        primaryVenue?.name,
        primaryVenue?.area,
        getScheduleSummaryLines(liveData).map((line) => `${line.label}: ${line.timeText}`).join(" / "),
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
    const today = getTodayInTokyo();
    let payload;
    try {
        payload = await getPublicLiveDetail(id);
    } catch (error) {
        return (
            <main>
                ライブの取得に失敗しました:{" "}
                {error instanceof Error ? error.message : "unknown error"}
            </main>
        );
    }

    if (!payload.found || !payload.live) {
        return (
            <main className="space-y-8">
                <Breadcrumbs
                    items={[
                        { href: "/lives", label: "ライブ" },
                        { label: "ライブが見つかりません" },
                    ]}
                />
                <section className="surface p-6 ring-1 ring-white/10 md:p-8">
                    <h1 className="text-3xl font-black text-white">
                        ライブが見つかりません
                    </h1>
                    <p className="mt-3 text-sm leading-7 text-zinc-400">
                        指定されたライブは未登録か、現在は公開されていません。
                    </p>
                    <Link
                        href="/lives"
                        className="mt-5 inline-flex rounded-sm bg-white px-4 py-2 text-sm font-black text-black hover:bg-zinc-200"
                    >
                        ライブ一覧へ戻る
                    </Link>
                </section>
            </main>
        );
    }

    const live = payload.live;
    const venue = getPrimaryVenue(live);
    const scheduleLines = getScheduleSummaryLines(live);
    const isUpcoming = live.live_date >= today;
    const liveTimeText = live.start_time
        ? live.end_time
            ? `${formatTime(live.start_time)}-${formatTime(live.end_time)}`
            : formatTime(live.start_time)
        : "時間未定";

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
                            イベント
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
                            時間枠
                        </p>
                        <div className="mt-2 space-y-2 text-sm text-zinc-300">
                            {scheduleLines.map((line) => (
                                <p key={line.id}>
                                    <span className="font-black text-white">{line.label}</span>
                                    {`: ${line.timeText}`}
                                    {line.placeText && ` / ${line.placeText}`}
                                </p>
                            ))}
                        </div>
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

                {live.schedule_items.filter((item) => item.schedule_kind === "live").length === 0 && (
                    <div className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                        ライブ枠がまだ登録されていません。
                    </div>
                )}

                {live.schedule_items
                    .filter((item) => item.schedule_kind === "live")
                    .map((item) => (
                        <section key={item.id} className="space-y-3">
                            <div>
                                <h3 className="text-xl font-black text-white">
                                    {item.item_title || "ライブ"}
                                </h3>
                                <p className="mt-1 text-sm text-zinc-400">
                                    {item.start_time ? formatTime(item.start_time) : "未定"}
                                    {item.end_time && `-${formatTime(item.end_time)}`}
                                </p>
                            </div>

                            {item.setlist_items.length === 0 && (
                                <div className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                                    {isUpcoming
                                        ? "セトリはライブ後に追加予定です。"
                                        : "まだセトリが登録されていません。"}
                                </div>
                            )}

                            <ol className="space-y-3">
                                {item.setlist_items.map((setlistItem) => {
                                    const visibleSong = setlistItem.song;

                                    return (
                                        <li
                                            key={setlistItem.id}
                                            className="group bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 hover:-translate-y-0.5 hover:bg-white"
                                        >
                                            <div className="flex items-center gap-4">
                                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-sm bg-violet-500 font-black text-white group-hover:bg-black">
                                                    {setlistItem.order_no}
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

                                                    {setlistItem.note && (
                                                        <p className="mt-1 text-sm text-zinc-400 group-hover:text-zinc-700">
                                                            {setlistItem.note}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        </section>
                    ))}
            </section>
        </main>
    );
}
