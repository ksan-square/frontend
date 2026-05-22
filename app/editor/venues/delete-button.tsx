"use client";

import { useRouter } from "next/navigation";
import { deleteVenue } from "@/lib/admin-api";
import { showToast } from "@/lib/toast";

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

        try {
            await deleteVenue(id);
        } catch (error) {
            showToast({ kind: "error", text: error instanceof Error ? error.message : "削除失敗" });
            return;
        }

        router.refresh();
    }

    return (
        <button
            onClick={handleDelete}
            className="rounded-sm bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-400"
        >
            削除
        </button>
    );
}
