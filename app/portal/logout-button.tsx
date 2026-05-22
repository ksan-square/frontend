"use client";

import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="rounded-sm bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-white/10 hover:bg-white hover:text-black"
        >
            ログアウト
        </button>
    );
}
