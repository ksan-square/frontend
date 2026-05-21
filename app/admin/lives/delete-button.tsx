"use client";

import { useRouter } from "next/navigation";
import { deleteLiveByApi } from "@/lib/admin-api";

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
            alert(`削除失敗: ${message}`);
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
