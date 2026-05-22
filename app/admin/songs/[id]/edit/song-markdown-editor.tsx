"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import SongContentBlocks from "@/app/_components/song-content-blocks";
import { saveSongContentBlocks, saveSongMarkdown } from "@/lib/admin-api";

type Member = {
    id: string;
    name: string;
    member_color_code: string | null;
    lyric_display_color_code: string | null;
};

type BlockType = "section" | "member" | "call" | "note" | "other";

type Block = {
    id: string;
    block_type: BlockType;
    order_no: number;
    performer_label: string | null;
    section_label: string | null;
    body_markdown: string;
    note: string | null;
    members: Member[];
};

function createId() {
    return `block-${Math.random().toString(36).slice(2, 10)}`;
}

function createEmptyBlock(blockType: BlockType, orderNo: number): Block {
    return {
        id: createId(),
        block_type: blockType,
        order_no: orderNo,
        performer_label: null,
        section_label: blockType === "section" ? "" : null,
        body_markdown: "",
        note: null,
        members: [],
    };
}

function parseMemberNames(rawValue: string) {
    return rawValue
        .split(/[\/,、&＆・]+/)
        .map((value) => value.trim())
        .filter(Boolean);
}

function parseMarkdownToBlocks(markdown: string, members: Member[]): Block[] {
    const lines = markdown.split(/\r?\n/);
    const blocks: Block[] = [];
    let index = 0;

    function pushNoteBuffer(buffer: string[]) {
        const body = buffer.join("\n").trim();
        if (!body) {
            return;
        }
        blocks.push({
            ...createEmptyBlock("note", blocks.length + 1),
            body_markdown: body,
        });
    }

    let noteBuffer: string[] = [];

    while (index < lines.length) {
        const line = lines[index];
        const headingMatch = line.match(/^##\s+(.+)$/);
        const memberMatch = line.match(/^\[member:([^\]]+)\]$/);

        if (headingMatch) {
            pushNoteBuffer(noteBuffer);
            noteBuffer = [];
            blocks.push({
                ...createEmptyBlock("section", blocks.length + 1),
                section_label: headingMatch[1].trim(),
            });
            index += 1;
            continue;
        }

        if (line.trim() === "[call]") {
            pushNoteBuffer(noteBuffer);
            noteBuffer = [];
            index += 1;
            const bodyLines: string[] = [];
            while (index < lines.length && lines[index].trim() !== "[/call]") {
                bodyLines.push(lines[index]);
                index += 1;
            }
            blocks.push({
                ...createEmptyBlock("call", blocks.length + 1),
                body_markdown: bodyLines.join("\n").trim(),
            });
            index += 1;
            continue;
        }

        if (memberMatch) {
            pushNoteBuffer(noteBuffer);
            noteBuffer = [];
            index += 1;
            const bodyLines: string[] = [];
            while (index < lines.length && lines[index].trim() !== "[/member]") {
                bodyLines.push(lines[index]);
                index += 1;
            }
            const memberNames = parseMemberNames(memberMatch[1]);
            blocks.push({
                ...createEmptyBlock("member", blocks.length + 1),
                performer_label: memberMatch[1].trim() || null,
                body_markdown: bodyLines.join("\n").trim(),
                members: members.filter((member) => memberNames.includes(member.name)),
            });
            index += 1;
            continue;
        }

        noteBuffer.push(line);
        index += 1;
    }

    pushNoteBuffer(noteBuffer);

    return blocks.map((block, orderIndex) => ({ ...block, order_no: orderIndex + 1 }));
}

function reorderBlocks(blocks: Block[]) {
    return blocks.map((block, index) => ({
        ...block,
        order_no: index + 1,
    }));
}

function getSectionPreview(block: Block) {
    return block.section_label?.trim() || "見出し未設定";
}

