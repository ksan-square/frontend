create table if not exists wiki_pages (
    id uuid primary key default gen_random_uuid(),
    title text not null,
    slug text not null unique,
    body_markdown text not null,
    is_published boolean not null default true,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    created_user uuid references auth.users(id),
    updated_user uuid references auth.users(id),
    is_delete boolean not null default false
);

create index if not exists wiki_pages_visible_idx
    on wiki_pages (is_delete, is_published, updated_at desc);

create index if not exists wiki_pages_created_idx
    on wiki_pages (is_delete, is_published, created_at desc);

create index if not exists wiki_pages_slug_idx
    on wiki_pages (slug);

create or replace function set_updated_at()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language plpgsql;

drop trigger if exists wiki_pages_set_updated_at on wiki_pages;

create trigger wiki_pages_set_updated_at
before update on wiki_pages
for each row
execute function set_updated_at();

create table if not exists wiki_comments (
    id uuid primary key default gen_random_uuid(),
    wiki_page_id uuid not null references wiki_pages(id) on delete cascade,
    nickname text not null,
    body text not null,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    created_user uuid references auth.users(id),
    updated_user uuid references auth.users(id),
    is_delete boolean not null default false
);

create index if not exists wiki_comments_page_idx
    on wiki_comments (wiki_page_id, is_delete, created_at asc);

drop trigger if exists wiki_comments_set_updated_at on wiki_comments;

create trigger wiki_comments_set_updated_at
before update on wiki_comments
for each row
execute function set_updated_at();
