"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const redirectedFrom = searchParams.get("redirectedFrom") ?? "/admin";

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setMessage(`ログイン失敗: ${error.message}`);
            return;
        }

        router.push(redirectedFrom);
        router.refresh();
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-900 p-6"
        >
            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                type="email"
                placeholder="メールアドレス"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />

            <input
                className="w-full rounded-xl bg-zinc-950 p-3"
                type="password"
                placeholder="パスワード"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />

            <button className="rounded-full bg-pink-500 px-5 py-3 font-bold">
                ログイン
            </button>

            {message && <p className="text-sm text-zinc-300">{message}</p>}
        </form>
    );
}