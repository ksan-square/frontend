import type { Metadata } from "next";
import Breadcrumbs from "@/app/_components/breadcrumbs";
import SongRichMarkdown from "@/app/_components/song-rich-markdown";
import {
    DEFAULT_DESCRIPTION,
    createDescription,
    joinDescriptionParts,
} from "@/lib/seo";
import { supabase } from "@/lib/supabase";
import type { Member, SongMarkdownPage, SongPart } from "@/types";

export const dynamic = "force-dynamic";

type Props = {
    params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;

    const { data: song } = await supabase
        .from("songs")
        .select("id,title,description,lyricist,composer,arranger")
        .eq("slug", slug)
        .eq("is_delete", false)
        .maybeSingle();

    if (!song) {
        return {
            title: "曲が見つかりません",
            description: DEFAULT_DESCRIPTION,
        };
    }

    const { data: markdownPage } = await supabase
        .from("song_markdown_pages")
        .select("body_markdown")
        .eq("song_id", song.id)
        .eq("is_delete", false)
        .maybeSingle();

    const bodyDescription = createDescription(markdownPage?.body_markdown, 90);
    const description = joinDescriptionParts([
        song.description,
        bodyDescription,
        song.lyricist ? `作詞 ${song.lyricist}` : null,
        song.composer ? `作曲 ${song.composer}` : null,
    ]);

    return {
        title: song.title,
        description,
        alternates: {
            canonical: `/songs/${slug}`,
        },
        openGraph: {
            title: song.title,
            description,
            url: `/songs/${slug}`,
        },
        twitter: {
            title: song.title,
            description,
        },
    };
}

function createAnchorId(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-_ぁ-んァ-ヶ一-龠]/g, "");
}

function extractMarkdownHeadings(markdown: string) {
    return Array.from(markdown.matchAll(/^##\s+(.+)$/gm)).map((match, index) => ({
        id: `heading-${index}`,
        label: match[1].trim(),
        anchorId: createAnchorId(match[1].trim()),
    }));
}

function getVocalLabel(part: SongPart) {
    if (part.vocal_type === "all") return "全員";
    if (part.vocal_type === "none") return "歌唱なし";

    const names = part.song_part_members
        ?.filter((spm) => !spm.is_delete)
        .flatMap((spm) => spm.members ?? [])
        .filter((member) => !member.is_delete)
        .map((member) => member.name);

    return names.length > 0 ? names.join(" / ") : "未設定";
}

