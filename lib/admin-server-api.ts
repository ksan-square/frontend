import { createSupabaseServerClient } from "@/lib/supabase-server";
import { getApiBaseUrl } from "@/lib/public-api";

type QueryValue = string | number | null | undefined;

function buildUrl(path: string, query?: Record<string, QueryValue>) {
    const url = new URL(path, getApiBaseUrl());

    Object.entries(query ?? {}).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
            return;
        }
        url.searchParams.set(key, String(value));
    });

    return url.toString();
}

async function adminServerFetch<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
    const supabase = await createSupabaseServerClient();
    const {
        data: { session },
    } = await supabase.auth.getSession();

    if (!session?.access_token) {
        throw new Error("ログインが必要です。");
    }

    const response = await fetch(buildUrl(path, query), {
        headers: {
            Authorization: `Bearer ${session.access_token}`,
        },
        cache: "no-store",
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export type AdminSongListResponse = {
    items: {
        id: string;
        title: string;
        slug: string;
        song_index: string;
        order_no: number;
        description: string | null;
        release_date: string | null;
        lyricist: string | null;
        composer: string | null;
        arranger: string | null;
    }[];
    index: {
        key: string;
        count: number;
    }[];
    pagination: {
        page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
    };
};

export type AdminSongDetailResponse = {
    found: boolean;
    song: AdminSongListResponse["items"][number] | null;
    members: {
        id: string;
        name: string;
        member_color_name: string | null;
        member_color_code: string | null;
        lyric_display_color_code: string | null;
    }[];
    markdown_page: {
        id: string;
        song_id: string;
        body_markdown: string;
    } | null;
    content_blocks: {
        id: string;
        order_no: number;
        block_type: "section" | "member" | "call" | "note" | "other";
        performer_label: string | null;
        section_label: string | null;
        body_markdown: string;
        note: string | null;
        members: {
            id: string;
            name: string;
            member_color_name: string | null;
            member_color_code: string | null;
            lyric_display_color_code: string | null;
        }[];
    }[];
};

export type AdminLiveSummary = {
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
};

export type AdminLiveListResponse = {
    upcoming_items: AdminLiveSummary[];
    upcoming_pagination: {
        page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
    };
    history_items: AdminLiveSummary[];
    month_index: {
        key: string;
        label: string;
        count: number;
    }[];
    pagination: {
        page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
    };
};

export type AdminLiveDetailResponse = {
    found: boolean;
    live: AdminLiveSummary | null;
    venues: {
        id: string;
        name: string;
        area: string | null;
        google_map_url: string | null;
    }[];
    songs: AdminSongListResponse["items"];
};

export type AdminMember = {
    id: string;
    name: string;
    member_color_name: string | null;
    member_color_code: string | null;
    lyric_display_color_code: string | null;
    profile: string | null;
    sort_order: number;
    is_active: boolean;
};

export type AdminMemberListResponse = {
    items: AdminMember[];
};

export type AdminMemberDetailResponse = {
    found: boolean;
    member: AdminMember | null;
};

export type AdminVenue = {
    id: string;
    name: string;
    area: string | null;
    address: string | null;
    google_map_url: string | null;
};

export type AdminVenueListResponse = {
    items: AdminVenue[];
};

export type AdminVenueDetailResponse = {
    found: boolean;
    venue: AdminVenue | null;
};

export type AdminNotice = {
    id: string;
    title: string;
    tag: string | null;
    body: string;
    is_published: boolean;
    published_at: string;
};

export type AdminNoticeListResponse = {
    items: AdminNotice[];
};

export type AdminNoticeDetailResponse = {
    found: boolean;
    notice: AdminNotice | null;
};

export function getAdminSongs(params: { initial?: string | null; page?: number }) {
    return adminServerFetch<AdminSongListResponse>("/api/v1/admin/songs", params);
}

export function getAdminSongDetail(songId: string) {
    return adminServerFetch<AdminSongDetailResponse>(`/api/v1/admin/songs/${songId}`);
}

export function getAdminLives(params: { month?: string | null; page?: number; upcoming_page?: number }) {
    return adminServerFetch<AdminLiveListResponse>("/api/v1/admin/lives", params);
}

export function getAdminLiveDetail(liveId: string) {
    return adminServerFetch<AdminLiveDetailResponse>(`/api/v1/admin/lives/${liveId}`);
}

export function getAdminMembers() {
    return adminServerFetch<AdminMemberListResponse>("/api/v1/admin/members");
}

export function getAdminMemberDetail(memberId: string) {
    return adminServerFetch<AdminMemberDetailResponse>(`/api/v1/admin/members/${memberId}`);
}

export function getAdminVenues() {
    return adminServerFetch<AdminVenueListResponse>("/api/v1/admin/venues");
}

export function getAdminVenueDetail(venueId: string) {
    return adminServerFetch<AdminVenueDetailResponse>(`/api/v1/admin/venues/${venueId}`);
}

export function getAdminNotices() {
    return adminServerFetch<AdminNoticeListResponse>("/api/v1/admin/notices");
}

export function getAdminNoticeDetail(noticeId: string) {
    return adminServerFetch<AdminNoticeDetailResponse>(`/api/v1/admin/notices/${noticeId}`);
}
