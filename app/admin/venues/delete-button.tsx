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
            "会場を削除しますか？"
        );

        if (!ok) {
            return;
        }

        const { error } = await supabaseClient
            .from("venues")
            .delete()
            .eq("id", id);

        if (error) {
            alert(error.message);
            return;
        }

        router.refresh();
    }

    return (
        <button
            onClick={handleDelete}
            className="rounded-full bg-red-500 px-4 py-2 text-sm text-white"
        >
            削除
        </button>
    );
}