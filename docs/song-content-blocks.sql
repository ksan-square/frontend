create table if not exists song_markdown_pages (
    id uuid primary key default gen_random_uuid(),
    song_id uuid not null unique references songs(id) on delete cascade,
    body_markdown text not null default '',
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    created_user uuid references auth.users(id),
    updated_user uuid references auth.users(id),
    is_delete boolean not null default false
);

create index if not exists song_markdown_pages_song_idx
    on song_markdown_pages (song_id, is_delete);

create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists song_markdown_pages_set_updated_at on song_markdown_pages;

create trigger song_markdown_pages_set_updated_at
before update on song_markdown_pages
for each row
execute function set_updated_at();