export default async function SongDetailPage({ params }: Props) {
    const { slug } = await params;

    const { data: song, error: songError } = await supabase
        .from("songs")
        .select("id,title,description,lyricist,composer,arranger")
        .eq("slug", slug)
        .eq("is_delete", false)
        .single();

    if (songError || !song) {
        return <main>曲が見つかりませんでした。</main>;
    }

    const { data: markdownPage, error: markdownError } = await supabase
        .from("song_markdown_pages")
        .select("id,song_id,body_markdown")
        .eq("song_id", song.id)
        .eq("is_delete", false)
        .maybeSingle();

    if (markdownError) {
        return <main>歌詞Markdownの取得に失敗しました: {markdownError.message}</main>;
    }

    const songMarkdownPage = markdownPage as SongMarkdownPage | null;

    const { data: members } = await supabase
        .from("members")
        .select(
            "id,name,is_delete,member_color_name,member_color_code,lyric_display_color_code",
        )
        .eq("is_delete", false)
        .order("sort_order", { ascending: true });

    const { data: parts, error: partsError } = await supabase
        .from("song_parts")
        .select(`
      id,
      order_no,
      section_name,
      part_type,
      vocal_type,
      lyric_text,
      call_text,
      note,
      song_part_members (
        is_delete,
        display_order,
        members (
          id,
          name,
          is_delete,
          member_color_name,
          member_color_code,
          lyric_display_color_code
        )
      )
    `)
        .eq("song_id", song.id)
        .eq("is_delete", false)
        .order("order_no");

    if (partsError) {
        return <main>歌割の取得に失敗しました: {partsError.message}</main>;
    }

    const songParts = (parts ?? []) as SongPart[];
    const displayMembers = (members ?? []) as Member[];
    const useMarkdownPage = Boolean(songMarkdownPage?.body_markdown);
    const sectionIndex = useMarkdownPage
        ? extractMarkdownHeadings(songMarkdownPage?.body_markdown ?? "")
        : songParts
              .filter((part) => part.section_name)
              .map((part) => ({
                  id: part.id,
                  label: part.section_name as string,
                  anchorId: createAnchorId(`${part.order_no}-${part.section_name}`),
              }));

    return (
        <main className="space-y-10">
            <Breadcrumbs
                items={[
                    { href: "/songs", label: "曲一覧" },
                    { label: song.title },
                ]}
            />

            <section className="relative overflow-hidden bg-black p-6 shadow-2xl shadow-black/30 ring-1 ring-white/10 md:p-8">
                <div className="editorial-rule absolute inset-x-0 top-0 h-1" />
                <p className="inline-flex bg-white px-3 py-1 text-xs font-black uppercase text-black">Song</p>
                <h1 className="mt-5 text-4xl font-black leading-tight text-white md:text-5xl">{song.title}</h1>

                {song.description && (
                    <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 md:text-base">{song.description}</p>
                )}

                <div className="mt-6 grid gap-2 text-sm text-zinc-400 md:grid-cols-3">
                    <p className="surface-subtle p-3">作詞: {song.lyricist ?? "未登録"}</p>
                    <p className="surface-subtle p-3">作曲: {song.composer ?? "未登録"}</p>
                    <p className="surface-subtle p-3">編曲: {song.arranger ?? "未登録"}</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-3xl font-black text-white">歌割・コール</h2>

                {sectionIndex.length > 0 && (
                    <div className="sticky top-16 z-20 max-h-[34vh] overflow-y-auto bg-black/95 p-3 shadow-xl shadow-black/40 ring-1 ring-white/10 backdrop-blur sm:top-20 sm:max-h-[42vh] sm:p-4">
                        <div className="flex gap-2 overflow-x-auto pb-1 sm:max-h-28 sm:flex-wrap sm:overflow-y-auto sm:overflow-x-visible sm:pb-0 sm:pr-1">
                                {sectionIndex.map((item) => (
                                    <a
                                        key={item.id}
                                        href={`#${item.anchorId}`}
                                        className="shrink-0 rounded-sm bg-zinc-900 px-3 py-2 text-sm text-zinc-200 ring-1 ring-white/10 hover:bg-white hover:text-black sm:py-1.5"
                                    >
                                        {item.label}
                                    </a>
                                ))}
                        </div>
                    </div>
                )}

                {!useMarkdownPage && songParts.length === 0 && (
                    <div className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                        まだ歌割・コールが登録されていません。
                    </div>
                )}

                <div className="space-y-3">
                    {useMarkdownPage && (
                        <article className="surface p-5 ring-1 ring-white/10 md:p-6">
                            <SongRichMarkdown
                                markdown={songMarkdownPage?.body_markdown ?? ""}
                                members={displayMembers}
                            />
                        </article>
                    )}

                    {!useMarkdownPage && songParts.map((part) => {
                        const members = (part.song_part_members
                            ?.filter((spm) => !spm.is_delete)
                            ?.flatMap((spm) => spm.members ?? [])
                            .filter((member) => member && !member.is_delete)) ?? [];
                        const anchorId = createAnchorId(
                            `${part.order_no}-${part.section_name ?? part.part_type}`,
                        );

                        return (
                            <article
                                key={part.id}
                                id={anchorId}
                                className="scroll-mt-52 bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10 sm:scroll-mt-44"
                            >
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-sm bg-black px-3 py-1 text-xs font-black text-white ring-1 ring-white/10">
                                        {part.order_no}
                                    </span>

                                    <span className="rounded-sm bg-violet-500/15 px-3 py-1 text-xs font-bold text-fuchsia-200 ring-1 ring-violet-300/20">
                                        {part.section_name ?? part.part_type}
                                    </span>

                                    <span className="rounded-sm bg-zinc-950 px-3 py-1 text-xs font-bold text-zinc-300 ring-1 ring-white/10">
                                        {getVocalLabel(part)}
                                    </span>
                                </div>

                                {part.lyric_text ? (
                                    <p className="whitespace-pre-wrap text-lg leading-relaxed text-zinc-100">{part.lyric_text}</p>
                                ) : (
                                    <p className="text-sm text-zinc-500">歌詞なしパート</p>
                                )}

                                {members.length > 0 && part.vocal_type === "members" && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {members.map((member) => (
                                            <span
                                                key={member.id}
                                                className="rounded-sm px-3 py-1 text-xs font-bold"
                                                style={{
                                                    backgroundColor:
                                                        member.member_color_code ?? "#3f3f46",
                                                    color: member.lyric_display_color_code ?? "#ffffff",
                                                }}
                                            >
                                                {member.name}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                {part.call_text && (
                                    <div className="mt-3 flex flex-wrap items-baseline gap-2 text-sm">
                                        <span className="text-[11px] font-black uppercase text-fuchsia-300">
                                            CALL
                                        </span>
                                        <p className="font-semibold leading-7 text-zinc-300">
                                            {part.call_text}
                                        </p>
                                    </div>
                                )}

                                {part.note && (
                                    <p className="mt-3 text-sm text-zinc-400">メモ: {part.note}</p>
                                )}
                            </article>
                        );
                    })}
                </div>
            </section>
        </main>
    );
}
