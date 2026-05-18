"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

export default function CommentForm({ wikiPageId }: { wikiPageId: string }) {
    const router = useRouter();
    const [nickname, setNickname] = useState("");
    const [body, setBody] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const trimmedNickname = nickname.trim();
        const trimmedBody = body.trim();

        if (!trimmedNickname || !trimmedBody) {
            setMessage("ニックネームとコメントを入力してください。");
            return;
        }

        const { error } = await supabaseClient.from("wiki_comments").insert({
            wiki_page_id: wikiPageId,
            nickname: trimmedNickname,
            body: trimmedBody,
            is_delete: false,
        });

        if (error) {
            setMessage(`投稿失敗: ${error.message}`);
            return;
        }

        setNickname("");
        setBody("");
        setMessage("コメントを投稿しました。");
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-5"
        >
            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                maxLength={40}
                placeholder="ニックネーム"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />

            <textarea
                className="min-h-28 w-full rounded-xl bg-zinc-950 p-3"
                maxLength={2000}
                placeholder="コメント"
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">
                    投稿
                </button>

                {message && (
                    <p className="text-sm text-zinc-300">
                        {message}
                    </p>
                )}
            </div>
        </form>
    );
}
