"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMember, deleteMember, updateMember } from "@/lib/admin-api";
import { showToast } from "@/lib/toast";

type MemberFormData = {
    id: string;
    name: string;
    member_color_name: string | null;
    member_color_code: string | null;
    lyric_display_color_code: string | null;
    profile: string | null;
    sort_order: number;
    is_active: boolean;
};

export default function MemberForm({
    initialData,
}: {
    initialData?: MemberFormData;
}) {
    const router = useRouter();
    const isEdit = Boolean(initialData);
    const [name, setName] = useState(initialData?.name ?? "");
    const [colorName, setColorName] = useState(
        initialData?.member_color_name ?? "",
    );
    const [colorCode, setColorCode] = useState(
        initialData?.member_color_code ?? "#ec4899",
    );
    const [textColor, setTextColor] = useState(
        initialData?.lyric_display_color_code ?? "#ffffff",
    );
    const [profile, setProfile] = useState(initialData?.profile ?? "");
    const [sortOrder, setSortOrder] = useState(initialData?.sort_order ?? 1);
    const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!name.trim()) {
            setMessage("名前を入力してください。");
            return;
        }

        const payload = {
            name: name.trim(),
            member_color_name: colorName.trim() || null,
            member_color_code: colorCode || null,
            lyric_display_color_code: textColor || null,
            profile: profile.trim() || null,
            profile_json: {},
            sort_order: sortOrder,
            is_active: isActive,
        };
        try {
            if (isEdit && initialData?.id) {
                await updateMember(initialData.id, payload);
            } else {
                await createMember(payload);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "保存失敗";
            showToast({ kind: "error", text: `${isEdit ? "更新" : "登録"}失敗: ${message}` });
            setMessage(message);
            return;
        }

        showToast({ kind: "success", text: isEdit ? "メンバーを更新しました。" : "メンバーを登録しました。" });
        setMessage(isEdit ? "更新しました。" : "登録しました。");
        router.push("/editor/members");
        router.refresh();
    }

    async function handleDelete() {
        if (!initialData) {
            return;
        }

        const ok = confirm("メンバーを削除しますか？");

        if (!ok) {
            return;
        }

        try {
            await deleteMember(initialData.id);
        } catch (error) {
            const message = error instanceof Error ? error.message : "削除失敗";
            showToast({ kind: "error", text: `削除失敗: ${message}` });
            setMessage(message);
            return;
        }

        showToast({ kind: "success", text: "メンバーを削除しました。" });
        router.push("/editor/members");
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                placeholder="名前"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                placeholder="メンバーカラー名"
                value={colorName}
                onChange={(e) => setColorName(e.target.value)}
            />

            <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                    <span className="block text-sm text-zinc-300">
                        メンバーカラー
                    </span>
                    <input
                        className="h-12 w-full rounded-xl bg-zinc-950 p-2"
                        type="color"
                        value={colorCode}
                        onChange={(e) => setColorCode(e.target.value)}
                    />
                </label>

                <label className="space-y-2">
                    <span className="block text-sm text-zinc-300">
                        表示文字色
                    </span>
                    <input
                        className="h-12 w-full rounded-xl bg-zinc-950 p-2"
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                    />
                </label>
            </div>

            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                type="number"
                min={1}
                placeholder="表示順"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 1)}
            />

            <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                />
                有効メンバーとして扱う
            </label>

            <textarea
                className="w-full rounded-xl bg-zinc-950 p-3"
                placeholder="プロフィール"
                value={profile}
                onChange={(e) => setProfile(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
                <button className="rounded-md bg-violet-500 px-5 py-2.5 text-sm font-black text-white hover:bg-violet-400">
                    {isEdit ? "更新" : "登録"}
                </button>

                {isEdit && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-black text-white hover:bg-red-500"
                    >
                        削除
                    </button>
                )}
            </div>

            {message && <p className="text-sm text-zinc-300">{message}</p>}
        </form>
    );
}
