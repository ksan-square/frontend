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

type BlockTag = {
    label: string;
    toneMembers: Member[];
    variant: "member" | "summary";
};

function createAnchorId(value: string) {
    return value
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9\-_ぁ-んァ-ヶ一-龠]/g, "");
}

function getBlockTags(block: Block, allMembers: Member[]): BlockTag[] {
    if (block.members.length === 0) {
        const explicitLabel = block.performer_label?.trim();
        return explicitLabel
            ? [{ label: explicitLabel, toneMembers: [], variant: "summary" }]
            : [];
    }
    const isAllMembers =
        allMembers.length > 0 && block.members.length === allMembers.length;
    if (isAllMembers) {
        return [{ label: "全員", toneMembers: allMembers, variant: "summary" }];
    }
    if (block.members.length <= 3) {
        return block.members.map((member) => ({
            label: member.name,
            toneMembers: [member],
            variant: "member",
        }));
    }
    return [{ label: "複数", toneMembers: block.members, variant: "summary" }];
}

function getTagStyle(tag: BlockTag) {
    if (tag.variant === "summary" || tag.toneMembers.length === 0) {
        return {
            backgroundColor: "#27272a",
            color: "#f4f4f5",
        };
    }

    if (tag.toneMembers.length === 1) {
        return {
            backgroundColor: tag.toneMembers[0].member_color_code ?? "#3f3f46",
            color: tag.toneMembers[0].lyric_display_color_code ?? "#ffffff",
        };
    }

    const colors = tag.toneMembers
        .map((member) => member.member_color_code)
        .filter((color): color is string => Boolean(color));

    if (colors.length === 0) {
        return {
            backgroundColor: "#3f3f46",
            color: "#ffffff",
        };
    }

    return {
        backgroundImage: `linear-gradient(90deg, ${colors.join(", ")})`,
        color: "#ffffff",
    };
}

function getTextColor(toneMembers: Member[]) {
    if (toneMembers.length !== 1) {
        return undefined;
    }
    return toneMembers[0].lyric_display_color_code
        ?? toneMembers[0].member_color_code
        ?? undefined;
}

export default function SongContentBlocks({
    blocks,
    members,
}: {
    blocks: Block[];
    members: Member[];
}) {
    return (
        <article className="space-y-5">
            {blocks.map((block) => {
                if (block.block_type === "section") {
                    const label = block.section_label?.trim() || "見出し未設定";
                    return (
                        <h2
                            key={block.id}
                            id={createAnchorId(label)}
                            className="pt-3 text-2xl font-black text-white"
                        >
                            {label}
                        </h2>
                    );
                }

                if (block.block_type === "member") {
                    const tags = getBlockTags(block, members);
                    const hasMultipleTags = tags.length >= 2;
                    return (
                        <section key={block.id} className="space-y-2">
                            <div className="grid grid-cols-[minmax(132px,180px)_minmax(0,1fr)] items-start gap-x-3">
                                {tags.length > 0 && (
                                    <div
                                        className={`grid content-start gap-2 pt-1 ${
                                            hasMultipleTags
                                                ? "grid-flow-col auto-cols-max grid-rows-2"
                                                : "grid-cols-1"
                                        }`}
                                    >
                                        {tags.map((tag) => (
                                            <span
                                                key={`${block.id}-${tag.label}`}
                                                className="justify-self-start rounded-sm px-3 py-1 text-xs font-black"
                                                style={getTagStyle(tag)}
                                            >
                                                [{tag.label}]
                                            </span>
                                        ))}
                                    </div>
                                )}
                                <div
                                    className="min-w-0 flex-1"
                                    style={{ color: getTextColor(tags[0]?.toneMembers ?? []) }}
                                >
                                    <SongRichMarkdown markdown={block.body_markdown} members={members} />
                                </div>
                            </div>
                            {block.note && <p className="text-sm text-zinc-500">{block.note}</p>}
                        </section>
                    );
                }

                if (block.block_type === "call") {
                    return (
                        <section
                            key={block.id}
                            className="rounded-sm bg-white/[0.04] px-4 py-3 ring-1 ring-white/6"
                        >
                            <div className="grid grid-cols-[minmax(132px,180px)_minmax(0,1fr)] items-start gap-x-3">
                                <div className="flex min-h-[32px] items-start pt-1">
                                    <span className="rounded-sm bg-fuchsia-400/12 px-2 py-1 text-[11px] font-black uppercase text-fuchsia-200">
                                        [CALL]
                                    </span>
                                </div>
                                <div className="min-w-0 flex-1">
                                    <SongRichMarkdown markdown={block.body_markdown} members={members} />
                                </div>
                            </div>
                        </section>
                    );
                }

                return (
                    <section key={block.id} className="space-y-2">
                        <SongRichMarkdown markdown={block.body_markdown} members={members} />
                        {block.note && <p className="text-sm text-zinc-500">{block.note}</p>}
                    </section>
                );
            })}
        </article>
    );
}
