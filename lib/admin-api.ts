import { createBrowserClient } from "@supabase/ssr";

type AdminFetchInit = Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
};

type QueryValue = string | number | null | undefined;

function getApiBaseUrl() {
    return (
        process.env.FASTAPI_BASE_URL ??
        process.env.NEXT_PUBLIC_FASTAPI_BASE_URL ??
        "http://127.0.0.1:8000"
    );
}

function getBrowserSupabase() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );
}

async function getAccessToken() {
    const supabase = getBrowserSupabase();
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session?.access_token ?? null;
}

async function adminFetch<T>(path: string, init: AdminFetchInit = {}): Promise<T> {
    const token = await getAccessToken();
    if (!token) {
        throw new Error("ログインが必要です。");
    }

    const response = await fetch(new URL(path, getApiBaseUrl()), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(init.headers ?? {}),
        },
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

function buildAdminUrl(path: string, query?: Record<string, QueryValue>) {
    const url = new URL(path, getApiBaseUrl());
    Object.entries(query ?? {}).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
            return;
        }
        url.searchParams.set(key, String(value));
    });
    return url.toString();
}

async function adminFetchWithQuery<T>(
    path: string,
    query?: Record<string, QueryValue>,
    init: AdminFetchInit = {},
): Promise<T> {
    const token = await getAccessToken();
    if (!token) {
        throw new Error("ログインが必要です。");
    }

    const response = await fetch(buildAdminUrl(path, query), {
        ...init,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...(init.headers ?? {}),
        },
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
        return undefined as T;
    }

    return response.json() as Promise<T>;
}

export async function createSong(payload: {
    title: string;
    slug: string;
    song_index: string;
    order_no: number;
    description: string | null;
    release_date: string | null;
    lyricist: string | null;
    composer: string | null;
    arranger: string | null;
}) {
    return adminFetch<{ id: string }>("/api/v1/admin/songs", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateSong(songId: string, payload: {
    title: string;
    slug: string;
    song_index: string;
    order_no: number;
    description: string | null;
    release_date: string | null;
    lyricist: string | null;
    composer: string | null;
    arranger: string | null;
}) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/songs/${songId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteSong(songId: string) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/songs/${songId}`, {
        method: "DELETE",
    });
}

export async function saveSongMarkdown(songId: string, body_markdown: string) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/songs/${songId}/markdown`, {
        method: "PUT",
        body: JSON.stringify({ body_markdown }),
    });
}

export async function saveSongContentBlocks(
    songId: string,
        items: {
            id?: string | null;
            block_type: "section" | "member" | "call" | "note" | "other";
            order_no: number;
            performer_label: string | null;
            section_label: string | null;
            body_markdown: string;
        note: string | null;
        members: {
            member_id: string;
            display_order: number;
        }[];
    }[],
) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/songs/${songId}/content-blocks`, {
        method: "PUT",
        body: JSON.stringify({ items }),
    });
}

export async function createLive(payload: Record<string, unknown>) {
    return adminFetch<{ id: string }>("/api/v1/admin/lives", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function getAdminLiveDetailByApi(liveId: string) {
    return adminFetch<{
        found: boolean;
        live: {
            id: string;
            live_date: string;
            same_day_order: number | null;
            start_time: string | null;
            end_time: string | null;
            ticket_url: string | null;
            official_x_url: string | null;
            event_name: string;
            memo: string | null;
            venue: {
                id: string;
                name: string;
                area: string | null;
                google_map_url: string | null;
            } | null;
            place_detail: string | null;
            schedule_items: {
                id: string;
                live_id: string;
                order_no: number;
                schedule_kind: string;
                item_title: string | null;
                start_time: string | null;
                end_time: string | null;
                time_note: string | null;
                place_detail: string | null;
                venue: {
                    id: string;
                    name: string;
                    area: string | null;
                    google_map_url: string | null;
                } | null;
                setlist_items: {
                    id: string;
                    order_no: number;
                    entry_type: string;
                    display_label: string;
                    entry_title: string | null;
                    note: string | null;
                    song: {
                        id: string;
                        title: string;
                        slug: string;
                    } | null;
                }[];
            }[];
        } | null;
        venues: {
            id: string;
            name: string;
            area: string | null;
            google_map_url: string | null;
        }[];
        songs: {
            id: string;
            title: string;
            slug: string;
            order_no: number;
            description: string | null;
            release_date: string | null;
            lyricist: string | null;
            composer: string | null;
            arranger: string | null;
        }[];
    }>(`/api/v1/admin/lives/${liveId}`);
}

export async function updateLiveByApi(liveId: string, payload: Record<string, unknown>) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/lives/${liveId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteLiveByApi(liveId: string) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/lives/${liveId}`, {
        method: "DELETE",
    });
}

