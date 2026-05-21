"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import SongRichMarkdown from "@/app/_components/song-rich-markdown";
import { saveSongMarkdown } from "@/lib/admin-api";

type Member = {
    id: string;
    name: string;
    member_color_code: string | null;
    lyric_display_color_code: string | null;
};

function extractHeadings(markdown: string) {
    return Array.from(markdown.matchAll(/^##\s+(.+)$/gm)).map((match) =>
        match[1].trim(),
    );
}

export default function SongMarkdownEditor({
    songId,
    songTitle,
    members,
    initialMarkdown,
}: {
    songId: string;
    songTitle: string;
    members: Member[];
    initialMarkdown: string;
}) {
    const router = useRouter();
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const [body, setBody] = useState(initialMarkdown);
    const [message, setMessage] = useState("");

    function insertText(before: string, after = "") {
        const textarea = textareaRef.current;

        if (!textarea) {
            setBody((current) => `${current}${before}${after}`);
            return;
        }

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const scrollTop = textarea.scrollTop;
        const scrollLeft = textarea.scrollLeft;
        const selectedText = body.slice(start, end);
        const nextBody =
            body.slice(0, start) +
            before +
            selectedText +
            after +
            body.slice(end);

        setBody(nextBody);

        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(
                start + before.length,
                end + before.length,
            );
            textarea.scrollTop = scrollTop;
            textarea.scrollLeft = scrollLeft;
        });
    }

    async function handleSave() {
        try {
            await saveSongMarkdown(songId, body);
        } catch (error) {
            const message = error instanceof Error ? error.message : "保存失敗";
            setMessage(`保存失敗: ${message}`);
            return;
        }

        setMessage("保存しました。");
        router.refresh();
    }

    const headings = extractHeadings(body);

    return (
        <section className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 sm:space-y-6 sm:p-6">
            <div>
                <h2 className="text-2xl font-bold">歌詞・コール Markdown 編集</h2>
                <p className="mt-2 text-sm text-zinc-400">
                    {songTitle} を 1 つの Markdown で管理します。`##`
                    見出しがそのまま index になります。
                </p>
                <p className="mt-2 text-xs text-zinc-500">
                    改行はそのままプレビューに反映されます。複数人は
                    `[member:日向,胡桃]...[/member]` のように書けます。全員はタグなしでそのまま書いてください。
                </p>
            </div>

            <div className="sticky top-16 z-20 max-h-[42vh] space-y-3 overflow-y-auto rounded-2xl border border-zinc-800 bg-zinc-900/95 p-3 shadow-xl shadow-zinc-950/40 backdrop-blur sm:top-20 sm:max-h-[48vh] sm:space-y-4">
                <div>
                    <div className="flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
                        <button
                            type="button"
                            onClick={() => insertText("## ")}
                            className="shrink-0 rounded-full bg-zinc-800 px-3 py-2 text-sm sm:py-1.5"
                        >
                            Index
                        </button>
                        <button
                            type="button"
                            onClick={() => insertText("**", "**")}
                            className="shrink-0 rounded-full bg-zinc-800 px-3 py-2 text-sm font-bold sm:py-1.5"
                        >
                            B
                        </button>
                        <button
                            type="button"
                            onClick={() => insertText("  \n")}
                            className="shrink-0 rounded-full bg-zinc-800 px-3 py-2 text-sm sm:py-1.5"
                        >
                            改行
                        </button>
                        <button
                            type="button"
                            onClick={() => insertText("[call]\n", "\n[/call]")}
                            className="shrink-0 rounded-full bg-zinc-800 px-3 py-2 text-sm sm:py-1.5"
                        >
                            Call
                        </button>
                        <button
                            type="button"
                            onClick={() => insertText("[color:#ec4899]", "[/color]")}
                            className="shrink-0 rounded-full bg-zinc-800 px-3 py-2 text-sm sm:py-1.5"
                        >
                            Color
                        </button>
                        {members.map((member) => (
                            <button
                                key={member.id}
                                type="button"
                                onClick={() =>
                                    insertText(`[member:${member.name}]`, "[/member]")
                                }
                                className="shrink-0 rounded-full px-3 py-2 text-xs font-semibold sm:py-1.5"
                                style={{
                                    backgroundColor:
                                        member.member_color_code ?? "#3f3f46",
                                    color:
                                        member.lyric_display_color_code ?? "#ffffff",
                                }}
                            >
                                {member.name}
                            </button>
                        ))}
                        <button
                            type="button"
                            onClick={() =>
                                insertText("[member:日向,胡桃]", "[/member]")
                            }
                            className="shrink-0 rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 sm:py-1.5"
                        >
                            日向,胡桃
                        </button>
                    </div>
                </div>

                {headings.length > 0 && (
                    <div className="border-t border-zinc-800 pt-3">
                        <p className="mb-2 text-sm font-semibold text-pink-300">
                            Index Preview
                        </p>
                        <div className="flex max-h-24 flex-wrap gap-2 overflow-y-auto pr-1 sm:max-h-28">
                            {headings.map((heading) => (
                                <span
                                    key={heading}
                                    className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                                >
                                    {heading}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="grid min-h-[78vh] scroll-mt-72 gap-0 overflow-hidden rounded-2xl border border-zinc-800 lg:h-[min(72vh,960px)] lg:min-h-0 lg:grid-cols-2">
                <textarea
                    ref={textareaRef}
                    className="h-[68vh] min-h-[520px] w-full resize-y overflow-y-auto bg-zinc-950 p-4 font-mono text-base leading-7 outline-none lg:h-full lg:min-h-0 lg:resize-none lg:text-sm lg:leading-6"
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    placeholder="## 1番

[member:かな]
歌詞
[/member]

[member:日向,胡桃]
ユニゾン
[/member]

[call]
コール
[/call]"
                />

                <div className="max-h-[60vh] min-h-[360px] overflow-y-auto border-t border-zinc-800 p-5 lg:h-full lg:max-h-none lg:min-h-0 lg:border-l lg:border-t-0">
                    <p className="mb-3 text-sm font-semibold text-pink-300">
                        Preview
                    </p>
                    <SongRichMarkdown markdown={body} members={members} />
                </div>
            </div>

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
