"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function MemberForm() {
    const [name, setName] = useState("");
    const [memberColorName, setMemberColorName] = useState("");
    const [memberColorCode, setMemberColorCode] = useState("#ec4899");
    const [lyricDisplayColorCode, setLyricDisplayColorCode] = useState("#ffffff");
    const [profile, setProfile] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabase.from("members").insert({
            name,
            member_color_name: memberColorName || null,
            member_color_code: memberColorCode || null,
            lyric_display_color_code: lyricDisplayColorCode || null,
            profile: profile || null,
        });

        if (error) {
            setMessage(`登録失敗: ${error.message}`);
            return;
        }

        setName("");
        setMemberColorName("");
        setProfile("");
        setMessage("メンバーを登録した。");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="メンバー名" value={name} onChange={(e) => setName(e.target.value)} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="メンバーカラー名 例: ライトブルー" value={memberColorName} onChange={(e) => setMemberColorName(e.target.value)} />

            <label className="block text-sm text-zinc-400">メンバーカラー</label>
            <input type="color" value={memberColorCode} onChange={(e) => setMemberColorCode(e.target.value)} />

            <label className="block text-sm text-zinc-400">歌詞表示用文字色</label>
            <input type="color" value={lyricDisplayColorCode} onChange={(e) => setLyricDisplayColorCode(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="プロフィール" value={profile} onChange={(e) => setProfile(e.target.value)} />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">登録</button>
            {message && <p className="text-sm text-zinc-300">{message}</p>}
        </form>
    );
}