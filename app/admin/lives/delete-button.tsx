"use client";

import { useRouter } from "next/navigation";
import { getCurrentUserId } from "@/lib/current-user";
import { supabaseClient } from "@/lib/supabase-client";

export default function DeleteButton({
    id,
}: {
    id: string;
}) {
    const router = useRouter();

    async function handleDelete() {
        const ok = confirm(
            "ライブを削除しますか？"
        );

        if (!ok) {
            return;
        }

        const userId = await getCurrentUserId();
        const setlistDeleteResult = await supabaseClient
            .from("setlist_items")
            .update({
                is_delete: true,
                updated_user: userId,
            })
            .eq("live_id", id)
            .eq("is_delete", false);

        if (setlistDeleteResult.error) {
            alert(`削除失敗: ${setlistDeleteResult.error.message}`);
            return;
        }

        const liveDeleteResult = await supabaseClient
            .from("lives")
            .update({
                is_delete: true,
                updated_user: userId,
            })
            .eq("id", id)
            .eq("is_delete", false);

        if (liveDeleteResult.error) {
            alert(`削除失敗: ${liveDeleteResult.error.message}`);
            return;
        }

        alert("ライブを削除しました。");
        router.refresh();
    }

    return (
        <button
            onClick={handleDelete}
            className="rounded-full bg-red-500 px-4 py-2 text-white hover:bg-red-400"
        >
            削除
        </button>
    );
}
