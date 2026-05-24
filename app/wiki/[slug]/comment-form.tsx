"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWikiComment } from "@/lib/public-api";

export default function CommentForm({ slug }: { slug: string }) {
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

        try {
            await createWikiComment(slug, { nickname: trimmedNickname, body: trimmedBody });
        } catch (err) {
            setMessage(`投稿失敗: ${err instanceof Error ? err.message : "unknown error"}`);
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
            className="surface-subtle space-y-3 p-5"
        >
            <input
                className="w-full rounded-sm bg-black p-3 text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-600 focus:ring-violet-400"
                maxLength={40}
                placeholder="ニックネーム"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
            />

            <textarea
                className="min-h-28 w-full rounded-sm bg-black p-3 text-zinc-100 outline-none ring-1 ring-white/10 placeholder:text-zinc-600 focus:ring-violet-400"
                maxLength={2000}
                placeholder="コメント"
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />

            <div className="flex flex-wrap items-center gap-3">
                <button className="rounded-md bg-violet-500 px-5 py-3 font-black text-white hover:bg-violet-400">
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
