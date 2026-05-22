"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { showToast } from "@/lib/toast";

function normalizeRedirect(path: string | null) {
    if (!path || !path.startsWith("/")) {
        return "/portal";
    }
    return path;
}

export default function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectedFrom = normalizeRedirect(searchParams.get("redirectedFrom"));
    const authError = searchParams.get("error");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isOAuthSubmitting, setIsOAuthSubmitting] = useState(false);

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    useEffect(() => {
        if (authError !== "oauth_callback_failed" && authError !== "missing_code") {
            return;
        }

        showToast({
            kind: "error",
            text: "ログイン処理を完了できませんでした。もう一度お試しください。",
        });
    }, [authError]);

    async function handlePasswordLogin(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsSubmitting(true);

        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setIsSubmitting(false);

        if (error) {
            showToast({
                kind: "error",
                text: `ログインに失敗しました: ${error.message}`,
            });
            return;
        }

        showToast({
            text: "ログインしました。",
        });
        router.push(redirectedFrom);
        router.refresh();
    }

    async function handleXLogin() {
        setIsOAuthSubmitting(true);
        const callbackTarget = new URL("/auth/callback", window.location.origin);
        callbackTarget.searchParams.set("next", redirectedFrom);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "x",
            options: {
                redirectTo: callbackTarget.toString(),
            },
        });

        setIsOAuthSubmitting(false);

        if (error) {
            showToast({
                kind: "error",
                text: `Xログインを開始できませんでした: ${error.message}`,
            });
        }
    }

    return (
        <div className="space-y-6 rounded-2xl border border-zinc-800 bg-zinc-950/80 p-6 shadow-2xl shadow-black/30">
            <div className="space-y-2">
                <button
                    type="button"
                    onClick={handleXLogin}
                    disabled={isOAuthSubmitting}
                    className="flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-black hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isOAuthSubmitting ? "接続中..." : "X でログイン"}
                </button>
                <p className="text-xs leading-6 text-zinc-500">
                    まずは X を主導線にしています。あとからメールを紐づける前提の構成です。
                </p>
            </div>

            <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-xs uppercase tracking-[0.2em] text-zinc-500">or</span>
                <div className="h-px flex-1 bg-white/10" />
            </div>

            <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Email
                    </label>
                    <input
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-pink-400"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(event) => setEmail(event.target.value)}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">
                        Password
                    </label>
                    <input
                        className="w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-sm text-white outline-none transition focus:border-pink-400"
                        type="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(event) => setPassword(event.target.value)}
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-pink-500 px-4 py-3 text-sm font-bold text-white hover:bg-pink-400 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isSubmitting ? "ログイン中..." : "メールでログイン"}
                </button>
            </form>
        </div>
    );
}
