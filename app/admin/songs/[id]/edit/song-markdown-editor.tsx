"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/current-user";
import { supabaseClient } from "@/lib/supabase-client";
import SongRichMarkdown from "@/app/_components/song-rich-markdown";

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
        });
    }

    async function handleSave() {
        const userId = await getCurrentUserId();

        if (!userId) {
            setMessage("ログインが必要です。");
            return;
        }

        const payload = {
            song_id: songId,
            body_markdown: body,
            created_user: userId,
            updated_user: userId,
            is_delete: false,
        };

        const { data: existingPage } = await supabaseClient
            .from("song_markdown_pages")
            .select("id,created_user")
            .eq("song_id", songId)
            .maybeSingle();

        const result = await supabaseClient.from("song_markdown_pages").upsert(
            {
                ...payload,
                created_user: existingPage?.created_user ?? userId,
            },
            {
                onConflict: "song_id",
            },
        );

        if (result.error) {
            setMessage(`保存失敗: ${result.error.message}`);
            return;
        }

        setMessage("保存しました。");
        router.refresh();
    }

    const headings = extractHeadings(body);

    return (
        <section className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
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

            <div className="sticky top-20 z-20 space-y-4">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-3 backdrop-blur">
                    <div className="flex flex-wrap gap-2">
                        <button
                            type="button"
                            onClick={() => insertText("## ")}
                            className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                        >
                            Index
                        </button>
                        <button
                            type="button"
                            onClick={() => insertText("**", "**")}
                            className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm font-bold"
                        >
                            B
                        </button>
                        <button
                            type="button"
                            onClick={() => insertText("  \n")}
                            className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                        >
                            改行
                        </button>
                        <button
                            type="button"
                            onClick={() => insertText("[call]\n", "\n[/call]")}
                            className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
                        >
                            Call
                        </button>
                        <button
                            type="button"
                            onClick={() => insertText("[color:#ec4899]", "[/color]")}
                            className="rounded-full bg-zinc-800 px-3 py-1.5 text-sm"
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
                                className="rounded-full px-3 py-1.5 text-xs font-semibold"
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
                            className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-zinc-200"
                        >
                            日向,胡桃
                        </button>
                    </div>
                </div>

                {headings.length > 0 && (
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur">
                        <p className="mb-2 text-sm font-semibold text-pink-300">
                            Index Preview
                        </p>
                        <div className="flex max-h-28 flex-wrap gap-2 overflow-y-auto pr-1">
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

            <div className="grid h-[min(72vh,960px)] gap-0 overflow-hidden rounded-2xl border border-zinc-800 lg:grid-cols-2">
                <textarea
                    ref={textareaRef}
                    className="h-full min-h-0 w-full resize-none overflow-y-auto bg-zinc-950 p-4 font-mono text-sm leading-6 outline-none"
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

                <div className="h-full min-h-0 overflow-y-auto border-t border-zinc-800 p-5 lg:border-l lg:border-t-0">
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
