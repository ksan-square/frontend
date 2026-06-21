// @boundary ISOMORPHIC (browser-safe)
// ライブデータの表示ロジック (会場名取得・スケジュール要約など)。
// Server Component / Client Component 両方から安全に使える。

type VenueLike = {
    id?: string;
    name: string;
    area: string | null;
    google_map_url?: string | null;
};

type SetlistLike = {
    id: string;
    order_no: number;
    entry_type: string;
    display_label: string;
    entry_title: string | null;
    note: string | null;
    song: {
        title: string;
        slug: string;
    } | null;
};

export type LiveScheduleItemLike = {
    id: string;
    live_id: string;
    order_no: number;
    schedule_kind: string;
    item_title: string | null;
    start_time: string | null;
    end_time: string | null;
    time_note: string | null;
    place_detail: string | null;
    venue: VenueLike | null;
    setlist_items?: SetlistLike[];
};

export type LiveEventLike = {
    id: string;
    live_date: string;
    same_day_order: number | null;
    start_time: string | null;
    end_time: string | null;
    ticket_url: string | null;
    official_x_url: string | null;
    event_name: string;
    memo: string | null;
    venue: VenueLike | null;
    place_detail: string | null;
    schedule_items: LiveScheduleItemLike[];
};

function formatTimeValue(value: string | null) {
    return value ? value.slice(0, 5) : null;
}

export function getScheduleItemLabel(item: LiveScheduleItemLike) {
    if (item.item_title) {
        return item.item_title;
    }

    return item.schedule_kind === "meet_and_greet" ? "特典会" : "ライブ";
}

export function formatScheduleTime(item: LiveScheduleItemLike) {
    if (item.time_note) {
        return item.time_note;
    }

    const startTime = formatTimeValue(item.start_time);
    const endTime = formatTimeValue(item.end_time);

    if (startTime && endTime) {
        return `${startTime}-${endTime}`;
    }

    if (startTime) {
        return item.schedule_kind === "meet_and_greet" ? `${startTime} 開始予定` : `${startTime} 開演`;
    }

    return "未定";
}

export function formatSchedulePlace(item: LiveScheduleItemLike) {
    if (item.venue?.name) {
        return `${item.venue.name}${item.venue.area ? ` / ${item.venue.area}` : ""}${item.place_detail ? ` / ${item.place_detail}` : ""}`;
    }

    return item.place_detail ?? "会場未定";
}

export function getPrimaryVenue(event: LiveEventLike) {
    return event.venue
        ?? event.schedule_items.find((item) => item.schedule_kind === "live" && item.venue)?.venue
        ?? event.schedule_items.find((item) => item.venue)?.venue
        ?? null;
}

export function getScheduleSummaryLines(event: LiveEventLike) {
    return event.schedule_items.map((item) => ({
        id: item.id,
        label: getScheduleItemLabel(item),
        timeText: formatScheduleTime(item),
        placeText:
            !item.venue && !item.place_detail
                ? null
                : item.venue?.id && event.venue?.id && item.venue.id === event.venue.id && !item.place_detail
                  ? null
                  : formatSchedulePlace(item),
        isLive: item.schedule_kind === "live",
        googleMapUrl: item.venue?.google_map_url ?? null,
        setlistItems: item.setlist_items ?? [],
    }));
}