function serializeBlocksToMarkdown(blocks: Block[]) {
    return reorderBlocks(blocks)
        .map((block) => {
            if (block.block_type === "section") {
                return `## ${block.section_label?.trim() || "見出し未設定"}`;
            }

            if (block.block_type === "member") {
                const performerLabel =
                    block.performer_label?.trim()
                    || block.members.map((member) => member.name).join("/");
                const body = block.body_markdown.trim();
                return `[member:${performerLabel}]\n${body}\n[/member]`;
            }

            if (block.block_type === "call") {
                return `[call]\n${block.body_markdown.trim()}\n[/call]`;
            }

            return block.body_markdown.trim();
        })
        .filter(Boolean)
        .join("\n\n");
}

export default function SongMarkdownEditor({
    songId,
    songTitle,
    members,
    initialMarkdown,
    initialBlocks,
}: {
    songId: string;
    songTitle: string;
    members: Member[];
    initialMarkdown: string;
    initialBlocks: Block[];
}) {
    const router = useRouter();
    const [mode, setMode] = useState<"block" | "markdown">("block");
    const [blocks, setBlocks] = useState<Block[]>(
        initialBlocks.length > 0 ? initialBlocks : parseMarkdownToBlocks(initialMarkdown, members),
    );
    const [markdownBody, setMarkdownBody] = useState(
        initialMarkdown || serializeBlocksToMarkdown(initialBlocks),
    );
    const [message, setMessage] = useState("");

    const previewBlocks = useMemo(
        () =>
            blocks.map((block) => ({
                ...block,
                members: block.members,
            })),
        [blocks],
    );

    function updateBlock(id: string, patch: Partial<Block>) {
        setBlocks((current) =>
            current.map((block) => (block.id === id ? { ...block, ...patch } : block)),
        );
    }

    function toggleMember(blockId: string, member: Member) {
        setBlocks((current) =>
            current.map((block) => {
                if (block.id !== blockId) {
                    return block;
                }
                const exists = block.members.some((item) => item.id === member.id);
                return {
                    ...block,
                    members: exists
                        ? block.members.filter((item) => item.id !== member.id)
                        : [...block.members, member],
                };
            }),
        );
    }

    function addBlock(blockType: BlockType) {
        setBlocks((current) => [
            ...current,
            createEmptyBlock(blockType, current.length + 1),
        ]);
    }

    function moveBlock(id: string, direction: -1 | 1) {
        setBlocks((current) => {
            const index = current.findIndex((block) => block.id === id);
            if (index < 0) {
                return current;
            }
            const nextIndex = index + direction;
            if (nextIndex < 0 || nextIndex >= current.length) {
                return current;
            }
            const next = [...current];
            const [target] = next.splice(index, 1);
            next.splice(nextIndex, 0, target);
            return reorderBlocks(next);
        });
    }

    function deleteBlock(id: string) {
        setBlocks((current) => reorderBlocks(current.filter((block) => block.id !== id)));
    }

    function switchToMarkdown() {
        setMarkdownBody(serializeBlocksToMarkdown(blocks));
        setMode("markdown");
    }

    function switchToBlock() {
        setBlocks(parseMarkdownToBlocks(markdownBody, members));
        setMode("block");
    }

    async function handleSave() {
        const nextBlocks =
            mode === "markdown"
                ? parseMarkdownToBlocks(markdownBody, members)
                : reorderBlocks(blocks);
        const nextMarkdown =
            mode === "markdown"
                ? markdownBody
                : serializeBlocksToMarkdown(nextBlocks);

        try {
            await saveSongContentBlocks(
                songId,
                nextBlocks.map((block, index) => ({
                    id: block.id.startsWith("block-") ? null : block.id,
                    block_type: block.block_type,
                    order_no: index + 1,
                    performer_label: block.block_type === "member" ? (block.performer_label?.trim() || null) : null,
                    section_label: block.block_type === "section" ? (block.section_label?.trim() || null) : null,
                    body_markdown: block.body_markdown,
                    note: block.note?.trim() || null,
                    members: block.members.map((member, memberIndex) => ({
                        member_id: member.id,
                        display_order: memberIndex + 1,
                    })),
                })),
            );
            await saveSongMarkdown(songId, nextMarkdown);
        } catch (error) {
            const nextMessage = error instanceof Error ? error.message : "保存失敗";
            setMessage(`保存失敗: ${nextMessage}`);
            return;
        }

        setBlocks(nextBlocks);
        setMarkdownBody(nextMarkdown);
        setMessage("保存しました。");
        router.refresh();
    }

    return (
        <section className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:space-y-6 sm:p-6">
            <div>
                <h2 className="text-2xl font-bold">歌詞・コール Block 編集</h2>
                <p className="mt-2 text-sm text-zinc-400">
                    {songTitle} を block 単位で管理します。将来的な検索、統計、API公開を前提にした構造です。
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                    既存 Markdown がある場合は、初回表示時に block へ変換して編集できます。
                </p>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => {
                        if (mode === "markdown") {
                            switchToBlock();
                            return;
                        }
                        setMode("block");
                    }}
                    className={`rounded-full px-4 py-2 text-sm ${mode === "block" ? "bg-pink-500 font-bold text-white" : "bg-zinc-800"}`}
                >
                    Block
                </button>
                <button
                    type="button"
                    onClick={switchToMarkdown}
                    className={`rounded-full px-4 py-2 text-sm ${mode === "markdown" ? "bg-pink-500 font-bold text-white" : "bg-zinc-800"}`}
                >
                    Markdown
                </button>
                {mode === "markdown" && (
                    <button
                        type="button"
                        onClick={switchToBlock}
                        className="rounded-full bg-zinc-800 px-4 py-2 text-sm"
                    >
                        MarkdownからBlockへ反映
                    </button>
                )}
            </div>

            {mode === "block" ? (
                <>
                    <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={() => addBlock("section")} className="rounded-full bg-zinc-800 px-3 py-2 text-sm">
                            見出し追加
                        </button>
                        <button type="button" onClick={() => addBlock("member")} className="rounded-full bg-zinc-800 px-3 py-2 text-sm">
                            歌唱ブロック追加
                        </button>
                        <button type="button" onClick={() => addBlock("call")} className="rounded-full bg-zinc-800 px-3 py-2 text-sm">
                            CALL追加
                        </button>
                        <button type="button" onClick={() => addBlock("note")} className="rounded-full bg-zinc-800 px-3 py-2 text-sm">
                            ノート追加
                        </button>
                        <button type="button" onClick={() => addBlock("other")} className="rounded-full bg-zinc-800 px-3 py-2 text-sm">
                            その他追加
                        </button>
                    </div>

                    <div className="grid gap-0 overflow-hidden rounded-2xl border border-zinc-800 lg:grid-cols-2">
                        <div className="max-h-[78vh] overflow-y-auto border-b border-zinc-800 bg-zinc-950 p-4 lg:border-b-0 lg:border-r">
                            <div className="space-y-4">
                                {blocks.length === 0 && (
                                    <p className="text-sm text-zinc-500">まだ block がありません。</p>
                                )}

                                {blocks.map((block, index) => (
                                    <article key={block.id} className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="flex items-center gap-2">
                                                <span className="rounded-full bg-pink-500 px-3 py-1 text-xs font-bold text-white">
                                                    {index + 1}
                                                </span>
                                                <select
                                                    value={block.block_type}
                                                    onChange={(event) =>
                                                        updateBlock(block.id, {
                                                            block_type: event.target.value as BlockType,
                                                            members:
                                                                event.target.value === "member" ? block.members : [],
                                                            performer_label:
                                                                event.target.value === "member" ? block.performer_label : null,
                                                            section_label:
                                                                event.target.value === "section" ? block.section_label : null,
                                                        })
                                                    }
                                                    className="rounded-xl bg-zinc-950 p-2 text-sm"
                                                >
                                                    <option value="section">見出し</option>
                                                    <option value="member">歌唱</option>
                                                    <option value="call">CALL</option>
                                                    <option value="note">ノート</option>
                                                    <option value="other">その他</option>
                                                </select>
                                            </div>

                                            <div className="flex gap-2">
                                                <button type="button" onClick={() => moveBlock(block.id, -1)} className="rounded-full bg-zinc-800 px-3 py-1 text-xs">
                                                    上へ
                                                </button>
                                                <button type="button" onClick={() => moveBlock(block.id, 1)} className="rounded-full bg-zinc-800 px-3 py-1 text-xs">
                                                    下へ
                                                </button>
                                                <button type="button" onClick={() => deleteBlock(block.id)} className="rounded-full bg-red-500 px-3 py-1 text-xs text-white">
                                                    削除
                                                </button>
                                            </div>
                                        </div>

                                        {block.block_type === "section" && (
                                            <input
                                                value={block.section_label ?? ""}
                                                onChange={(event) => updateBlock(block.id, { section_label: event.target.value })}
                                                placeholder="見出し名"
                                                className="w-full rounded-xl bg-zinc-950 p-3"
                                            />
                                        )}

                                        {block.block_type === "member" && (
                                            <div className="space-y-3">
                                                <input
                                                    value={block.performer_label ?? ""}
                                                    onChange={(event) => updateBlock(block.id, { performer_label: event.target.value })}
                                                    placeholder="表示ラベル 例: 全員 / 詩田/一ノ瀬"
                                                    className="w-full rounded-xl bg-zinc-950 p-3"
                                                />
                                                <div className="flex flex-wrap gap-2 rounded-xl border border-zinc-800 p-3">
                                                    {members.map((member) => {
                                                        const checked = block.members.some((item) => item.id === member.id);
                                                        return (
                                                            <button
                                                                key={member.id}
                                                                type="button"
                                                                onClick={() => toggleMember(block.id, member)}
                                                                className="rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ring-white/10"
                                                                style={{
                                                                    backgroundColor: checked
                                                                        ? (member.member_color_code ?? "#52525b")
                                                                        : "#18181b",
                                                                    color: checked
                                                                        ? (member.lyric_display_color_code ?? "#ffffff")
                                                                        : "#e4e4e7",
                                                                }}
                                                            >
                                                                {member.name}
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}

                                        {block.block_type !== "section" && (
                                            <textarea
                                                value={block.body_markdown}
                                                onChange={(event) => updateBlock(block.id, { body_markdown: event.target.value })}
                                                placeholder={block.block_type === "call" ? "CALL本文" : "本文"}
                                                className="min-h-[120px] w-full rounded-xl bg-zinc-950 p-3 font-mono text-sm"
                                            />
                                        )}

                                        {block.block_type !== "section" && block.block_type !== "call" && (
                                            <input
                                                value={block.note ?? ""}
                                                onChange={(event) => updateBlock(block.id, { note: event.target.value })}
                                                placeholder="メモ"
                                                className="w-full rounded-xl bg-zinc-950 p-3"
                                            />
                                        )}

                                        <p className="text-xs text-zinc-500">
                                            {block.block_type === "section" ? getSectionPreview(block) : "本文とメンバー構成を右の preview で確認できます。"}
                                        </p>
                                    </article>
                                ))}
                            </div>
                        </div>

                        <div className="max-h-[78vh] overflow-y-auto p-5">
                            <p className="mb-3 text-sm font-semibold text-pink-300">Preview</p>
                            <SongContentBlocks blocks={previewBlocks} members={members} />
                        </div>
                    </div>
                </>
            ) : (
                <div className="grid gap-0 overflow-hidden rounded-2xl border border-zinc-800 lg:grid-cols-2">
                    <textarea
                        className="min-h-[70vh] w-full resize-none bg-zinc-950 p-4 font-mono text-sm leading-7 outline-none"
                        value={markdownBody}
                        onChange={(event) => setMarkdownBody(event.target.value)}
                        placeholder="## 見出し

[member:全員]
歌詞
[/member]

[call]
コール
[/call]"
                    />
                    <div className="max-h-[78vh] overflow-y-auto border-t border-zinc-800 p-5 lg:border-l lg:border-t-0">
                        <p className="mb-3 text-sm font-semibold text-pink-300">Preview</p>
                        <SongContentBlocks
                            blocks={parseMarkdownToBlocks(markdownBody, members)}
                            members={members}
                        />
                    </div>
                </div>
            )}

            <div className="flex flex-wrap items-center gap-3">
                <button
                    type="button"
                    onClick={handleSave}
                    className="rounded-full bg-pink-500 px-5 py-3 font-bold text-white"
                >
                    保存
                </button>

                {message && <p className="text-sm text-zinc-300">{message}</p>}
            </div>
        </section>
    );
}
