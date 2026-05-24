"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateLiveStatus } from "@/lib/admin-api";
import { showToast } from "@/lib/toast";

type Props = {
    liveId: string;
    initialIsActive: boolean;
    initialIsCurrent: boolean;
    initialManualOverride: boolean;
};

export default function LiveStatusEditor({
    liveId,
    initialIsActive,
    initialIsCurrent,
    initialManualOverride,
}: Props) {
    const router = useRouter();
    const [isActive, setIsActive] = useState(initialIsActive);
    const [isCurrent, setIsCurrent] = useState(initialIsCurrent);
    const [manualOverride, setManualOverride] = useState(initialManualOverride);
    const [saving, setSaving] = useState(false);

    async function handleSave() {
        setSaving(true);
        try {
            await updateLiveStatus(liveId, {
                is_active: isActive,
                is_current: isCurrent,
                manual_override: manualOverride,
            });
            showToast({ kind: "success", text: "ステータスを更新しました。" });
            router.refresh();
        } catch (err) {
            showToast({ kind: "error", text: err instanceof Error ? err.message : "更新に失敗しました。" });
        } finally {
            setSaving(false);
        }
    }

    return (
        <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-xs font-black uppercase tracking-wide text-zinc-400">表示ステータス</p>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-zinc-900 p-4">
                <div>
                    <p className="font-black text-white">公開 (is_active)</p>
                    <p className="text-xs text-zinc-400">OFF にすると一覧・詳細から非表示になります</p>
                </div>
                <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-5 w-5 accent-violet-500"
                />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-zinc-900 p-4">
                <div>
                    <p className="font-black text-white">現在のライブ (is_current)</p>
                    <p className="text-xs text-zinc-400">このライブをトップページの「現在のライブ」として設定します</p>
                </div>
                <input
                    type="checkbox"
                    checked={isCurrent}
                    onChange={(e) => setIsCurrent(e.target.checked)}
                    className="h-5 w-5 accent-violet-500"
                />
            </label>

            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-zinc-900 p-4">
                <div>
                    <p className="font-black text-white">手動設定 (manual_override)</p>
                    <p className="text-xs text-zinc-400">
                        ON にすると自動判定を無効化し、is_current の設定を優先します。
                        他のライブの手動設定は自動的に解除されます。
                    </p>
                </div>
                <input
                    type="checkbox"
                    checked={manualOverride}
                    onChange={(e) => setManualOverride(e.target.checked)}
                    className="h-5 w-5 accent-violet-500"
                />
            </label>

            <button
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-violet-500 px-5 py-2.5 text-sm font-black text-white hover:bg-violet-400 disabled:opacity-50"
            >
                {saving ? "保存中..." : "ステータスを保存"}
            </button>
        </div>
    );
}
