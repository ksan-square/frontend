"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

type Song = { id: string; title: string };
type Member = { id: string; name: string };

type Props = {
    songs: Song[];
    members: Member[];
};

export default function SongPartForm({ songs, members }: Props) {
    const [songId, setSongId] = useState("");
    const [orderNo, setOrderNo] = useState(1);
    const [sectionName, setSectionName] = useState("");
    const [partType, setPartType] = useState("lyric");
    const [vocalType, setVocalType] = useState("members");
    const [lyricText, setLyricText] = useState("");
    const [callText, setCallText] = useState("");
    const [note, setNote] = useState("");
    const [memberIds, setMemberIds] = useState<string[]>([]);
    const [message, setMessage] = useState("");

    function toggleMember(memberId: string) {
        setMemberIds((current) =>
            current.includes(memberId)
                ? current.filter((id) => id !== memberId)
                : [...current, memberId]
        );
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { data: insertedPart, error: partError } = await supabaseClient
            .from("song_parts")
            .insert({
                song_id: songId,
                order_no: orderNo,
                section_name: sectionName || null,
                part_type: partType,
                vocal_type: vocalType,
                lyric_text: lyricText || null,
                call_text: callText || null,
                note: note || null,
            })
            .select("id")
            .single();

        if (partError || !insertedPart) {
            setMessage(`登録失敗: ${partError?.message}`);
            return;
        }

        if (vocalType === "members" && memberIds.length > 0) {
            const rows = memberIds.map((memberId, index) => ({
                song_part_id: insertedPart.id,
                member_id: memberId,
                display_order: index + 1,
            }));

            const { error: memberError } = await supabaseClient
                .from("song_part_members")
                .insert(rows);

            if (memberError) {
                setMessage(`歌唱メンバー登録失敗: ${memberError.message}`);
                return;
            }
        }

        setOrderNo(orderNo + 1);
        setLyricText("");
        setCallText("");
        setNote("");
        setMemberIds([]);
        setMessage("歌詞・コール・歌唱メンバーを登録した。");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <select className="w-full rounded-xl bg-zinc-950 p-3" value={songId} onChange={(e) => setSongId(e.target.value)}>
                <option value="">曲を選択</option>
                {songs.map((song) => (
                    <option key={song.id} value={song.id}>{song.title}</option>
                ))}
            </select>

            <input className="w-full rounded-xl bg-zinc-950 p-3" type="number" value={orderNo} onChange={(e) => setOrderNo(Number(e.target.value))} />

            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="セクション 例: Aメロ / サビ / 前奏" value={sectionName} onChange={(e) => setSectionName(e.target.value)} />

            <select className="w-full rounded-xl bg-zinc-950 p-3" value={partType} onChange={(e) => setPartType(e.target.value)}>
                <option value="intro">前奏</option>
                <option value="verse">Aメロ</option>
                <option value="pre_chorus">Bメロ</option>
                <option value="chorus">サビ</option>
                <option value="bridge">ブリッジ</option>
                <option value="interlude">間奏</option>
                <option value="outro">アウトロ</option>
                <option value="lyric">歌詞</option>
                <option value="other">その他</option>
            </select>

            <select className="w-full rounded-xl bg-zinc-950 p-3" value={vocalType} onChange={(e) => setVocalType(e.target.value)}>
                <option value="members">メンバー指定</option>
                <option value="all">全員</option>
                <option value="none">歌唱なし</option>
            </select>

            {vocalType === "members" && (
                <div className="grid gap-3 md:grid-cols-2">
                    {members.map((member) => (
                        <label key={member.id} className="flex items-center gap-3 rounded-xl bg-zinc-950 p-3">
                            <input
                                type="checkbox"
                                checked={memberIds.includes(member.id)}
                                onChange={() => toggleMember(member.id)}
                            />
                            <span>{member.name}</span>
                        </label>
                    ))}
                </div>
            )}

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="歌詞。前奏など歌詞なしなら空でOK" value={lyricText} onChange={(e) => setLyricText(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="コール" value={callText} onChange={(e) => setCallText(e.target.value)} />

            <textarea className="w-full rounded-xl bg-zinc-950 p-3" placeholder="メモ" value={note} onChange={(e) => setNote(e.target.value)} />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">登録</button>

            {message && <p className="text-sm text-zinc-300">{message}</p>}
        </form>
    );
}