export type Member = {
    id: string;
    name: string;
    is_delete?: boolean;
    member_color_name: string | null;
    member_color_code: string | null;
    lyric_display_color_code: string | null;
};

export type Song = {
    id: string;
    title: string;
    slug: string;
    order_no: number;
    description: string | null;
    release_date: string | null;
    lyricist: string | null;
    composer: string | null;
    arranger: string | null;
};

export type SongPart = {
    id: string;
    order_no: number;
    section_name: string | null;
    part_type: string;
    vocal_type: "none" | "members" | "all";
    lyric_text: string | null;
    call_text: string | null;
    note: string | null;
    song_part_members: {
        is_delete?: boolean;
        display_order: number;
        members: Member[] | null;
    }[];
};

export type Venue = {
    id: string;
    name: string;
    area: string | null;
    google_map_url: string | null;
};

export type Live = {
    id: string;
    live_date: string;
    event_name: string;
    memo: string | null;
    venues: Venue | null;
};

export type SetlistItem = {
    id: string;
    order_no: number;
    note: string | null;
    songs: {
        title: string;
        slug: string;
        is_delete?: boolean;
    }[] | null;
};
