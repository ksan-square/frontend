type QueryValue = string | number | null | undefined;

export function getApiBaseUrl() {
    return (
        process.env.FASTAPI_BASE_URL ??
        process.env.NEXT_PUBLIC_FASTAPI_BASE_URL ??
        "http://127.0.0.1:8000"
    );
}

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

async function fetchJson<T>(path: string, query?: Record<string, QueryValue>): Promise<T> {
    const response = await fetch(buildUrl(path, query), {
        cache: "no-store",
    });

    if (!response.ok) {
        const message = await response.text();
        throw new Error(message || `Request failed: ${response.status}`);
    }

    return response.json() as Promise<T>;
}

export type PublicSong = {
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
};

export type PublicSongIndexItem = {
    key: string;
    count: number;
};

export type PublicMember = {
    id: string;
    name: string;
    member_color_name: string | null;
    member_color_code: string | null;
    lyric_display_color_code: string | null;
};

export type PublicSongPart = {
    id: string;
    order_no: number;
    section_name: string | null;
    part_type: string;
    vocal_type: "none" | "members" | "all";
    lyric_text: string | null;
    call_text: string | null;
    note: string | null;
    song_part_members: {
        display_order: number;
        members: PublicMember[];
    }[];
};

export type PublicSongDetailResponse = {
    found: boolean;
    song: PublicSong | null;
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
        members: PublicMember[];
    }[];
    members: PublicMember[];
    parts: PublicSongPart[];
    section_index: {
        id: string;
        label: string;
        anchor_id: string;
    }[];
};

export type PublicSongListResponse = {
    items: PublicSong[];
    index: PublicSongIndexItem[];
    pagination: {
        page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
    };
};

export type PublicVenue = {
    id: string;
    name: string;
    area: string | null;
    google_map_url: string | null;
};

export type PublicLive = {
    id: string;
    live_date: string;
    same_day_order: number | null;
    start_time: string | null;
    end_time: string | null;
    ticket_url: string | null;
    official_x_url: string | null;
    event_name: string;
    memo: string | null;
    venue: PublicVenue | null;
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
        venue: PublicVenue | null;
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

export type PublicLiveListResponse = {
    upcoming_items: PublicLive[];
    upcoming_pagination: {
        page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
    };
    history_items: PublicLive[];
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

export type PublicLiveDetailResponse = {
    found: boolean;
    live: PublicLive | null;
};

export type PublicWikiPageSummary = {
    id: string;
    title: string;
    slug: string;
    is_published: boolean;
    created_at: string;
    updated_at: string;
};

export type PublicWikiPageListResponse = {
    items: PublicWikiPageSummary[];
    pagination: {
        page: number;
        page_size: number;
        total_items: number;
        total_pages: number;
    };
};

export type PublicWikiPageDetailResponse = {
    found: boolean;
    page: {
        id: string;
        title: string;
        slug: string;
        body_markdown: string;
        is_published: boolean;
        updated_at: string;
    } | null;
    comments: {
        id: string;
        nickname: string;
        body: string;
        created_at: string;
    }[];
    viewer: {
        can_edit: boolean;
    };
};

export type PublicNoticeListResponse = {
    items: {
        id: string;
        title: string;
        tag: string | null;
        body: string;
        published_at: string;
    }[];
};

export type PublicHomeResponse = {
    counts: {
        songs: number;
        lives: number;
        wiki_pages: number;
    };
    notices: PublicNoticeListResponse["items"];
    latest_songs: PublicSong[];
    latest_lives: PublicLive[];
    latest_wiki_pages: PublicWikiPageSummary[];
    next_live: PublicLive | null;
};

export type PublicSitemapResponse = {
    songs: { url: string; updated_at: string | null }[];
    lives: { url: string; updated_at: string | null }[];
    wiki_pages: { url: string; updated_at: string | null }[];
};

export function getPublicHome() {
    return fetchJson<PublicHomeResponse>("/api/v1/public/home");
}

export function getPublicSongs(params: { initial?: string | null; page?: number }) {
    return fetchJson<PublicSongListResponse>("/api/v1/public/songs", params);
}

export function getPublicSongDetail(slug: string) {
    return fetchJson<PublicSongDetailResponse>(`/api/v1/public/songs/${slug}`);
}

export function getPublicLives(params: { month?: string | null; page?: number; upcoming_page?: number }) {
    return fetchJson<PublicLiveListResponse>("/api/v1/public/lives", params);
}

export function getPublicLiveDetail(id: string) {
    return fetchJson<PublicLiveDetailResponse>(`/api/v1/public/lives/${id}`);
}

export function getPublicWikiPages(params: {
    page?: number;
    sort?: "updated_at" | "created_at";
    direction?: "asc" | "desc";
}) {
    return fetchJson<PublicWikiPageListResponse>("/api/v1/public/wiki-pages", params);
}

export function getPublicWikiPageDetail(slug: string) {
    return fetchJson<PublicWikiPageDetailResponse>(`/api/v1/public/wiki-pages/${slug}`);
}

export function getPublicSitemap() {
    return fetchJson<PublicSitemapResponse>("/api/v1/public/meta/sitemap");
}
