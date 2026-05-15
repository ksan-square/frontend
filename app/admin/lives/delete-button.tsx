"use client";

import { useRouter } from "next/navigation";
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

        const setlistDeleteResult = await supabaseClient
            .from("setlist_items")
            .delete()
            .eq("live_id", id);

        if (setlistDeleteResult.error) {
            alert(`削除失敗: ${setlistDeleteResult.error.message}`);
            return;
        }

        const liveDeleteResult = await supabaseClient
            .from("lives")
            .delete()
            .eq("id", id);

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