export async function addSetlistItem(
    liveId: string,
    payload: {
        entry_type: "song" | "talk" | "photo_time" | "other";
        display_label: string;
        entry_title: string | null;
        song_id: string | null;
        note: string | null;
    },
) {
    return adminFetch<{ id: string }>(`/api/v1/admin/schedule-items/${liveId}/setlist-items`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateSetlistItem(
    itemId: string,
    payload: {
        entry_type: "song" | "talk" | "photo_time" | "other";
        display_label: string;
        entry_title: string | null;
        song_id: string | null;
        note: string | null;
    },
) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/setlist-items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteSetlistItem(itemId: string) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/setlist-items/${itemId}`, {
        method: "DELETE",
    });
}

export async function reorderSetlist(liveId: string, items: { id: string; order_no: number }[]) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/schedule-items/${liveId}/setlist`, {
        method: "PUT",
        body: JSON.stringify({ items }),
    });
}

export async function createLiveScheduleItem(liveId: string, payload: Record<string, unknown>) {
    return adminFetch<{ id: string }>(`/api/v1/admin/lives/${liveId}/schedule-items`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateLiveScheduleItem(itemId: string, payload: Record<string, unknown>) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/schedule-items/${itemId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteLiveScheduleItem(itemId: string) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/schedule-items/${itemId}`, {
        method: "DELETE",
    });
}

export async function createMember(payload: Record<string, unknown>) {
    return adminFetch<{ id: string }>("/api/v1/admin/members", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateMember(memberId: string, payload: Record<string, unknown>) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/members/${memberId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteMember(memberId: string) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/members/${memberId}`, {
        method: "DELETE",
    });
}

export async function createVenue(payload: Record<string, unknown>) {
    return adminFetch<{ id: string }>("/api/v1/admin/venues", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function searchVenues(params?: {
    q?: string | null;
    limit?: number;
}) {
    return adminFetchWithQuery<{
        items: {
            id: string;
            name: string;
            area: string | null;
            address: string | null;
            google_map_url: string | null;
        }[];
    }>("/api/v1/admin/venues", params);
}

export async function updateVenue(venueId: string, payload: Record<string, unknown>) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/venues/${venueId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteVenue(venueId: string) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/venues/${venueId}`, {
        method: "DELETE",
    });
}

export async function importVenues(payload: {
    items: {
        name: string;
        area: string | null;
        address: string | null;
        google_map_url: string | null;
    }[];
    overwrite_existing: boolean;
}) {
    return adminFetch<{
        total_received: number;
        created_count: number;
        updated_count: number;
        skipped_count: number;
        items: {
            name: string;
            status: "created" | "updated" | "skipped";
            id: string | null;
            message: string | null;
        }[];
    }>("/api/v1/import/venues", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function createNotice(payload: Record<string, unknown>) {
    return adminFetch<{ id: string }>("/api/v1/admin/notices", {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateNotice(noticeId: string, payload: Record<string, unknown>) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/notices/${noticeId}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
    });
}

export async function deleteNotice(noticeId: string) {
    return adminFetch<{ success: boolean }>(`/api/v1/admin/notices/${noticeId}`, {
        method: "DELETE",
    });
}
