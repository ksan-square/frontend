"use client";

import { useState } from "react";
import { getCurrentUserId } from "@/lib/current-user";
import { supabaseClient } from "@/lib/supabase-client";

export default function NoticeForm() {
    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("");
    const [body, setBody] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const userId = await getCurrentUserId();

        const { error } = await supabaseClient.from("notices").insert({
            title,
            tag: tag || null,
            body,
            is_published: true,
            is_delete: false,
            created_user: userId,
            updated_user: userId,
        });

        if (error) {
            setMessage(`登録失敗: ${error.message}`);
            return;
        }

        setTitle("");
        setTag("");
        setBody("");
        setMessage("お知らせを登録しました。");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="タイトル" value={title} onChange={(e) => setTitle(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="タグ 例: 更新情報 / メンテナンス" value={tag} onChange={(e) => setTag(e.target.value)} />
            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="内容" value={body} onChange={(e) => setBody(e.target.value)} />
            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">登録</button>
            {message && <p>{message}</p>}
        </form>
    );
}
