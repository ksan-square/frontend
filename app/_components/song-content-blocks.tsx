"use client";

import SongRichMarkdown from "@/app/_components/song-rich-markdown";

type Member = {
    id: string;
    name: string;
    member_color_name?: string | null;
    member_color_code: string | null;
    lyric_display_color_code: string | null;
};

type Block = {
    id: string;
    order_no: number;
    block_type: "section" | "member" | "call" | "note" | "other";
    performer_label?: string | null;
    section_label: string | null;
    body_markdown: string;
    note: string | null;
    members: Member[];
};

function createAnchorId(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-_ぁ-んァ-ヶ一-龠]/g, "");
}

export default function SongContentBlocks({
    blocks,
    members,
}: {
    blocks: Block[];
    members: Member[];
}) {
    return (
        <div className="space-y-4">
            {blocks.map((block) => {
                if (block.block_type === "section") {
                    const label = block.section_label?.trim() || "見出し未設定";
                    return (
                        <h2
                            key={block.id}
                            id={createAnchorId(label)}
                            className="border-l-4 border-violet-500 pl-3 text-2xl font-black text-white"
                        >
                            {label}
                        </h2>
                    );
                }

                if (block.block_type === "member") {
                    return (
                        <article key={block.id} className="space-y-3 rounded-2xl bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10">
                            {block.performer_label && (
                                <div className="flex flex-wrap gap-2">
                                    <span className="rounded-sm bg-zinc-900 px-3 py-1 text-xs font-bold text-zinc-200 ring-1 ring-white/10">
                                        {block.performer_label}
                                    </span>
                                </div>
                            )}
                            {block.members.length > 0 && (
                                <div className="flex flex-wrap gap-2">
                                    {block.members.map((member) => (
                                        <span
                                            key={member.id}
                                            className="rounded-sm px-3 py-1 text-xs font-bold"
                                            style={{
                                                backgroundColor: member.member_color_code ?? "#3f3f46",
                                                color: member.lyric_display_color_code ?? "#ffffff",
                                            }}
                                        >
                                            {member.name}
                                        </span>
                                    ))}
                                </div>
                            )}
                            <SongRichMarkdown markdown={block.body_markdown} members={members} />
                            {block.note && <p className="text-sm text-zinc-500">{block.note}</p>}
                        </article>
                    );
                }

                if (block.block_type === "call") {
                    return (
                        <article key={block.id} className="rounded-2xl bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10">
                            <div className="flex items-start gap-3">
                                <span className="mt-1 text-[11px] font-black uppercase text-fuchsia-300">
                                    CALL
                                </span>
                                <div className="min-w-0 flex-1">
                                    <SongRichMarkdown markdown={block.body_markdown} members={members} />
                                </div>
                            </div>
                        </article>
                    );
                }

                return (
                    <article key={block.id} className="rounded-2xl bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-white/10">
                        <SongRichMarkdown markdown={block.body_markdown} members={members} />
                        {block.note && <p className="mt-3 text-sm text-zinc-500">{block.note}</p>}
                    </article>
                );
            })}
        </div>
    );
}
