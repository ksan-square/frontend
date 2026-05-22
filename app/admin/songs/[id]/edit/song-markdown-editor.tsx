"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    PointerSensor,
    closestCenter,
    type DragEndEvent,
    useSensor,
    useSensors,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    useSortable,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

function getBlockTitle(block: Block) {
    if (block.block_type === "section") {
        return block.section_label?.trim() || "見出し";
    }
    if (block.block_type === "member") {
        return block.performer_label?.trim() || "歌ブロック";
    }
    if (block.block_type === "call") {
        return "CALL";
    }
    if (block.block_type === "note") {
        return "ノート";
    }
    return "その他";
}

function getBlockBadge(blockType: BlockType) {
    switch (blockType) {
        case "section":
            return "見出し";
        case "member":
            return "歌";
        case "call":
            return "CALL";
        case "note":
            return "ノート";
        default:
            return "その他";
    }
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

function SortableBlockItem({
    block,
    members,
    isEditing,
    onEdit,
    onDone,
    onDelete,
    onUpdate,
    onToggleMember,
}: {
    block: Block;
    members: Member[];
    isEditing: boolean;
    onEdit: (id: string) => void;
    onDone: () => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, patch: Partial<Block>) => void;
    onToggleMember: (blockId: string, member: Member) => void;
}) {
    const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: block.id });
    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <article
            ref={setNodeRef}
            style={style}
            className="group relative"
        >
            {!isEditing ? (
                <div
                    role="button"
                    tabIndex={0}
                    onClick={() => onEdit(block.id)}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            onEdit(block.id);
                        }
                    }}
                    className="cursor-text rounded-sm outline-none transition hover:bg-white/[0.03] focus-visible:ring-2 focus-visible:ring-pink-400"
                >
                    <button
                        type="button"
                        aria-label="並び替え"
                        onClick={(event) => event.stopPropagation()}
                        className="absolute -left-8 top-3 hidden h-8 w-6 cursor-grab items-center justify-center rounded-sm text-zinc-500 opacity-0 transition hover:bg-white/10 hover:text-white group-hover:flex group-hover:opacity-100"
                        {...attributes}
                        {...listeners}
                    >
                        ::
                    </button>
                    <SongContentBlocks blocks={[block]} members={members} />
                </div>
            ) : (
                <div className="space-y-4 rounded-sm bg-[#111113] p-5 shadow-xl shadow-black/20 ring-1 ring-pink-400/40">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-sm bg-violet-500/15 px-3 py-1 text-xs font-bold text-fuchsia-200 ring-1 ring-violet-300/20">
                                    {getBlockBadge(block.block_type)}
                                </span>
                                <p className="truncate text-lg font-black text-white">
                                    {getBlockTitle(block)}
                                </p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                            <button type="button" onClick={onDone} className="rounded-sm bg-white px-3 py-2 text-xs font-bold text-black">
                                完了
                            </button>
                            <button type="button" onClick={() => onDelete(block.id)} className="rounded-sm bg-red-500 px-3 py-2 text-xs font-bold text-white">
                                削除
                            </button>
                        </div>
                    </div>

                    <div className="grid gap-3 md:grid-cols-[160px_minmax(0,1fr)]">
                        <select
                            value={block.block_type}
                            onChange={(event) =>
                                onUpdate(block.id, {
                                    block_type: event.target.value as BlockType,
                                    members: event.target.value === "member" ? block.members : [],
                                    performer_label: event.target.value === "member" ? block.performer_label : null,
                                    section_label: event.target.value === "section" ? block.section_label : null,
                                })
                            }
                            className="rounded-sm bg-zinc-950 p-3 text-sm"
                        >
                            <option value="section">見出し</option>
                            <option value="member">歌</option>
                            <option value="call">CALL</option>
                            <option value="note">ノート</option>
                            <option value="other">その他</option>
                        </select>

                        {block.block_type === "section" ? (
                            <input
                                value={block.section_label ?? ""}
                                onChange={(event) => onUpdate(block.id, { section_label: event.target.value })}
                                placeholder="見出し名"
                                className="rounded-sm bg-zinc-950 p-3"
                            />
                        ) : (
                            <textarea
                                value={block.body_markdown}
                                onChange={(event) => onUpdate(block.id, { body_markdown: event.target.value })}
                                placeholder={block.block_type === "call" ? "CALL本文" : "本文"}
                                className="min-h-[120px] rounded-sm bg-zinc-950 p-3 font-mono text-sm leading-7"
                            />
                        )}
                    </div>

                    {block.block_type === "member" && (
                        <div className="space-y-3">
                            <input
                                value={block.performer_label ?? ""}
                                onChange={(event) => onUpdate(block.id, { performer_label: event.target.value })}
                                placeholder="表示ラベル 例: 全員 / 詩田 / 詩田・一ノ瀬"
                                className="w-full rounded-sm bg-zinc-950 p-3"
                            />
                            <div className="flex flex-wrap gap-2">
                                {members.map((member) => {
                                    const checked = block.members.some((item) => item.id === member.id);
                                    return (
                                        <button
                                            key={member.id}
                                            type="button"
                                            onClick={() => onToggleMember(block.id, member)}
                                            className="rounded-sm px-3 py-2 text-xs font-semibold ring-1 ring-white/10"
                                            style={{
                                                backgroundColor: checked ? (member.member_color_code ?? "#52525b") : "#18181b",
                                                color: checked ? (member.lyric_display_color_code ?? "#ffffff") : "#e4e4e7",
                                            }}
                                        >
                                            {member.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {block.block_type !== "section" && block.block_type !== "call" && (
                        <input
                            value={block.note ?? ""}
                            onChange={(event) => onUpdate(block.id, { note: event.target.value })}
                            placeholder="メモ"
                            className="w-full rounded-sm bg-zinc-950 p-3"
                        />
                    )}

                    <div className="border-t border-white/10 pt-4">
                        <SongContentBlocks blocks={[block]} members={members} />
                    </div>
                </div>
            )}
        </article>
    );
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
    const [editingBlockId, setEditingBlockId] = useState<string | null>(null);
    const sensors = useSensors(useSensor(PointerSensor));

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
        const nextBlock = createEmptyBlock(blockType, blocks.length + 1);
        setBlocks((current) => {
            const editingIndex = editingBlockId
                ? current.findIndex((block) => block.id === editingBlockId)
                : -1;
            if (editingIndex < 0) {
                return reorderBlocks([...current, nextBlock]);
            }
            return reorderBlocks([
                ...current.slice(0, editingIndex + 1),
                nextBlock,
                ...current.slice(editingIndex + 1),
            ]);
        });
        setEditingBlockId(nextBlock.id);
    }

    function deleteBlock(id: string) {
        setBlocks((current) => reorderBlocks(current.filter((block) => block.id !== id)));
        if (editingBlockId === id) {
            setEditingBlockId(null);
        }
    }

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) {
            return;
        }
        setBlocks((current) => {
            const oldIndex = current.findIndex((block) => block.id === active.id);
            const newIndex = current.findIndex((block) => block.id === over.id);
            if (oldIndex < 0 || newIndex < 0) {
                return current;
            }
            return reorderBlocks(arrayMove(current, oldIndex, newIndex));
        });
    }

    function switchToMarkdown() {
        setMarkdownBody(serializeBlocksToMarkdown(blocks));
        setMode("markdown");
    }

    function switchToBlock() {
        setBlocks(parseMarkdownToBlocks(markdownBody, members));
        setEditingBlockId(null);
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
        setEditingBlockId(null);
        setMessage("保存しました。");
        router.refresh();
    }

    return (
        <section className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:space-y-6 sm:p-6">
            <div>
                <h2 className="text-3xl font-black text-white">歌詞・コール編集</h2>
                <p className="mt-2 text-sm text-zinc-400">
                    {songTitle}
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
                    <div className="flex flex-wrap gap-2 border-y border-white/10 py-3">
                        <button type="button" onClick={() => addBlock("section")} className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black">
                            + 見出し
                        </button>
                        <button type="button" onClick={() => addBlock("member")} className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black">
                            + 歌
                        </button>
                        <button type="button" onClick={() => addBlock("call")} className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black">
                            + CALL
                        </button>
                        <button type="button" onClick={() => addBlock("note")} className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black">
                            + ノート
                        </button>
                        <button type="button" onClick={() => addBlock("other")} className="rounded-sm bg-zinc-900 px-4 py-2 text-sm text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black">
                            + その他
                        </button>
                    </div>

                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={blocks.map((block) => block.id)} strategy={verticalListSortingStrategy}>
                            <div className="space-y-3 pl-0 sm:pl-8">
                                {blocks.length === 0 && (
                                    <div className="surface p-6 text-zinc-400 ring-1 ring-white/10">
                                        まだ block がありません。
                                    </div>
                                )}
                                {blocks.map((block) => (
                                    <SortableBlockItem
                                        key={block.id}
                                        block={block}
                                        members={members}
                                        isEditing={editingBlockId === block.id}
                                        onEdit={setEditingBlockId}
                                        onDone={() => setEditingBlockId(null)}
                                        onDelete={deleteBlock}
                                        onUpdate={updateBlock}
                                        onToggleMember={toggleMember}
                                    />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
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
