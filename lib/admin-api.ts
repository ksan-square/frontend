import { createBrowserClient } from "@supabase/ssr";

type AdminFetchInit = Omit<RequestInit, "headers"> & {
    headers?: Record<string, string>;
};

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

export async function createSong(payload: {
    title: string;
    slug: string;
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

export async function createLive(payload: Record<string, unknown>) {
    return adminFetch<{ id: string }>("/api/v1/admin/lives", {
        method: "POST",
        body: JSON.stringify(payload),
    });
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

export async function addSetlistItem(liveId: string, payload: { song_id: string; note: string | null }) {
    return adminFetch<{ id: string }>(`/api/v1/admin/lives/${liveId}/setlist-items`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateSetlistItem(itemId: string, payload: { note: string | null }) {
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
    return adminFetch<{ success: boolean }>(`/api/v1/admin/lives/${liveId}/setlist`, {
        method: "PUT",
        body: JSON.stringify({ items }),
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
