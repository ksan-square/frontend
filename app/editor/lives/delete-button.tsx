"use client";

import { useRouter } from "next/navigation";
import { deleteLiveByApi } from "@/lib/admin-api";
import { showToast } from "@/lib/toast";

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

        try {
            await deleteLiveByApi(id);
        } catch (error) {
            const message = error instanceof Error ? error.message : "削除失敗";
            showToast({ kind: "error", text: `削除失敗: ${message}` });
            return;
        }

        showToast({ kind: "success", text: "ライブを削除しました。" });
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
