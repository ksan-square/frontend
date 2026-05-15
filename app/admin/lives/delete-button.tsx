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

        await supabaseClient
            .from("setlist_items")
            .delete()
            .eq("live_id", id);

        await supabaseClient
            .from("lives")
            .delete()
            .eq("id", id);

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