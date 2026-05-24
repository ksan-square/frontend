"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { deleteWikiComment } from "@/lib/admin-api";

export default function DeleteCommentButton({ id }: { id: string }) {
    const router = useRouter();
    const [message, setMessage] = useState("");

    async function handleDelete() {
        const ok = confirm("コメントを削除しますか？");

        if (!ok) {
            return;
        }

        try {
            await deleteWikiComment(id);
        } catch (err) {
            setMessage(`削除失敗: ${err instanceof Error ? err.message : "unknown error"}`);
            return;
        }

        router.refresh();
    }

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={handleDelete}
                className="rounded-full bg-red-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-400"
            >
                削除
            </button>

            {message && (
                <p className="text-xs text-red-300">
                    {message}
                </p>
            )}
        </div>
    );
}
