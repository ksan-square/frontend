alter table public.lives
    add column if not exists live_start_time time,
    add column if not exists live_end_time time,
    add column if not exists benefit_meeting_start_time time,
    add column if not exists benefit_meeting_end_time time,
    add column if not exists benefit_meeting_time_note text,
    add column if not exists benefit_meeting_place_detail text,
    add column if not exists ticket_url text,
    add column if not exists official_x_url text,
    add column if not exists benefit_venue_id uuid references public.venues(id);

create index if not exists lives_schedule_lookup_idx
    on public.lives (
        is_delete,
        live_date asc,
        live_start_time asc,
        same_day_order asc
    );
