"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/current-user";
import { supabaseClient } from "@/lib/supabase-client";

type NoticeFormData = {
    id: string;
    title: string;
    tag: string | null;
    body: string;
    is_published: boolean;
    published_at: string;
};

function formatDateTimeLocal(value: string | null) {
    if (!value) {
        return "";
    }

    return new Date(value).toISOString().slice(0, 16);
}

export default function NoticeForm({
    initialData,
}: {
    initialData?: NoticeFormData;
}) {
    const router = useRouter();
    const isEdit = Boolean(initialData);
    const [title, setTitle] = useState(initialData?.title ?? "");
    const [tag, setTag] = useState(initialData?.tag ?? "");
    const [body, setBody] = useState(initialData?.body ?? "");
    const [isPublished, setIsPublished] = useState(
        initialData?.is_published ?? true,
    );
    const [publishedAt, setPublishedAt] = useState(
        formatDateTimeLocal(initialData?.published_at ?? new Date().toISOString()),
    );
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!title.trim() || !body.trim() || !publishedAt) {
            setMessage("タイトル、本文、公開日時を入力してください。");
            return;
        }

        const userId = await getCurrentUserId();
        const payload = {
            title: title.trim(),
            tag: tag.trim() || null,
            body: body.trim(),
            is_published: isPublished,
            published_at: new Date(publishedAt).toISOString(),
            updated_user: userId,
        };

        const result = isEdit
            ? await supabaseClient
                  .from("notices")
                  .update(payload)
                  .eq("id", initialData?.id)
                  .eq("is_delete", false)
            : await supabaseClient.from("notices").insert({
                  ...payload,
                  is_delete: false,
                  created_user: userId,
              });

        if (result.error) {
            alert(`${isEdit ? "更新" : "登録"}失敗: ${result.error.message}`);
            setMessage(result.error.message);
            return;
        }

        alert(isEdit ? "お知らせを更新しました。" : "お知らせを登録しました。");
        setMessage(isEdit ? "更新しました。" : "登録しました。");
        router.push("/admin/notices");
        router.refresh();
    }

    async function handleDelete() {
        if (!initialData) {
            return;
        }

        const ok = confirm("お知らせを削除しますか？");

        if (!ok) {
            return;
        }

        const userId = await getCurrentUserId();
        const { error } = await supabaseClient
            .from("notices")
            .update({
                is_delete: true,
                updated_user: userId,
            })
            .eq("id", initialData.id)
            .eq("is_delete", false);

        if (error) {
            alert(`削除失敗: ${error.message}`);
            setMessage(error.message);
            return;
        }

        alert("お知らせを削除しました。");
        router.push("/admin/notices");
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                placeholder="タイトル"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
            />

            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                placeholder="タグ 例: 更新情報 / メンテナンス"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
            />

            <label className="block space-y-2">
                <span className="text-sm text-zinc-300">公開日時</span>
                <input
                    className="w-full rounded-xl bg-zinc-950 p-3"
                    type="datetime-local"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                />
            </label>

            <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                />
                公開する
            </label>

            <textarea
                className="min-h-40 w-full rounded-xl bg-zinc-950 p-3"
                placeholder="内容"
                value={body}
                onChange={(e) => setBody(e.target.value)}
            />

            <div className="flex flex-wrap gap-2">
                <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">
                    {isEdit ? "更新" : "登録"}
                </button>

                {isEdit && (
                    <button
                        type="button"
                        onClick={handleDelete}
                        className="rounded-full bg-red-500 px-5 py-3 font-bold text-white"
                    >
                        削除
                    </button>
                )}
            </div>

            {message && <p className="text-sm text-zinc-300">{message}</p>}
        </form>
    );
}
