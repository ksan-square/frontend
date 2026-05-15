"use client";

import { useMemo, useState } from "react";
import { getCurrentUserId } from "@/lib/current-user";
import { supabase } from "@/lib/supabase";

type Song = {
    id: string;
    title: string;
};

type Member = {
    id: string;
    name: string;
};

type SongPart = {
    id: string;
    song_id: string;
    order_no: number;
    section_name: string | null;
    lyric_text: string | null;
    vocal_type: string;
    songs: { title: string }[] | null;
    song_part_members: { is_delete: boolean; member_id: string }[];
};

type Props = {
    songs: Song[];
    parts: SongPart[];
    members: Member[];
};

export default function SongPartMemberManager({ songs, parts, members }: Props) {
    const [songId, setSongId] = useState("");
    const [sectionName, setSectionName] = useState("");
    const [selectedPartId, setSelectedPartId] = useState("");
    const [checkedMemberIds, setCheckedMemberIds] = useState<string[]>([]);
    const [message, setMessage] = useState("");

    const sectionOptions = useMemo(() => {
        return Array.from(
            new Set(
                parts
                    .filter((part) => !songId || part.song_id === songId)
                    .map((part) => part.section_name)
                    .filter(Boolean)
            )
        ) as string[];
    }, [parts, songId]);

    const filteredParts = parts.filter((part) => {
        const matchSong = !songId || part.song_id === songId;
        const matchSection = !sectionName || part.section_name === sectionName;
        return matchSong && matchSection;
    });

    function selectPart(partId: string) {
        setSelectedPartId(partId);

        const part = parts.find((p) => p.id === partId);
        const currentMemberIds =
            part?.song_part_members
                ?.filter((row) => !row.is_delete)
                .map((row) => row.member_id) ?? [];

        setCheckedMemberIds(currentMemberIds);
        setMessage("");
    }

    function toggleMember(memberId: string) {
        setCheckedMemberIds((current) =>
            current.includes(memberId)
                ? current.filter((id) => id !== memberId)
                : [...current, memberId]
        );
    }

    async function handleSave() {
        if (!selectedPartId) {
            setMessage("歌割パートを選択してください。");
            return;
        }

        const userId = await getCurrentUserId();
        const deleteResult = await supabase
            .from("song_part_members")
            .update({
                is_delete: true,
                updated_user: userId,
            })
            .eq("song_part_id", selectedPartId)
            .eq("is_delete", false);

        if (deleteResult.error) {
            setMessage(`削除失敗: ${deleteResult.error.message}`);
            return;
        }

        if (checkedMemberIds.length === 0) {
            setMessage("歌唱メンバーを空にした。");
            return;
        }

        const rows = checkedMemberIds.map((memberId, index) => ({
            song_part_id: selectedPartId,
            member_id: memberId,
            display_order: index + 1,
            is_delete: false,
            created_user: userId,
            updated_user: userId,
        }));

        const insertResult = await supabase
            .from("song_part_members")
            .upsert(rows, {
                onConflict: "song_part_id,member_id",
            });

        if (insertResult.error) {
            setMessage(`登録失敗: ${insertResult.error.message}`);
            return;
        }

        setMessage("歌唱メンバーを更新した。");
    }

    return (
        <section className="space-y-6">
            <div className="grid gap-3 md:grid-cols-2">
                <select
                    className="rounded-xl bg-zinc-950 p-3"
                    value={songId}
                    onChange={(e) => {
                        setSongId(e.target.value);
                        setSectionName("");
                        setSelectedPartId("");
                        setCheckedMemberIds([]);
                    }}
                >
                    <option value="">全曲</option>
                    {songs.map((song) => (
                        <option key={song.id} value={song.id}>
                            {song.title}
                        </option>
                    ))}
                </select>

                <select
                    className="rounded-xl bg-zinc-950 p-3"
                    value={sectionName}
                    onChange={(e) => {
                        setSectionName(e.target.value);
                        setSelectedPartId("");
                        setCheckedMemberIds([]);
                    }}
                >
                    <option value="">全セクション</option>
                    {sectionOptions.map((section) => (
                        <option key={section} value={section}>
                            {section}
                        </option>
                    ))}
                </select>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                    <h2 className="text-xl font-bold">歌割パート</h2>

                    {filteredParts.map((part) => {
                        const song = part.songs?.[0];

                        return (
                            <button
                                key={part.id}
                                type="button"
                                onClick={() => selectPart(part.id)}
                                className={`w-full rounded-2xl border p-4 text-left ${selectedPartId === part.id
                                        ? "border-pink-400 bg-pink-500/10"
                                        : "border-zinc-800 bg-zinc-900"
                                    }`}
                            >
                                <p className="text-sm text-pink-300">
                                    {song?.title ?? "曲名不明"} / {part.section_name ?? "未分類"}
                                </p>
                                <p className="mt-1 font-bold">
                                    {part.order_no}. {part.lyric_text ?? "歌詞なし"}
                                </p>
                            </button>
                        );
                    })}
                </div>

                <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-5">
                    <h2 className="text-xl font-bold">歌唱メンバー</h2>

                    <div className="grid gap-3">
                        {members.map((member) => (
                            <label key={member.id} className="flex items-center gap-3 rounded-xl bg-zinc-950 p-3">
                                <input
                                    type="checkbox"
                                    checked={checkedMemberIds.includes(member.id)}
                                    onChange={() => toggleMember(member.id)}
                                />
                                <span>{member.name}</span>
                            </label>
                        ))}
                    </div>

                    <button
                        type="button"
                        onClick={handleSave}
                        className="rounded-full bg-pink-500 px-5 py-3 font-bold"
                    >
                        更新
                    </button>

                    {message && <p className="text-sm text-zinc-300">{message}</p>}
                </div>
            </div>
        </section>
    );
}
