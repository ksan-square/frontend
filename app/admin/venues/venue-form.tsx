"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase-client";

type VenueData = {
    id?: string;
    name: string;
    area: string | null;
    address: string | null;
    google_map_url: string | null;
};

export default function VenueForm({
    initialData,
}: {
    initialData?: VenueData;
}) {
    const router = useRouter();

    const [name, setName] = useState(
        initialData?.name ?? ""
    );

    const [area, setArea] = useState(
        initialData?.area ?? ""
    );

    const [address, setAddress] = useState(
        initialData?.address ?? ""
    );

    const [googleMapUrl, setGoogleMapUrl] =
        useState(
            initialData?.google_map_url ?? ""
        );

    const [message, setMessage] = useState("");

    async function handleSubmit(
        e: React.FormEvent
    ) {
        e.preventDefault();

        const payload = {
            name,
            area: area || null,
            address: address || null,
            google_map_url:
                googleMapUrl || null,
        };

        const query = initialData?.id
            ? supabaseClient
                .from("venues")
                .update(payload)
                .eq("id", initialData.id)
            : supabaseClient
                .from("venues")
                .insert(payload);

        const { error } = await query;

        if (error) {
            setMessage(error.message);
            return;
        }

        router.push("/admin/venues");
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                placeholder="会場名"
                value={name}
                onChange={(e) =>
                    setName(e.target.value)
                }
            />

            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                placeholder="エリア"
                value={area}
                onChange={(e) =>
                    setArea(e.target.value)
                }
            />

            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                placeholder="住所"
                value={address}
                onChange={(e) =>
                    setAddress(e.target.value)
                }
            />

            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                placeholder="Google Map URL"
                value={googleMapUrl}
                onChange={(e) =>
                    setGoogleMapUrl(e.target.value)
                }
            />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">
                {initialData ? "更新" : "登録"}
            </button>

            {message && (
                <p className="text-red-400">
                    {message}
                </p>
            )}
        </form>
    );
}