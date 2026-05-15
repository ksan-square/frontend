"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/current-user";
import { supabaseClient } from "@/lib/supabase-client";

export default function DeleteCommentButton({ id }: { id: string }) {
    const router = useRouter();
    const [message, setMessage] = useState("");

    async function handleDelete() {
        const ok = confirm("コメントを削除しますか？");

        if (!ok) {
            return;
        }

        const userId = await getCurrentUserId();

        if (!userId) {
            setMessage("ログインが必要です。");
            return;
        }

        const { error } = await supabaseClient
            .from("wiki_comments")
            .update({
                is_delete: true,
                updated_user: userId,
            })
            .eq("id", id)
            .eq("is_delete", false);

        if (error) {
            setMessage(`削除失敗: ${error.message}`);
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
