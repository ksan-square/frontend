import { supabase } from "@/lib/supabase";
import type { SongPart } from "@/types";

type Props = {
    params: Promise<{ slug: string }>;
};

function getVocalLabel(part: SongPart) {
    if (part.vocal_type === "all") return "全員";
    if (part.vocal_type === "none") return "歌唱なし";

    const names = part.song_part_members
        ?.flatMap((spm) => spm.members ?? [])
        .map((member) => member.name);

    return names.length > 0 ? names.join(" / ") : "未設定";
}

export default async function SongDetailPage({ params }: Props) {
    const { slug } = await params;

    const { data: song, error: songError } = await supabase
        .from("songs")
        .select("id,title,description,lyricist,composer,arranger")
        .eq("slug", slug)
        .single();

    if (songError || !song) {
        return <main>曲が見つからなかった。</main>;
    }

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
        display_order,
        members (
          id,
          name,
          member_color_name,
          member_color_code,
          lyric_display_color_code
        )
      )
    `)
        .eq("song_id", song.id)
        .order("order_no");

    if (partsError) {
        return <main>歌割の取得に失敗した: {partsError.message}</main>;
    }

    const songParts = (parts ?? []) as SongPart[];

    return (
        <main className="space-y-8">
            <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
                <p className="text-sm font-semibold text-pink-300">Song</p>
                <h1 className="mt-2 text-3xl font-bold">{song.title}</h1>

                {song.description && (
                    <p className="mt-4 text-zinc-300">{song.description}</p>
                )}

                <div className="mt-5 grid gap-2 text-sm text-zinc-400 md:grid-cols-3">
                    <p>作詞: {song.lyricist ?? "未登録"}</p>
                    <p>作曲: {song.composer ?? "未登録"}</p>
                    <p>編曲: {song.arranger ?? "未登録"}</p>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-bold">歌割・コール</h2>

                {songParts.length === 0 && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
                        まだ歌割・コールが登録されていない。
                    </div>
                )}

                <div className="space-y-3">
                    {songParts.map((part) => {
                        const members = part.song_part_members
                            ?.flatMap((spm) => spm.members ?? [])
                            .filter(Boolean);

                        return (
                            <article
                                key={part.id}
                                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
                            >
                                <div className="mb-3 flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs">
                                        {part.order_no}
                                    </span>

                                    <span className="rounded-full bg-pink-500/20 px-3 py-1 text-xs font-semibold text-pink-200">
                                        {part.section_name ?? part.part_type}
                                    </span>

                                    <span className="rounded-full bg-blue-500/20 px-3 py-1 text-xs font-semibold text-blue-200">
                                        {getVocalLabel(part)}
                                    </span>
                                </div>

                                {part.lyric_text ? (
                                    <p className="text-lg leading-relaxed">{part.lyric_text}</p>
                                ) : (
                                    <p className="text-sm text-zinc-500">歌詞なしパート</p>
                                )}

                                {members.length > 0 && part.vocal_type === "members" && (
                                    <div className="mt-3 flex flex-wrap gap-2">
                                        {members.map((member) => (
                                            <span
                                                key={member.id}
                                                className="rounded-full px-3 py-1 text-xs font-semibold"
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
                                    <div className="mt-4 rounded-xl border border-pink-500/30 bg-pink-500/10 p-4">
                                        <p className="text-xs font-semibold text-pink-300">CALL</p>
                                        <p className="mt-1 font-bold text-pink-100">
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