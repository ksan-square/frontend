"use client";

import { useState } from "react";
import { getCurrentUserId } from "@/lib/current-user";
import { supabaseClient } from "@/lib/supabase-client";

export default function MemberForm() {
    const [name, setName] = useState("");
    const [colorName, setColorName] = useState("");
    const [colorCode, setColorCode] = useState("#ec4899");
    const [textColor, setTextColor] = useState("#ffffff");
    const [profile, setProfile] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        const userId = await getCurrentUserId();

        const { error } = await supabaseClient.from("members").insert({
            name,
            member_color_name: colorName || null,
            member_color_code: colorCode,
            lyric_display_color_code: textColor,
            profile: profile || null,
            is_delete: false,
            created_user: userId,
            updated_user: userId,
        });

        if (error) {
            setMessage(error.message);
            return;
        }

        setMessage("登録した。");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="名前" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="メンバーカラー名" value={colorName} onChange={(e) => setColorName(e.target.value)} />

            <label>メンバーカラー</label>
            <input type="color" value={colorCode} onChange={(e) => setColorCode(e.target.value)} />

            <label>表示文字色</label>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="プロフィール" value={profile} onChange={(e) => setProfile(e.target.value)} />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">登録</button>
            {message && <p>{message}</p>}
        </form>
    );
}
