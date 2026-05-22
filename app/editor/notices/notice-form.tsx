"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createNotice, deleteNotice, updateNotice } from "@/lib/admin-api";
import { showToast } from "@/lib/toast";

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

        const payload = {
            title: title.trim(),
            tag: tag.trim() || null,
            body: body.trim(),
            is_published: isPublished,
            published_at: new Date(publishedAt).toISOString(),
        };
        try {
            if (isEdit && initialData?.id) {
                await updateNotice(initialData.id, payload);
            } else {
                await createNotice(payload);
            }
        } catch (error) {
            const message = error instanceof Error ? error.message : "保存失敗";
            showToast({ kind: "error", text: `${isEdit ? "更新" : "登録"}失敗: ${message}` });
            setMessage(message);
            return;
        }

        showToast({ kind: "success", text: isEdit ? "お知らせを更新しました。" : "お知らせを登録しました。" });
        setMessage(isEdit ? "更新しました。" : "登録しました。");
        router.push("/editor/notices");
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

        try {
            await deleteNotice(initialData.id);
        } catch (error) {
            const message = error instanceof Error ? error.message : "削除失敗";
            showToast({ kind: "error", text: `削除失敗: ${message}` });
            setMessage(message);
            return;
        }

        showToast({ kind: "success", text: "お知らせを削除しました。" });
        router.push("/editor/notices");
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
