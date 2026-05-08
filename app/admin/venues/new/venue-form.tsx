"use client";

import { useState } from "react";
import { supabaseClient } from "@/lib/supabase-client";

export default function VenueForm() {
    const [name, setName] = useState("");
    const [area, setArea] = useState("");
    const [address, setAddress] = useState("");
    const [googleMapUrl, setGoogleMapUrl] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabaseClient.from("venues").insert({
            name,
            area: area || null,
            address: address || null,
            google_map_url: googleMapUrl || null,
        });

        if (error) {
            setMessage(`登録失敗: ${error.message}`);
            return;
        }

        setName("");
        setArea("");
        setAddress("");
        setGoogleMapUrl("");
        setMessage("会場を登録した。");
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6">
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="会場名 例: Spotify O-WEST" value={name} onChange={(e) => setName(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="場所 例: 東京" value={area} onChange={(e) => setArea(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="住所" value={address} onChange={(e) => setAddress(e.target.value)} />
            <input className="w-full rounded-xl bg-zinc-950 p-3" placeholder="Google Map URL" value={googleMapUrl} onChange={(e) => setGoogleMapUrl(e.target.value)} />
            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">登録</button>
            {message && <p>{message}</p>}
        </form>
    );
}