"use client";

import { useState } from "react";
import { importVenues } from "@/lib/admin-api";

const sampleJson = JSON.stringify(
    [
        {
            name: "Spotify O-EAST",
            area: "渋谷",
            address: "東京都渋谷区道玄坂2-14-8",
            google_map_url: "https://maps.google.com/?q=Spotify+O-EAST",
        },
    ],
    null,
    2,
);

export default function VenueImportForm() {
    const [rawJson, setRawJson] = useState(sampleJson);
    const [overwriteExisting, setOverwriteExisting] = useState(false);
    const [message, setMessage] = useState("");

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setMessage("");

        let parsed: unknown;
        try {
            parsed = JSON.parse(rawJson);
        } catch {
            setMessage("JSON の形式が不正です。");
            return;
        }

        if (!Array.isArray(parsed)) {
            setMessage("JSON 配列を入力してください。");
            return;
        }

        try {
            const items = parsed.map((item) => {
                const row =
                    item && typeof item === "object"
                        ? (item as Record<string, unknown>)
                        : {};

                return {
                    name: typeof row.name === "string" ? row.name : "",
                    area: typeof row.area === "string" ? row.area : null,
                    address: typeof row.address === "string" ? row.address : null,
                    google_map_url:
                        typeof row.google_map_url === "string"
                            ? row.google_map_url
                            : null,
                };
            });

            if (items.some((item) => !item.name.trim())) {
                setMessage("各会場に name を入れてください。");
                return;
            }

            const result = await importVenues({
                items,
                overwrite_existing: overwriteExisting,
            });

            setMessage(
                `完了: created ${result.created_count} / updated ${result.updated_count} / skipped ${result.skipped_count}`,
            );
        } catch (error) {
            setMessage(error instanceof Error ? error.message : "インポート失敗");
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <p className="text-sm leading-6 text-zinc-400">
                `name` は必須です。`area`、`address`、`google_map_url` は任意です。
            </p>

            <label className="flex items-center gap-3 text-sm text-zinc-300">
                <input
                    type="checkbox"
                    checked={overwriteExisting}
                    onChange={(event) => setOverwriteExisting(event.target.checked)}
                />
                既存会場を上書きする
            </label>

            <textarea
                value={rawJson}
                onChange={(event) => setRawJson(event.target.value)}
                className="min-h-[360px] w-full rounded-xl bg-zinc-950 p-4 font-mono text-sm"
            />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold text-white">
                インポート実行
            </button>

            {message && <p className="text-sm text-zinc-300">{message}</p>}
        </form>
    );
}
